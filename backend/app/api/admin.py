"""
Admin/maintenance endpoints.

Provides a reset endpoint to clear in-memory simulation state and wipe the
SQLite database tables managed by TinyVerse.
"""
from fastapi import APIRouter, HTTPException, Body, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import adapter, db_service


router = APIRouter(prefix="/admin", tags=["admin"])


class ResetRequest(BaseModel):
    """Confirmation wrapper to avoid accidental wipes."""
    confirm: bool = False


@router.post("/reset", status_code=status.HTTP_200_OK)
async def reset_system(payload: ResetRequest = Body(...), db: Session = Depends(get_db)):
    """Hard reset the backend state.

    - Clears all in-memory registries (agents, locations, connections, tools, faculties, logs).
    - Deletes all persisted rows in the SQLite database (agents, skills, locations, simulation runs/events).
    """
    if not payload.confirm:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Set 'confirm': true to proceed.")

    # Reset in-memory adapter
    adapter.reset_all()

    # Purge DB tables
    db_service.clear_all(db)

    return {"status": "ok", "message": "Backend state cleared."}
