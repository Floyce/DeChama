from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, JSON, BigInteger, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import datetime
import enum
from .database import Base

class MemberRole(str, enum.Enum):
    ADMIN = "admin"
    MEMBER = "member"

class MembershipStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    REJECTED = "rejected"

class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class User(Base):

    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    phoneNumber = Column(String, unique=True, index=True)
    country_code = Column(String)
    wallet_address = Column(String)
    referralCode = Column(String)
    referredBy = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    memberships = relationship("ChamaMembership", back_populates="user")
    contributions = relationship("Contribution", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    nfts = relationship("NFT", back_populates="user")

class Chama(Base):
    __tablename__ = "chamas"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    creator_id = Column(String, ForeignKey("users.id"))
    contribution_amount_sats = Column(BigInteger, default=0)
    payout_schedule = Column(String) # Cron or descriptive string
    current_balance_sats = Column(BigInteger, default=0)
    currency = Column(String, default="BTC")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    members = relationship("ChamaMembership", back_populates="chama")
    contributions = relationship("Contribution", back_populates="chama")
    payouts = relationship("Payout", back_populates="chama")
    votes = relationship("MemberVote", back_populates="chama")

class ChamaMembership(Base):
    __tablename__ = "chama_memberships"

    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    chama_id = Column(String, ForeignKey("chamas.id"), primary_key=True)
    status = Column(Enum(MembershipStatus), default=MembershipStatus.PENDING)
    role = Column(Enum(MemberRole), default=MemberRole.MEMBER)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="memberships")
    chama = relationship("Chama", back_populates="members")

class Contribution(Base):
    __tablename__ = "contributions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    chama_id = Column(String, ForeignKey("chamas.id"))
    amount_sats = Column(BigInteger, nullable=False)
    payment_hash = Column(String, unique=True, index=True)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING)
    nft_token_id = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="contributions")
    chama = relationship("Chama", back_populates="contributions")
    nft = relationship("NFT", back_populates="contribution", uselist=False)

class Payout(Base):
    __tablename__ = "payouts"

    id = Column(String, primary_key=True, index=True)
    chama_id = Column(String, ForeignKey("chamas.id"))
    recipient_id = Column(String, ForeignKey("users.id"))
    amount_sats = Column(BigInteger, nullable=False)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING)
    scheduled_date = Column(DateTime(timezone=True))
    executed_at = Column(DateTime(timezone=True))

    chama = relationship("Chama", back_populates="payouts")

class NFT(Base):
    __tablename__ = "nfts"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    chama_id = Column(String, ForeignKey("chamas.id"))
    contribution_id = Column(String, ForeignKey("contributions.id"))
    token_id = Column(String, unique=True)
    metadata_ipfs_hash = Column(String)
    minted_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="nfts")
    contribution = relationship("Contribution", back_populates="nft")

class MemberVote(Base):
    __tablename__ = "member_votes"

    id = Column(String, primary_key=True, index=True)
    target_user_id = Column(String, ForeignKey("users.id"))
    chama_id = Column(String, ForeignKey("chamas.id"))
    voter_id = Column(String, ForeignKey("users.id"))
    vote = Column(Boolean) # True = Approve, False = Reject
    reason = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    chama = relationship("Chama", back_populates="votes")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    type = Column(String) # 'contribution', 'payout', 'join_request'
    message = Column(String)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
