import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

export function AlertPanel() {
  const alerts = [
    {
      id: 1,
      time: '14:23:18',
      type: 'advisory',
      zone: 'Zone 4',
      message: 'Rainfall escalation detected in Zone 4',
      description: 'Monitoring systems activated for enhanced data collection'
    },
    {
      id: 2,
      time: '14:21:45',
      type: 'warning',
      zone: 'Zone 4',
      message: 'FoS reduced from 1.52 to 1.34',
      description: 'Adaptive stabilization protocol evaluation in progress'
    },
    {
      id: 3,
      time: '14:18:32',
      type: 'info',
      zone: 'All Zones',
      message: 'Renewable operational load optimized',
      description: 'Energy routing balanced across solar and wind generation'
    },
    {
      id: 4,
      time: '14:15:09',
      type: 'advisory',
      zone: 'Zone 3-4',
      message: 'Inspection advisory issued',
      description: 'Routine geotechnical assessment scheduled for next cycle'
    },
    {
      id: 5,
      time: '14:12:54',
      type: 'info',
      zone: 'System',
      message: 'Node communication health verified',
      description: '247 monitoring nodes operational, network latency nominal'
    }
  ];

  const getAlertConfig = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          bg: '#fee2e2',
          border: '#fca5a5',
          icon: AlertTriangle,
          iconColor: '#991b1b'
        };
      case 'advisory':
        return {
          bg: '#fef3c7',
          border: '#fcd34d',
          icon: Info,
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

  return (
    <div className="h-full bg-white border-t border-[#e5e7eb] p-6 overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-sm text-[#1e3a5f] mb-1" style={{ fontWeight: 600 }}>
          Operational Events & Advisories
        </h3>
        <div className="text-xs text-[#64748b]">
          Real-time corridor status updates and system notifications
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = getAlertConfig(alert.type);
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className="border rounded-lg p-4"
              style={{
                backgroundColor: config.bg,
                borderColor: config.border
              }}
            >
              <div className="flex items-start gap-3">
                <Icon size={16} style={{ color: config.iconColor }} className="mt-0.5 shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[#64748b] tabular-nums">{alert.time}</span>
                    <span className="text-xs text-[#64748b]">•</span>
                    <span className="text-xs" style={{ color: config.iconColor, fontWeight: 500 }}>
                      {alert.zone}
                    </span>
                  </div>

                  <div className="text-sm text-[#1e3a5f] mb-1" style={{ fontWeight: 500 }}>
                    {alert.message}
                  </div>

                  <div className="text-xs text-[#64748b]">
                    {alert.description}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
