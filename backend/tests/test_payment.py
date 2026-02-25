import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
import json
import hmac
import hashlib

@pytest.mark.asyncio
async def test_list_products(client: AsyncClient):
    """Test listing available products"""
    response = await client.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert "products" in data
    assert len(data["products"]) == 3
    
    skus = {p["sku"] for p in data["products"]}
    assert "starter" in skus
    assert "pro" in skus
    assert "unlimited" in skus

@pytest.mark.asyncio
async def test_checkout_invalid_sku(client: AsyncClient):
    """Test checkout with invalid product SKU"""
    response = await client.post(
        "/api/v1/checkout",
        json={
            "product_sku": "invalid_sku",
            "device_id": "test-device"
        }
    )
    assert response.status_code == 400
    data = response.json()
    assert "Invalid product" in data["detail"]

@pytest.mark.asyncio
async def test_checkout_not_configured(client: AsyncClient):
    """Test checkout when Creem not configured"""
    response = await client.post(
        "/api/v1/checkout",
        json={
            "product_sku": "starter",
            "device_id": "test-device"
        }
    )
    # Should fail because no API key configured
    assert response.status_code == 503
    data = response.json()
    assert "not configured" in data["detail"]

@pytest.mark.asyncio
async def test_get_tokens_new_device(client: AsyncClient):
    """Test getting tokens for new device"""
    response = await client.get(
        "/api/v1/tokens",
        headers={"X-Device-Id": "brand-new-device"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["used"] == 0
    assert data["remaining"] == 0
    assert data["is_premium"] is False

@pytest.mark.asyncio
async def test_webhook_invalid_signature(client: AsyncClient):
    """Test webhook rejects invalid signature when secret is set"""
    with patch("app.api.v1.payment.settings") as mock_settings:
        mock_settings.creem_webhook_secret = "test_secret"
        
        response = await client.post(
            "/api/v1/webhook",
            content=json.dumps({"type": "checkout.completed"}),
            headers={
                "Content-Type": "application/json",
                "creem-signature": "invalid_signature"
            }
        )
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_webhook_checkout_completed(client: AsyncClient):
    """Test webhook processes checkout.completed event"""
    payload = {
        "type": "checkout.completed",
        "data": {
            "id": "checkout_123",
            "metadata": {
                "device_id": "webhook-test-device",
                "product_sku": "starter"
            }
        }
    }
    body = json.dumps(payload).encode()
    
    # Without webhook secret configured, signature isn't checked
    with patch("app.api.v1.payment.settings") as mock_settings:
        mock_settings.creem_webhook_secret = ""
        
        response = await client.post(
            "/api/v1/webhook",
            content=body,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
    
    # Verify tokens were created
    response = await client.get(
        "/api/v1/tokens",
        headers={"X-Device-Id": "webhook-test-device"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 50  # starter pack
    assert data["is_premium"] is True

@pytest.mark.asyncio
async def test_webhook_ignores_unknown_event(client: AsyncClient):
    """Test webhook ignores unknown event types"""
    response = await client.post(
        "/api/v1/webhook",
        json={"type": "unknown.event"},
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ignored"
