interface StatusIndicatorProps {
  label: string;
  status: 'online' | 'warning' | 'offline';
  subsystem?: string;
}

export function StatusIndicator({ label, status, subsystem }: StatusIndicatorProps) {
  const statusConfig = {
    online: { color: '#10b981', text: 'ONLINE' },
    warning: { color: '#f59e0b', text: 'WARNING' },
    offline: { color: '#dc2626', text: 'OFFLINE' }
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1a2332]">
      <div className="flex flex-col">
        <span className="text-sm text-white">{label}</span>
        {subsystem && <span className="text-xs text-[#6b7280]">{subsystem}</span>}
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: config.color }}
        />
        <span className="text-xs tabular-nums" style={{ color: config.color }}>
          {config.text}
        </span>
      </div>
    </div>
  );
}
