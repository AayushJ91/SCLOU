// components/SCLOUDashboard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Drop-in example that wires useSCLOU() into your existing dashboard.
// Replace the inner JSX with your real UI components as needed.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { useSCLOU, ZoneReading, SCLOUAlert } from "../hooks/useSCLOU";

// ── Status badge colours ──────────────────────────────────────────────────────
const STATUS_COLOUR: Record<string, string> = {
  STABLE:   "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  WARNING:  "bg-amber-500/20  text-amber-300  border-amber-500/40",
  CRITICAL: "bg-red-500/20    text-red-300    border-red-500/40",
  NOMINAL:  "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  STRESSED: "bg-amber-500/20  text-amber-300  border-amber-500/40",
  BACKUP:   "bg-red-500/20    text-red-300    border-red-500/40",
};

function StatusBadge({ label }: { label: string }) {
  return (
    <span
      className={`text-xs font-mono px-2 py-0.5 rounded border
                  ${STATUS_COLOUR[label] ?? "bg-slate-700 text-slate-300"}`}
    >
      {label}
    </span>
  );
}

// ── Zone card ─────────────────────────────────────────────────────────────────
function ZoneCard({ zone }: { zone: ZoneReading }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-cyan-400">{zone.id}</span>
        <StatusBadge label={zone.status} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-300">
        <span>FoS</span>          <span className="font-mono text-right">{zone.fos.toFixed(2)}</span>
        <span>Rainfall</span>     <span className="font-mono text-right">{zone.rainfall.toFixed(1)} mm/hr</span>
        <span>Pore Pressure</span><span className="font-mono text-right">{zone.pore_pressure.toFixed(1)} kPa</span>
        <span>Slope Movement</span><span className="font-mono text-right">{zone.slope_movement.toFixed(2)} mm/d</span>
      </div>
    </div>
  );
}

// ── Alert row ─────────────────────────────────────────────────────────────────
function AlertRow({ alert }: { alert: SCLOUAlert }) {
  const ts = new Date(alert.timestamp).toLocaleTimeString();
  return (
    <div className="flex gap-3 text-sm border-b border-slate-700/50 py-2">
      <span className="w-16 shrink-0 font-mono text-slate-400">{ts}</span>
      <StatusBadge label={alert.type} />
      <span className="text-slate-300 leading-snug">{alert.message}</span>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function SCLOUDashboard() {
  const {
    zones, structural, energy, alerts,
    loading, error, lastUpdated,
    triggerSimulate,
  } = useSCLOU();

  if (loading && zones.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Connecting to SCLOU backend…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-400 font-mono text-sm">Error: {error}</p>
        <p className="text-slate-500 text-xs">
          Make sure the FastAPI server is running on port 8000.
        </p>
      </div>
    );
  }

  // Build structural lookup for easy access
  const structuralMap = Object.fromEntries(
    structural.map(s => [s.zone_id, s])
  );

  return (
    <div className="space-y-8 p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          SCLOU — Corridor Intelligence
        </h1>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-slate-500 font-mono">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={triggerSimulate}
            className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white
                       px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            ⚡ Force Cycle
          </button>
        </div>
      </div>

      {/* ── Zone sensor grid ── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Zone Sensors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {zones.map(z => <ZoneCard key={z.id} zone={z} />)}
        </div>
      </section>

      {/* ── Structural response table ── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Structural Response
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-slate-300">
            <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
              <tr>
                {["Zone","Anchor (kN)","Reinforcement","Stability","Risk Index"].map(h => (
                  <th key={h} className="px-4 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {structural.map(s => (
                <tr key={s.zone_id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2 font-bold text-cyan-400">{s.zone_id}</td>
                  <td className="px-4 py-2 font-mono">{s.anchor_tension.toFixed(0)}</td>
                  <td className="px-4 py-2"><StatusBadge label={s.reinforcement_status} /></td>
                  <td className="px-4 py-2"><StatusBadge label={s.stability_state} /></td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-red-500"
                          style={{ width: `${s.risk_index * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs w-10 text-right">
                        {(s.risk_index * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Energy panel ── */}
      {energy && (
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Energy
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Solar",      value: `${energy.solar_output.toFixed(1)} kW` },
              { label: "Wind",       value: `${energy.wind_output.toFixed(1)} kW`  },
              { label: "Total",      value: `${(energy.solar_output + energy.wind_output).toFixed(1)} kW` },
              { label: "Grid",       value: <StatusBadge label={energy.grid_status} /> },
            ].map(card => (
              <div key={card.label}
                   className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                <div className="text-xs text-slate-500 mb-1">{card.label}</div>
                <div className="text-lg font-bold text-white">{card.value}</div>
              </div>
            ))}
          </div>

          {/* Load distribution bar */}
          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
            <div className="text-xs text-slate-500 mb-2">Load Distribution</div>
            <div className="flex h-5 rounded-full overflow-hidden gap-0.5">
              {Object.entries(energy.load_distribution).map(([z, pct], i) => {
                const colours = ["bg-cyan-500","bg-blue-500","bg-violet-500",
                                 "bg-purple-500","bg-fuchsia-500"];
                return (
                  <div
                    key={z}
                    className={`${colours[i]} flex items-center justify-center
                                text-[10px] font-bold text-white transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${z}: ${pct}%`}
                  >
                    {pct > 10 ? z : ""}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              {Object.entries(energy.load_distribution).map(([z, pct]) => (
                <span key={z} className="text-[10px] text-slate-500 font-mono">
                  {pct}%
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Alerts feed ── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Alert Feed ({alerts.length})
        </h2>
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 max-h-72 overflow-y-auto">
          {alerts.length === 0
            ? <p className="text-slate-500 text-sm">No alerts generated yet.</p>
            : alerts.map(a => <AlertRow key={a.id} alert={a} />)
          }
        </div>
      </section>

    </div>
  );
}
