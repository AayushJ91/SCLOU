interface MetricDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

export function MetricDisplay({ label, value, unit, status = 'normal', trend }: MetricDisplayProps) {
  const statusColors = {
    normal: '#3b82f6',
    warning: '#f59e0b',
    critical: '#dc2626'
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→'
  };

  return (
    <div className="flex flex-col gap-1 py-2 border-b border-[#1a2332]">
      <div className="text-xs text-[#6b7280] uppercase tracking-wider">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl tabular-nums" style={{ color: statusColors[status] }}>
          {value}
        </span>
        {unit && <span className="text-sm text-[#6b7280]">{unit}</span>}
        {trend && (
          <span className="text-xs" style={{ color: statusColors[status] }}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
    </div>
  );
}
