from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import socketio

from .database import get_db, engine, Base
from . import models, schemas, auth
from .services.lightning import lightning_service
from .services.stacks import stacks_service
from .services.notifications import notification_service
from .services.sockets import sio

app = FastAPI(title="Impact Chain API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Socket.IO
app_sio = socketio.ASGIApp(sio, app)

@app.on_event("startup")
async def startup():
    # In production, use migrations!
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# --- AUTH ROUTES ---

@app.post("/api/auth/register", response_model=schemas.Token)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.email == user.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = models.User(
        id=str(uuid.uuid4()),
        email=user.email,
        hashed_password=auth.get_password_hash(user.password),
        phoneNumber=user.phoneNumber,
        displayName=user.displayName,
        referralCode=user.referralCode
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"success": True, "access_token": access_token, "token_type": "bearer", "user": db_user}

@app.post("/api/auth/login")
async def login(credentials: schemas.UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(
        (models.User.email == credentials.identifier) | (models.User.phoneNumber == credentials.identifier)
    ))
    user = result.scalar_one_or_none()
    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"success": True, "access_token": access_token, "token_type": "bearer", "user": user}

# --- CHAMA ROUTES ---

@app.post("/api/chamas/create", response_model=schemas.ChamaResponse)
async def create_chama(chama: schemas.ChamaCreate, db: AsyncSession = Depends(get_db)):
    db_chama = models.Chama(
        id=str(uuid.uuid4()),
        **chama.dict()
    )
    db.add(db_chama)
    
    # Add creator as Admin member
    membership = models.ChamaMembership(
        user_id=chama.creator_id,
        chama_id=db_chama.id,
        status=models.MembershipStatus.ACTIVE,
        role=models.MemberRole.ADMIN
    )
    db.add(membership)
    
    await db.commit()
    await db.refresh(db_chama)
    return db_chama

@app.get("/api/user/chamas", response_model=list[schemas.ChamaResponse])
async def get_user_chamas(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Chama).join(models.ChamaMembership).filter(
        models.ChamaMembership.user_id == user_id,
        models.ChamaMembership.status == models.MembershipStatus.ACTIVE
    ))
    return result.scalars().all()

# --- LIGHTNING & CONTRIBUTIONS ---

@app.post("/api/contributions/create-invoice", response_model=schemas.InvoiceResponse)
async def create_invoice(req: schemas.InvoiceCreate, db: AsyncSession = Depends(get_db)):
    invoice = await lightning_service.create_invoice(
        amount_sats=req.amount_sats,
        memo=f"Contribution to Chama {req.chama_id}"
    )
    
    contribution = models.Contribution(
        id=str(uuid.uuid4()),
        user_id=req.user_id,
        chama_id=req.chama_id,
        amount_sats=req.amount_sats,
        payment_hash=invoice["payment_hash"],
        status=models.TransactionStatus.PENDING
    )
    db.add(contribution)
    await db.commit()
    return invoice

@app.post("/api/webhooks/lightning")
async def lightning_webhook(payload: dict = Body(...), db: AsyncSession = Depends(get_db)):
    payment_hash = payload.get("payment_hash")
    # Verify with LND
    status = await lightning_service.lookup_invoice(payment_hash)
    if status["settled"]:
        result = await db.execute(select(models.Contribution).filter(models.Contribution.payment_hash == payment_hash))
        contribution = result.scalar_one_or_none()
        if contribution and contribution.status != models.TransactionStatus.COMPLETED:
            contribution.status = models.TransactionStatus.COMPLETED
            
            # Mint NFT via Stacks
            nft_data = await stacks_service.mint_contribution_nft(
                user_id=contribution.user_id,
                amount=contribution.amount_sats,
                timestamp=str(contribution.timestamp)
            )
            
            db_nft = models.NFT(
                id=str(uuid.uuid4()),
                user_id=contribution.user_id,
                chama_id=contribution.chama_id,
                contribution_id=contribution.id,
                token_id=nft_data["token_id"],
                metadata_ipfs_hash=nft_data["metadata_url"]
            )
            db.add(db_nft)
            
            # Update Chama Balance
            result = await db.execute(select(models.Chama).filter(models.Chama.id == contribution.chama_id))
            chama = result.scalar_one()
            chama.current_balance_sats += contribution.amount_sats
            
            # Send Notification
            await notification_service.send_email(
                to_email="user@example.com", # Get from user object
                subject="Contribution Confirmed",
                content=f"Your contribution of {contribution.amount_sats} sats has been confirmed."
            )
            
            await db.commit()
            return {"status": "success"}
    return {"status": "pending"}

# Final export for uvicorn
app = app_sio
