from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
import edge_tts
import httpx
import io
import base64

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.database import get_db
from app.config import get_settings
from app.models.token import GenerationToken, FreeTrialUsage
from app.metrics import voice_generations, free_trial_used, tokens_consumed, TOOL_NAME

router = APIRouter()
settings = get_settings()

class GenerateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    voice_id: str
    provider: str = "edge"  # edge or openai

class GenerateResponse(BaseModel):
    audio_base64: str
    format: str = "mp3"
    voice_id: str
    provider: str

class BatchGenerateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    voice_ids: List[str] = Field(..., min_items=1, max_items=4)

async def check_usage(device_id: str, db: AsyncSession) -> tuple[bool, int]:
    """Check if user has available generations. Returns (can_generate, remaining)"""
    today = date.today().isoformat()
    
    # Check paid tokens first
    token_result = await db.execute(
        select(GenerationToken).where(
            and_(
                GenerationToken.device_id == device_id,
                GenerationToken.tokens_total > GenerationToken.tokens_used
            )
        )
    )
    token = token_result.scalar_one_or_none()
    if token:
        return True, token.tokens_remaining
    
    # Check free trial
    usage_result = await db.execute(
        select(FreeTrialUsage).where(
            and_(
                FreeTrialUsage.device_id == device_id,
                FreeTrialUsage.date == today
            )
        )
    )
    usage = usage_result.scalar_one_or_none()
    
    if not usage:
        return True, settings.free_generations_per_day
    
    remaining = settings.free_generations_per_day - usage.usage_count
    return remaining > 0, remaining

async def consume_usage(device_id: str, db: AsyncSession):
    """Consume one generation from user's quota"""
    today = date.today().isoformat()
    
    # Try paid tokens first
    token_result = await db.execute(
        select(GenerationToken).where(
            and_(
                GenerationToken.device_id == device_id,
                GenerationToken.tokens_total > GenerationToken.tokens_used
            )
        )
    )
    token = token_result.scalar_one_or_none()
    if token:
        token.tokens_used += 1
        tokens_consumed.labels(tool=TOOL_NAME).inc()
        await db.commit()
        return
    
    # Use free trial
    usage_result = await db.execute(
        select(FreeTrialUsage).where(
            and_(
                FreeTrialUsage.device_id == device_id,
                FreeTrialUsage.date == today
            )
        )
    )
    usage = usage_result.scalar_one_or_none()
    
    if not usage:
        usage = FreeTrialUsage(device_id=device_id, date=today, usage_count=1)
        db.add(usage)
    else:
        usage.usage_count += 1
    
    free_trial_used.labels(tool=TOOL_NAME).inc()
    await db.commit()

async def generate_edge_tts(text: str, voice_id: str) -> bytes:
    """Generate audio using Edge TTS"""
    communicate = edge_tts.Communicate(text, voice_id)
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
    return audio_data

async def generate_openai_tts(text: str, voice_id: str) -> bytes:
    """Generate audio using OpenAI TTS via llm-proxy"""
    if not settings.llm_proxy_key:
        raise HTTPException(status_code=503, detail="OpenAI TTS not configured")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.llm_proxy_url}/v1/audio/speech",
            headers={
                "Authorization": f"Bearer {settings.llm_proxy_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "tts-1",
                "input": text,
                "voice": voice_id,
                "response_format": "mp3"
            },
            timeout=60.0
        )
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="OpenAI TTS generation failed")
        return response.content

@router.post("/generate", response_model=GenerateResponse)
async def generate_voice(
    request: GenerateRequest,
    x_device_id: str = Header(..., alias="X-Device-Id"),
    db: AsyncSession = Depends(get_db)
):
    """Generate voice audio from text"""
    
    # Check usage
    can_generate, remaining = await check_usage(x_device_id, db)
    if not can_generate:
        raise HTTPException(
            status_code=402,
            detail="No generations remaining. Please purchase more tokens."
        )
    
    # Generate audio
    try:
        if request.provider == "edge":
            audio_data = await generate_edge_tts(request.text, request.voice_id)
        elif request.provider == "openai":
            audio_data = await generate_openai_tts(request.text, request.voice_id)
        else:
            raise HTTPException(status_code=400, detail="Invalid provider")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
    
    # Consume usage
    await consume_usage(x_device_id, db)
    
    # Record metrics
    voice_generations.labels(
        tool=TOOL_NAME,
        provider=request.provider,
        voice_id=request.voice_id
    ).inc()
    
    return GenerateResponse(
        audio_base64=base64.b64encode(audio_data).decode(),
        format="mp3",
        voice_id=request.voice_id,
        provider=request.provider
    )

@router.post("/generate/stream")
async def generate_voice_stream(
    request: GenerateRequest,
    x_device_id: str = Header(..., alias="X-Device-Id"),
    db: AsyncSession = Depends(get_db)
):
    """Generate voice audio and stream directly"""
    
    can_generate, _ = await check_usage(x_device_id, db)
    if not can_generate:
        raise HTTPException(
            status_code=402,
            detail="No generations remaining. Please purchase more tokens."
        )
    
    if request.provider == "edge":
        audio_data = await generate_edge_tts(request.text, request.voice_id)
    elif request.provider == "openai":
        audio_data = await generate_openai_tts(request.text, request.voice_id)
    else:
        raise HTTPException(status_code=400, detail="Invalid provider")
    
    await consume_usage(x_device_id, db)
    
    voice_generations.labels(
        tool=TOOL_NAME,
        provider=request.provider,
        voice_id=request.voice_id
    ).inc()
    
    return StreamingResponse(
        io.BytesIO(audio_data),
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": f"attachment; filename={request.voice_id}.mp3"
        }
    )

@router.get("/usage")
async def get_usage(
    x_device_id: str = Header(..., alias="X-Device-Id"),
    db: AsyncSession = Depends(get_db)
):
    """Get current usage status for a device"""
    can_generate, remaining = await check_usage(x_device_id, db)
    
    # Check for paid tokens
    token_result = await db.execute(
        select(GenerationToken).where(
            GenerationToken.device_id == x_device_id
        )
    )
    token = token_result.scalar_one_or_none()
    
    return {
        "can_generate": can_generate,
        "remaining": remaining,
        "is_premium": token is not None and token.tokens_remaining > 0,
        "free_limit": settings.free_generations_per_day
    }
