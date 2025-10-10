"""Autofill endpoints for LLM-powered form generation."""
from fastapi import APIRouter, HTTPException, status
from typing import Union

from app.schemas import (
    AutofillAgentResponse,
    AutofillLocationResponse,
    AutofillRequest,
    AgentCreate,
    LocationCreate,
    AutofillScenarioRequest,
    AutofillScenarioResponse,
)
from app.services import adapter


router = APIRouter(tags=["autofill"])


@router.get("/autofill")
@router.get("/api/autofill")
async def autofill_readiness():
    """Return guidance for clients that accidentally issue GET requests."""
    return {
        "status": "ready",
        "detail": "Use POST /autofill with JSON payload to generate autofill suggestions."
    }


@router.post(
    "/autofill",
    response_model=Union[AutofillAgentResponse, AutofillLocationResponse],
)
@router.post(
    "/api/autofill",
    response_model=Union[AutofillAgentResponse, AutofillLocationResponse],
)
async def autofill_form(request: AutofillRequest):
    """
    Generate form data via TinyTroupe-backed LLM call.
    """
    try:
        payload = adapter.autofill_form(
            form=request.form,
            context=request.context,
            seed=request.seed,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to autofill form: {exc}",
        ) from exc

    form_type = payload.get("form")
    data = payload.get("data", {})

    if form_type == "agent":
        agent = AgentCreate.model_validate(data)
        return AutofillAgentResponse(form="agent", data=agent)

    if form_type == "location":
        location = LocationCreate.model_validate(data)
        return AutofillLocationResponse(form="location", data=location)

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Unsupported autofill form response: {form_type}",
    )


@router.post(
    "/autofill_scenario",
    response_model=AutofillScenarioResponse,
)
@router.post(
    "/api/autofill_scenario",
    response_model=AutofillScenarioResponse,
)
async def autofill_scenario(request: AutofillScenarioRequest):
    """Generate a full scenario (agents, locations, beats) in one shot."""
    try:
        scenario = adapter._autofill_scenario(
            context=request.context,
            seed=request.seed,
        )
        return scenario
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to autofill scenario: {exc}",
        ) from exc
