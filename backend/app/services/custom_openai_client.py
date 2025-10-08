"""
Custom OpenAI Client for TinyVerse.

This module provides a custom OpenAI client that can be configured with a custom
base URL without modifying TinyTroupe source code. It subclasses TinyTroupe's
OpenAIClient and overrides the setup method to inject custom configuration.
"""
import os
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
        
        Inject a custom base URL when one is provided while keeping TinyTroupe's
        default behaviour otherwise. Newer versions of the openai python client
        expect the base URL to be provided at construction time (or through the
        `OPENAI_BASE_URL` env var) rather than by mutating the attribute later, so
        we rebuild the client when a custom base is requested.
        """
        # If we have a custom base we need to recreate the OpenAI client with it.
        if self.custom_base_url:
            import openai
            from openai import OpenAI

            # Ensure downstream libraries can also discover the override
            os.environ["OPENAI_BASE_URL"] = self.custom_base_url

            if hasattr(openai, "api_base"):
                openai.api_base = self.custom_base_url

            self.client = OpenAI(
                api_key=os.getenv("OPENAI_API_KEY"),
                base_url=self.custom_base_url,
            )
        else:
            # Fall back to TinyTroupe's standard setup which honours env vars.
            super()._setup_from_config()

    def _raw_model_call(self, model, chat_api_params):
        """Call the upstream client while stripping OpenAI-only features."""

        # Some non-OpenAI providers (DeepSeek, etc.) reject the "response_format"
        # parameter and also do not expose the .beta.parse() surface. When a
        # custom base URL is configured we proactively drop the field so the
        # generic chat completion path is used.
        if self.custom_base_url:
            chat_api_params = dict(chat_api_params)

            # DeepSeek rejects OpenAI's response_format beta payloads. Strip it
            # so the generic chat completion path is used instead.
            chat_api_params.pop("response_format", None)

            # DeepSeek exposes its own nucleus sampling defaults. To avoid
            # tripping vendor-specific validation we simply defer to the
            # provider and drop any explicit top_p override.
            chat_api_params.pop("top_p", None)

            max_tokens = chat_api_params.get("max_tokens")
            if max_tokens is not None:
                try:
                    max_tokens_value = int(max_tokens)
                except (TypeError, ValueError):
                    max_tokens_value = None

                if max_tokens_value is None:
                    chat_api_params.pop("max_tokens", None)
                else:
                    if max_tokens_value < 1:
                        chat_api_params.pop("max_tokens", None)
                    elif max_tokens_value > 8192:
                        chat_api_params["max_tokens"] = 8192

        return super()._raw_model_call(model, chat_api_params)


def setup_custom_openai_client(base_url: Optional[str] = None) -> CustomOpenAIClient:
    """
    Setup and register a custom OpenAI client with TinyTroupe.
    
    Args:
        base_url: Optional custom base URL for OpenAI API
        
    Returns:
        The configured custom OpenAI client
    """
    from tinytroupe import openai_utils, config_manager, default
    
    # Create custom client
    client = CustomOpenAIClient(custom_base_url=base_url)
    
    # Register with TinyTroupe under the OpenAI API type
    openai_utils.register_client("openai", client)
    
    # Force the API type if using custom base URL
    if base_url:
        openai_utils.force_api_type("openai")

    # Align TinyTroupe model selection with environment overrides to avoid
    # accidental calls to unsupported OpenAI defaults when using alternate
    # providers (DeepSeek, etc.).
    model_override = os.getenv("TINYTROUPE_MODEL") or os.getenv("TINYTROUPE_DEFAULT_MODEL")
    if model_override:
        # Update both the config manager and the legacy default dict so that
        # every call path (old + new TinyTroupe APIs) sees the correct model.
        config_manager.update("model", model_override)
        default["model"] = model_override

    # Allow callers to override temperature as well, since some providers have
    # tighter limits or prefer cooler defaults. This stays optional.
    temperature_override = os.getenv("TINYTROUPE_TEMPERATURE")
    if temperature_override:
        try:
            parsed_temperature = float(temperature_override)
        except ValueError:
            parsed_temperature = None

        if parsed_temperature is not None:
            config_manager.update("temperature", parsed_temperature)
            default["temperature"] = parsed_temperature

    # DeepSeek caps completions at 8,192 tokens regardless of OpenAI default
    # limits. Clamp TinyTroupe's max_tokens baseline so we don't send values
    # the provider will reject outright when a custom base URL is in play.
    max_tokens_cap = 8192

    max_tokens_env = os.getenv("TINYTROUPE_MAX_TOKENS") or os.getenv("TINYTROUPE_DEFAULT_MAX_TOKENS")
    if max_tokens_env:
        try:
            parsed_max_tokens = int(max_tokens_env)
        except ValueError:
            parsed_max_tokens = None

        if parsed_max_tokens is not None:
            parsed_max_tokens = max(1, min(parsed_max_tokens, max_tokens_cap))
            config_manager.update("max_tokens", parsed_max_tokens)
            default["max_tokens"] = parsed_max_tokens
    else:
        current_max_tokens = default.get("max_tokens")
        if isinstance(current_max_tokens, (int, float)) and current_max_tokens > max_tokens_cap:
            config_manager.update("max_tokens", max_tokens_cap)
            default["max_tokens"] = max_tokens_cap
    
    return client
