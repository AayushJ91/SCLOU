"""
SCLOU — Database Layer
SQLite schema setup and connection management.
"""

import sqlite3
import os

DB_PATH = os.getenv("SCLOU_DB", "sclou.db")


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row          # rows behave like dicts
    conn.execute("PRAGMA journal_mode=WAL") # safe concurrent reads
    return conn


def init_db() -> None:
    """Create all tables if they don't exist and seed initial zone rows."""
    with get_connection() as conn:
        conn.executescript("""
            -- ── Zone sensor readings ─────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS zones (
                id              TEXT PRIMARY KEY,   -- Z1 … Z5
                fos             REAL NOT NULL,       -- Factor of Safety
                rainfall        REAL NOT NULL,       -- mm/hr
                pore_pressure   REAL NOT NULL,       -- kPa
                slope_movement  REAL NOT NULL,       -- mm/day
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
                message   TEXT    NOT NULL,
                timestamp TEXT    NOT NULL,   -- ISO-8601
                type      TEXT    NOT NULL    -- INFO | WARNING | CRITICAL
            );
        """)

        # Seed zones so the table is never empty on first run
        zones = ["Z1", "Z2", "Z3", "Z4", "Z5"]
        for z in zones:
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
               VALUES (1, 45.0, 20.0, 'NOMINAL', '{"Z1":20,"Z2":20,"Z3":20,"Z4":20,"Z5":20}')"""
        )
        conn.commit()
