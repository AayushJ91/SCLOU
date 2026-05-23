import { useEffect, useState } from "react";
import { API_BASE_URL, POLLING_INTERVAL } from "../config/api";
export interface ZoneReading {
  id: string;
  fos: number;
  rainfall: number;
  pressure: number;
  displacement: number;
  status: string;
  pore_pressure?: number;
  slope_movement?: number;
}

export interface StructuralResponse {
  zone_id: string;
  anchor_tension: number;
  reinforcement_status: string;
  stability_state: string;
  risk_index: number;
}

export interface EnergySnapshot {
  solar_output: number;
  wind_output: number;
  grid_status: string;
  load_distribution: Record<string, number>;
}

export interface Alert {
  id: number;
  zone: string;
  cause: string;
  response: string;
  outcome: string;
  message: string;
  timestamp: string;
  type: string;
}

export interface SimulateResult {
  status: string;
  cycle: number;
  alerts_generated: number;
  zones_updated: string[];
}

// ── Hook ──────────────────────────────────────────────────────────────────
export interface UseSCLOUResult {
  zones: ZoneReading[];
  structural: StructuralResponse[];
  energy: EnergySnapshot | null;
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  simulate: () => Promise<SimulateResult | null>;
}

export function useSCLOU(): UseSCLOUResult {
  const [zones, setZones] = useState<ZoneReading[]>([]);
  const [structural, setStructural] = useState<StructuralResponse[]>([]);
  const [energy, setEnergy] = useState<EnergySnapshot | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [z, s, e, a] = await Promise.all([
        fetch(`${API_BASE_URL}/zones`).then(res => {
          if (!res.ok) throw new Error(`Zones: ${res.statusText}`);
          return res.json();
        }),
        fetch(`${API_BASE_URL}/structural`).then(res => {
          if (!res.ok) throw new Error(`Structural: ${res.statusText}`);
          return res.json();
        }),
        fetch(`${API_BASE_URL}/energy`).then(res => {
          if (!res.ok) throw new Error(`Energy: ${res.statusText}`);
          return res.json();
        }),
        fetch(`${API_BASE_URL}/alerts`).then(res => {
          if (!res.ok) throw new Error(`Alerts: ${res.statusText}`);
          return res.json();
        }),
      ]);

      setZones(
        z.map((zone: ZoneReading) => ({
          ...zone,
          pressure: zone.pressure ?? zone.pore_pressure ?? 0,
          displacement: zone.displacement ?? zone.slope_movement ?? 0,
          pore_pressure: zone.pore_pressure ?? zone.pressure ?? 0,
          slope_movement: zone.slope_movement ?? zone.displacement ?? 0,
        }))
      );
      setStructural(s);
      setEnergy(e);
      setAlerts(a);
      setIsLoading(false);

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("SCLOU API error:", msg);
      setError(msg);
      setIsLoading(false);
    }
  };

  const simulate = async (): Promise<SimulateResult | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/simulate`, { method: "POST" });
      if (!res.ok) throw new Error(`Simulate: ${res.statusText}`);
      return res.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Simulate failed";
      console.error("SCLOU simulate error:", msg);
      setError(msg);
      return null;
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLLING_INTERVAL); // refresh at configured interval
    return () => clearInterval(interval);
  }, []);

  return { zones, structural, energy, alerts, isLoading, error, refetch: fetchData, simulate };
}