"""
Custom OpenAI Client for TinyVerse.

This module provides a custom OpenAI client that can be configured with a custom
base URL without modifying TinyTroupe source code. It subclasses TinyTroupe's
OpenAIClient and overrides the setup method to inject custom configuration.
"""
from typing import Optional
from tinytroupe.openai_utils import OpenAIClient


class CustomOpenAIClient(OpenAIClient):
    """
    Custom OpenAI client that supports configurable base URL.
    
    This client extends TinyTroupe's OpenAIClient to allow runtime configuration
    of the OpenAI API base URL and other connection parameters.
    """
    
    def __init__(self, custom_base_url: Optional[str] = None, cache_api_calls: bool = False, cache_file_name: str = "openai_api_cache.pickle"):
        """
        Initialize the custom OpenAI client.
        
        Args:
            custom_base_url: Optional custom base URL for OpenAI API
            cache_api_calls: Whether to cache API calls
            cache_file_name: Name of the cache file
        """
        self.custom_base_url = custom_base_url
        super().__init__(cache_api_calls=cache_api_calls, cache_file_name=cache_file_name)
    
    def _setup_from_config(self):
        """
        Setup the OpenAI client from configuration.
        
        This method overrides the parent class method to inject the custom base URL
        if provided, while maintaining compatibility with TinyTroupe's configuration.
        """
        # Call parent setup to initialize default configuration
        super()._setup_from_config()
        
        # Override base_url if custom one is provided
        if self.custom_base_url:
            import openai
            # Update the client's base_url
            if hasattr(openai, 'api_base'):
                openai.api_base = self.custom_base_url
            # For newer OpenAI SDK versions, update the client instance
            if hasattr(self, 'client') and hasattr(self.client, 'base_url'):
                self.client.base_url = self.custom_base_url


def setup_custom_openai_client(base_url: Optional[str] = None) -> CustomOpenAIClient:
    """
    Setup and register a custom OpenAI client with TinyTroupe.
    
    Args:
        base_url: Optional custom base URL for OpenAI API
        
    Returns:
        The configured custom OpenAI client
    """
    from tinytroupe import openai_utils
    
    # Create custom client
    client = CustomOpenAIClient(custom_base_url=base_url)
    
    # Register with TinyTroupe
    openai_utils.register_client(client)
    
    # Force the API type if using custom base URL
    if base_url:
        openai_utils.force_api_type("openai")
    
    return client
