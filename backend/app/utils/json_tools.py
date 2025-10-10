from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict

from json_repair import repair_json

logger = logging.getLogger(__name__)

_CODE_FENCE_RE = re.compile(r"^```(?:json)?\s*\n([\s\S]*?)\n```\s*$", re.IGNORECASE)


def _strip_code_fence(raw: str) -> str:
    match = _CODE_FENCE_RE.match(raw.strip())
    if match:
        return match.group(1).strip()
    return raw.strip()


def coerce_json_object(raw: Any) -> Dict[str, Any]:
    """Attempt to coerce LLM output into a JSON object.

    The helper is tolerant to markdown fences and minor JSON syntax issues by
    repairing the payload with ``json-repair`` when necessary.
    """

    if isinstance(raw, dict):
        return raw

    if raw is None:
        raise ValueError("Received empty payload from LLM")

    text = _strip_code_fence(str(raw))

    # Try parsing as-is first for happy path performance.
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        try:
            repaired = repair_json(text)
            parsed = json.loads(repaired)
        except Exception as exc:  # pragma: no cover - escalated above for logging context
            logger.error("Failed to repair LLM JSON payload", exc_info=True)
            raise ValueError("Unable to parse repaired JSON payload") from exc

    if not isinstance(parsed, dict):
        raise ValueError("Expected JSON object from LLM response")

    return parsed
