from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "voice-arena"}

@router.get("/")
async def root():
    return {"message": "Voice Arena API", "version": "1.0.0"}
