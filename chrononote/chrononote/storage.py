import json
import sqlite3
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Generator, Iterable, List, Optional, Tuple


SQLITE_PRAGMAS = [
    "PRAGMA journal_mode=WAL;",
    "PRAGMA synchronous=NORMAL;",
    "PRAGMA foreign_keys=ON;",
]


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    raw_text TEXT NOT NULL,
    source_hint TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_entries_topic ON entries(topic_id);

CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    section_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    date_iso TEXT NOT NULL,
    citations_json TEXT NOT NULL,
    confidence REAL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sections_date ON sections(date_iso);
CREATE INDEX IF NOT EXISTS idx_sections_entry ON sections(entry_id);
"""


@dataclass
class Topic:
    id: int
    name: str
    description: Optional[str]
    created_at: str


@dataclass
class Entry:
    id: int
    topic_id: int
    raw_text: str
    source_hint: Optional[str]
    created_at: str


@dataclass
class Section:
    id: int
    entry_id: int
    section_index: int
    title: str
    summary: str
    date_iso: str
    citations_json: str
    confidence: Optional[float]
    created_at: str

    @property
    def citations(self) -> List[Dict[str, Any]]:
        try:
            return json.loads(self.citations_json)
        except Exception:
            return []


class Storage:
    def __init__(self, database_path: Path) -> None:
        self.database_path = database_path

    @contextmanager
    def connect(self) -> Generator[sqlite3.Connection, None, None]:
        need_init = not self.database_path.exists()
        connection = sqlite3.connect(str(self.database_path))
        connection.row_factory = sqlite3.Row
        try:
            for pragma in SQLITE_PRAGMAS:
                connection.execute(pragma)
            if need_init:
                connection.executescript(SCHEMA_SQL)
            yield connection
            connection.commit()
        finally:
            connection.close()

    def initialize(self) -> None:
        with self.connect() as _:
            pass

    # Topics
    def add_topic(self, name: str, description: Optional[str]) -> int:
        now = datetime.utcnow().isoformat()
        with self.connect() as conn:
            cur = conn.execute(
                "INSERT INTO topics (name, description, created_at) VALUES (?, ?, ?)",
                (name, description, now),
            )
            return int(cur.lastrowid)

    def get_topic_by_name(self, name: str) -> Optional[Topic]:
        with self.connect() as conn:
            cur = conn.execute("SELECT * FROM topics WHERE name = ?", (name,))
            row = cur.fetchone()
            if not row:
                return None
            return Topic(
                id=row["id"],
                name=row["name"],
                description=row["description"],
                created_at=row["created_at"],
            )

    def list_topics(self) -> List[Topic]:
        with self.connect() as conn:
            cur = conn.execute("SELECT * FROM topics ORDER BY created_at ASC")
            return [
                Topic(
                    id=row["id"],
                    name=row["name"],
                    description=row["description"],
                    created_at=row["created_at"],
                )
                for row in cur.fetchall()
            ]

    # Entries
    def add_entry(self, topic_id: int, raw_text: str, source_hint: Optional[str]) -> int:
        now = datetime.utcnow().isoformat()
        with self.connect() as conn:
            cur = conn.execute(
                "INSERT INTO entries (topic_id, raw_text, source_hint, created_at) VALUES (?, ?, ?, ?)",
                (topic_id, raw_text, source_hint, now),
            )
            return int(cur.lastrowid)

    def list_entries_for_topic(self, topic_id: int) -> List[Entry]:
        with self.connect() as conn:
            cur = conn.execute(
                "SELECT * FROM entries WHERE topic_id = ? ORDER BY created_at ASC",
                (topic_id,),
            )
            return [
                Entry(
                    id=row["id"],
                    topic_id=row["topic_id"],
                    raw_text=row["raw_text"],
                    source_hint=row["source_hint"],
                    created_at=row["created_at"],
                )
                for row in cur.fetchall()
            ]

    # Sections
    def add_sections(
        self,
        entry_id: int,
        sections: Iterable[Tuple[int, str, str, str, List[Dict[str, Any]], Optional[float]]],
    ) -> List[int]:
        now = datetime.utcnow().isoformat()
        with self.connect() as conn:
            ids: List[int] = []
            for section_index, title, summary, date_iso, citations, confidence in sections:
                cur = conn.execute(
                    """
                    INSERT INTO sections (
                        entry_id, section_index, title, summary, date_iso, citations_json, confidence, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        entry_id,
                        section_index,
                        title,
                        summary,
                        date_iso,
                        json.dumps(citations, ensure_ascii=False),
                        confidence,
                        now,
                    ),
                )
                ids.append(int(cur.lastrowid))
            return ids

    def list_sections_for_topic(self, topic_id: int, ascending: bool = True) -> List[Section]:
        order = "ASC" if ascending else "DESC"
        with self.connect() as conn:
            cur = conn.execute(
                """
                SELECT s.* FROM sections s
                JOIN entries e ON e.id = s.entry_id
                WHERE e.topic_id = ?
                ORDER BY s.date_iso %s, s.section_index ASC, s.id ASC
                """
                % order,
                (topic_id,),
            )
            return [
                Section(
                    id=row["id"],
                    entry_id=row["entry_id"],
                    section_index=row["section_index"],
                    title=row["title"],
                    summary=row["summary"],
                    date_iso=row["date_iso"],
                    citations_json=row["citations_json"],
                    confidence=row["confidence"],
                    created_at=row["created_at"],
                )
                for row in cur.fetchall()
            ]

