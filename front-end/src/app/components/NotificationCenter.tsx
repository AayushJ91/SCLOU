import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import type { Alert } from '../../hooks/useSCLOU';

function formatAlertTime(timestamp: string) {
  try {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
}

function alertSummary(alert: Alert) {
  const text = alert.cause || alert.message;
  if (text.length <= 80) return text;
  return `${text.slice(0, 80)}…`;
}

interface NotificationCenterProps {
  alerts: Alert[];
}

export function NotificationCenter({ alerts }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const recentAlerts = alerts.slice(0, 8);
  const activeCount = alerts.filter(
    (alert) => alert.type === 'WARNING' || alert.type === 'CRITICAL',
  ).length;

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="relative flex h-10 w-10 items-center justify-center rounded border border-[#e5e7eb] bg-[#f8fafc] text-[#1e3a5f] transition-colors hover:bg-[#f1f5f9]"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={18} />
        {activeCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-semibold text-white">
            {activeCount > 99 ? '99+' : activeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-lg">
          <div className="border-b border-[#e5e7eb] bg-[#fafafa] px-4 py-3">
            <div className="text-sm font-semibold text-[#1e3a5f]">Notifications</div>
            <div className="text-xs text-[#64748b]">{activeCount} active alert(s)</div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {recentAlerts.length === 0 ? (
              <div className="px-4 py-6 text-sm text-[#64748b]">No recent alerts.</div>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border-b border-[#f1f5f9] px-4 py-3 last:border-b-0"
                >
                  <div className="text-xs tabular-nums text-[#64748b]">
                    [{formatAlertTime(alert.timestamp)}]
                  </div>
                  <div className="mt-1 text-sm text-[#1f2937]">{alertSummary(alert)}</div>
                  {alert.zone ? (
                    <div className="mt-1 text-[11px] uppercase tracking-wide text-[#94a3b8]">
                      {alert.zone}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
