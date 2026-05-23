export function DecisionTimeline() {
  const events = [
    { time: '14:23:18', action: 'Load redistribution initiated', zone: 'Z3→Z2', status: 'active' },
    { time: '14:21:45', action: 'Rainfall threshold exceeded', zone: 'Z3', status: 'warning' },
    { time: '14:18:32', action: 'Pore pressure nominal', zone: 'ALL', status: 'normal' },
    { time: '14:15:09', action: 'Anchor tension adjusted', zone: 'Z4', status: 'normal' },
    { time: '14:12:54', action: 'System diagnostics complete', zone: 'SYS', status: 'normal' },
  ];

  const statusColors = {
    active: '#3b82f6',
    warning: '#f59e0b',
    normal: '#6b7280'
  };

  return (
    <div className="flex items-center gap-6 overflow-x-auto">
      {events.map((event, i) => (
        <div key={i} className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-center">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColors[event.status] }}
            />
            {i < events.length - 1 && (
              <div className="w-0.5 h-8 bg-[#1a2332]" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="text-xs text-[#6b7280] tabular-nums">{event.time}</div>
            <div className="text-sm text-white">{event.action}</div>
            <div className="text-xs" style={{ color: statusColors[event.status] }}>
              {event.zone}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
