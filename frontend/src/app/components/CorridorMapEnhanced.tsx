import { useState } from 'react';
import { ZoneReading } from '../../hooks/useSCLOU';

interface LayerToggleProps {
  layers: string[];
  activeLayers: string[];
  onLayerToggle: (layer: string) => void;
}

function LayerToggle({ layers, activeLayers, onLayerToggle }: LayerToggleProps) {
  return (
    <div className="flex items-center gap-2">
      {layers.map((layer) => (
        <button
          key={layer}
          onClick={() => onLayerToggle(layer)}
          className={`px-3 py-1.5 text-xs border rounded transition-colors ${
            activeLayers.includes(layer)
              ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
              : 'bg-white text-[#64748b] border-[#cbd5e1] hover:border-[#1e3a5f]'
          }`}
        >
          {layer}
        </button>
      ))}
    </div>
  );
}

interface CorridorMapEnhancedProps {
  zones: ZoneReading[];
}

export function CorridorMapEnhanced({ zones }: CorridorMapEnhancedProps) {
  const [activeLayers, setActiveLayers] = useState(['Stability']);

  const layers = ['Stability', 'Solar', 'Wind', 'Environmental', 'Reinforcement', 'Node Health'];

  const toggleLayer = (layer: string) => {
    setActiveLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  };

  // Map backend zones to display coordinates
  const zonePositions: Record<string, { x: number; y: number; km: string; name: string }> = {
    Z1: { x: 120, y: 180, km: 'KM 0-42', name: 'Thane District' },
    Z2: { x: 240, y: 160, km: 'KM 42-98', name: 'Nashik Approach' },
    Z3: { x: 360, y: 140, km: 'KM 98-156', name: 'Western Ghats' },
    Z4: { x: 480, y: 150, km: 'KM 156-234', name: 'Ahmednagar' },
    Z5: { x: 600, y: 165, km: 'KM 234-312', name: 'Aurangabad' },
  };

  const displayZones = zones
    .map((zone, index) => {
      const pos = zonePositions[zone.id] || { x: 0, y: 0, km: '', name: '' };
      return {
        ...zone,
        ...pos,
        nodes: 3 + (index % 3),
      };
    })
    .filter((z) => z.x > 0);

  const solarOutput = zones.reduce((sum, zone) => sum + Math.max(0, 40 - zone.rainfall), 0);
  const rainfallPeak = Math.max(...zones.map((zone) => zone.rainfall), 1);

  const interchanges = [
    { id: 'INT-MUM', name: 'Mumbai Junction', x: 60, y: 185, type: 'primary' },
    { id: 'INT-NSK', name: 'Nashik', x: 300, y: 150, type: 'major' },
    { id: 'INT-AHM', name: 'Ahmednagar', x: 540, y: 158, type: 'major' },
    { id: 'INT-AUR', name: 'Aurangabad', x: 660, y: 170, type: 'major' },
    { id: 'INT-NAG', name: 'Nagpur Junction', x: 900, y: 175, type: 'primary' },
  ];

  const getStatusFromFoS = (fos: number): string => {
    if (fos >= 1.5) return 'stable';
    if (fos >= 1.3) return 'monitoring';
    return 'warning';
  };

  const getStatusColor = (status: string) => {
    if (status === 'monitoring') return '#f59e0b';
    if (status === 'advisory') return '#f59e0b';
    if (status === 'warning') return '#ef4444';
    return '#10b981';
  };

  const getStatusFill = (status: string) => {
    if (status === 'monitoring') return '#fffbeb';
    if (status === 'advisory') return '#fef3c7';
    if (status === 'warning') return '#fee2e2';
    return '#f0fdf4';
  };

  return (
    <div className="w-full h-full bg-white border border-[#e5e7eb] rounded-lg overflow-hidden flex flex-col">
      {/* Map header with layer controls */}
      <div className="px-6 py-4 border-b border-[#e5e7eb] bg-[#fafafa]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base text-[#1e3a5f] mb-1" style={{ fontWeight: 600 }}>
              Mumbai-Nagpur Expressway Corridor
            </h2>
            <div className="text-xs text-[#64748b]">
              520km integrated transportation-energy infrastructure monitoring ({zones.length} zones active)
            </div>
          </div>
          <div className="text-xs text-[#64748b]">
            Live Infrastructure Telemetry
          </div>
        </div>

        <div className="flex items-center justify-between">
          <LayerToggle layers={layers} activeLayers={activeLayers} onLayerToggle={toggleLayer} />

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10b981]" />
              <span className="text-[#64748b]">Stable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
              <span className="text-[#64748b]">Monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
              <span className="text-[#64748b]">Warning</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main corridor map */}
      <div className="flex-1 p-8 overflow-auto bg-[#fafafa]">
        <svg viewBox="0 0 960 300" className="w-full h-full">
          <defs>
            <pattern id="grid-enhanced" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#94a3b8" />
            </marker>
          </defs>

          <rect width="960" height="300" fill="url(#grid-enhanced)" />

          {/* Main expressway corridor line */}
          <path
            d="M 40 185 L 120 180 L 240 160 L 360 140 L 480 150 L 600 165 L 720 155 L 840 170 L 920 175"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Solar generation zone (south side) - shown if active */}
          {activeLayers.includes('Solar') && (
            <>
              <rect x="80" y="198" width="800" height="34" fill="#fef3c7" opacity="0.35" rx="6" />
              <text x="920" y="220" textAnchor="end" className="fill-[#92400e]" style={{ fontSize: '11px', fontWeight: 500 }}>
                Solar {solarOutput.toFixed(0)} kW
              </text>
            </>
          )}

          {/* Wind generation zone (north side) - shown if active */}
          {activeLayers.includes('Wind') && (
            <>
              <rect x="80" y="48" width="800" height="34" fill="#dbeafe" opacity="0.35" rx="6" />
            </>
          )}

          {activeLayers.includes('Environmental') && (
            <>
              {displayZones.map((zone) => (
                <rect
                  key={`${zone.id}-env`}
                  x={zone.x - 34}
                  y={zone.y - 34}
                  width="68"
                  height="68"
                  fill="#fee2e2"
                  opacity={Math.min(zone.rainfall / Math.max(rainfallPeak, 1), 1) * 0.35}
                  rx="14"
                />
              ))}
            </>
          )}

          {/* Terrain annotation - Western Ghats */}
          <text x="360" y="120" textAnchor="middle" className="fill-[#64748b]" style={{ fontSize: '10px', fontStyle: 'italic' }}>
            Western Ghats Terrain
          </text>

          {/* Zone connection lines */}
          {displayZones.slice(0, -1).map((zone, i) => {
            const nextZone = displayZones[i + 1];
            return (
              <line
                key={i}
                x1={zone.x}
                y1={zone.y}
                x2={nextZone.x}
                y2={nextZone.y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4,3"
                markerEnd={activeLayers.includes('Reinforcement') ? 'url(#arrow)' : undefined}
              />
            );
          })}

          {activeLayers.includes('Reinforcement') && (
            <>
              {displayZones.slice(1).map((zone, i) => {
                const previousZone = displayZones[i];
                const nextZone = displayZones[i + 1];
                if (!previousZone || !nextZone) return null;
                return (
                  <g key={`${zone.id}-reinf`}>
                    <line
                      x1={zone.x}
                      y1={zone.y - 48}
                      x2={previousZone.x}
                      y2={previousZone.y - 48}
                      stroke="#6b7280"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />
                    {nextZone ? (
                      <line
                        x1={zone.x}
                        y1={zone.y - 48}
                        x2={nextZone.x}
                        y2={nextZone.y - 48}
                        stroke="#6b7280"
                        strokeWidth="1.5"
                        markerEnd="url(#arrow)"
                      />
                    ) : null}
                  </g>
                );
              })}
            </>
          )}

          {/* Monitoring zones - from backend data */}
          {displayZones.map((zone) => {
            const status = getStatusFromFoS(zone.fos);
            return (
              <g key={zone.id}>
                <title>{`${zone.id} | FoS ${zone.fos.toFixed(2)} | ${zone.name} | ${zone.km} | Rainfall ${zone.rainfall.toFixed(1)} mm/h`}</title>
                <circle
                  cx={zone.x}
                  cy={zone.y}
                  r="42"
                  fill={activeLayers.includes('Stability') ? getStatusFill(status) : 'white'}
                  stroke={getStatusColor(status)}
                  strokeWidth="2.5"
                />

                <text
                  x={zone.x}
                  y={zone.y - 2}
                  textAnchor="middle"
                  className="fill-[#1e3a5f]"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  {zone.id}
                </text>

                <text
                  x={zone.x}
                  y={zone.y + 14}
                  textAnchor="middle"
                  className="fill-[#64748b]"
                  style={{ fontSize: '11px', fontWeight: 500 }}
                >
                  FoS {zone.fos.toFixed(2)}
                </text>

                {/* Node indicators */}
                {activeLayers.includes('Node Health') && (
                  <>
                    {Array.from({ length: zone.nodes }).map((_, i) => (
                      <circle
                        key={i}
                        cx={zone.x + (i - Math.floor(zone.nodes / 2)) * 8}
                        cy={zone.y + 35}
                        r="2"
                        fill={getStatusColor(status)}
                      />
                    ))}
                  </>
                )}
              </g>
            );
          })}

          {/* Interchanges */}
          {interchanges.map((interchange) => (
            <g key={interchange.id}>
              <rect
                x={interchange.x - 10}
                y={interchange.y - 10}
                width="20"
                height="20"
                fill="white"
                stroke="#1e3a5f"
                strokeWidth={interchange.type === 'primary' ? 2.5 : 1.5}
                rx="2"
              />
              <line
                x1={interchange.x - 6}
                y1={interchange.y}
                x2={interchange.x + 6}
                y2={interchange.y}
                stroke="#1e3a5f"
                strokeWidth="1.5"
              />
              <line
                x1={interchange.x}
                y1={interchange.y - 6}
                x2={interchange.x}
                y2={interchange.y + 6}
                stroke="#1e3a5f"
                strokeWidth="1.5"
              />
              <text
                x={interchange.x}
                y={interchange.y + 25}
                textAnchor="middle"
                className="fill-[#1e3a5f]"
                style={{ fontSize: '10px', fontWeight: 500 }}
              >
                {interchange.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
