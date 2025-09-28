from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import typer
from rich import print as rprint
from rich.console import Console
from rich.table import Table

from .config import Config, ensure_data_dir
from .exporter import export_markdown, export_json
from .llm import label_sections
from .parser import parse_labeled_sections
from .storage import Storage


app = typer.Typer(add_completion=False, help="ChronoNote: Label and store chronological notes with citations.")
console = Console()


@app.command()
def init(
    data_dir: str = typer.Option(None, help="Custom data dir; defaults to ~/.chrononote"),
) -> None:
    """Initialize the ChronoNote database."""
    cfg = Config.from_env()
    if data_dir:
        cfg.database_path = Path(data_dir).expanduser() / "chrononote.db"
    ensure_data_dir(cfg.database_path)
    Storage(cfg.database_path).initialize()
    rprint(f"[green]Initialized database at[/green] {cfg.database_path}")


@app.command("add-topic")
def add_topic(
    name: str = typer.Argument(..., help="Unique topic name"),
    description: Optional[str] = typer.Option(None, "--description", "-d", help="Optional description"),
    data_dir: str = typer.Option(None, help="Custom data dir"),
) -> None:
    cfg = Config.from_env()
    if data_dir:
        cfg.database_path = Path(data_dir).expanduser() / "chrononote.db"
    ensure_data_dir(cfg.database_path)
    storage = Storage(cfg.database_path)
    storage.initialize()
    topic_id = storage.add_topic(name=name, description=description)
    rprint(f"[green]Created topic[/green] '{name}' (id={topic_id})")


@app.command("topics")
def list_topics(
    data_dir: str = typer.Option(None, help="Custom data dir"),
) -> None:
    cfg = Config.from_env()
    if data_dir:
        cfg.database_path = Path(data_dir).expanduser() / "chrononote.db"
    storage = Storage(cfg.database_path)
    topics = storage.list_topics()
    if not topics:
        rprint("[yellow]No topics yet. Use 'chrononote add-topic NAME'.[/yellow]")
        raise typer.Exit(code=0)
    table = Table(title="Topics")
    table.add_column("ID", justify="right")
    table.add_column("Name")
    table.add_column("Description")
    table.add_column("Created At (UTC)")
    for t in topics:
        table.add_row(str(t.id), t.name, t.description or "", t.created_at)
    console.print(table)


@app.command()
def ingest(
    topic: str = typer.Argument(..., help="Existing topic name"),
    source: Optional[str] = typer.Option(None, "--source", "-s", help="Source hint (URL, file, etc.)"),
    file: Optional[Path] = typer.Option(None, "--file", "-f", exists=True, dir_okay=False, help="Read text from file"),
    data_dir: str = typer.Option(None, help="Custom data dir"),
    model: Optional[str] = typer.Option(None, help="Override model (default from env)"),
) -> None:
    """Ingest raw text, have the LLM label chronological sections, and store them."""
    cfg = Config.from_env()
    if model:
        cfg.openai_model = model
    if data_dir:
        cfg.database_path = Path(data_dir).expanduser() / "chrononote.db"

    storage = Storage(cfg.database_path)
    storage.initialize()
    topic_obj = storage.get_topic_by_name(topic)
    if not topic_obj:
        rprint(f"[red]Topic '{topic}' not found. Create it with 'chrononote add-topic'.[/red]")
        raise typer.Exit(1)

    if file:
        raw_text = file.read_text(encoding="utf-8")
    else:
        raw_text = sys.stdin.read()
    if not raw_text.strip():
        rprint("[red]No input text provided. Use --file or pipe text via stdin.[/red]")
        raise typer.Exit(1)

    entry_id = storage.add_entry(topic_id=topic_obj.id, raw_text=raw_text, source_hint=source)
    rprint(f"[green]Stored entry[/green] id={entry_id}; labeling sections via LLM...")

    llm_output = label_sections(cfg=cfg, topic_name=topic_obj.name, raw_text=raw_text)
    sections = parse_labeled_sections(llm_output)

    if not sections:
        rprint("[red]Failed to parse any sections from model output.[/red]")
        raise typer.Exit(2)

    storage.add_sections(
        entry_id=entry_id,
        sections=[
            (
                idx,
                s["title"],
                s["summary"],
                s["date_iso"],
                s.get("citations", []),
                s.get("confidence"),
            )
            for idx, s in enumerate(sections)
        ],
    )

    rprint(f"[green]Added {len(sections)} sections[/green]. Use 'chrononote timeline {topic}' to view.")


@app.command()
def timeline(
    topic: str = typer.Argument(..., help="Existing topic name"),
    descending: bool = typer.Option(False, "--desc", help="Show newest first"),
    limit: Optional[int] = typer.Option(None, help="Limit number of sections"),
    data_dir: str = typer.Option(None, help="Custom data dir"),
) -> None:
    cfg = Config.from_env()
    if data_dir:
        cfg.database_path = Path(data_dir).expanduser() / "chrononote.db"
    storage = Storage(cfg.database_path)
    topic_obj = storage.get_topic_by_name(topic)
    if not topic_obj:
        rprint(f"[red]Topic '{topic}' not found.[/red]")
        raise typer.Exit(1)
    sections = storage.list_sections_for_topic(topic_obj.id, ascending=not descending)
    if limit is not None:
        sections = sections[: max(limit, 0)]
    if not sections:
        rprint("[yellow]No sections found.[/yellow]")
        raise typer.Exit(0)

    table = Table(title=f"Timeline for '{topic}'")
    table.add_column("When (ISO)")
    table.add_column("Title")
    table.add_column("Confidence")
    for s in sections:
        conf = f"{s.confidence:.2f}" if s.confidence is not None else "-"
        table.add_row(s.date_iso, s.title, conf)
    console.print(table)


@app.command()
def export(
    topic: str = typer.Argument(..., help="Existing topic name"),
    out: Path = typer.Argument(..., help="Output file path (.md or .json)"),
    data_dir: str = typer.Option(None, help="Custom data dir"),
) -> None:
    cfg = Config.from_env()
    if data_dir:
        cfg.database_path = Path(data_dir).expanduser() / "chrononote.db"
    storage = Storage(cfg.database_path)
    topic_obj = storage.get_topic_by_name(topic)
    if not topic_obj:
        rprint(f"[red]Topic '{topic}' not found.[/red]")
        raise typer.Exit(1)
    sections = storage.list_sections_for_topic(topic_obj.id, ascending=True)
    if out.suffix.lower() == ".md":
        content = export_markdown(topic_obj, sections)
        out.write_text(content, encoding="utf-8")
        rprint(f"[green]Exported markdown to[/green] {out}")
    elif out.suffix.lower() == ".json":
        content = export_json(topic_obj, sections)
        out.write_text(json.dumps(content, ensure_ascii=False, indent=2), encoding="utf-8")
        rprint(f"[green]Exported JSON to[/green] {out}")
    else:
        rprint("[red]Unsupported format. Use .md or .json[/red]")
        raise typer.Exit(2)

