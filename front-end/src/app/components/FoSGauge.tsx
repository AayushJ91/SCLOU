export function FoSGauge({ value }: { value: number }) {
  const minValue = 1.0;
  const maxValue = 2.0;
  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
  const angle = (percentage / 100) * 180 - 90;

  const getColor = () => {
    if (value < 1.2) return '#991b1b';
    if (value < 1.4) return '#92400e';
    return '#166534';
  };

  const getZoneColor = (threshold: number) => {
    if (threshold < 1.2) return '#fee2e2';
    if (threshold < 1.4) return '#fef3c7';
    return '#f0fdf4';
  };

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
      <div className="text-xs text-[#64748b] uppercase tracking-wide mb-4">
        Factor of Safety
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-full h-32 mb-4">
          <svg viewBox="0 0 200 110" className="w-full h-full">
            {/* Background arc zones */}
            <path
              d="M 20 90 A 80 80 0 0 1 60 30"
              fill="none"
              stroke="#fee2e2"
              strokeWidth="12"
            />
            <path
              d="M 60 30 A 80 80 0 0 1 140 30"
              fill="none"
              stroke="#fef3c7"
              strokeWidth="12"
            />
            <path
              d="M 140 30 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="#f0fdf4"
              strokeWidth="12"
            />

            {/* Threshold markers */}
            <text x="30" y="105" className="text-xs fill-[#64748b]" style={{ fontSize: '9px' }}>
              1.0
            </text>
            <text x="95" y="20" textAnchor="middle" className="text-xs fill-[#64748b]" style={{ fontSize: '9px' }}>
              1.5
            </text>
            <text x="170" y="105" textAnchor="end" className="text-xs fill-[#64748b]" style={{ fontSize: '9px' }}>
              2.0
            </text>

            {/* Needle */}
            <line
              x1="100"
              y1="90"
              x2={100 + 70 * Math.cos(angle * Math.PI / 180)}
              y2={90 + 70 * Math.sin(angle * Math.PI / 180)}
              stroke={getColor()}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="90" r="5" fill={getColor()} />
          </svg>
        </div>

        <div className="text-center">
          <div className="text-3xl text-[#1e3a5f] tabular-nums mb-1" style={{ fontWeight: 600 }}>
            {value.toFixed(2)}
          </div>
          <div className="text-xs text-[#64748b]">Current Safety Factor</div>
        </div>
      </div>
    </div>
  );
}
