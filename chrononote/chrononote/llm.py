from __future__ import annotations

import json
from textwrap import dedent
from typing import Any, Dict

from .config import Config


PROMPT_TEMPLATE = dedent(
    """
    You are labeling a user's raw notes about a topic into chronological sections.

    Requirements:
    - Parse the provided RAW TEXT into an ordered list of sections.
    - Each section must include: date_iso (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SSZ), title, summary.
    - Include citations: an array of objects with free-form fields like {"type": "url|paper|book|source", "reference": string, ...}
    - Infer missing dates conservatively; if only month-year, use first day of month (e.g., 2024-05-01). If only year, use 2024-01-01.
    - If exact time is unknown, provide date only.
    - Add an optional numeric confidence in [0,1].
    - Output STRICT JSON ONLY, no markdown fences, as an array of objects.

    Topic: {topic_name}
    RAW TEXT:
    ---
    {raw_text}
    ---

    Respond with JSON array only, like:
    [
      {"date_iso": "2024-06-01", "title": "Milestone", "summary": "...", "citations": [{"type": "url", "reference": "https://..."}], "confidence": 0.82}
    ]
    """
).strip()


def label_sections(cfg: Config, topic_name: str, raw_text: str) -> str:
    """Call the model and return its raw string output.

    Defaults to OpenAI SDK if LLM_PROVIDER=openai.
    """
    if cfg.llm_provider == "openai":
        try:
            # Avoid heavy imports unless needed
            from openai import OpenAI
        except Exception as exc:  # pragma: no cover
            raise RuntimeError("openai package is required; install dependencies.") from exc

        client = OpenAI(
            api_key=cfg.openai_api_key,
            base_url=cfg.openai_base_url or None,
        )

        prompt = PROMPT_TEMPLATE.format(topic_name=topic_name, raw_text=raw_text[:20000])

        # Prefer responses API if available; fallback to chat.completions
        try:
            response = client.chat.completions.create(
                model=cfg.openai_model,
                messages=[
                    {"role": "system", "content": "You are a careful data labeling assistant."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                max_tokens=2000,
            )
            content = response.choices[0].message.content or ""
            return content.strip()
        except Exception:
            # Try newer responses API shape
            response = client.responses.create(
                model=cfg.openai_model,
                input=[
                    {"role": "system", "content": "You are a careful data labeling assistant."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                max_output_tokens=2000,
            )
            # The new API may return structured content
            try:
                parts = response.output[0].content[0].text  # type: ignore[attr-defined]
                return str(parts).strip()
            except Exception:
                return json.dumps(response.dict())

    raise NotImplementedError(f"LLM provider '{cfg.llm_provider}' not supported")

