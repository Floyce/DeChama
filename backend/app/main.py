import sys
sys.modules['_wmi'] = None

from fastapi import FastAPI, Depends, HTTPException, status, Body, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

from .database import get_db, engine, Base
from . import models, schemas, auth, lnbits
from datetime import datetime

app = FastAPI(title="Impact Chain API", version="2.0.0")

# --- CORS ---
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_auth_user_id(
    user_id: str | None = Query(None, alias="user_id"),
    header_user_id: str | None = Header(None, alias="user-id")
) -> str:
    uid = header_user_id or user_id
    if not uid:
        raise HTTPException(status_code=401, detail="Authentication missing: user ID not provided")
    return uid

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# ── HEALTH ──────────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "DeChama API"}

# ── RATES (mock – no external dependency) ───────────────────────────────────
@app.get("/api/rates/btc-kes")
async def get_btc_kes_rate():
    return {"rate": 12850000, "currency": "KES", "source": "mock"}

# ── AUTH ─────────────────────────────────────────────────────────────────────
@app.post("/api/auth/register", response_model=schemas.Token)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # Check duplicate email
    result = await db.execute(select(models.User).filter(models.User.email == user.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    # Check duplicate phone
    if user.phoneNumber:
        result2 = await db.execute(select(models.User).filter(models.User.phoneNumber == user.phoneNumber))
        if result2.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Phone number already registered")

    db_user = models.User(
        id=str(uuid.uuid4()),
        email=user.email,
        hashed_password=auth.get_password_hash(user.password),
        phoneNumber=user.phoneNumber,
        displayName=user.displayName,
        referralCode=user.referralCode or f"REF{str(uuid.uuid4())[:6].upper()}",
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"success": True, "access_token": access_token, "token_type": "bearer", "user": db_user}

@app.post("/api/auth/login")
async def login(credentials: schemas.UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(
        (models.User.email == credentials.identifier) |
        (models.User.phoneNumber == credentials.identifier)
    ))
    user = result.scalar_one_or_none()
    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = auth.create_access_token(data={"sub": user.email})
    return {"success": True, "access_token": access_token, "token_type": "bearer", "user": user}

# ── CHAMAS ───────────────────────────────────────────────────────────────────
# Fix 3: Email Validation Sample Endpoint
class EmailValidReq(BaseModel):
    email: str

@app.post("/api/validate-email")
async def validate_email(req: EmailValidReq):
    # Basic check for simulation
    if "@" in req.email and "." in req.email.split("@")[1]:
        return {"valid": True}
    return {"valid": False, "reason": "Invalid domain format"}

# Updated Chama logic for Impact Chain
@app.post("/api/chamas/create", response_model=schemas.ChamaResponse)
async def create_chama(chama: dict, user_id: str = Depends(get_auth_user_id), db: AsyncSession = Depends(get_db)):
    # Validate user exists
    user_check = await db.execute(select(models.User).filter(models.User.id == user_id))
    if not user_check.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Authenticated user not found in database")
    
    # Handle Contribution Amount (Input is now in Sats)
    amount_raw = chama.get("contributionAmount") or 0
    try:
        amount_sats = int(amount_raw)
    except (ValueError, TypeError):
        amount_sats = 0
    
    # Handle Target Goal (Input is now in Sats)
    goal_raw = chama.get("target_goal_btc") or 0
    try:
        goal_sats = int(goal_raw)
    except (ValueError, TypeError):
        goal_sats = 0

    new_id = str(uuid.uuid4())
    db_chama = models.Chama(
        id=new_id,
        name=chama.get("name"),
        description=chama.get("description"),
        creator_id=user_id,
        contribution_amount_sats=amount_sats,
        target_goal_sats=goal_sats,
        max_members=int(chama.get("expectedMembers") or 100),
        payout_schedule=chama.get("frequency") or "Monthly",
        currency=chama.get("currency") or "BTC",
        member_count=1
    )
    
    # Check for duplicate name
    existing = await db.execute(select(models.Chama).filter(models.Chama.name == db_chama.name))
    if existing.scalar_one_or_none():
         raise HTTPException(status_code=400, detail=f"The name '{db_chama.name}' is already taken. Please choose another.")

    db.add(db_chama)
    
    # Auto-add creator as Admin
    membership = models.ChamaMembership(
        user_id=user_id,
        chama_id=new_id,
        status=models.MembershipStatus.ACTIVE,
        role=models.MemberRole.ADMIN
    )
    db.add(membership)
    
    try:
        await db.commit()
        await db.refresh(db_chama)
        return db_chama
    except Exception as e:
        await db.rollback()
        # Log the full error to terminal for debugging
        print(f"CRITICAL ERROR IN CREATE_CHAMA: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Database error: {str(e)}")

# Fix 6: Real Asset Statistics Endpoint
@app.get("/api/user/stats")
async def get_user_stats(user_id: str = Depends(get_auth_user_id), db: AsyncSession = Depends(get_db)):
    # Total Contribution across all chamas
    contribution_result = await db.execute(
        select(func.sum(models.Contribution.amount_sats))
        .filter(models.Contribution.user_id == user_id)
        .filter(models.Contribution.status == models.TransactionStatus.COMPLETED)
    )
    total_savings = contribution_result.scalar() or 0
    
    # Active memberships count
    chama_count_result = await db.execute(
        select(func.count(models.ChamaMembership.chama_id))
        .filter(models.ChamaMembership.user_id == user_id)
        .filter(models.ChamaMembership.status == models.MembershipStatus.ACTIVE)
    )
    active_groups = chama_count_result.scalar() or 0
    
    return {
        "total_savings_sats": total_savings,
        "active_groups": active_groups,
        "payouts_received_sats": 0 # Placeholder for now
    }

class LightningAddressUpdate(BaseModel):
    user_id: str
    lightning_address: str

@app.post("/api/user/lightning-address")
async def update_lightning_address(req: LightningAddressUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.id == req.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.lightning_address = req.lightning_address
    await db.commit()
    return {"success": True, "message": "Lightning address saved"}

@app.get("/api/chamas/hub")
async def get_chama_hub(user_id: str = Depends(get_auth_user_id), db: AsyncSession = Depends(get_db)):
    # ACTIVE Memberships
    joined_res = await db.execute(
        select(models.Chama)
        .join(models.ChamaMembership)
        .filter(models.ChamaMembership.user_id == user_id, models.ChamaMembership.status == models.MembershipStatus.ACTIVE)
    )
    joined = joined_res.scalars().all()
    
    # PENDING Memberships with Vote stats
    pending_res = await db.execute(
        select(models.Chama)
        .join(models.ChamaMembership)
        .filter(models.ChamaMembership.user_id == user_id, models.ChamaMembership.status == models.MembershipStatus.PENDING)
    )
    db_pending = pending_res.scalars().all()
    
    pending = []
    for c in db_pending:
        # Finding the join request for this user and this chama
        req_res = await db.execute(
            select(models.ChamaRequest)
            .filter(models.ChamaRequest.chama_id == c.id, models.ChamaRequest.user_id == user_id, models.ChamaRequest.type == 'join')
        )
        chama_req = req_res.scalar_one_or_none()
        
        # Total members to calculate 51%
        mem_count_res = await db.execute(select(func.count(models.ChamaMembership.user_id)).filter(models.ChamaMembership.chama_id == c.id, models.ChamaMembership.status == models.MembershipStatus.ACTIVE))
        total_m = mem_count_res.scalar() or 1
        
        approvals = 0
        if chama_req:
            votes_res = await db.execute(select(func.count(models.ChamaRequestVote.id)).filter(models.ChamaRequestVote.request_id == chama_req.id, models.ChamaRequestVote.vote == True))
            approvals = votes_res.scalar() or 0
            
        pending.append({
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "approvals": approvals,
            "total_members": total_m,
            "target_votes": int(total_m * 0.51) + 1
        })

    # IDs to exclude
    all_membership_res = await db.execute(
        select(models.ChamaMembership.chama_id).filter(models.ChamaMembership.user_id == user_id)
    )
    membership_ids = [row[0] for row in all_membership_res.all()]
    
    # Available Chamas (No membership record)
    available_res = await db.execute(
        select(models.Chama).filter(models.Chama.id.notin_(membership_ids)) if membership_ids else select(models.Chama)
    )
    available = available_res.scalars().all()
    
    return {
        "joined": joined,
        "pending": pending,
        "available": available
    }

@app.get("/api/chamas/discover")
async def discover_chamas(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Chama))
    return result.scalars().all()
# Fix 10: Actual Lightning Payment (Outgoing)
class PaymentRequest(BaseModel):
    bolt11: str
    reason: str # Fix 9: Required reason

@app.post("/api/payments/pay")
async def pay_lightning_invoice(req: PaymentRequest, db: AsyncSession = Depends(get_db)):
    try:
        # Call LNbits to pay the invoice
        result = await lnbits.pay_invoice(req.bolt11)
        
        # Log the transaction with reason (Fix 9)
        # For simplicity, we just return success if LNbits payment succeeds
        return {"success": True, "payment_hash": result.get("payment_hash")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/chamas", response_model=list[schemas.ChamaResponse])
async def get_user_chamas(user_id: str = Depends(get_auth_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Chama)
        .join(models.ChamaMembership)
        .filter(
            models.ChamaMembership.user_id == user_id,
            models.ChamaMembership.status == models.MembershipStatus.ACTIVE
        )
    )
    return result.scalars().all()

@app.get("/api/chamas/{chama_id}")
async def get_chama(chama_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Chama).filter(models.Chama.id == chama_id))
    chama = result.scalar_one_or_none()
    if not chama:
        raise HTTPException(status_code=404, detail="Chama not found")
    return chama

@app.get("/api/chamas/{chama_id}/my-membership")
async def get_my_membership(chama_id: str, user_id: str = Depends(get_auth_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.ChamaMembership).filter(
            models.ChamaMembership.chama_id == chama_id,
            models.ChamaMembership.user_id == user_id
        )
    )
    membership = result.scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    return {"role": membership.role, "status": membership.status}

@app.get("/api/chamas/{chama_id}/members")
async def get_chama_members(chama_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.ChamaMembership, models.User)
        .join(models.User, models.ChamaMembership.user_id == models.User.id)
        .filter(models.ChamaMembership.chama_id == chama_id)
    )
    rows = result.all()
    return [
        {
            "user_id": m.user_id,
            "displayName": u.displayName,
            "role": m.role,
            "status": m.status,
        }
        for m, u in rows
    ]

@app.post("/api/chamas/{chama_id}/join-request")
async def join_chama(chama_id: str, req: schemas.JoinRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(models.ChamaMembership).filter(
            models.ChamaMembership.chama_id == chama_id,
            models.ChamaMembership.user_id == req.user_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already a member or pending")
    membership = models.ChamaMembership(
        user_id=req.user_id,
        chama_id=chama_id,
        status=models.MembershipStatus.PENDING,
        role=models.MemberRole.MEMBER
    )
    db.add(membership)
    await db.commit()
    return {"message": "Join request submitted", "status": "pending"}

# ── CONTRIBUTIONS ─────────────────────────────────────────────────────────────
@app.post("/api/contributions/create-invoice")
async def create_invoice(req: schemas.InvoiceCreate, db: AsyncSession = Depends(get_db)):
    # Fix 7 & 8: Real LNbits Invoice
    try:
        # Create invoice in LNbits
        memo = f"Chama {req.chama_id} - User {req.user_id}"
        ln_data = await lnbits.create_ln_invoice(req.amount_sats, memo)
        
        payment_hash = ln_data["payment_hash"]
        payment_request = ln_data["payment_request"]

        # Fix Solo Savings: If chama_id is 'SOLO', we don't link to a chama record
        target_chama = None
        if req.chama_id and req.chama_id.strip().upper() != "SOLO":
            target_chama = req.chama_id
        
        print(f"Creating invoice: user={req.user_id}, chama_id={target_chama} (original={req.chama_id})")

        contribution = models.Contribution(
            id=str(uuid.uuid4()),
            user_id=req.user_id,
            chama_id=target_chama,
            amount_sats=req.amount_sats,
            payment_hash=payment_hash,
            status=models.TransactionStatus.PENDING
        )
        db.add(contribution)
        await db.commit()
        
        return {
            "payment_request": payment_request,
            "payment_hash": payment_hash,
            "expiry": 3600
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chamas/{chama_id}/dashboard")
async def get_chama_dashboard(chama_id: str, user_id: str = Depends(get_auth_user_id), db: AsyncSession = Depends(get_db)):
    # STRICT ACCESS CONTROL
    membership_res = await db.execute(select(models.ChamaMembership).filter(
        models.ChamaMembership.chama_id == chama_id,
        models.ChamaMembership.user_id == user_id,
        models.ChamaMembership.status == models.MembershipStatus.ACTIVE
    ))
    membership = membership_res.scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=403, detail="Access Denied: You must be an approved member of this Chama.")

    result = await db.execute(select(models.Chama).filter(models.Chama.id == chama_id))
    chama = result.scalar_one_or_none()
    if not chama: raise HTTPException(404, "Chama not found")
    
    # Get last payout date to define current cycle range
    last_payout_res = await db.execute(
        select(models.Payout.executed_at)
        .filter(models.Payout.chama_id == chama_id)
        .order_by(models.Payout.executed_at.desc())
        .limit(1)
    )
    last_payout_date = last_payout_res.scalar() or datetime.datetime(2020, 1, 1)

    # Rotation logic & Detailed member contribution stats
    members_result = await db.execute(
        select(models.User.id, models.User.displayName, models.ChamaMembership.joined_at)
        .join(models.User, models.ChamaMembership.user_id == models.User.id)
        .filter(models.ChamaMembership.chama_id == chama_id, models.ChamaMembership.status == models.MembershipStatus.ACTIVE)
        .order_by(models.ChamaMembership.joined_at.asc())
    )
    
    members = []
    for row in members_result.all():
        u_id, u_name, u_joined = row
        
        # SUM Contributions since last payout
        contrib_res = await db.execute(
            select(func.sum(models.Contribution.amount_sats))
            .filter(
                models.Contribution.user_id == u_id,
                models.Contribution.chama_id == chama_id,
                models.Contribution.status == models.TransactionStatus.COMPLETED,
                models.Contribution.timestamp >= last_payout_date
            )
        )
        paid = contrib_res.scalar() or 0
        
        # SUM internal transfers to this chama
        transfers_res = await db.execute(
            select(func.sum(models.Transaction.amount_sats))
            .filter(
                models.Transaction.user_id == u_id,
                models.Transaction.chama_id == chama_id,
                models.Transaction.type == 'transfer',
                models.Transaction.created_at >= last_payout_date
            )
        )
        transferred = transfers_res.scalar() or 0
        
        total_member_paid = paid + transferred
        
        members.append({
            "id": u_id,
            "name": u_name, 
            "joined_at": u_joined,
            "paid_sats": total_member_paid,
            "is_paid": total_member_paid >= chama.contribution_amount_sats
        })
    
    # Calculate payout info
    payouts_count_res = await db.execute(select(func.count(models.Payout.id)).filter(models.Payout.chama_id == chama_id))
    payout_count = payouts_count_res.scalar() or 0
    next_receiver = members[payout_count % len(members)]["name"] if members else "N/A"
    
    return {
        "chama": chama,
        "members": members,
        "next_receiver": next_receiver,
        "rotation_order": [m["name"] for m in members]
    }

@app.post("/api/savings/transfer-to-chama")
async def transfer_to_chama(req: dict, db: AsyncSession = Depends(get_db)):
    user_id = req.get("user_id")
    chama_id = req.get("chama_id")
    amount = int(req.get("amount_sats", 0))
    reason = req.get("reason", "Transfer from Solo Savings")

    # In real app: check user's solo balance. Here we just log it as a transfer.
    chama_result = await db.execute(select(models.Chama).filter(models.Chama.id == chama_id))
    chama = chama_result.scalar_one_or_none()
    if not chama: raise HTTPException(404, "Chama not found")
    
    chama.current_balance_sats += amount
    
    # Record Transaction
    tx = models.Transaction(
        id=str(uuid.uuid4()),
        user_id=user_id,
        chama_id=chama_id,
        type="transfer",
        amount_sats=amount,
        reason=reason,
        status=models.TransactionStatus.COMPLETED,
        completed_at=datetime.utcnow()
    )
    db.add(tx)
    await db.commit()
    return {"success": True, "new_balance": chama.current_balance_sats}

@app.get("/api/transactions")
async def list_transactions(user_id: str = Depends(get_auth_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Transaction)
        .filter(models.Transaction.user_id == user_id)
        .order_by(models.Transaction.created_at.desc())
    )
    return result.scalars().all()

@app.post("/api/transactions")
async def create_manual_transaction(tx: schemas.TransactionCreate, db: AsyncSession = Depends(get_db)):
    new_tx = models.Transaction(
        id=str(uuid.uuid4()),
        **tx.dict()
    )
    db.add(new_tx)
    await db.commit()
    await db.refresh(new_tx)
    return new_tx

@app.get("/api/contributions/check-payment/{payment_hash}")
async def check_contribution_payment(payment_hash: str, db: AsyncSession = Depends(get_db)):
    paid = await lnbits.check_invoice_status(payment_hash)
    if paid:
        result = await db.execute(
            select(models.Contribution).filter(models.Contribution.payment_hash == payment_hash)
        )
        contribution = result.scalar_one_or_none()
        if contribution and contribution.status != models.TransactionStatus.COMPLETED:
            contribution.status = models.TransactionStatus.COMPLETED
            
            chama = await db.get(models.Chama, contribution.chama_id)
            if chama:
                chama.current_balance_sats += contribution.amount_sats
                
                # CHECK FOR PAYOUT (Rotation Logic)
                # If pool is full, pay the next person
                members_res = await db.execute(
                    select(models.User)
                    .join(models.ChamaMembership)
                    .filter(models.ChamaMembership.chama_id == chama.id, models.ChamaMembership.status == models.MembershipStatus.ACTIVE)
                    .order_by(models.ChamaMembership.joined_at.asc())
                )
                active_members = members_res.scalars().all()
                
                required_total = chama.contribution_amount_sats * len(active_members)
                if chama.current_balance_sats >= required_total and required_total > 0:
                    # Determine next receiver
                    # Check payout history
                    payouts_res = await db.execute(select(func.count(models.Payout.id)).filter(models.Payout.chama_id == chama.id))
                    payout_count = payouts_res.scalar() or 0
                    
                    receiver = active_members[payout_count % len(active_members)]
                    
                    if receiver.lightning_address:
                        print(f"AUTOMATIC PAYOUT: Paying {chama.current_balance_sats} sats to {receiver.lightning_address} (Member: {receiver.displayName})")
                        try:
                            # In real app: call lnbits.pay_invoice() or use a LN address provider
                            # For MVP: Log and clear balance
                            payout = models.Payout(
                                id=str(uuid.uuid4()),
                                chama_id=chama.id,
                                recipient_id=receiver.id,
                                amount_sats=chama.current_balance_sats,
                                memo=f"Impact Chain Payout: {chama.name}",
                                status=models.TransactionStatus.COMPLETED,
                                executed_at=datetime.utcnow()
                            )
                            db.add(payout)
                            chama.current_balance_sats = 0 # Reset balance after payout rotation
                        except Exception as e:
                            print(f"Payout Failed: {e}")
                    else:
                        print(f"PAYOUT BLOCKED: {receiver.displayName} has no lightning address saved!")

            # Log as Transaction also
            tx = models.Transaction(
                id=str(uuid.uuid4()),
                user_id=contribution.user_id,
                chama_id=contribution.chama_id,
                type="deposit",
                amount_sats=contribution.amount_sats,
                reason=f"Lightning Deposit to {chama.name if chama else 'Group'}",
                payment_hash=payment_hash,
                status=models.TransactionStatus.COMPLETED,
                completed_at=datetime.utcnow()
            )
            db.add(tx)
            await db.commit()
            return {"status": "paid", "message": "Contribution confirmed!"}
    
    return {"status": "pending", "message": "Still waiting for payment..."}

# ── REQUESTS & GOVERNANCE ────────────────────────────────────────────────────────
@app.post("/api/chamas/{chama_id}/requests", response_model=schemas.ChamaRequestResponse)
async def create_request(chama_id: str, req: schemas.ChamaRequestCreate, user_id: str = Depends(get_auth_user_id), db: AsyncSession = Depends(get_db)):
    # MEMBERSHIP CHECK: ONLY ACTIVE MEMBERS CAN CREATE DYNAMIC REQUESTS
    if req.type != 'join':
        membership_res = await db.execute(select(models.ChamaMembership).filter(
            models.ChamaMembership.chama_id == chama_id,
            models.ChamaMembership.user_id == user_id,
            models.ChamaMembership.status == models.MembershipStatus.ACTIVE
        ))
        if not membership_res.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Permission Denied: Only active members can create requests.")

    req_id = str(uuid.uuid4())
    db_req = models.ChamaRequest(
        id=req_id,
        chama_id=chama_id,
        user_id=user_id,
        type=req.type,
        amount_sats=req.amount_sats,
        title=req.title,
        description=req.description,
        status=models.RequestStatus.PENDING
    )
    db.add(db_req)
    await db.commit()
    await db.refresh(db_req)
    return db_req

@app.get("/api/chamas/{chama_id}/requests")
async def get_chama_requests(chama_id: str, db: AsyncSession = Depends(get_db)):
    # Return requests along with vote counts
    result = await db.execute(
        select(models.ChamaRequest, models.User.displayName)
        .join(models.User, models.ChamaRequest.user_id == models.User.id)
        .filter(models.ChamaRequest.chama_id == chama_id)
        .order_by(models.ChamaRequest.created_at.desc())
    )
    reqs = result.all()

    out = []
    for r, display_name in reqs:
        # Get votes
        votes_res = await db.execute(select(models.ChamaRequestVote).filter(models.ChamaRequestVote.request_id == r.id))
        votes = votes_res.scalars().all()
        approvals = sum(1 for v in votes if v.vote)
        rejections = sum(1 for v in votes if not v.vote)
        out.append({
            "id": r.id,
            "type": r.type,
            "user_id": r.user_id,
            "user_name": display_name,
            "amount_sats": r.amount_sats,
            "title": r.title,
            "description": r.description,
            "status": r.status,
            "created_at": r.created_at,
            "approvals": approvals,
            "rejections": rejections,
            "total_votes": len(votes)
        })
    return out

@app.post("/api/chamas/requests/{request_id}/vote")
async def vote_on_request(request_id: str, vote: bool = Body(..., embed=True), user_id: str = Depends(get_auth_user_id), db: AsyncSession = Depends(get_db)):
    # Check if request exists
    req_res = await db.execute(select(models.ChamaRequest).filter(models.ChamaRequest.id == request_id))
    chama_req = req_res.scalar_one_or_none()
    if not chama_req:
        raise HTTPException(status_code=404, detail="Request not found")

    # Check existing vote
    vote_res = await db.execute(select(models.ChamaRequestVote).filter(
        models.ChamaRequestVote.request_id == request_id,
        models.ChamaRequestVote.user_id == user_id
    ))
    if vote_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User has already voted on this request")

    new_vote = models.ChamaRequestVote(
        id=str(uuid.uuid4()),
        request_id=request_id,
        user_id=user_id,
        vote=vote
    )
    db.add(new_vote)

    # Calculate if threshold met
    # Assume 51% of members needed
    members_res = await db.execute(select(func.count(models.ChamaMembership.user_id)).filter(
        models.ChamaMembership.chama_id == chama_req.chama_id,
        models.ChamaMembership.status == models.MembershipStatus.ACTIVE
    ))
    total_members = members_res.scalar() or 1
    
    votes_res = await db.execute(select(models.ChamaRequestVote).filter(models.ChamaRequestVote.request_id == request_id))
    all_votes = votes_res.scalars().all()
    approvals = sum(1 for v in all_votes if v.vote) + (1 if vote else 0)
    
    if approvals / total_members > 0.5:
        chama_req.status = models.RequestStatus.APPROVED
        # Auto-create membership if join request
        if chama_req.type == 'join': # Using string literal for safety
            existing_mem = await db.execute(select(models.ChamaMembership).filter(
                models.ChamaMembership.chama_id == chama_req.chama_id,
                models.ChamaMembership.user_id == chama_req.user_id
            ))
            m = existing_mem.scalar_one_or_none()
            if m:
                m.status = models.MembershipStatus.ACTIVE
            else:
                db.add(models.ChamaMembership(
                    user_id=chama_req.user_id, 
                    chama_id=chama_req.chama_id, 
                    status=models.MembershipStatus.ACTIVE,
                    role=models.MemberRole.MEMBER
                ))

    await db.commit()
    return {"success": True, "status": chama_req.status}

# ── INVITES & EMAILS ──────────────────────────────────────────────────────────
@app.post("/api/invite")
async def send_invite(email: str = Body(..., embed=True), chama_id: str = Body(None, embed=True), db: AsyncSession = Depends(get_db)):
    # Mock Resend API call
    print(f"[RESEND/EMAILJS MOCK] Sending invite to {email} for Chama {chama_id}")
    print(f"[RESEND/EMAILJS MOCK] Subject: You've been invited to Impact Chain!")
    print(f"[RESEND/EMAILJS MOCK] Body: Click here to join: http://localhost:5173/signup?chama={chama_id}")
    return {"success": True, "message": f"Invite sent successfully to {email}"}
