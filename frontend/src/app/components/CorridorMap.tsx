export function CorridorMap() {
  const zones = [
    { id: 'Z1', x: 50, y: 100, temp: 22, load: 45, status: 'normal' },
    { id: 'Z2', x: 150, y: 80, temp: 24, load: 58, status: 'normal' },
    { id: 'Z3', x: 250, y: 120, temp: 31, load: 87, status: 'warning' },
    { id: 'Z4', x: 350, y: 90, temp: 26, load: 62, status: 'normal' },
    { id: 'Z5', x: 450, y: 110, temp: 23, load: 51, status: 'normal' },
  ];

  const connections = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
  ];

  const getZoneColor = (status: string, load: number) => {
    if (status === 'warning') return '#f59e0b';
    if (status === 'critical') return '#dc2626';
    const intensity = Math.min(load / 100, 1);
    return `rgba(59, 130, 246, ${0.3 + intensity * 0.5})`;
  };

  return (
    <div className="relative w-full h-full bg-[#0a0e13] border border-[#1a2332]">
      <svg viewBox="0 0 500 250" className="w-full h-full">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(59, 130, 246, 0.05)" strokeWidth="0.5"/>
          </pattern>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" opacity="0.5" />
          </marker>
        </defs>

        <rect width="500" height="250" fill="url(#grid)" />

        {connections.map((conn, i) => {
          const from = zones[conn.from];
          const to = zones[conn.to];
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;

          return (
            <g key={i}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(59, 130, 246, 0.15)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <line
                x1={from.x}
                y1={from.y}
                x2={midX}
                y2={midY}
                stroke="#3b82f6"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                opacity="0.4"
              />
            </g>
          );
        })}

        {zones.map((zone, i) => (
          <g key={zone.id}>
            <circle
              cx={zone.x}
              cy={zone.y}
              r={zone.status === 'warning' ? 35 : 30}
              fill={getZoneColor(zone.status, zone.load)}
              stroke={zone.status === 'warning' ? '#f59e0b' : '#3b82f6'}
              strokeWidth={zone.status === 'warning' ? 2 : 1}
            />
            <text
              x={zone.x}
              y={zone.y - 5}
              textAnchor="middle"
              className="text-xs fill-white"
              style={{ fontSize: '10px', fontWeight: 500 }}
            >
              {zone.id}
            </text>
            <text
              x={zone.x}
              y={zone.y + 8}
              textAnchor="middle"
              className="text-xs"
              style={{ fill: '#6b7280', fontSize: '8px' }}
            >
              {zone.load}% | {zone.temp}°C
            </text>

            <circle
              cx={zone.x + 20}
              cy={zone.y - 20}
              r="3"
              fill={zone.status === 'warning' ? '#f59e0b' : '#10b981'}
              opacity="0.8"
            />
          </g>
        ))}

        <text x="10" y="20" className="text-xs fill-[#6b7280]" style={{ fontSize: '10px' }}>
          CORRIDOR INTELLIGENCE MAP
        </text>
        <text x="10" y="35" className="text-xs fill-[#6b7280]" style={{ fontSize: '8px' }}>
          REAL-TIME STRUCTURAL MONITORING
        </text>
      </svg>
    </div>
  );
}
