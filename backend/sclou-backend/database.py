"""
SCLOU — Database Layer
SQLite schema setup and connection management.
"""

import json
import os
import sqlite3

from constants import TOTAL_ZONES, ZONE_IDS

DB_PATH = os.getenv("SCLOU_DB", "sclou.db")


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row          # rows behave like dicts
    conn.execute("PRAGMA journal_mode=WAL") # safe concurrent reads
    return conn


def _table_columns(conn: sqlite3.Connection, table_name: str) -> list[str]:
    rows = conn.execute(f"PRAGMA table_info({table_name})").fetchall()
    return [row[1] for row in rows]


def init_db() -> None:
    """Create all tables if they don't exist and seed initial zone rows."""
    with get_connection() as conn:
        expected_zone_columns = ["id", "fos", "rainfall", "pressure", "displacement", "status"]
        expected_alert_columns = ["id", "zone", "cause", "response", "outcome", "message", "timestamp", "type"]

        zone_columns = _table_columns(conn, "zones")
        if zone_columns and zone_columns != expected_zone_columns:
            conn.execute("DROP TABLE IF EXISTS zones")

        alert_columns = _table_columns(conn, "alerts")
        if alert_columns and alert_columns != expected_alert_columns:
            conn.execute("DROP TABLE IF EXISTS alerts")

        conn.executescript("""
            -- ── Zone sensor readings ─────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS zones (
                id              TEXT PRIMARY KEY,   -- Z1 … Z10
                fos             REAL NOT NULL,       -- Factor of Safety
                rainfall        REAL NOT NULL,       -- mm/hr
                pressure        REAL NOT NULL,       -- kPa
                displacement    REAL NOT NULL,       -- mm/day
                status          TEXT NOT NULL        -- STABLE | WARNING | CRITICAL
            );

            -- ── Structural response per zone ──────────────────────────────────
            CREATE TABLE IF NOT EXISTS structural_response (
                zone_id               TEXT PRIMARY KEY REFERENCES zones(id),
                anchor_tension        REAL NOT NULL,   -- kN
                reinforcement_status  TEXT NOT NULL,   -- ACTIVE | STANDBY | ENGAGED
                stability_state       TEXT NOT NULL,   -- STABLE | AT RISK | CRITICAL
                risk_index            REAL NOT NULL    -- 0.0 – 1.0
            );

            -- ── Energy snapshot (single row, updated in-place) ────────────────
            CREATE TABLE IF NOT EXISTS energy (
                id                INTEGER PRIMARY KEY CHECK (id = 1),
                solar_output      REAL NOT NULL,   -- kW
                wind_output       REAL NOT NULL,   -- kW
                grid_status       TEXT NOT NULL,   -- NOMINAL | STRESSED | BACKUP
                load_distribution TEXT NOT NULL    -- JSON string e.g. '{"Z1":20,"Z2":20,...}'
            );

            -- ── Alerts log ────────────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS alerts (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                zone      TEXT    NOT NULL,
                cause     TEXT    NOT NULL,
                response  TEXT    NOT NULL,
                outcome   TEXT    NOT NULL,
                message   TEXT    NOT NULL,
                timestamp TEXT    NOT NULL,   -- ISO-8601
                type      TEXT    NOT NULL    -- INFO | WARNING | CRITICAL
            );
        """)

        # Seed zones so the table is never empty on first run
        default_share = round(100.0 / TOTAL_ZONES, 1)
        load_distribution = json.dumps({z: default_share for z in ZONE_IDS})

        for z in ZONE_IDS:
            conn.execute(
                """INSERT OR IGNORE INTO zones
                   VALUES (?, 1.5, 10.0, 50.0, 0.5, 'STABLE')""",
                (z,)
            )
            conn.execute(
                """INSERT OR IGNORE INTO structural_response
                   VALUES (?, 120.0, 'STANDBY', 'STABLE', 0.2)""",
                (z,)
            )

        conn.execute(
            """INSERT OR IGNORE INTO energy
               VALUES (1, 45.0, 20.0, 'NOMINAL', ?)""",
            (load_distribution,),
        )
        conn.commit()
