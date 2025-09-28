from __future__ import annotations

from typing import Any, Dict, List

from .storage import Section, Topic


def export_markdown(topic: Topic, sections: List[Section]) -> str:
    lines: List[str] = []
    lines.append(f"# Timeline: {topic.name}")
    if topic.description:
        lines.append("")
        lines.append(topic.description)
    lines.append("")

    for s in sections:
        lines.append(f"## {s.date_iso} — {s.title}")
        lines.append("")
        lines.append(s.summary)
        if s.citations:
            lines.append("")
            lines.append("Citations:")
            for c in s.citations:
                citation_text = _format_citation(c)
                lines.append(f"- {citation_text}")
        if s.confidence is not None:
            lines.append("")
            lines.append(f"Confidence: {s.confidence:.2f}")
        lines.append("")

    return "\n".join(lines).strip() + "\n"


def _format_citation(c: Dict[str, Any]) -> str:
    reference = str(c.get("reference") or "").strip()
    ctype = str(c.get("type") or "").strip()
    if reference and ctype:
        return f"[{ctype}] {reference}"
    return reference or "(citation)"


def export_json(topic: Topic, sections: List[Section]) -> Dict[str, Any]:
    return {
        "topic": {
            "id": topic.id,
            "name": topic.name,
            "description": topic.description,
        },
        "sections": [
            {
                "date_iso": s.date_iso,
                "title": s.title,
                "summary": s.summary,
                "citations": s.citations,
                "confidence": s.confidence,
            }
            for s in sections
        ],
    }

