from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from .models import MemberRole, MembershipStatus, TransactionStatus

# ── AUTH ──────────────────────────────────────────────────────────────────────
class UserBase(BaseModel):
    email: Optional[str] = None # Fix 1: Permissive str instead of strict EmailStr to avoid false negatives
    phoneNumber: Optional[str] = None
    displayName: Optional[str] = Field(None, alias="display_name")
    referralCode: Optional[str] = None
    referredBy: Optional[str] = None
    id: Optional[str] = None

    class Config:
        populate_by_name = True
        from_attributes = True

class UserCreate(BaseModel):
    email: Optional[str] = None # Fix 1
    phoneNumber: Optional[str] = None
    # Accept both camelCase and snake_case from frontend
    displayName: Optional[str] = Field(None, alias="display_name")
    password: str
    referralCode: Optional[str] = None

    class Config:
        populate_by_name = True

class UserLogin(BaseModel):
    identifier: str  # email or phone
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserBase

# ── CHAMAS ────────────────────────────────────────────────────────────────────
class ChamaBase(BaseModel):
    name: str
    description: Optional[str] = None
    contribution_amount_sats: int
    target_goal_sats: int = 0
    max_members: int = 100
    payout_schedule: str
    currency: str = "BTC"

class ChamaCreate(ChamaBase):
    creator_id: str

class ChamaResponse(ChamaBase):
    id: str
    creator_id: str
    current_balance_sats: int
    member_count: int = 1
    created_at: datetime

    class Config:
        from_attributes = True

# ── TRANSACTIONS ──────────────────────────────────────────────────────────────
class TransactionBase(BaseModel):
    user_id: str
    chama_id: Optional[str] = None
    type: str # 'deposit', 'withdrawal', 'transfer'
    amount_sats: int
    reason: str
    status: TransactionStatus = TransactionStatus.PENDING

class TransactionCreate(TransactionBase):
    payment_hash: Optional[str] = None
    bolt11: Optional[str] = None

class TransactionResponse(TransactionBase):
    id: str
    payment_hash: Optional[str] = None
    bolt11: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ── MEMBERSHIP ────────────────────────────────────────────────────────────────
class JoinRequest(BaseModel):
    user_id: str
    chama_id: Optional[str] = None

class VoteRequest(BaseModel):
    target_user_id: str
    chama_id: str
    vote: bool
    reason: Optional[str] = None

# ── CONTRIBUTIONS ─────────────────────────────────────────────────────────────
class InvoiceCreate(BaseModel):
    user_id: str
    chama_id: str
    amount_sats: int
    memo: Optional[str] = "Contribution" # Fix 9/10 support

class InvoiceResponse(BaseModel):
    payment_request: str
    payment_hash: str
    expiry: int

# ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
class NotificationResponse(BaseModel):
    id: str
    type: str
    message: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True
