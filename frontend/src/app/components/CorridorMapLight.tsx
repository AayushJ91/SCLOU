export function CorridorMapLight() {
  const zones = [
    { id: 'INT-01', name: 'Mumbai Junction', x: 80, y: 120, type: 'interchange', status: 'operational' },
    { id: 'Z1', name: 'Zone 1', x: 180, y: 100, type: 'monitoring', status: 'operational', fos: 1.52, solar: 45 },
    { id: 'Z2', name: 'Zone 2', x: 280, y: 110, type: 'monitoring', status: 'operational', fos: 1.48, solar: 52 },
    { id: 'Z3', name: 'Zone 3', x: 380, y: 95, type: 'monitoring', status: 'operational', fos: 1.45, solar: 48 },
    { id: 'Z4', name: 'Zone 4', x: 480, y: 105, type: 'monitoring', status: 'advisory', fos: 1.34, solar: 41 },
    { id: 'Z5', name: 'Zone 5', x: 580, y: 115, type: 'monitoring', status: 'operational', fos: 1.51, solar: 47 },
    { id: 'INT-02', name: 'Nashik Interchange', x: 680, y: 120, type: 'interchange', status: 'operational' },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'advisory') return '#f59e0b';
    if (status === 'warning') return '#ef4444';
    return '#10b981';
  };

  const getZoneFill = (status: string) => {
    if (status === 'advisory') return '#fef3c7';
    if (status === 'warning') return '#fee2e2';
    return '#f0fdf4';
  };

  return (
    <div className="w-full h-full bg-[#fafafa] border border-[#e5e7eb] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[#e5e7eb] bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm text-[#1e3a5f]" style={{ fontWeight: 600 }}>
              Corridor Monitoring Network
            </h3>
            <div className="text-xs text-[#64748b] mt-0.5">
              Real-time infrastructure health visualization
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10b981]" />
              <span className="text-[#64748b]">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
              <span className="text-[#64748b]">Advisory</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <svg viewBox="0 0 760 240" className="w-full h-full">
          <defs>
            <pattern id="grid-light" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
          </defs>

          <rect width="760" height="240" fill="url(#grid-light)" />

          {/* Main corridor line */}
          <line
            x1="40"
            y1="120"
            x2="720"
            y2="120"
            stroke="#cbd5e1"
            strokeWidth="3"
          />

          {/* Solar zones (south side) */}
          <rect x="160" y="130" width="480" height="40" fill="#fef3c7" opacity="0.3" rx="2" />
          <text x="400" y="155" textAnchor="middle" className="text-xs fill-[#92400e]" style={{ fontSize: '10px' }}>
            South-Facing Solar Generation Zones
          </text>

          {/* Wind zones (north side) */}
          <rect x="160" y="50" width="480" height="40" fill="#dbeafe" opacity="0.3" rx="2" />
          <text x="400" y="75" textAnchor="middle" className="text-xs fill-[#1e3a8a]" style={{ fontSize: '10px' }}>
            North-Side Distributed Wind Zones
          </text>

          {/* Zone connections */}
          {zones.slice(0, -1).map((zone, i) => {
            if (zone.type === 'monitoring') {
              const nextZone = zones[i + 1];
              return (
                <line
                  key={i}
                  x1={zone.x}
                  y1={zone.y}
                  x2={nextZone.x}
                  y2={nextZone.y}
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
              );
            }
            return null;
          })}

          {/* Zones and interchanges */}
          {zones.map((zone) => {
            if (zone.type === 'interchange') {
              return (
                <g key={zone.id}>
                  <rect
                    x={zone.x - 15}
                    y={zone.y - 15}
                    width="30"
                    height="30"
                    fill="white"
                    stroke="#1e3a5f"
                    strokeWidth="2"
                    rx="2"
                  />
                  <text
                    x={zone.x}
                    y={zone.y + 35}
                    textAnchor="middle"
                    className="text-xs fill-[#1e3a5f]"
                    style={{ fontSize: '9px', fontWeight: 500 }}
                  >
                    {zone.name}
                  </text>
                </g>
              );
            }

            return (
              <g key={zone.id}>
                <circle
                  cx={zone.x}
                  cy={zone.y}
                  r="28"
                  fill={getZoneFill(zone.status)}
                  stroke={getStatusColor(zone.status)}
                  strokeWidth="2"
                />
                <text
                  x={zone.x}
                  y={zone.y - 6}
                  textAnchor="middle"
                  className="fill-[#1e3a5f]"
                  style={{ fontSize: '11px', fontWeight: 600 }}
                >
                  {zone.id}
                </text>
                <text
                  x={zone.x}
                  y={zone.y + 6}
                  textAnchor="middle"
                  className="fill-[#64748b]"
                  style={{ fontSize: '8px' }}
                >
                  FoS {zone.fos}
                </text>
                <text
                  x={zone.x}
                  y={zone.y + 15}
                  textAnchor="middle"
                  className="fill-[#64748b]"
                  style={{ fontSize: '8px' }}
                >
                  {zone.solar}% solar
                </text>

                {/* Node indicator */}
                <circle
                  cx={zone.x + 22}
                  cy={zone.y - 22}
                  r="4"
                  fill={getStatusColor(zone.status)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
