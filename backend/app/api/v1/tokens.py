from fastapi import APIRouter, Header, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.token import GenerationToken

router = APIRouter()

@router.get("/tokens")
async def get_tokens(
    x_device_id: str = Header(..., alias="X-Device-Id"),
    db: AsyncSession = Depends(get_db)
):
    """Get token balance for a device"""
    result = await db.execute(
        select(GenerationToken).where(
            GenerationToken.device_id == x_device_id
        )
    )
    token = result.scalar_one_or_none()
    
    if not token:
        return {
            "total": 0,
            "used": 0,
            "remaining": 0,
            "is_premium": False
        }
    
    return {
        "total": token.tokens_total,
        "used": token.tokens_used,
        "remaining": token.tokens_remaining,
        "is_premium": token.tokens_remaining > 0,
        "product_sku": token.product_sku
    }
