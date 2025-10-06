"""
Configuration API endpoints.

This module provides REST API endpoints for managing TinyVerse backend configuration,
including OpenAI settings that affect TinyTroupe behavior.
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from app.config import settings
from app.services.custom_openai_client import setup_custom_openai_client
import os
import json


router = APIRouter(prefix="/config", tags=["config"])


class ConfigUpdate(BaseModel):
    """Schema for configuration updates."""
    openai_api_key: Optional[str] = Field(None, description="OpenAI API key")
    openai_api_base_url: Optional[str] = Field(None, description="Custom OpenAI API base URL")
    azure_openai_key: Optional[str] = Field(None, description="Azure OpenAI API key")
    azure_openai_endpoint: Optional[str] = Field(None, description="Azure OpenAI endpoint")
    tinytroupe_model: Optional[str] = Field(None, description="TinyTroupe model name")
    tinytroupe_temperature: Optional[float] = Field(None, description="TinyTroupe temperature", ge=0.0, le=2.0)


class ConfigResponse(BaseModel):
    """Schema for configuration response."""
    openai_api_key: str = Field("", description="OpenAI API key (masked)")
    openai_api_base_url: str = Field("", description="Custom OpenAI API base URL")
    azure_openai_key: str = Field("", description="Azure OpenAI API key (masked)")
    azure_openai_endpoint: str = Field("", description="Azure OpenAI endpoint")
    tinytroupe_model: str = Field("gpt-4o-mini", description="TinyTroupe model name")
    tinytroupe_temperature: float = Field(0.7, description="TinyTroupe temperature")
    api_base_configured: bool = Field(False, description="Whether a custom base URL is configured")


def mask_api_key(key: str) -> str:
    """Mask an API key for display."""
    if not key or len(key) < 8:
        return ""
    return f"{key[:4]}...{key[-4:]}"


def save_config_to_env(config_data: dict):
    """
    Save configuration to .env file.
    
    Args:
        config_data: Dictionary with configuration values
    """
    env_path = "/home/runner/work/TinyVerse/TinyVerse/backend/.env"
    
    # Read existing .env file or create empty dict
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    
    # Update with new values
    for key, value in config_data.items():
        if value is not None:
            env_key = key.upper()
            env_vars[env_key] = str(value)
    
    # Write back to file
    with open(env_path, 'w') as f:
        for key, value in env_vars.items():
            f.write(f"{key}={value}\n")


@router.get("", response_model=ConfigResponse)
async def get_config():
    """
    Get current configuration.
    
    Returns masked API keys and other configuration values.
    """
    return ConfigResponse(
        openai_api_key=mask_api_key(settings.openai_api_key),
        openai_api_base_url=settings.openai_api_base_url,
        azure_openai_key=mask_api_key(settings.azure_openai_key),
        azure_openai_endpoint=settings.azure_openai_endpoint,
        tinytroupe_model=settings.tinytroupe_model,
        tinytroupe_temperature=settings.tinytroupe_temperature,
        api_base_configured=bool(settings.openai_api_base_url),
    )


@router.patch("", response_model=ConfigResponse)
async def update_config(config: ConfigUpdate):
    """
    Update configuration.
    
    Updates configuration values and reinitializes the OpenAI client if needed.
    """
    updates = {}
    
    # Update settings object
    if config.openai_api_key is not None:
        settings.openai_api_key = config.openai_api_key
        updates["openai_api_key"] = config.openai_api_key
        # Set environment variable for TinyTroupe
        os.environ["OPENAI_API_KEY"] = config.openai_api_key
    
    if config.openai_api_base_url is not None:
        settings.openai_api_base_url = config.openai_api_base_url
        updates["openai_api_base_url"] = config.openai_api_base_url
    
    if config.azure_openai_key is not None:
        settings.azure_openai_key = config.azure_openai_key
        updates["azure_openai_key"] = config.azure_openai_key
        os.environ["AZURE_OPENAI_KEY"] = config.azure_openai_key
    
    if config.azure_openai_endpoint is not None:
        settings.azure_openai_endpoint = config.azure_openai_endpoint
        updates["azure_openai_endpoint"] = config.azure_openai_endpoint
        os.environ["AZURE_OPENAI_ENDPOINT"] = config.azure_openai_endpoint
    
    if config.tinytroupe_model is not None:
        settings.tinytroupe_model = config.tinytroupe_model
        updates["tinytroupe_model"] = config.tinytroupe_model
    
    if config.tinytroupe_temperature is not None:
        settings.tinytroupe_temperature = config.tinytroupe_temperature
        updates["tinytroupe_temperature"] = config.tinytroupe_temperature
    
    # Save to .env file for persistence
    try:
        save_config_to_env(updates)
    except Exception as e:
        # Log but don't fail - settings are already updated in memory
        print(f"Warning: Could not save config to .env file: {e}")
    
    # Reinitialize OpenAI client with new base URL if provided
    if config.openai_api_base_url is not None or config.openai_api_key is not None:
        try:
            setup_custom_openai_client(
                base_url=settings.openai_api_base_url if settings.openai_api_base_url else None
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to reinitialize OpenAI client: {str(e)}"
            )
    
    return ConfigResponse(
        openai_api_key=mask_api_key(settings.openai_api_key),
        openai_api_base_url=settings.openai_api_base_url,
        azure_openai_key=mask_api_key(settings.azure_openai_key),
        azure_openai_endpoint=settings.azure_openai_endpoint,
        tinytroupe_model=settings.tinytroupe_model,
        tinytroupe_temperature=settings.tinytroupe_temperature,
        api_base_configured=bool(settings.openai_api_base_url),
    )
