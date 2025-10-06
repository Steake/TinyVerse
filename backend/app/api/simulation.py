"""
Simulation control API endpoints.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas import SimulationControl, SimulationState, SimulationLog
from app.services import adapter


router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.post("/control")
async def control_simulation(control: SimulationControl):
    """
    Control the simulation (start, pause, stop, step).
    
    Manages the TinyWorld simulation execution.
    """
    try:
        if control.action == "start":
            adapter.run_simulation(control.steps or 1)
            return {"message": f"Simulation started for {control.steps} steps"}
        
        elif control.action == "pause":
            adapter.pause_simulation()
            return {"message": "Simulation paused"}
        
        elif control.action == "stop":
            adapter.pause_simulation()
            return {"message": "Simulation stopped"}
        
        elif control.action == "step":
            adapter.run_simulation(1)
            return {"message": "Simulation advanced 1 step"}
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid action: {control.action}"
            )
    
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
