"""
Simulation control API endpoints.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas import SimulationControl, SimulationState, SimulationLog, SimulationAction
from app.services import adapter
from app.api.websocket import broadcast_simulation_event


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
            
            # Broadcast event to WebSocket clients
            await broadcast_simulation_event("simulation_started", {
                "action": "start",
                "steps": control.steps or 1
            })
            
            return {"message": f"Simulation started for {control.steps} steps"}
        
        elif control.action == "pause":
            adapter.pause_simulation()
            
            # Broadcast event to WebSocket clients
            await broadcast_simulation_event("simulation_paused", {
                "action": "pause"
            })
            
            return {"message": "Simulation paused"}
        
        elif control.action == "stop":
            adapter.pause_simulation()
            
            # Broadcast event to WebSocket clients
            await broadcast_simulation_event("simulation_stopped", {
                "action": "stop"
            })
            
            return {"message": "Simulation stopped"}
        
        elif control.action == "step":
            adapter.run_simulation(1)
            
            # Broadcast event to WebSocket clients
            await broadcast_simulation_event("simulation_step", {
                "action": "step",
                "current_step": adapter.current_step
            })
            
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
