"""
SCLOU — Synthetic Data Simulator
Generates realistic-looking sensor readings and persists them via the
SCLOU logic engine. Runs in a background thread every INTERVAL seconds.
"""

from __future__ import annotations

import json
import logging
import random
import threading
import time
from datetime import datetime, timezone
from typing import Optional

import logic
from database import get_connection

log = logging.getLogger("sclou.simulator")

INTERVAL = 4          # seconds between cycles
MAX_ALERTS = 200      # prune older alerts beyond this count
_cycle_count = 0
_stop_event   = threading.Event()
_thread: Optional[threading.Thread] = None

# ── Per-zone "weather scenario" state ────────────────────────────────────────
# Each zone drifts independently so the dashboard always has variety.
_zone_state: dict[str, dict] = {
    z: {
        "rainfall_base": random.uniform(5, 35),
        "fos_base":      random.uniform(1.1, 2.2),
        "drift_dir":     random.choice([-1, 1]),
    }
    for z in ["Z1", "Z2", "Z3", "Z4", "Z5"]
}


# ── Sensor-level noise helpers ───────────────────────────────────────────────
def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def _gen_zone_reading(zone_id: str) -> dict:
    """Generate one synthetic sensor snapshot for a zone."""
    state = _zone_state[zone_id]

    # Drift rainfall and FoS slowly, reversing at extremes
    state["rainfall_base"] += state["drift_dir"] * random.uniform(0.3, 1.8)
    if state["rainfall_base"] > 55 or state["rainfall_base"] < 2:
        state["drift_dir"] *= -1

    state["fos_base"] += random.uniform(-0.05, 0.05)
    state["fos_base"] = _clamp(state["fos_base"], 0.7, 2.8)

    rainfall      = _clamp(state["rainfall_base"] + random.gauss(0, 1.5), 0, 60)
    fos           = _clamp(state["fos_base"]      + random.gauss(0, 0.04), 0.6, 2.9)
    pore_pressure = _clamp(30 + rainfall * 1.2    + random.gauss(0, 3),   20, 120)
    slope_movement= _clamp((2.5 - fos) * 2.5      + random.gauss(0, 0.3),  0, 15)

    return {
        "id":             zone_id,
        "fos":            round(fos,           3),
        "rainfall":       round(rainfall,      2),
        "pore_pressure":  round(pore_pressure, 2),
        "slope_movement": round(slope_movement,3),
    }


def _gen_energy() -> dict:
    """Generate synthetic energy readings (solar, wind)."""
    hour = datetime.now().hour
    # Solar peaks around noon
    solar_factor = max(0, -(hour - 12) ** 2 / 36 + 1)
    solar = round(_clamp(60 * solar_factor + random.gauss(0, 3), 0, 65), 1)
    wind  = round(_clamp(20 + random.gauss(0, 5), 5, 40), 1)
    return {"solar_output": solar, "wind_output": wind}


# ── Main simulation cycle ─────────────────────────────────────────────────────
def run_cycle() -> dict:
    """Execute one full SCLOU simulation + persistence cycle."""
    global _cycle_count
    _cycle_count += 1

    zone_readings = [_gen_zone_reading(z) for z in ["Z1", "Z2", "Z3", "Z4", "Z5"]]
    energy_live   = _gen_energy()

    # Run SCLOU logic
    zones, structural, energy_logic, alerts = logic.evaluate(zone_readings)

    # Merge energy sources
    energy_logic["solar_output"] = energy_live["solar_output"]
    energy_logic["wind_output"]  = energy_live["wind_output"]

    with get_connection() as conn:
        # Update zones
        conn.executemany(
            """UPDATE zones SET fos=:fos, rainfall=:rainfall,
               pore_pressure=:pore_pressure, slope_movement=:slope_movement,
               status=:status WHERE id=:id""",
            zones,
        )

        # Update structural response
        conn.executemany(
            """UPDATE structural_response
               SET anchor_tension=:anchor_tension,
                   reinforcement_status=:reinforcement_status,
                   stability_state=:stability_state,
                   risk_index=:risk_index
               WHERE zone_id=:zone_id""",
            structural,
        )

        # Update energy (single row)
        conn.execute(
            """UPDATE energy SET solar_output=:solar_output, wind_output=:wind_output,
               grid_status=:grid_status, load_distribution=:load_distribution
               WHERE id=1""",
            energy_logic,
        )

        # Insert new alerts
        if alerts:
            conn.executemany(
                """INSERT INTO alerts (zone, message, timestamp, type)
                   VALUES (:zone, :message, :timestamp, :type)""",
                alerts,
            )
            # Prune old alerts
            conn.execute(
                """DELETE FROM alerts WHERE id NOT IN
                   (SELECT id FROM alerts ORDER BY id DESC LIMIT ?)""",
                (MAX_ALERTS,),
            )

        conn.commit()

    log.debug("Cycle %d done — %d alert(s) generated.", _cycle_count, len(alerts))
    return {
        "status":          "ok",
        "cycle":           _cycle_count,
        "alerts_generated": len(alerts),
        "zones_updated":   [z["id"] for z in zones],
    }


# ── Background thread ─────────────────────────────────────────────────────────
def _loop():
    log.info("Simulator started (interval=%ds).", INTERVAL)
    while not _stop_event.is_set():
        try:
            run_cycle()
        except Exception:
            log.exception("Simulator cycle failed.")
        _stop_event.wait(INTERVAL)
    log.info("Simulator stopped.")


def start():
    global _thread
    if _thread and _thread.is_alive():
        return
    _stop_event.clear()
    _thread = threading.Thread(target=_loop, daemon=True, name="sclou-sim")
    _thread.start()


def stop():
    _stop_event.set()
