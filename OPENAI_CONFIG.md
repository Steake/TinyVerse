# OpenAI Configuration Guide

This guide explains how to configure TinyVerse to work with OpenAI or OpenAI-compatible APIs.

## Overview

TinyVerse integrates with TinyTroupe, which uses OpenAI's API for agent simulation. You can configure:
- OpenAI API credentials
- Custom base URLs for OpenAI-compatible services
- Azure OpenAI endpoints
- Model and temperature parameters

## Configuration Methods

### Method 1: Web UI (Recommended)

The easiest way to configure TinyVerse is through the Settings panel:

1. Start the TinyVerse backend and frontend servers
2. Open TinyVerse in your browser
3. Click the **⚙️ Settings** icon in the left sidebar
4. Configure your settings:
   - **OpenAI Tab**: For standard OpenAI or compatible APIs
     - Enter your API key
     - (Optional) Set a custom base URL
   - **Azure OpenAI Tab**: For Azure OpenAI Service
     - Enter your Azure OpenAI key
     - Enter your Azure endpoint URL
   - **TinyTroupe Settings**: Configure model and temperature
5. Click **Save Configuration**

Settings are automatically:
- Saved to the `.env` file
- Applied immediately (no restart needed)
- Validated before saving

### Method 2: Environment Variables

You can also configure settings directly in the `.env` file:

```bash
# Standard OpenAI
OPENAI_API_KEY=sk-your-key-here
OPENAI_API_BASE_URL=  # Leave empty for default

# Azure OpenAI (alternative)
AZURE_OPENAI_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/

# TinyTroupe settings
TINYTROUPE_MODEL=gpt-4o-mini
TINYTROUPE_TEMPERATURE=0.7
```

## Using Custom Base URLs

TinyVerse supports any OpenAI-compatible API through custom base URLs.

### LocalAI

Run a local LLM with [LocalAI](https://localai.io/):

```bash
# Start LocalAI
docker run -p 8080:8080 localai/localai:latest

# In TinyVerse Settings, set:
# Custom Base URL: http://localhost:8080/v1
```

### OpenRouter

Use [OpenRouter](https://openrouter.ai/) for access to multiple models:

```bash
# In TinyVerse Settings, set:
# API Key: your-openrouter-key
# Custom Base URL: https://openrouter.ai/api/v1
```

### LM Studio

Use [LM Studio](https://lmstudio.ai/) to run models locally:

```bash
# Start LM Studio server on port 1234
# In TinyVerse Settings, set:
# Custom Base URL: http://localhost:1234/v1
```

### Other Compatible Services

Any service that implements the OpenAI API format can be used:
- Ollama with OpenAI compatibility
- vLLM server
- Text Generation WebUI with API mode
- And more...

## Model Selection

Available models (depends on your API provider):
- `gpt-4o-mini` (Recommended for cost/performance)
- `gpt-4o`
- `gpt-4-turbo`
- `gpt-4`
- `gpt-3.5-turbo`

For custom APIs, use the model name supported by your provider.

## Temperature Setting

Temperature controls randomness in agent responses:
- **0.0-0.3**: More focused and deterministic
- **0.4-0.7**: Balanced (recommended)
- **0.8-1.0**: More creative and varied
- **1.1-2.0**: Very creative (may be unpredictable)

## Security Notes

- API keys are masked in the UI (only first 4 and last 4 characters shown)
- Keys are stored in `.env` file (git-ignored by default)
- Never commit `.env` files to version control
- Use read-only API keys when possible
- Consider using environment-specific configuration for production

## Troubleshooting

### "Failed to initialize OpenAI client"
- Check that your API key is valid
- Verify the base URL is correct and accessible
- Ensure the service is running (for local APIs)

### "Failed to save configuration"
- Check that the backend has write permissions to `.env` file
- Verify the backend server is running

### API calls failing
- Verify API key has sufficient credits/quota
- Check network connectivity to the API endpoint
- Review the backend server logs for detailed errors

### Custom base URL not working
- Ensure the URL includes the version path (e.g., `/v1`)
- Test the endpoint directly with curl
- Check CORS settings if using a local service

## Advanced: Custom OpenAI Client

For developers who want to customize the OpenAI client behavior beyond what's available in the UI, you can modify `backend/app/services/custom_openai_client.py`. The custom client:

- Extends TinyTroupe's `OpenAIClient`
- Overrides `_setup_from_config()` to inject custom base URL
- Registers itself with TinyTroupe on startup
- Can be extended for additional customization

## API Reference

### GET /api/config
Retrieve current configuration (with masked API keys).

**Response:**
```json
{
  "openai_api_key": "sk-1...xyz",
  "openai_api_base_url": "https://api.openai.com/v1",
  "azure_openai_key": "",
  "azure_openai_endpoint": "",
  "tinytroupe_model": "gpt-4o-mini",
  "tinytroupe_temperature": 0.7,
  "api_base_configured": true
}
```

### PATCH /api/config
Update configuration settings.

**Request:**
```json
{
  "openai_api_key": "sk-new-key",
  "openai_api_base_url": "https://custom-api.com/v1",
  "tinytroupe_model": "gpt-4o",
  "tinytroupe_temperature": 0.5
}
```

**Response:** Same as GET /api/config with updated values.

## See Also

- [TinyTroupe Documentation](https://github.com/microsoft/TinyTroupe)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
