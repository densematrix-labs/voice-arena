import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test health endpoint returns 200"""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "voice-arena"

@pytest.mark.asyncio
async def test_root(client: AsyncClient):
    """Test root endpoint"""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "Voice Arena" in data["message"]
    assert "version" in data

@pytest.mark.asyncio
async def test_metrics_endpoint(client: AsyncClient):
    """Test Prometheus metrics endpoint"""
    response = await client.get("/metrics")
    assert response.status_code == 200
    assert "voice_generations_total" in response.text or "http_requests_total" in response.text
