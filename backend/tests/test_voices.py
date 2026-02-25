import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock

# Mock Edge TTS voices for testing
MOCK_VOICES = [
    {
        "ShortName": "en-US-JennyNeural",
        "FriendlyName": "Jenny",
        "Locale": "en-US",
        "LocaleName": "English (United States)",
        "Gender": "Female",
        "VoiceStyleNames": ["cheerful", "sad"]
    },
    {
        "ShortName": "zh-CN-XiaoxiaoNeural",
        "FriendlyName": "Xiaoxiao",
        "Locale": "zh-CN",
        "LocaleName": "Chinese (Simplified)",
        "Gender": "Female",
        "VoiceStyleNames": []
    },
    {
        "ShortName": "ja-JP-NanamiNeural",
        "FriendlyName": "Nanami",
        "Locale": "ja-JP",
        "LocaleName": "Japanese (Japan)",
        "Gender": "Female",
        "VoiceStyleNames": []
    },
]

@pytest.fixture
def mock_edge_voices():
    with patch("app.api.v1.voices.edge_tts.list_voices", new_callable=AsyncMock) as mock:
        mock.return_value = MOCK_VOICES
        # Clear cache
        from app.api.v1 import voices
        voices._voices_cache = []
        yield mock
        voices._voices_cache = []

@pytest.mark.asyncio
async def test_list_voices(client: AsyncClient, mock_edge_voices):
    """Test listing all voices"""
    response = await client.get("/api/v1/voices")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "voices" in data
    # 3 edge + 6 openai
    assert data["total"] == 9

@pytest.mark.asyncio
async def test_filter_voices_by_language(client: AsyncClient, mock_edge_voices):
    """Test filtering voices by language"""
    response = await client.get("/api/v1/voices?language=zh")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["voices"][0]["id"] == "zh-CN-XiaoxiaoNeural"

@pytest.mark.asyncio
async def test_filter_voices_by_gender(client: AsyncClient, mock_edge_voices):
    """Test filtering voices by gender"""
    response = await client.get("/api/v1/voices?gender=male")
    assert response.status_code == 200
    data = response.json()
    # Only OpenAI male voices (echo, onyx)
    assert data["total"] == 2

@pytest.mark.asyncio
async def test_filter_voices_by_provider(client: AsyncClient, mock_edge_voices):
    """Test filtering voices by provider"""
    response = await client.get("/api/v1/voices?provider=openai")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 6
    assert all(v["provider"] == "openai" for v in data["voices"])

@pytest.mark.asyncio
async def test_search_voices(client: AsyncClient, mock_edge_voices):
    """Test searching voices by name"""
    response = await client.get("/api/v1/voices?search=jenny")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert "Jenny" in data["voices"][0]["name"]

@pytest.mark.asyncio
async def test_list_languages(client: AsyncClient, mock_edge_voices):
    """Test listing available languages"""
    response = await client.get("/api/v1/voices/languages")
    assert response.status_code == 200
    data = response.json()
    assert "languages" in data
    lang_codes = [l["code"] for l in data["languages"]]
    assert "en" in lang_codes
    assert "zh" in lang_codes
    assert "ja" in lang_codes

@pytest.mark.asyncio
async def test_list_providers(client: AsyncClient, mock_edge_voices):
    """Test listing providers"""
    response = await client.get("/api/v1/voices/providers")
    assert response.status_code == 200
    data = response.json()
    assert "providers" in data
    providers = {p["id"]: p for p in data["providers"]}
    assert "edge" in providers
    assert "openai" in providers
    assert providers["edge"]["free"] is True
