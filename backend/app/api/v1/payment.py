from fastapi import APIRouter, HTTPException, Header, Request, Depends
from pydantic import BaseModel
from typing import Optional
import json
import hmac
import hashlib
import httpx
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.config import get_settings
from app.models.token import GenerationToken, PaymentTransaction
from app.metrics import payment_success, payment_revenue_cents, TOOL_NAME

router = APIRouter()
settings = get_settings()

# Product configuration
PRODUCTS = {
    "starter": {"tokens": 50, "price_cents": 300},
    "pro": {"tokens": 200, "price_cents": 800},
    "unlimited": {"tokens": 9999, "price_cents": 1200},  # Monthly unlimited
}

class CheckoutRequest(BaseModel):
    product_sku: str
    device_id: str
    success_url: Optional[str] = None
    
class CheckoutResponse(BaseModel):
    checkout_url: str
    checkout_id: str

@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    request: CheckoutRequest,
    db: AsyncSession = Depends(get_db)
):
    """Create a Creem checkout session"""
    
    if request.product_sku not in PRODUCTS:
        raise HTTPException(status_code=400, detail="Invalid product SKU")
    
    product = PRODUCTS[request.product_sku]
    
    # Get Creem product ID from config
    try:
        product_ids = json.loads(settings.creem_product_ids)
        creem_product_id = product_ids.get(request.product_sku)
    except:
        creem_product_id = None
    
    if not creem_product_id or not settings.creem_api_key:
        raise HTTPException(status_code=503, detail="Payment not configured")
    
    success_url = request.success_url or "https://voice-arena.demo.densematrix.ai/payment/success"
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.creem.io/v1/checkouts",
            headers={
                "Authorization": f"Bearer {settings.creem_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "product_id": creem_product_id,
                "success_url": f"{success_url}?session_id={{CHECKOUT_SESSION_ID}}",
                "metadata": {
                    "device_id": request.device_id,
                    "product_sku": request.product_sku
                }
            },
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to create checkout")
        
        data = response.json()
        checkout_id = data.get("id")
        checkout_url = data.get("checkout_url")
    
    # Record pending transaction
    transaction = PaymentTransaction(
        checkout_id=checkout_id,
        device_id=request.device_id,
        product_sku=request.product_sku,
        amount_cents=product["price_cents"],
        status="pending"
    )
    db.add(transaction)
    await db.commit()
    
    return CheckoutResponse(checkout_url=checkout_url, checkout_id=checkout_id)

@router.post("/webhook")
async def handle_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Handle Creem webhook"""
    
    body = await request.body()
    signature = request.headers.get("creem-signature", "")
    
    # Verify signature
    if settings.creem_webhook_secret:
        expected = hmac.new(
            settings.creem_webhook_secret.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    data = json.loads(body)
    event_type = data.get("type")
    
    if event_type == "checkout.completed":
        checkout_data = data.get("data", {})
        checkout_id = checkout_data.get("id")
        metadata = checkout_data.get("metadata", {})
        
        device_id = metadata.get("device_id")
        product_sku = metadata.get("product_sku")
        
        if not device_id or not product_sku:
            return {"status": "ignored", "reason": "missing metadata"}
        
        # Update transaction
        tx_result = await db.execute(
            select(PaymentTransaction).where(
                PaymentTransaction.checkout_id == checkout_id
            )
        )
        transaction = tx_result.scalar_one_or_none()
        if transaction:
            transaction.status = "completed"
            transaction.completed_at = datetime.utcnow()
        
        # Create tokens
        product = PRODUCTS.get(product_sku, {})
        tokens_to_add = product.get("tokens", 0)
        
        # Check for existing token record
        token_result = await db.execute(
            select(GenerationToken).where(
                GenerationToken.device_id == device_id
            )
        )
        token = token_result.scalar_one_or_none()
        
        if token:
            token.tokens_total += tokens_to_add
        else:
            token = GenerationToken(
                device_id=device_id,
                tokens_total=tokens_to_add,
                tokens_used=0,
                product_sku=product_sku
            )
            db.add(token)
        
        await db.commit()
        
        # Record metrics
        payment_success.labels(tool=TOOL_NAME, product_sku=product_sku).inc()
        payment_revenue_cents.labels(tool=TOOL_NAME).inc(product.get("price_cents", 0))
        
        return {"status": "ok"}
    
    return {"status": "ignored"}

@router.get("/products")
async def list_products():
    """List available products"""
    return {
        "products": [
            {
                "sku": sku,
                "tokens": p["tokens"],
                "price_cents": p["price_cents"],
                "price_display": f"${p['price_cents']/100:.2f}"
            }
            for sku, p in PRODUCTS.items()
        ]
    }
