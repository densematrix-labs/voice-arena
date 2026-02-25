from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float
from sqlalchemy.sql import func
from app.database import Base

class GenerationToken(Base):
    __tablename__ = "generation_tokens"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String(255), index=True, nullable=False)
    tokens_total = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)
    product_sku = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    @property
    def tokens_remaining(self):
        return self.tokens_total - self.tokens_used

class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    checkout_id = Column(String(255), unique=True, index=True)
    device_id = Column(String(255), index=True)
    product_sku = Column(String(100))
    amount_cents = Column(Integer)
    currency = Column(String(10), default="USD")
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)

class FreeTrialUsage(Base):
    __tablename__ = "free_trial_usage"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String(255), index=True, nullable=False)
    date = Column(String(10), index=True, nullable=False)  # YYYY-MM-DD
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
