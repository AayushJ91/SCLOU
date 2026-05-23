"""
SCLOU — Pydantic Response Models
Clean, typed shapes for all API responses.
"""

from pydantic import BaseModel
from typing import Dict, List


class ZoneReading(BaseModel):
    id: str
    fos: float
    rainfall: float
    pore_pressure: float
    slope_movement: float
    status: str


class StructuralResponse(BaseModel):
    zone_id: str
    anchor_tension: float
    reinforcement_status: str
    stability_state: str
    risk_index: float


class EnergySnapshot(BaseModel):
    solar_output: float
    wind_output: float
    grid_status: str
    load_distribution: Dict[str, float]


class Alert(BaseModel):
    id: int
    zone: str
    message: str
    timestamp: str
    type: str


class SimulateResult(BaseModel):
    status: str
    cycle: int
    alerts_generated: int
    zones_updated: List[str]
