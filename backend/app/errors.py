"""
Custom error handling for TinyVerse API.

Provides standardized error responses matching the API specification.
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from typing import Dict, Any, Optional


class APIError(Exception):
    """Base API error class."""
    
    def __init__(
        self, 
        code: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    ):
        self.code = code
        self.message = message
        self.details = details or {}
        self.status_code = status_code
        super().__init__(self.message)


def create_error_response(
    code: str,
    message: str,
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Create a standardized error response.
    
    Args:
        code: Error code (e.g., "400_BAD_REQUEST")
        message: Human-readable error message
        details: Optional additional error context
        
    Returns:
        Dictionary with error response structure
    """
    response = {
        "code": code,
        "message": message,
    }
    if details:
        response["details"] = details
    return response


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle FastAPI validation errors with custom format.
    
    Transforms Pydantic validation errors into API spec format.
    """
    errors = {}
    for error in exc.errors():
        field = ".".join(str(x) for x in error["loc"][1:])  # Skip 'body'
        errors[field] = error["msg"]
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=create_error_response(
            code="400_BAD_REQUEST",
            message="Invalid request parameters",
            details=errors
        )
    )


async def api_error_handler(request: Request, exc: APIError):
    """
    Handle custom API errors.
    
    Returns errors in the standardized format.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content=create_error_response(
            code=exc.code,
            message=exc.message,
            details=exc.details
        )
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """
    Handle unexpected exceptions.
    
    Returns a generic 500 error while logging the actual error.
    """
    # In production, this should log the actual error for debugging
    print(f"Unexpected error: {exc}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=create_error_response(
            code="500_SERVER_ERROR",
            message="Internal server error",
            details={"error": str(exc)}
        )
    )
