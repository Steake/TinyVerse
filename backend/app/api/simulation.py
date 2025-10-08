"""Simulation control API endpoints."""
from fastapi import APIRouter, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from typing import List, Optional

from app.schemas import (
    SimulationControl,
    SimulationState,
    SimulationLog,
    SimulationAction,
    SimulationControlResponse,
)
from app.services import adapter
from app.api.websocket import broadcast_simulation_event


router = APIRouter(prefix="/simulation", tags=["simulation"])


def _resolve_steps(requested_steps: Optional[int]) -> int:
    steps = requested_steps or 1
    if steps < 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Simulation steps must be a positive integer",
        )
    return steps


def _build_response(message: str) -> SimulationControlResponse:
    state = adapter.get_simulation_state()
    return SimulationControlResponse(message=message, state=state)


@router.post("/control", response_model=SimulationControlResponse)
async def control_simulation(control: SimulationControl):
    """
    Control the simulation (start, pause, stop, step).
    
    Manages the TinyWorld simulation execution.
    """
    try:
        if control.action == "start":
            if adapter.simulation_running:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Simulation is already running",
                )

            steps = _resolve_steps(control.steps)
            await run_in_threadpool(adapter.run_simulation, steps)

            await broadcast_simulation_event(
                "simulation_started",
                {"action": "start", "steps": steps},
            )

            suffix = "step" if steps == 1 else "steps"
            return _build_response(f"Simulation executed for {steps} {suffix}")

        if control.action == "pause":
            already_paused = not adapter.simulation_running
            if not already_paused:
                await run_in_threadpool(adapter.pause_simulation)
                await broadcast_simulation_event(
                    "simulation_paused",
                    {"action": "pause"},
                )

            message = "Simulation already paused" if already_paused else "Simulation paused"
            return _build_response(message)

        if control.action == "stop":
            await run_in_threadpool(adapter.pause_simulation)
            await broadcast_simulation_event(
                "simulation_stopped",
                {"action": "stop"},
            )

            return _build_response("Simulation stopped")

        if control.action == "step":
            steps = _resolve_steps(control.steps)
            await run_in_threadpool(adapter.run_simulation, steps)

            await broadcast_simulation_event(
                "simulation_step",
                {"action": "step", "current_step": adapter.current_step, "steps": steps},
            )

            suffix = "step" if steps == 1 else "steps"
            return _build_response(f"Simulation advanced {steps} {suffix}")
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid action: {control.action}"
            )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(err),
        ) from err
    except RuntimeError as err:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(err),
        ) from err
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to control simulation: {str(e)}"
        )


@router.get("/state", response_model=SimulationState)
async def get_simulation_state():
    """
    Get current simulation state.
    
    Returns information about the running simulation.
    """
    try:
        state = adapter.get_simulation_state()
        return state
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get simulation state: {str(e)}"
        )


@router.get("/logs", response_model=List[SimulationLog])
async def get_simulation_logs(limit: int = 100):
    """
    Get simulation logs/events.
    
    Returns recent simulation events and agent actions.
    """
    try:
        logs = adapter.get_simulation_logs(limit)
        return logs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get simulation logs: {str(e)}"
        )


@router.post("/action", response_model=SimulationLog, status_code=status.HTTP_201_CREATED)
async def execute_simulation_action(action: SimulationAction):
    """
    Execute a simulation action.
    
    Allows triggering specific agent actions in the simulation.
    """
    try:
        log = adapter.execute_action(action.model_dump())
        return log
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute action: {str(e)}"
        )
