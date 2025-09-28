import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv


@dataclass
class Config:
    """Runtime configuration for ChronoNote.

    Values are sourced from environment variables with sensible defaults.
    """

    database_path: Path
    llm_provider: str
    openai_api_key: Optional[str]
    openai_base_url: Optional[str]
    openai_model: str

    @staticmethod
    def from_env() -> "Config":
        load_dotenv()

        data_dir = Path(os.environ.get("CHRONONOTE_DATA_DIR", "~/.chrononote")).expanduser()
        database_path = data_dir / "chrononote.db"

        llm_provider = os.environ.get("LLM_PROVIDER", "openai").lower()
        openai_api_key = os.environ.get("OPENAI_API_KEY")
        openai_base_url = os.environ.get("OPENAI_BASE_URL")
        openai_model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

        return Config(
            database_path=database_path,
            llm_provider=llm_provider,
            openai_api_key=openai_api_key,
            openai_base_url=openai_base_url,
            openai_model=openai_model,
        )


def ensure_data_dir(database_path: Path) -> None:
    """Ensure the parent directory for the database exists."""

    database_path.parent.mkdir(parents=True, exist_ok=True)

