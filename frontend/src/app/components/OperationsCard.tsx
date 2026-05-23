interface OperationsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status: 'normal' | 'advisory' | 'warning';
  subtitle?: string;
  trend?: number;
}

export function OperationsCard({ title, value, unit, status, subtitle, trend }: OperationsCardProps) {
  const statusConfig = {
    normal: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
    advisory: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
    warning: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' }
  };

  const config = statusConfig[status];

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs text-[#64748b] uppercase tracking-wide">{title}</div>
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: config.text }}
        />
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <div className="text-2xl text-[#1e3a5f] tabular-nums" style={{ fontWeight: 600 }}>
          {value}
        </div>
        {unit && <div className="text-sm text-[#64748b]">{unit}</div>}
      </div>

      {subtitle && (
        <div className="text-xs text-[#64748b]">{subtitle}</div>
      )}

      {trend !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          <span className={`text-xs ${trend >= 0 ? 'text-[#166534]' : 'text-[#991b1b]'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-xs text-[#64748b]">vs. last hour</span>
        </div>
      )}
    </div>
  );
}
