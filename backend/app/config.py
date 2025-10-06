"""
Configuration settings for TinyVerse backend.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings."""
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    
    # Database
    database_url: str = "sqlite:///./tinyverse.db"
    
    # OpenAI Configuration (for TinyTroupe)
    openai_api_key: str = ""
    azure_openai_key: str = ""
    azure_openai_endpoint: str = ""
    
    # TinyTroupe Configuration
    tinytroupe_model: str = "gpt-4o-mini"
    tinytroupe_temperature: float = 0.7
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
