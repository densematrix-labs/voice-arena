from fastapi import APIRouter, Query
from typing import Optional, List
import edge_tts
import asyncio

router = APIRouter()

# Cache for voices
_voices_cache: List[dict] = []

async def get_edge_voices():
    """Fetch all available Edge TTS voices"""
    global _voices_cache
    if _voices_cache:
        return _voices_cache
    
    voices = await edge_tts.list_voices()
    _voices_cache = [
        {
            "id": v["ShortName"],
            "name": v["FriendlyName"],
            "language": v["Locale"],
            "language_name": v.get("LocaleName", ""),
            "gender": v["Gender"],
            "provider": "edge",
            "styles": v.get("VoiceStyleNames", []),
            "sample_url": None,  # Could add pre-generated samples
        }
        for v in voices
    ]
    return _voices_cache

# OpenAI TTS voices (static list)
OPENAI_VOICES = [
    {"id": "alloy", "name": "Alloy", "language": "en-US", "language_name": "English (US)", "gender": "Neutral", "provider": "openai", "styles": ["conversational"]},
    {"id": "echo", "name": "Echo", "language": "en-US", "language_name": "English (US)", "gender": "Male", "provider": "openai", "styles": ["conversational"]},
    {"id": "fable", "name": "Fable", "language": "en-US", "language_name": "English (US)", "gender": "Neutral", "provider": "openai", "styles": ["storytelling"]},
    {"id": "onyx", "name": "Onyx", "language": "en-US", "language_name": "English (US)", "gender": "Male", "provider": "openai", "styles": ["authoritative"]},
    {"id": "nova", "name": "Nova", "language": "en-US", "language_name": "English (US)", "gender": "Female", "provider": "openai", "styles": ["warm"]},
    {"id": "shimmer", "name": "Shimmer", "language": "en-US", "language_name": "English (US)", "gender": "Female", "provider": "openai", "styles": ["expressive"]},
]

@router.get("/voices")
async def list_voices(
    language: Optional[str] = Query(None, description="Filter by language code (e.g., en, zh, ja)"),
    gender: Optional[str] = Query(None, description="Filter by gender (Male, Female, Neutral)"),
    provider: Optional[str] = Query(None, description="Filter by provider (edge, openai)"),
    search: Optional[str] = Query(None, description="Search by voice name"),
):
    """List all available voices with optional filters"""
    edge_voices = await get_edge_voices()
    all_voices = edge_voices + OPENAI_VOICES
    
    # Apply filters
    result = all_voices
    
    if language:
        result = [v for v in result if v["language"].lower().startswith(language.lower())]
    
    if gender:
        result = [v for v in result if v["gender"].lower() == gender.lower()]
    
    if provider:
        result = [v for v in result if v["provider"].lower() == provider.lower()]
    
    if search:
        search_lower = search.lower()
        result = [v for v in result if search_lower in v["name"].lower() or search_lower in v["id"].lower()]
    
    return {
        "total": len(result),
        "voices": result
    }

@router.get("/voices/languages")
async def list_languages():
    """Get all available languages"""
    voices = await get_edge_voices()
    languages = {}
    for v in voices:
        lang_code = v["language"][:2]
        if lang_code not in languages:
            languages[lang_code] = {
                "code": lang_code,
                "name": v["language_name"].split(" (")[0] if " (" in v["language_name"] else v["language_name"],
                "count": 0
            }
        languages[lang_code]["count"] += 1
    
    # Add OpenAI
    languages["en"]["count"] += len(OPENAI_VOICES)
    
    return {"languages": sorted(languages.values(), key=lambda x: -x["count"])}

@router.get("/voices/providers")
async def list_providers():
    """Get provider statistics"""
    edge_voices = await get_edge_voices()
    return {
        "providers": [
            {"id": "edge", "name": "Microsoft Edge TTS", "count": len(edge_voices), "free": True},
            {"id": "openai", "name": "OpenAI TTS", "count": len(OPENAI_VOICES), "free": False},
        ]
    }
