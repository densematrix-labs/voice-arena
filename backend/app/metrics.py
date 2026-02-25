import os
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import APIRouter
from fastapi.responses import Response

TOOL_NAME = os.getenv("TOOL_NAME", "voice-arena")

# HTTP Metrics
http_requests = Counter(
    "http_requests_total", 
    "HTTP requests", 
    ["tool", "endpoint", "method", "status"]
)
http_request_duration = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration",
    ["tool", "endpoint"]
)

# Business Metrics
voice_generations = Counter(
    "voice_generations_total",
    "Voice generation requests",
    ["tool", "provider", "voice_id"]
)
voice_comparisons = Counter(
    "voice_comparisons_total",
    "Multi-voice comparison sessions",
    ["tool"]
)
tokens_consumed = Counter(
    "tokens_consumed_total",
    "Tokens consumed",
    ["tool"]
)
free_trial_used = Counter(
    "free_trial_used_total",
    "Free trial generations",
    ["tool"]
)
payment_success = Counter(
    "payment_success_total",
    "Successful payments",
    ["tool", "product_sku"]
)
payment_revenue_cents = Counter(
    "payment_revenue_cents_total",
    "Total revenue in cents",
    ["tool"]
)

# SEO Metrics
page_views = Counter(
    "page_views_total",
    "Page views",
    ["tool", "page"]
)
crawler_visits = Counter(
    "crawler_visits_total",
    "Crawler visits",
    ["tool", "bot"]
)

metrics_router = APIRouter()

@metrics_router.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
