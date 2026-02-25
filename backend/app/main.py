from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.api.v1 import voices, generate, health, payment, tokens
from app.metrics import metrics_router
from app.database import init_db

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title=settings.app_name,
    description="Compare 200+ AI voices side by side",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, tags=["Health"])
app.include_router(voices.router, prefix="/api/v1", tags=["Voices"])
app.include_router(generate.router, prefix="/api/v1", tags=["Generate"])
app.include_router(payment.router, prefix="/api/v1", tags=["Payment"])
app.include_router(tokens.router, prefix="/api/v1", tags=["Tokens"])
app.include_router(metrics_router, tags=["Metrics"])
