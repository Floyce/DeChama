from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from .models import MemberRole, MembershipStatus, TransactionStatus

# Auth Schemas
class UserBase(BaseModel):
    email: EmailStr
    phoneNumber: Optional[str] = None
    displayName: str = Field(..., alias="display_name")
    referralCode: Optional[str] = None
    referredBy: Optional[str] = None

    class Config:
        populate_by_name = True

class UserCreate(UserBase):
    password: str
    referralCode: Optional[str] = None

class UserLogin(BaseModel):
    identifier: str # email or phone
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserBase

# Chama Schemas
class ChamaBase(BaseModel):
    name: str
    description: Optional[str] = None
    contribution_amount_sats: int
    payout_schedule: str
    currency: str = "BTC"

class ChamaCreate(ChamaBase):
    creator_id: str

class ChamaResponse(ChamaBase):
    id: str
    creator_id: str
    current_balance_sats: int
    created_at: datetime

    class Config:
        from_attributes = True

# Membership Schemas
class JoinRequest(BaseModel):
    user_id: str
    chama_id: str

class VoteRequest(BaseModel):
    target_user_id: str
    chama_id: str
    vote: bool
    reason: Optional[str] = None

# Contribution Schemas
class InvoiceCreate(BaseModel):
    user_id: str
    chama_id: str
    amount_sats: int

class InvoiceResponse(BaseModel):
    payment_request: str
    payment_hash: str
    expiry: int

# Notification Schemas
class NotificationResponse(BaseModel):
    id: str
    type: str
    message: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True
