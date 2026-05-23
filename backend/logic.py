"""
SCLOU — Logic Engine
Evaluates sensor readings and decides structural + alert responses.

Core rule:
    IF rainfall > RAIN_THRESH AND fos < FOS_THRESH
    THEN raise anchor tension, engage reinforcement, trigger alert,
         update risk index.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple

log = logging.getLogger("sclou.logic")

# ── Thresholds ──────────────────────────────────────────────────────────────
RAIN_THRESH        = 25.0   # mm/hr  — heavy rain
FOS_THRESH         = 1.3    # below this → unsafe
PORE_THRESH        = 80.0   # kPa    — elevated pore pressure
SLOPE_THRESH       = 5.0    # mm/day — significant movement

MAX_ANCHOR_TENSION = 280.0  # kN
BASE_ANCHOR        = 120.0  # kN

# ── Risk weights ────────────────────────────────────────────────────────────
W_FOS    = 0.35
W_RAIN   = 0.25
W_PORE   = 0.20
W_SLOPE  = 0.20


# ────────────────────────────────────────────────────────────────────────────
def compute_risk_index(fos: float, rainfall: float,
                       pore_pressure: float, slope_movement: float) -> float:
    """
    Returns a normalised risk index in [0, 1].
    Higher = more dangerous.
    """
    # Each component mapped to 0–1 (1 = worst)
    fos_risk   = max(0.0, min(1.0, (2.5 - fos) / 2.0))          # FOS 0.5→1, 2.5→0
    rain_risk  = max(0.0, min(1.0, rainfall / 60.0))              # 60 mm/hr max
    pore_risk  = max(0.0, min(1.0, pore_pressure / 120.0))        # 120 kPa max
    slope_risk = max(0.0, min(1.0, slope_movement / 15.0))        # 15 mm/day max

    index = (W_FOS   * fos_risk   +
             W_RAIN  * rain_risk  +
             W_PORE  * pore_risk  +
             W_SLOPE * slope_risk)
    return round(index, 4)


def zone_status(fos: float, rainfall: float) -> str:
    """Derive zone operational status from two primary signals."""
    if fos < 1.0 or rainfall > 45.0:
        return "CRITICAL"
    if fos < FOS_THRESH or rainfall > RAIN_THRESH:
        return "WARNING"
    return "STABLE"


def compute_anchor_tension(risk_index: float) -> float:
    """
    Scale anchor tension linearly with risk.
    Low risk → BASE_ANCHOR; high risk → MAX_ANCHOR_TENSION.
    """
    tension = BASE_ANCHOR + risk_index * (MAX_ANCHOR_TENSION - BASE_ANCHOR)
    return round(tension, 1)


def reinforcement_status(status: str) -> str:
    return {"STABLE": "STANDBY", "WARNING": "ACTIVE", "CRITICAL": "ENGAGED"}.get(
        status, "STANDBY"
    )


def stability_state(status: str) -> str:
    return {"STABLE": "STABLE", "WARNING": "AT RISK", "CRITICAL": "CRITICAL"}.get(
        status, "STABLE"
    )


def compute_grid_status(risk_indices: List[float]) -> str:
    avg = sum(risk_indices) / len(risk_indices) if risk_indices else 0
    if avg > 0.65:
        return "BACKUP"
    if avg > 0.40:
        return "STRESSED"
    return "NOMINAL"


def compute_load_distribution(zone_ids: List[str],
                               risk_indices: List[float]) -> Dict[str, float]:
    """
    Distribute 100 % of corridor load inversely proportional to risk
    (higher-risk zones get less load so they're protected).
    """
    inv = [1.0 - r for r in risk_indices]
    total = sum(inv) or 1.0
    shares = {z: round((v / total) * 100, 1)
              for z, v in zip(zone_ids, inv)}
    return shares


# ── Main evaluation ──────────────────────────────────────────────────────────
def evaluate(
    zone_readings: List[Dict[str, Any]]
) -> Tuple[List[Dict], List[Dict], Dict, List[Dict]]:
    """
    Run full SCLOU evaluation pass.

    Returns:
        updated_zones          – list of zone dicts with status field set
        updated_structural     – list of structural_response dicts
        updated_energy         – energy dict
        new_alerts             – list of alert dicts (may be empty)
    """
    updated_zones      : List[Dict] = []
    updated_structural : List[Dict] = []
    new_alerts         : List[Dict] = []
    risk_indices       : List[float] = []
    zone_ids           : List[str]   = []

    now = datetime.now(timezone.utc).isoformat()

    for row in zone_readings:
        zid          = row["id"]
        fos          = row["fos"]
        rainfall     = row["rainfall"]
        pore_pressure= row["pore_pressure"]
        slope_movement = row["slope_movement"]

        # ── Core SCLOU rule ────────────────────────────────────────────────
        triggered = (rainfall > RAIN_THRESH) and (fos < FOS_THRESH)

        status = zone_status(fos, rainfall)
        risk   = compute_risk_index(fos, rainfall, pore_pressure, slope_movement)
        anchor = compute_anchor_tension(risk)
        reinf  = reinforcement_status(status)
        stab   = stability_state(status)

        risk_indices.append(risk)
        zone_ids.append(zid)

        # ── Persist zone update ────────────────────────────────────────────
        updated_zones.append({
            "id": zid, "fos": fos, "rainfall": rainfall,
            "pore_pressure": pore_pressure, "slope_movement": slope_movement,
            "status": status,
        })

        updated_structural.append({
            "zone_id": zid,
            "anchor_tension": anchor,
            "reinforcement_status": reinf,
            "stability_state": stab,
            "risk_index": risk,
        })

        # ── Alert generation ───────────────────────────────────────────────
        if triggered:
            new_alerts.append({
                "zone": zid,
                "message": (
                    f"[SCLOU TRIGGER] Zone {zid} — "
                    f"Rainfall {rainfall:.1f} mm/hr exceeds threshold, "
                    f"FoS {fos:.2f} below safe limit. "
                    f"Anchor tension raised to {anchor:.0f} kN. "
                    f"Reinforcement: {reinf}."
                ),
                "timestamp": now,
                "type": "CRITICAL" if status == "CRITICAL" else "WARNING",
            })
            log.info("SCLOU trigger fired for zone %s (risk=%.2f)", zid, risk)

        elif status == "WARNING":
            new_alerts.append({
                "zone": zid,
                "message": (
                    f"[SCLOU WATCH] Zone {zid} — "
                    f"Elevated conditions: rainfall={rainfall:.1f} mm/hr, "
                    f"FoS={fos:.2f}, risk index={risk:.2f}."
                ),
                "timestamp": now,
                "type": "WARNING",
            })

    # ── Energy ────────────────────────────────────────────────────────────
    grid_status       = compute_grid_status(risk_indices)
    load_distribution = compute_load_distribution(zone_ids, risk_indices)

    updated_energy = {
        "grid_status": grid_status,
        "load_distribution": json.dumps(load_distribution),
    }

    return updated_zones, updated_structural, updated_energy, new_alerts
