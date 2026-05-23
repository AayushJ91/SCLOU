"""
SCLOU — FastAPI Application
Smart Corridor Logic Unit · Backend API
"""

from __future__ import annotations

import json
import logging
import os
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import simulator
from database import get_connection, init_db
from models import Alert, EnergySnapshot, SimulateResult, StructuralResponse, ZoneReading

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(name)-20s  %(levelname)s  %(message)s",
)
log = logging.getLogger("sclou.api")


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Initialising SCLOU database …")
    init_db()
    log.info("Starting background simulator …")
    simulator.start()
    yield
    log.info("Shutting down simulator …")
    simulator.stop()


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="SCLOU API",
    description="Smart Corridor Logic Unit — Backend Intelligence Layer",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow all origins for demo; tighten in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ── Helpers ───────────────────────────────────────────────────────────────────
def _row_to_dict(row) -> dict:
    return dict(row)


def _normalize_zone(row: dict) -> dict:
    pressure = row.get("pressure", row.get("pore_pressure", 0.0))
    displacement = row.get("displacement", row.get("slope_movement", 0.0))
    return {
        "id": row["id"],
        "fos": row["fos"],
        "rainfall": row["rainfall"],
        "pressure": pressure,
        "displacement": displacement,
        "status": row["status"],
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/", tags=["Meta"])
def root():
    return {
        "system": "SCLOU — Smart Corridor Logic Unit",
        "status": "operational",
        "version": "1.0.0",
        "endpoints": ["/zones", "/energy", "/alerts", "/simulate"],
    }


@app.get("/zones", response_model=List[ZoneReading], tags=["Sensor Data"])
def get_zones():
    """Return latest sensor readings for all zones (Z1–Z10)."""
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM zones ORDER BY id").fetchall()
    if not rows:
        raise HTTPException(status_code=503, detail="No zone data available yet.")
    return [_normalize_zone(_row_to_dict(r)) for r in rows]


@app.get("/structural", response_model=List[StructuralResponse], tags=["Structural"])
def get_structural():
    """Return current structural response state for all zones."""
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM structural_response ORDER BY zone_id"
        ).fetchall()
    if not rows:
        raise HTTPException(status_code=503, detail="No structural data available yet.")
    return [_row_to_dict(r) for r in rows]


@app.get("/energy", response_model=EnergySnapshot, tags=["Energy"])
def get_energy():
    """Return current corridor energy snapshot."""
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM energy WHERE id=1").fetchone()
    if not row:
        raise HTTPException(status_code=503, detail="No energy data available yet.")
    data = _row_to_dict(row)
    data["load_distribution"] = json.loads(data["load_distribution"])
    return data


@app.get("/alerts", response_model=List[Alert], tags=["Alerts"])
def get_alerts(
    limit: int = Query(default=50, ge=1, le=200, description="Max alerts to return"),
    type: str  = Query(default=None, description="Filter by type: INFO | WARNING | CRITICAL"),
):
    """Return recent SCLOU-generated alerts, newest first."""
    with get_connection() as conn:
        if type:
            rows = conn.execute(
                "SELECT * FROM alerts WHERE type=? ORDER BY id DESC LIMIT ?",
                (type.upper(), limit),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM alerts ORDER BY id DESC LIMIT ?", (limit,)
            ).fetchall()
    return [_row_to_dict(r) for r in rows]


@app.post("/simulate", response_model=SimulateResult, tags=["Control"])
def trigger_simulate():
    """
    Manually trigger one SCLOU simulation cycle.
    Useful for testing or forcing an immediate data refresh.
    """
    try:
        result = simulator.run_cycle()
        return result
    except Exception as exc:
        log.exception("Manual simulate failed.")
        raise HTTPException(status_code=500, detail=str(exc))


# ── Dev entry-point ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
