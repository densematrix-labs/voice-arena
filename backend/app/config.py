from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "Voice Arena"
    tool_name: str = "voice-arena"
    debug: bool = False
    
    # LLM Proxy for OpenAI TTS
    llm_proxy_url: str = "https://llm-proxy.densematrix.ai"
    llm_proxy_key: str = ""
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./voice_arena.db"
    
    # Creem Payment
    creem_api_key: str = ""
    creem_webhook_secret: str = ""
    creem_product_ids: str = "{}"
    
    # Free tier limits
    free_generations_per_day: int = 3
    
    class Config:
        env_file = ".env"

@lru_cache
def get_settings():
    return Settings()
