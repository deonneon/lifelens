from __future__ import annotations

import json
import re
from datetime import datetime
from typing import Any, Dict, List, Optional

from dateutil import parser as dateparser


def _coerce_date_iso(value: str) -> Optional[str]:
    text = (value or "").strip()
    if not text:
        return None
    try:
        # Allow partial dates, fill missing month/day with defaults
        dt = dateparser.parse(text, default=datetime(1970, 1, 1))
        if dt.tzinfo is not None:
            dt = dt.astimezone(tz=None).replace(tzinfo=None)
        # If day was missing, dateutil fills from default 1st; acceptable per prompt
        return dt.isoformat(timespec="seconds") if any([dt.hour, dt.minute, dt.second]) else dt.date().isoformat()
    except Exception:
        # Try YYYY or YYYY-MM explicitly
        if re.fullmatch(r"\d{4}$", text):
            return f"{text}-01-01"
        if re.fullmatch(r"\d{4}-\d{2}$", text):
            return f"{text}-01"
        return None


def _try_json_repair(raw: str) -> Optional[List[Dict[str, Any]]]:
    # Strip code fences
    fenced = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw, re.IGNORECASE)
    if fenced:
        raw = fenced.group(1)
    # Trim leading noise before [ and trailing after ]
    start = raw.find("[")
    end = raw.rfind("]")
    if start != -1 and end != -1 and end >= start:
        raw = raw[start : end + 1]
    # Remove trailing commas before ] or }
    raw = re.sub(r",\s*([\]}])", r"\1", raw)
    try:
        return json.loads(raw)
    except Exception:
        try:
            import json5  # type: ignore

            return json5.loads(raw)
        except Exception:
            return None


def parse_labeled_sections(raw_output: str) -> List[Dict[str, Any]]:
    """Parse model output into normalized sections.

    Returns list of dicts with keys: date_iso, title, summary, citations?, confidence?
    """
    data: Optional[List[Dict[str, Any]]] = None
    try:
        data = json.loads(raw_output)
    except Exception:
        data = _try_json_repair(raw_output)

    if not isinstance(data, list):
        return []

    normalized: List[Dict[str, Any]] = []
    for item in data:
        if not isinstance(item, dict):
            continue
        title = str(item.get("title") or "").strip()
        summary = str(item.get("summary") or "").strip()
        date_raw = str(item.get("date_iso") or item.get("date") or "").strip()
        date_iso = _coerce_date_iso(date_raw) or ""
        if not (title and summary and date_iso):
            continue
        citations = item.get("citations")
        if not isinstance(citations, list):
            citations = []
        confidence = item.get("confidence")
        try:
            if confidence is not None:
                confidence = float(confidence)
        except Exception:
            confidence = None
        normalized.append(
            {
                "date_iso": date_iso,
                "title": title,
                "summary": summary,
                "citations": citations,
                "confidence": confidence,
            }
        )

    normalized.sort(key=lambda s: (s["date_iso"], s["title"]))
    return normalized

