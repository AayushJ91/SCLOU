// hooks/useSCLOU.ts
// ─────────────────────────────────────────────────────────────────────────────
// Central data hook — fetches all SCLOU endpoints and keeps state fresh.
// Auto-refreshes every POLL_MS milliseconds.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";

const BASE_URL  = import.meta.env.VITE_SCLOU_API ?? "http://localhost:8000";
const POLL_MS   = 4_000; // match backend simulator interval

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ZoneReading {
  id: string;
  fos: number;
  rainfall: number;
  pore_pressure: number;
  slope_movement: number;
  status: "STABLE" | "WARNING" | "CRITICAL";
}

export interface StructuralResponse {
  zone_id: string;
  anchor_tension: number;
  reinforcement_status: "STANDBY" | "ACTIVE" | "ENGAGED";
  stability_state: "STABLE" | "AT RISK" | "CRITICAL";
  risk_index: number;
}

export interface EnergySnapshot {
  solar_output: number;
  wind_output: number;
  grid_status: "NOMINAL" | "STRESSED" | "BACKUP";
  load_distribution: Record<string, number>;
}

export interface SCLOUAlert {
  id: number;
  zone: string;
  message: string;
  timestamp: string;
  type: "INFO" | "WARNING" | "CRITICAL";
}

export interface SCLOUState {
  zones:      ZoneReading[];
  structural: StructuralResponse[];
  energy:     EnergySnapshot | null;
  alerts:     SCLOUAlert[];
  loading:    boolean;
  error:      string | null;
  lastUpdated: Date | null;
}

// ── Fetch helper ──────────────────────────────────────────────────────────────
async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useSCLOU() {
  const [state, setState] = useState<SCLOUState>({
    zones:       [],
    structural:  [],
    energy:      null,
    alerts:      [],
    loading:     true,
    error:       null,
    lastUpdated: null,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [zones, structural, energy, alerts] = await Promise.all([
        fetchJSON<ZoneReading[]>       ("/zones"),
        fetchJSON<StructuralResponse[]>("/structural"),
        fetchJSON<EnergySnapshot>      ("/energy"),
        fetchJSON<SCLOUAlert[]>        ("/alerts?limit=30"),
      ]);

      setState({
        zones, structural, energy, alerts,
        loading:     false,
        error:       null,
        lastUpdated: new Date(),
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error:   err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  // Manual trigger — calls POST /simulate then immediately re-fetches
  const triggerSimulate = useCallback(async () => {
    await fetch(`${BASE_URL}/simulate`, { method: "POST" });
    await fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    fetchAll();                                      // initial load
    timerRef.current = setInterval(fetchAll, POLL_MS); // auto-refresh
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchAll]);

  return { ...state, refetch: fetchAll, triggerSimulate };
}
