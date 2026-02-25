import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
import base64

@pytest.fixture
def mock_edge_tts():
    """Mock edge TTS generation"""
    async def mock_stream(self):
        yield {"type": "audio", "data": b"mock_audio_data_12345"}
    
    with patch("app.api.v1.generate.edge_tts.Communicate") as mock:
        instance = AsyncMock()
        instance.stream = mock_stream
        mock.return_value = instance
        yield mock

@pytest.mark.asyncio
async def test_generate_voice_success(client: AsyncClient, mock_edge_tts):
    """Test successful voice generation"""
    response = await client.post(
        "/api/v1/generate",
        json={
            "text": "Hello world",
            "voice_id": "en-US-JennyNeural",
            "provider": "edge"
        },
        headers={"X-Device-Id": "test-device-001"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "audio_base64" in data
    assert data["format"] == "mp3"
    assert data["voice_id"] == "en-US-JennyNeural"
    assert data["provider"] == "edge"
    
    # Verify base64 is valid
    audio_bytes = base64.b64decode(data["audio_base64"])
    assert len(audio_bytes) > 0

@pytest.mark.asyncio
async def test_generate_voice_missing_device_id(client: AsyncClient):
    """Test generation fails without device ID"""
    response = await client.post(
        "/api/v1/generate",
        json={
            "text": "Hello world",
            "voice_id": "en-US-JennyNeural",
            "provider": "edge"
        }
    )
    assert response.status_code == 422  # Missing required header

@pytest.mark.asyncio
async def test_generate_voice_empty_text(client: AsyncClient):
    """Test generation fails with empty text"""
    response = await client.post(
        "/api/v1/generate",
        json={
            "text": "",
            "voice_id": "en-US-JennyNeural",
            "provider": "edge"
        },
        headers={"X-Device-Id": "test-device-001"}
    )
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_generate_voice_invalid_provider(client: AsyncClient):
    """Test generation fails with invalid provider"""
    response = await client.post(
        "/api/v1/generate",
        json={
            "text": "Hello world",
            "voice_id": "en-US-JennyNeural",
            "provider": "invalid"
        },
        headers={"X-Device-Id": "test-device-001"}
    )
    assert response.status_code == 400
    data = response.json()
    assert "Invalid provider" in str(data["detail"])

@pytest.mark.asyncio
async def test_generate_exhausts_free_trial(client: AsyncClient, mock_edge_tts):
    """Test free trial limit enforcement"""
    device_id = "test-device-exhaust"
    
    # Use all 3 free generations
    for i in range(3):
        response = await client.post(
            "/api/v1/generate",
            json={
                "text": f"Test {i}",
                "voice_id": "en-US-JennyNeural",
                "provider": "edge"
            },
            headers={"X-Device-Id": device_id}
        )
        assert response.status_code == 200
    
    # 4th should fail
    response = await client.post(
        "/api/v1/generate",
        json={
            "text": "Should fail",
            "voice_id": "en-US-JennyNeural",
            "provider": "edge"
        },
        headers={"X-Device-Id": device_id}
    )
    assert response.status_code == 402
    data = response.json()
    # Verify error message is a string, not object
    assert isinstance(data["detail"], str)
    assert "remaining" in data["detail"].lower() or "token" in data["detail"].lower()

@pytest.mark.asyncio
async def test_get_usage(client: AsyncClient):
    """Test getting usage status"""
    response = await client.get(
        "/api/v1/usage",
        headers={"X-Device-Id": "new-device-001"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["can_generate"] is True
    assert data["remaining"] == 3  # Free limit
    assert data["is_premium"] is False

@pytest.mark.asyncio
async def test_error_detail_format_402(client: AsyncClient, mock_edge_tts):
    """Test 402 error detail is string (not object) for frontend compatibility"""
    device_id = "test-402-format"
    
    # Exhaust free tier
    for i in range(3):
        await client.post(
            "/api/v1/generate",
            json={"text": f"Test {i}", "voice_id": "en-US-JennyNeural", "provider": "edge"},
            headers={"X-Device-Id": device_id}
        )
    
    response = await client.post(
        "/api/v1/generate",
        json={"text": "Should fail", "voice_id": "en-US-JennyNeural", "provider": "edge"},
        headers={"X-Device-Id": device_id}
    )
    assert response.status_code == 402
    data = response.json()
    
    # CRITICAL: detail must be string for frontend to display correctly
    detail = data.get("detail")
    assert isinstance(detail, str), f"402 detail must be string, got: {type(detail)} = {detail}"
    assert "[object" not in str(detail).lower()
