import type { ReactNode } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowRightLeft,
  ArrowUp,
  Gauge,
  Minus,
  ShieldAlert,
  Sun,
  TrendingDown,
  TrendingUp,
  Wind,
  Zap,
} from 'lucide-react';
import { OperationsPanelRefined } from './OperationsPanelRefined';
import { Alert, EnergySnapshot, ZoneReading } from '../../hooks/useSCLOU';

type SectionProps = {
  zones: ZoneReading[];
  energy: EnergySnapshot | null;
  alerts: Alert[];
  zoneHistory: ZoneReading[][];
};

function statusTone(value: string) {
  switch (value.toUpperCase()) {
    case 'CRITICAL':
    case 'BACKUP':
      return { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c' };
    case 'ADVISORY':
    case 'WARNING':
    case 'STRESSED':
      return { bg: '#fffbeb', border: '#f59e0b', text: '#b45309' };
    case 'OPERATIONAL':
    case 'NOMINAL':
    default:
      return { bg: '#f0fdf4', border: '#22c55e', text: '#15803d' };
  }
}

function riskIndex(zone: ZoneReading) {
  const fosRisk = Math.max(0, Math.min(1, (2.5 - zone.fos) / 2));
  const rainRisk = Math.max(0, Math.min(1, zone.rainfall / 60));
  const pressure = zone.pressure ?? zone.pore_pressure ?? 0;
  const displacement = zone.displacement ?? zone.slope_movement ?? 0;
  const pressureRisk = Math.max(0, Math.min(1, pressure / 120));
  const displacementRisk = Math.max(0, Math.min(1, displacement / 15));
  return (fosRisk * 0.35 + rainRisk * 0.25 + pressureRisk * 0.2 + displacementRisk * 0.2);
}

function avgFoS(zones: ZoneReading[]) {
  return zones.length ? zones.reduce((sum, zone) => sum + zone.fos, 0) / zones.length : 0;
}

function getZoneStatusColor(fos: number) {
  if (fos >= 1.45) return { bg: '#f0fdf4', border: '#22c55e', text: '#15803d', label: 'Stable' };
  if (fos >= 1.30) return { bg: '#fffbeb', border: '#f59e0b', text: '#b45309', label: 'Monitoring' };
  return { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c', label: 'Advisory' };
}

const ZONE_SEGMENT_KM = 20;
const TOTAL_CORRIDOR_ZONES = 10;

const ZONE_DISTRICTS: Record<string, string> = {
  Z1: 'Thane District',
  Z2: 'Nashik Approach',
  Z3: 'Western Ghats',
  Z4: 'Ahmednagar District',
  Z5: 'Aurangabad',
  Z6: 'Jalna Segment',
  Z7: 'Buldhana Approach',
  Z8: 'Washim Plateau',
  Z9: 'Wardha Transition',
  Z10: 'Nagpur Terminus',
};

const ZONE_CORRIDOR_META: Record<string, { km: string; district: string }> = Object.fromEntries(
  Array.from({ length: TOTAL_CORRIDOR_ZONES }, (_, index) => {
    const zoneNumber = index + 1;
    const zoneId = `Z${zoneNumber}`;
    const startKm = index * ZONE_SEGMENT_KM;
    const endKm = zoneNumber * ZONE_SEGMENT_KM;
    return [
      zoneId,
      {
        km: `KM ${startKm}–${endKm}`,
        district: ZONE_DISTRICTS[zoneId] ?? `Segment ${zoneNumber}`,
      },
    ];
  }),
);

function sortZonesById(zones: ZoneReading[]) {
  return [...zones].sort((left, right) =>
    left.id.localeCompare(right.id, undefined, { numeric: true }),
  );
}

function getZoneCorridorMeta(zoneId: string) {
  return ZONE_CORRIDOR_META[zoneId] ?? { km: '—', district: '—' };
}

function getLowestFoSZone(zones: ZoneReading[]) {
  return zones.length > 0 ? zones.reduce((min, z) => (z.fos < min.fos ? z : min)) : null;
}

function isCriticalMonitoringZone(zone: ZoneReading, zones: ZoneReading[]) {
  const lowest = getLowestFoSZone(zones);
  return lowest?.id === zone.id && zone.fos < 1.5;
}

function ZoneFoSSummaryStrip({ zones }: { zones: ZoneReading[] }) {
  const sortedZones = sortZonesById(zones);

  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2 w-full scrollbar-hide"
    >
      {sortedZones.map((zone) => {
        const isCritical = isCriticalMonitoringZone(zone, zones);
        const corridor = getZoneCorridorMeta(zone.id);
        const color = getZoneStatusColor(zone.fos);
        return (
          <div
            key={zone.id}
            className={`min-w-[80px] rounded border px-1.5 py-2 transition-all ${isCritical ? 'ring-1 ring-[#1e3a5f] ring-offset-1' : ''}`}
            style={{
              backgroundColor: color.bg,
              borderColor: color.border,
            }}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#475569]">
                {zone.id}
              </span>
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: color.border }}
                title={color.label}
              />
            </div>
            <div className="mt-0.5 truncate text-[8px] font-medium tabular-nums leading-tight text-[#64748b]">
              {corridor.km}
            </div>
            <div
              className="mt-1 text-sm font-semibold leading-none tabular-nums"
              style={{ color: color.text }}
            >
              {zone.fos.toFixed(2)}
            </div>
            {isCritical ? (
              <div className="mt-1 truncate text-[8px] font-bold uppercase tracking-wide text-[#ef4444]">
                CRIT
              </div>
            ) : (
              <div className="mt-1 truncate text-[8px] uppercase tracking-wide text-[#94a3b8]">
                {color.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[#d1d5db] bg-white">
      <div className="border-b border-[#e5e7eb] px-5 py-4">
        <div className="text-[11px] uppercase tracking-[0.16em] text-[#64748b]">{subtitle}</div>
        <h2 className="mt-1 text-lg font-semibold text-[#1f2937]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Metric({ label, value, unit, tone }: { label: string; value: string | number; unit?: string; tone?: string }) {
  const styles = tone ? statusTone(tone) : { bg: '#f8fafc', border: '#d1d5db', text: '#1f2937' };
  return (
    <div className="rounded-lg border px-4 py-3" style={{ borderColor: styles.border, backgroundColor: styles.bg }}>
      <div className="text-[11px] uppercase tracking-[0.14em] text-[#64748b]">{label}</div>
      <div className="mt-2 flex items-end gap-2">
        <div className="text-2xl font-semibold tabular-nums" style={{ color: styles.text }}>
          {value}
        </div>
        {unit ? <div className="pb-0.5 text-sm text-[#64748b]">{unit}</div> : null}
      </div>
    </div>
  );
}

type FoSTrendDirection = 'Improving' | 'Stable' | 'Declining';
type SystemStabilityLevel = 'Stable' | 'Monitoring' | 'Warning';
type ZoneTableStatus = 'Stable' | 'Monitoring' | 'Warning';

function systemStabilityFromFoS(fos: number): SystemStabilityLevel {
  if (fos >= 1.45) return 'Stable';
  if (fos >= 1.30) return 'Monitoring';
  return 'Warning';
}

function zoneTableStatusFromFoS(fos: number): ZoneTableStatus {
  return systemStabilityFromFoS(fos);
}

function zoneTableStatusTone(status: ZoneTableStatus) {
  if (status === 'Warning') return statusTone('WARNING');
  if (status === 'Monitoring') return statusTone('ADVISORY');
  return statusTone('NOMINAL');
}

function getFoSTrendDirection(values: number[]): FoSTrendDirection {
  if (values.length < 2) return 'Stable';
  const delta = values[values.length - 1] - values[0];
  if (delta > 0.02) return 'Improving';
  if (delta < -0.02) return 'Declining';
  return 'Stable';
}

function getSuggestedAction(
  stability: SystemStabilityLevel,
  trend: FoSTrendDirection,
  riskZoneId: string | null,
): string {
  const zoneRef = riskZoneId ?? 'priority zone';
  if (stability === 'Warning') {
    return `Escalate field inspection and reinforcement checks on ${zoneRef}.`;
  }
  if (stability === 'Monitoring' && trend === 'Declining') {
    return `Increase adaptive monitoring and hydrological surveillance on ${zoneRef}.`;
  }
  if (stability === 'Monitoring') {
    return `Maintain elevated watch on ${zoneRef} and validate sensor baselines.`;
  }
  if (trend === 'Declining') {
    return `Continue routine monitoring; review rainfall-driven drift on ${zoneRef}.`;
  }
  return 'Maintain routine corridor monitoring and scheduled stability reviews.';
}

function computeStabilityDriverImpacts(zones: ZoneReading[]) {
  if (!zones.length) {
    return { rainfall: 0, porePressure: 0, displacement: 0 };
  }

  const rainfallScores = zones.map((zone) => Math.max(0, Math.min(1, zone.rainfall / 60)));
  const poreScores = zones.map((zone) =>
    Math.max(0, Math.min(1, (zone.pressure ?? zone.pore_pressure ?? 0) / 120)),
  );
  const displacementScores = zones.map((zone) =>
    Math.max(0, Math.min(1, (zone.displacement ?? zone.slope_movement ?? 0) / 15)),
  );

  const avg = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const rainfall = avg(rainfallScores);
  const porePressure = avg(poreScores);
  const displacement = avg(displacementScores);
  const total = rainfall + porePressure + displacement || 1;

  return {
    rainfall: Math.round((rainfall / total) * 100),
    porePressure: Math.round((porePressure / total) * 100),
    displacement: Math.round((displacement / total) * 100),
  };
}

function computeTrafficLoadIndex(energy: EnergySnapshot | null, zones: ZoneReading[]) {
  const distribution = energy?.load_distribution;
  if (distribution && Object.keys(distribution).length > 0) {
    return Math.round(Math.max(...Object.values(distribution)));
  }
  if (!zones.length) return 0;
  const meanRisk = zones.reduce((sum, zone) => sum + riskIndex(zone), 0) / zones.length;
  return Math.round(Math.min(100, meanRisk * 100));
}

function InlineTrendChart({
  values,
  color,
  lowestIndex,
}: {
  values: number[];
  color: string;
  lowestIndex?: number;
}) {
  const width = 520;
  const height = 180;
  const padding = 16;
  const max = Math.max(...values, 2);
  const min = Math.min(...values, 0.8);
  const range = Math.max(max - min, 0.1);
  const highlightIndex =
    lowestIndex ??
    values.reduce((lowest, value, index) => (value < values[lowest] ? index : lowest), 0);

  const points = values
    .map((value, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[180px] w-full">
      <rect x="0" y="0" width={width} height={height} rx="12" fill="#fafafa" stroke="#e5e7eb" />
      {[0.25, 0.5, 0.75].map((ratio) => (
        <line
          key={ratio}
          x1={padding}
          x2={width - padding}
          y1={padding + ratio * (height - padding * 2)}
          y2={padding + ratio * (height - padding * 2)}
          stroke="#e5e7eb"
          strokeDasharray="4 4"
        />
      ))}
      {points ? <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /> : null}
      {values.map((value, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        const isLowest = index === highlightIndex;
        return (
          <g key={index}>
            {isLowest ? (
              <circle cx={x} cy={y} r="9" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.35" />
            ) : null}
            <circle cx={x} cy={y} r={isLowest ? 5.5 : 4} fill={isLowest ? '#ef4444' : color} />
          </g>
        );
      })}
    </svg>
  );
}

function TrendDirectionLabel({ direction }: { direction: FoSTrendDirection }) {
  const Icon = direction === 'Improving' ? TrendingUp : direction === 'Declining' ? TrendingDown : Minus;
  const tone =
    direction === 'Improving'
      ? statusTone('NOMINAL')
      : direction === 'Declining'
        ? statusTone('WARNING')
        : statusTone('ADVISORY');

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{ borderColor: tone.border, backgroundColor: tone.bg, color: tone.text }}
    >
      <Icon size={14} />
      {direction}
    </span>
  );
}

function SystemInsightStrip({
  stability,
  trend,
  riskZone,
  suggestedAction,
}: {
  stability: SystemStabilityLevel;
  trend: FoSTrendDirection;
  riskZone: ZoneReading | null;
  suggestedAction: string;
}) {
  const stabilityTone = zoneTableStatusTone(stability);

  return (
    <section className="rounded-lg border border-[#d1d5db] bg-white p-5">
      <div className="mb-4 text-[11px] uppercase tracking-[0.16em] text-[#64748b]">System insight</div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border px-4 py-3" style={{ borderColor: stabilityTone.border, backgroundColor: stabilityTone.bg }}>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[#64748b]">System Stability</div>
          <div className="mt-2 text-lg font-semibold" style={{ color: stabilityTone.text }}>
            {stability}
          </div>
        </div>
        <div className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.14em] text-[#64748b]">Trend</div>
          <div className="mt-2">
            <TrendDirectionLabel direction={trend} />
          </div>
        </div>
        <div className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.14em] text-[#64748b]">Highest Risk Zone</div>
          <div className="mt-2 text-lg font-semibold tabular-nums text-[#1f2937]">
            {riskZone ? `${riskZone.id} — FoS ${riskZone.fos.toFixed(2)}` : '—'}
          </div>
          {riskZone ? (
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-[#92400e]">
              Critical Focus Zone
            </div>
          ) : null}
        </div>
        <div className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 sm:col-span-2 xl:col-span-1">
          <div className="text-[11px] uppercase tracking-[0.14em] text-[#64748b]">Suggested Action</div>
          <div className="mt-2 text-sm leading-relaxed text-[#374151]">{suggestedAction}</div>
        </div>
      </div>
    </section>
  );
}

function StabilityDriversPanel({
  zones,
  energy,
}: {
  zones: ZoneReading[];
  energy: EnergySnapshot | null;
}) {
  const impacts = computeStabilityDriverImpacts(zones);
  const trafficLoadIndex = computeTrafficLoadIndex(energy, zones);
  const drivers = [
    { label: 'Rainfall Impact', value: impacts.rainfall, color: '#3b82f6' },
    { label: 'Pore Pressure Impact', value: impacts.porePressure, color: '#8b5cf6' },
    { label: 'Displacement Impact', value: impacts.displacement, color: '#f59e0b' },
    { label: 'Traffic Load Index', value: trafficLoadIndex, color: '#64748b', unit: '%' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-[#64748b]">
        <Gauge size={16} />
        Relative contribution to corridor instability risk
      </div>
      <p className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2 text-xs leading-relaxed text-[#475569]">
        <span className="font-semibold text-[#1e3a5f]">Correlation: </span>
        Rainfall ↑ → Pore Pressure ↑ → FoS ↓
      </p>
      {drivers.map((driver) => (
        <div key={driver.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-[#1f2937]">{driver.label}</span>
            <span className="tabular-nums text-[#64748b]">
              {driver.value}
              {'unit' in driver && driver.unit ? driver.unit : '%'}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#e5e7eb]">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${driver.value}%`, backgroundColor: driver.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function CriticalZonesPanel({ zones }: { zones: ZoneReading[] }) {
  const criticalZones = sortZonesById(zones)
    .sort((left, right) => left.fos - right.fos)
    .slice(0, 3);

  return (
    <div className="mb-4 grid gap-3 md:grid-cols-3">
      {criticalZones.map((zone, index) => {
        const tableStatus = zoneTableStatusFromFoS(zone.fos);
        const tone = zoneTableStatusTone(tableStatus);
        return (
          <div
            key={zone.id}
            className="rounded-lg border px-4 py-3"
            style={{ borderColor: tone.border, backgroundColor: tone.bg }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.14em] text-[#64748b]">
                Rank {index + 1}
              </span>
              <span
                className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
                style={{ borderColor: tone.border, color: tone.text }}
              >
                {tableStatus}
              </span>
            </div>
            <div className="mt-2 text-lg font-semibold text-[#1f2937]">{zone.id}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums" style={{ color: tone.text }}>
              {zone.fos.toFixed(2)}
            </div>
            <div className="mt-1 text-xs text-[#64748b]">FoS</div>
          </div>
        );
      })}
    </div>
  );
}

export function CorridorOverviewSection({ zones, energy, alerts }: SectionProps) {
  const foS = avgFoS(zones);
  const criticalAlerts = alerts.filter((alert) => alert.type === 'CRITICAL').length;
  const warningAlerts = alerts.filter((alert) => alert.type === 'WARNING').length;
  const gridStatus = energy?.grid_status ?? 'NOMINAL';
  const systemTone = criticalAlerts > 0 || foS < 1.3 || gridStatus === 'BACKUP'
    ? 'CRITICAL'
    : foS < 1.5 || warningAlerts > 0 || gridStatus === 'STRESSED'
      ? 'ADVISORY'
      : 'OPERATIONAL';
  
  const getStatusIndicator = (value: number) => {
    if (value >= 1.45) return { color: '#10b981', bg: '#f0fdf4', label: 'Stable' };
    if (value >= 1.30) return { color: '#f59e0b', bg: '#fef3c7', label: 'Monitoring' };
    return { color: '#ef4444', bg: '#fee2e2', label: 'Advisory' };
  };

  const indicator = getStatusIndicator(foS);

  const primaryZone = getLowestFoSZone(zones);
  const primaryCorridor = primaryZone ? getZoneCorridorMeta(primaryZone.id) : null;
  const zoneCount = zones.length;

  return (
    <div className="grid h-full min-h-0 gap-6 grid-cols-1 lg:grid-cols-[1fr_320px]">
      {/* Left Panel: Dashboard */}
      <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        {/* Header Section */}
        <div className="px-6 py-5 bg-[#fafafa] border-b border-[#e5e7eb]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">
            Dashboard
          </div>
          <h2 className="text-xl font-semibold text-[#1e3a5f]">
            Mumbai-Nagpur Expressway
          </h2>
        </div>

        {/* Main Content */}
        <div className="px-6 py-6 space-y-6">
          {/* FoS Display with Status Badge */}
          <div>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-xs text-[#6b7280] uppercase tracking-wide">
                  Corridor Factor of Safety
                </div>
                <div className="mt-1 text-[11px] text-[#94a3b8]">
                  Mean FoS across {zoneCount || TOTAL_CORRIDOR_ZONES} active zones
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-baseline gap-2">
                <div className="sm:text-3xl md:text-4xl text-5xl font-bold text-[#1e3a5f] tabular-nums">
                  {foS.toFixed(2)}
                </div>
                <div className="text-lg text-[#6b7280]">FoS</div>
              </div>
              <div
                className="px-4 py-2 rounded-lg border-2"
                style={{
                  backgroundColor: indicator.bg,
                  borderColor: indicator.color
                }}
              >
                <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">
                  Status
                </div>
                <div className="text-sm font-semibold" style={{ color: indicator.color }}>
                  {indicator.label}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#6b7280]">Design Threshold</span>
              <span className="text-xs text-[#6b7280] tabular-nums">2.00</span>
            </div>
            <div className="h-1 bg-[#e5e7eb] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((foS / 2.0) * 100, 100)}%`,
                  backgroundColor: indicator.color
                }}
              />
            </div>
          </div>

          {/* Zone FoS Summary */}
          <div>
            <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-3">
              Zone Summary
            </div>
            <ZoneFoSSummaryStrip zones={zones} />
          </div>

          {/* Primary Monitoring Zone */}
          {primaryZone && primaryCorridor ? (
            <div className="flex min-h-[3.75rem] items-center rounded-lg border-2 border-[#fef3c7] bg-[#fffbeb] px-5 py-4">
              <div className="flex w-full min-w-0 flex-nowrap items-center justify-between gap-3 text-sm text-[#1e3a5f]">
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[#92400e]">
                  Primary Monitoring Zone
                </span>
                <span className="hidden text-[#d4a574] sm:inline">·</span>
                <span className="min-w-0 shrink font-semibold tabular-nums">{primaryZone.id}</span>
                <span className="hidden text-[#d4a574] sm:inline">·</span>
                <span className="min-w-0 truncate text-[#6b7280]">{primaryCorridor.district}</span>
                <span className="hidden text-[#d4a574] sm:inline">·</span>
                <span className="min-w-0 shrink-0 text-right">
                  <span className="text-xs uppercase tracking-wide text-[#6b7280]">Corridor Position </span>
                  <span className="font-semibold tabular-nums">{primaryCorridor.km}</span>
                </span>
                <span className="hidden text-[#d4a574] sm:inline">·</span>
                <span className="shrink-0 text-right">
                  <span className="text-xs uppercase tracking-wide text-[#6b7280]">Local FoS </span>
                  <span className="font-semibold tabular-nums">{primaryZone.fos.toFixed(2)}</span>
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Right Panel: Telemetry — scrolls independently */}
      <div className="min-h-0 overflow-y-auto max-h-[calc(100vh-120px)] pr-1">
        <SectionCard title="Corridor Telemetry" subtitle="environment + energy">
          <OperationsPanelRefined energy={energy} zones={zones} />
        </SectionCard>
      </div>
    </div>
  );
}

export function StabilityMonitoringSection({ zones, zoneHistory, energy }: SectionProps) {
  const currentRisk = zones.map((zone) => ({ zone, risk: riskIndex(zone) }));
  const trendSeries = zoneHistory.slice(-12).map((snapshot) => avgFoS(snapshot));
  const chartValues = trendSeries.length ? trendSeries : [avgFoS(zones)];
  const currentZones = sortZonesById(zones);
  const meanFoS = avgFoS(zones);
  const riskZone = getLowestFoSZone(zones);
  const systemStability = systemStabilityFromFoS(meanFoS);
  const trendDirection = getFoSTrendDirection(chartValues);
  const suggestedAction = getSuggestedAction(systemStability, trendDirection, riskZone?.id ?? null);
  const lowestTrendIndex = chartValues.reduce(
    (lowest, value, index) => (value < chartValues[lowest] ? index : lowest),
    0,
  );

  return (
    <div className="space-y-6">
      <SystemInsightStrip
        stability={systemStability}
        trend={trendDirection}
        riskZone={riskZone}
        suggestedAction={suggestedAction}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <SectionCard title="FoS Trend" subtitle="time series">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-[#64748b]">
              <TrendingUp size={16} />
              rolling average across the last refreshes
            </div>
            <TrendDirectionLabel direction={trendDirection} />
          </div>
          <InlineTrendChart
            values={chartValues}
            color="#1f2937"
            lowestIndex={lowestTrendIndex}
          />
          <div className="mt-2 text-xs text-[#64748b]">
            Lowest corridor FoS point highlighted in red
          </div>
        </SectionCard>

        <SectionCard title="Stability Drivers" subtitle="instability contribution">
          <StabilityDriversPanel zones={zones} energy={energy} />
        </SectionCard>
      </div>

      <SectionCard title="Zone Stability Table" subtitle="zone-wise status">
        <CriticalZonesPanel zones={zones} />
        <div className="overflow-hidden rounded-lg border border-[#e5e7eb]">
          <table className="min-w-full divide-y divide-[#e5e7eb] text-sm">
            <thead className="bg-[#fafafa] text-left text-[11px] uppercase tracking-[0.14em] text-[#64748b]">
              <tr>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">FoS</th>
                <th className="px-4 py-3">Rainfall</th>
                <th className="px-4 py-3">Pore Pressure (kPa)</th>
                <th className="px-4 py-3">Displacement</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Risk Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] bg-white">
              {currentZones.map((zone) => {
                const tableStatus = zoneTableStatusFromFoS(zone.fos);
                const tone = zoneTableStatusTone(tableStatus);
                const risk = currentRisk.find((entry) => entry.zone.id === zone.id)?.risk ?? 0;
                return (
                  <tr
                    key={zone.id}
                    style={{ backgroundColor: tone.bg }}
                  >
                    <td className="px-4 py-3 font-medium text-[#1f2937]">{zone.id}</td>
                    <td className="px-4 py-3 tabular-nums">{zone.fos.toFixed(2)}</td>
                    <td className="px-4 py-3 tabular-nums">{zone.rainfall.toFixed(1)}</td>
                    <td className="px-4 py-3 tabular-nums">{(zone.pressure ?? zone.pore_pressure ?? 0).toFixed(1)}</td>
                    <td className="px-4 py-3 tabular-nums">{(zone.displacement ?? zone.slope_movement ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border px-2.5 py-1 text-[11px] font-medium" style={{ borderColor: tone.border, backgroundColor: '#fff', color: tone.text }}>
                        {tableStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{risk.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

type SystemLoadLevel = 'Low' | 'Moderate' | 'High';

function computeEnergyAnalytics(zones: ZoneReading[], energy: EnergySnapshot | null) {
  const solar = energy?.solar_output ?? 0;
  const wind = energy?.wind_output ?? 0;
  const renewable = solar + wind;
  const gridStatus = energy?.grid_status ?? 'NOMINAL';
  const distribution = energy?.load_distribution ?? {};
  const entries = Object.entries(distribution).sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
  const zoneRisks = sortZonesById(zones).map((zone) => ({
    zone,
    risk: riskIndex(zone),
    share: distribution[zone.id] ?? 0,
  }));

  const peakLoad = entries.length
    ? Math.max(...entries.map(([, share]) => share))
    : Math.round(zoneRisks.reduce((sum, entry) => sum + entry.risk, 0) / Math.max(zoneRisks.length, 1) * 100);

  const systemLoad: SystemLoadLevel =
    gridStatus === 'BACKUP' || peakLoad >= 18 ? 'High' : gridStatus === 'STRESSED' || peakLoad >= 14 ? 'Moderate' : 'Low';

  const stressZones = [...zoneRisks]
    .sort((left, right) => right.risk - left.risk || right.share - left.share)
    .slice(0, 3)
    .map((entry) => entry.zone.id);

  const avgShare = entries.length ? 100 / entries.length : 0;
  const reducing = entries.filter(([, share]) => share < avgShare - 0.4);
  const receiving = entries.filter(([, share]) => share > avgShare + 0.4);

  const gridAssist =
    gridStatus === 'BACKUP' ? renewable * 0.55 : gridStatus === 'STRESSED' ? renewable * 0.35 : renewable * 0.12;
  const totalLoad = renewable + gridAssist;
  const renewableContribution = totalLoad > 0 ? Math.round((renewable / totalLoad) * 100) : 0;
  const gridDependency = Math.max(0, 100 - renewableContribution);
  const systemEfficiency = Math.round(Math.min(99, 62 + renewableContribution * 0.35));

  const optimizationMode =
    gridStatus === 'BACKUP'
      ? 'Emergency Grid Assist'
      : gridStatus === 'STRESSED'
        ? 'Adaptive Load Balancing'
        : renewableContribution >= 70
          ? 'Renewable Priority'
          : 'Corridor Optimization';

  const cause =
    stressZones.length > 0
      ? `${stressZones.join(', ')} driving corridor stress`
      : 'No elevated zone stress detected';

  return {
    solar,
    wind,
    renewable,
    gridStatus,
    entries,
    zoneRisks,
    peakLoad: Math.round(peakLoad),
    systemLoad,
    stressZones,
    avgShare,
    reducing,
    receiving,
    gridAssist,
    totalLoad,
    renewableContribution,
    gridDependency,
    systemEfficiency,
    optimizationMode,
    cause,
  };
}

function EnergyIntelligenceStrip({
  systemLoad,
  gridStatus,
  cause,
  optimizationMode,
}: {
  systemLoad: SystemLoadLevel;
  gridStatus: string;
  cause: string;
  optimizationMode: string;
}) {
  const loadTone =
    systemLoad === 'High'
      ? statusTone('WARNING')
      : systemLoad === 'Moderate'
        ? statusTone('ADVISORY')
        : statusTone('NOMINAL');
  const gridTone = statusTone(gridStatus);

  return (
    <section className="rounded-lg border border-[#d1d5db] bg-white p-5">
      <div className="mb-4 text-[11px] uppercase tracking-[0.16em] text-[#64748b]">Energy intelligence</div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border px-4 py-3" style={{ borderColor: loadTone.border, backgroundColor: loadTone.bg }}>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[#64748b]">System Load</div>
          <div className="mt-2 text-lg font-semibold" style={{ color: loadTone.text }}>{systemLoad}</div>
        </div>
        <div className="rounded-lg border px-4 py-3" style={{ borderColor: gridTone.border, backgroundColor: gridTone.bg }}>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[#64748b]">Grid Status</div>
          <div className="mt-2 text-lg font-semibold" style={{ color: gridTone.text }}>{gridStatus}</div>
        </div>
        <div className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 sm:col-span-2 xl:col-span-1">
          <div className="text-[11px] uppercase tracking-[0.14em] text-[#64748b]">Cause</div>
          <div className="mt-2 text-sm leading-relaxed text-[#374151]">{cause}</div>
        </div>
        <div className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 sm:col-span-2 xl:col-span-1">
          <div className="text-[11px] uppercase tracking-[0.14em] text-[#64748b]">Optimization Mode</div>
          <div className="mt-2 text-sm font-semibold text-[#1e3a5f]">{optimizationMode}</div>
        </div>
      </div>
    </section>
  );
}

function GridStatusPanel({
  gridStatus,
  gridLoadPct,
  stressZones,
}: {
  gridStatus: string;
  gridLoadPct: number;
  stressZones: string[];
}) {
  const tone = statusTone(gridStatus);

  return (
    <div className="rounded-lg border px-4 py-3" style={{ borderColor: tone.border, backgroundColor: tone.bg }}>
      <div className="text-[11px] uppercase tracking-[0.14em] text-[#64748b]">Grid Status</div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold tabular-nums" style={{ color: tone.text }}>
            {gridLoadPct}%
          </div>
          <div className="text-xs text-[#64748b]">Grid Load</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold" style={{ color: tone.text }}>{gridStatus}</div>
          <div className="text-xs text-[#64748b]">Status</div>
        </div>
      </div>
      <div className="mt-3 border-t pt-3" style={{ borderColor: tone.border }}>
        <div className="text-[11px] uppercase tracking-[0.14em] text-[#64748b]">Primary stress zones</div>
        <div className="mt-1 text-sm font-medium text-[#1f2937]">
          {stressZones.length ? stressZones.join(' · ') : 'None flagged'}
        </div>
      </div>
    </div>
  );
}

function LoadRedistributionEngine({
  entries,
  zoneRisks,
  avgShare,
  reducing,
  receiving,
}: {
  entries: [string, number][];
  zoneRisks: { zone: ZoneReading; risk: number; share: number }[];
  avgShare: number;
  reducing: [string, number][];
  receiving: [string, number][];
}) {
  const riskByZone = Object.fromEntries(zoneRisks.map((entry) => [entry.zone.id, entry.risk]));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-[#64748b]">
        <ArrowRightLeft size={16} />
        Adaptive redistribution shifts corridor load away from stressed segments.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#b91c1c]">
            <ArrowDown size={14} />
            Zones reducing load
          </div>
          {reducing.length === 0 ? (
            <div className="text-sm text-[#64748b]">No active load reductions.</div>
          ) : (
            <ul className="space-y-1 text-sm text-[#1f2937]">
              {reducing.map(([zoneId, share]) => (
                <li key={zoneId} className="flex justify-between tabular-nums">
                  <span>{zoneId}</span>
                  <span className="text-[#b91c1c]">{share.toFixed(1)}% ↓</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#15803d]">
            <ArrowUp size={14} />
            Zones receiving load
          </div>
          {receiving.length === 0 ? (
            <div className="text-sm text-[#64748b]">No active load increases.</div>
          ) : (
            <ul className="space-y-1 text-sm text-[#1f2937]">
              {receiving.map(([zoneId, share]) => (
                <li key={zoneId} className="flex justify-between tabular-nums">
                  <span>{zoneId}</span>
                  <span className="text-[#15803d]">{share.toFixed(1)}% ↑</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#d1d5db] px-4 py-6 text-sm text-[#64748b]">
            No load distribution data available.
          </div>
        ) : (
          entries.map(([zoneId, share]) => {
            const risk = riskByZone[zoneId] ?? 0;
            const isOverloaded = share > avgShare + 0.4 || risk >= 0.45;
            const isReceiving = share > avgShare + 0.4 && risk < 0.45;
            const barColor = isOverloaded ? '#ef4444' : isReceiving ? '#22c55e' : '#64748b';
            return (
              <div key={zoneId}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#1f2937]">{zoneId}</span>
                  <span className="tabular-nums text-[#64748b]">{share.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#e5e7eb]">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(share, 100)}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function EnergyFlowSummary({
  solar,
  wind,
  gridAssist,
  totalLoad,
}: {
  solar: number;
  wind: number;
  gridAssist: number;
  totalLoad: number;
}) {
  const flows = [
    { label: 'Solar → Corridor', value: solar, icon: Sun, color: '#f59e0b' },
    { label: 'Wind → Corridor', value: wind, icon: Wind, color: '#3b82f6' },
    { label: 'Grid → Corridor', value: gridAssist, icon: Zap, color: '#64748b' },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {flows.map((flow) => {
        const Icon = flow.icon;
        return (
          <div key={flow.label} className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#64748b]">
              <Icon size={14} style={{ color: flow.color }} />
              {flow.label}
            </div>
            <div className="mt-2 text-xl font-semibold tabular-nums text-[#1f2937]">
              {flow.value.toFixed(1)} <span className="text-sm font-normal text-[#64748b]">kW</span>
            </div>
          </div>
        );
      })}
      <div className="rounded-lg border border-[#d1d5db] bg-white px-4 py-3">
        <div className="text-xs uppercase tracking-wide text-[#64748b]">Total load</div>
        <div className="mt-2 text-xl font-semibold tabular-nums text-[#1e3a5f]">
          {totalLoad.toFixed(1)} <span className="text-sm font-normal text-[#64748b]">kW</span>
        </div>
      </div>
    </div>
  );
}

function SystemActionPanel({ gridStatus, reducing, receiving, renewableContribution }: {
  gridStatus: string;
  reducing: [string, number][];
  receiving: [string, number][];
  renewableContribution: number;
}) {
  const actions = [
    reducing.length > 0 || receiving.length > 0
      ? 'Load redistribution active across corridor segments'
      : 'Load redistribution standing by',
    gridStatus === 'NOMINAL'
      ? 'Grid dependency reduced — corridor operating within nominal band'
      : 'Grid assist engaged to stabilize corridor supply',
    renewableContribution >= 60
      ? 'Renewable prioritization active (solar + wind preferred)'
      : 'Mixed supply mode — balancing renewables with grid assist',
  ];

  return (
    <ul className="space-y-2 text-sm text-[#374151]">
      {actions.map((action) => (
        <li key={action} className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1e3a5f]" />
          {action}
        </li>
      ))}
    </ul>
  );
}

export function EnergyOperationsSection({ zones, energy }: SectionProps) {
  const analytics = computeEnergyAnalytics(zones, energy);

  return (
    <div className="space-y-6">
      <EnergyIntelligenceStrip
        systemLoad={analytics.systemLoad}
        gridStatus={analytics.gridStatus}
        cause={analytics.cause}
        optimizationMode={analytics.optimizationMode}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Solar Output" value={analytics.solar.toFixed(1)} unit="kW" />
        <Metric label="Wind Output" value={analytics.wind.toFixed(1)} unit="kW" />
        <GridStatusPanel
          gridStatus={analytics.gridStatus}
          gridLoadPct={analytics.peakLoad}
          stressZones={analytics.stressZones}
        />
      </div>

      <SectionCard title="Energy Flow Summary" subtitle="supply routing">
        <EnergyFlowSummary
          solar={analytics.solar}
          wind={analytics.wind}
          gridAssist={analytics.gridAssist}
          totalLoad={analytics.totalLoad}
        />
      </SectionCard>

      <SectionCard title="Load Redistribution Engine" subtitle="adaptive corridor balancing">
        <LoadRedistributionEngine
          entries={analytics.entries}
          zoneRisks={analytics.zoneRisks}
          avgShare={analytics.avgShare}
          reducing={analytics.reducing}
          receiving={analytics.receiving}
        />
      </SectionCard>

      <SectionCard title="Energy vs Corridor Load" subtitle="system balance">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="System Efficiency" value={analytics.systemEfficiency} unit="%" />
          <Metric label="Renewable Contribution" value={analytics.renewableContribution} unit="%" />
          <Metric label="Grid Dependency" value={analytics.gridDependency} unit="%" />
        </div>
        <div className="mt-6 border-t border-[#e5e7eb] pt-5">
          <div className="mb-3 text-[11px] uppercase tracking-[0.14em] text-[#64748b]">System actions</div>
          <SystemActionPanel
            gridStatus={analytics.gridStatus}
            reducing={analytics.reducing}
            receiving={analytics.receiving}
            renewableContribution={analytics.renewableContribution}
          />
        </div>
      </SectionCard>
    </div>
  );
}

export function AdaptiveAlertsSection({ alerts }: SectionProps) {
  return (
    <div className="space-y-6">
      <SectionCard title="Adaptive Alerts" subtitle="event chain view">
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#d1d5db] px-4 py-8 text-sm text-[#64748b]">No event chains have been generated yet.</div>
          ) : alerts.map((alert) => {
            const tone = statusTone(alert.type);
            return (
              <div key={alert.id} className="rounded-lg border px-4 py-4" style={{ borderColor: tone.border, backgroundColor: tone.bg }}>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium text-[#1f2937]">{alert.zone}</div>
                  <span className="rounded-full border px-2.5 py-1 text-[11px] font-medium" style={{ borderColor: tone.border, color: tone.text }}>
                    {alert.type}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-sm text-[#374151]">
                  <div><span className="font-semibold">Cause:</span> {alert.cause}</div>
                  <div><span className="font-semibold">System Response:</span> {alert.response}</div>
                  <div><span className="font-semibold">Outcome:</span> {alert.outcome}</div>
                </div>
                <div className="mt-3 text-xs uppercase tracking-[0.14em] text-[#64748b]">{new Date(alert.timestamp).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Chain Logic" subtitle="how the simulation reacts">
        <div className="grid gap-3 text-sm text-[#374151]">
          <div className="flex items-center gap-2"><Activity size={16} /> rainfall rises</div>
          <div className="flex items-center gap-2"><ShieldAlert size={16} /> FoS drops below the advisory band</div>
          <div className="flex items-center gap-2"><Wind size={16} /> load is redistributed to lower-risk zones</div>
          <div className="flex items-center gap-2"><Zap size={16} /> system stabilizes and logs the chain</div>
        </div>
      </SectionCard>
    </div>
  );
}