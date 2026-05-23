interface SCADAGaugeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  warning?: number;
  critical?: number;
}

export function SCADAGauge({ label, value, min, max, unit, warning, critical }: SCADAGaugeProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const angle = (percentage / 100) * 180 - 90;

  const getColor = () => {
    if (critical && value >= critical) return '#dc2626';
    if (warning && value >= warning) return '#f59e0b';
    return '#3b82f6';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-16">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="rgba(59, 130, 246, 0.1)"
            strokeWidth="2"
          />
          {warning && (
            <path
              d={`M 20 90 A 80 80 0 0 1 ${100 + 80 * Math.cos((((warning - min) / (max - min)) * 180 - 90) * Math.PI / 180)} ${90 + 80 * Math.sin((((warning - min) / (max - min)) * 180 - 90) * Math.PI / 180)}`}
              fill="none"
              stroke="rgba(245, 158, 11, 0.15)"
              strokeWidth="2"
            />
          )}
          <line
            x1="100"
            y1="90"
            x2={100 + 70 * Math.cos(angle * Math.PI / 180)}
            y2={90 + 70 * Math.sin(angle * Math.PI / 180)}
            stroke={getColor()}
            strokeWidth="2"
          />
          <circle cx="100" cy="90" r="3" fill={getColor()} />
        </svg>
      </div>
      <div className="text-center">
        <div className="text-xs text-[#6b7280] uppercase tracking-wider">{label}</div>
        <div className="text-lg" style={{ color: getColor() }}>
          {value.toFixed(2)} {unit}
        </div>
      </div>
    </div>
  );
}
