import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Alert } from '../../hooks/useSCLOU';

interface AlertPanelRefinedProps {
  alerts: Alert[];
}

export function AlertPanelRefined({ alerts }: AlertPanelRefinedProps) {
  const getAlertConfig = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CRITICAL':
        return {
          bg: '#fee2e2',
          border: '#fca5a5',
          icon: AlertTriangle,
          iconColor: '#991b1b'
        };
      case 'WARNING':
        return {
          bg: '#fef3c7',
          border: '#fcd34d',
          icon: AlertTriangle,
          iconColor: '#92400e'
        };
      default:
        return {
          bg: '#f0fdf4',
          border: '#86efac',
          icon: CheckCircle,
          iconColor: '#166534'
        };
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    } catch {
      return timestamp;
    }
  };

  // Show latest 10 alerts
  const displayAlerts = alerts.slice(0, 10);

  return (
    <div className="h-full bg-white border-t-2 border-[#e5e7eb] overflow-hidden flex flex-col">
      <div className="px-6 py-4 bg-[#fafafa] border-b border-[#e5e7eb]">
        <div className="text-xs text-[#64748b] uppercase tracking-wide mb-1">
          Operational Events
        </div>
        <div className="text-sm text-[#1e3a5f]" style={{ fontWeight: 600 }}>
          Corridor Status & Advisory Log ({displayAlerts.length} alerts)
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {displayAlerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-xs text-[#64748b]">No alerts at this time</div>
          </div>
        ) : (
          <div className="space-y-3">
            {displayAlerts.map((alert) => {
              const config = getAlertConfig(alert.type);
              const Icon = config.icon;

              return (
                <div
                  key={alert.id}
                  className="border-l-4 pl-4 py-3"
                  style={{ borderColor: config.border, backgroundColor: `${config.bg}20` }}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={16} style={{ color: config.iconColor }} className="mt-0.5 shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs text-[#64748b] tabular-nums">
                          {formatTime(alert.timestamp)}
                        </span>
                        <span className="text-xs" style={{ color: config.iconColor, fontWeight: 500 }}>
                          {alert.zone}
                        </span>
                      </div>

                      <div className="text-sm text-[#1e3a5f] mb-1" style={{ fontWeight: 500 }}>
                        {alert.message}
                      </div>

                      <div className="text-xs text-[#64748b]">
                        Type: <span style={{ fontWeight: 500 }}>{alert.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
