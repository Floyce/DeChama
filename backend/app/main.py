import sys
sys.modules['_wmi'] = None

from fastapi import FastAPI, Depends, HTTPException, status, Body, Query
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
async def create_chama(chama: dict, db: AsyncSession = Depends(get_db)):
    # Fix 3: Robust Chama Creation logic
    user_id = chama.get("userId") or chama.get("creator_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user ID")
    
    # Convert BTC decimal to Sats int if needed
    amount_btc = chama.get("contributionAmount") or 0
    amount_sats = int(float(amount_btc) * 100_000_000) if isinstance(amount_btc, str) and amount_btc else chama.get("contribution_amount_sats", 1000)
    
    goal_btc = chama.get("target_goal_btc") or 0
    goal_sats = int(float(goal_btc) * 100_000_000) if isinstance(goal_btc, str) and goal_btc else chama.get("target_goal_sats", 0)

    new_id = str(uuid.uuid4())
    db_chama = models.Chama(
        id=new_id,
        name=chama.get("name"),
        description=chama.get("description"),
        creator_id=user_id,
        contribution_amount_sats=amount_sats,
        target_goal_sats=goal_sats,
        max_members=int(chama.get("expectedMembers") or 10),
        payout_schedule=chama.get("frequency") or "Monthly",
        currency=chama.get("currency") or "BTC",
        member_count=1
    )
    db.add(db_chama)
    
    # Auto-add creator as Admin (Fix 3: Immediate membership)
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
        raise HTTPException(status_code=400, detail=f"Error creating chama: {str(e)}")

# Fix 6: Real Asset Statistics Endpoint
@app.get("/api/user/stats")
async def get_user_stats(user_id: str = Query(...), db: AsyncSession = Depends(get_db)):
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

@app.get("/api/chamas/hub")
async def get_chama_hub(user_id: str = Query(...), db: AsyncSession = Depends(get_db)):
    # Joined Chamas
    joined_result = await db.execute(
        select(models.Chama)
        .join(models.ChamaMembership)
        .filter(models.ChamaMembership.user_id == user_id)
    )
    joined = joined_result.scalars().all()
    
    # Available Chamas (Not joined)
    joined_ids = [c.id for c in joined]
    available_result = await db.execute(
        select(models.Chama).filter(models.Chama.id.notin_(joined_ids)) if joined_ids else select(models.Chama)
    )
    available = available_result.scalars().all()
    
    return {
        "joined": joined,
        "available": available
    }

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
async def get_user_chamas(user_id: str = Query(...), db: AsyncSession = Depends(get_db)):
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
async def get_my_membership(chama_id: str, user_id: str = Query(...), db: AsyncSession = Depends(get_db)):
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
async def get_chama_dashboard(chama_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Chama).filter(models.Chama.id == chama_id))
    chama = result.scalar_one_or_none()
    if not chama: raise HTTPException(404, "Chama not found")
    
    # Rotation logic: join dates
    members_result = await db.execute(
        select(models.User.displayName, models.ChamaMembership.joined_at)
        .join(models.User, models.ChamaMembership.user_id == models.User.id)
        .filter(models.ChamaMembership.chama_id == chama_id, models.ChamaMembership.status == models.MembershipStatus.ACTIVE)
        .order_by(models.ChamaMembership.joined_at.asc())
    )
    members = [{"name": m[0], "joined_at": m[1]} for m in members_result.all()]
    
    # Calculate who receives next
    # For MVP: cycle based on current_balance vs contribution_amount
    payout_count = 0 # In real app, check Payouts table
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
async def list_transactions(user_id: str = Query(...), db: AsyncSession = Depends(get_db)):
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
