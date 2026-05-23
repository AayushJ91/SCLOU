import { EnergySnapshot, ZoneReading } from '../../hooks/useSCLOU';

interface OperationsPanelRefinedProps {
  energy: EnergySnapshot | null;
  zones: ZoneReading[];
}

export function OperationsPanelRefined({ energy, zones }: OperationsPanelRefinedProps) {
  // Calculate environmental metrics from zones
  const avgRainfall = zones.length > 0 
    ? (zones.reduce((sum, z) => sum + (z.rainfall || 0), 0) / zones.length).toFixed(1)
    : '0';
  
  const avgPorePressure = zones.length > 0
    ? (
        zones.reduce(
          (sum, z) => sum + (z.pressure ?? z.pore_pressure ?? 0),
          0,
        ) / zones.length
      ).toFixed(1)
    : '0';
  
  const avgSlopeMovement = zones.length > 0
    ? (zones.reduce((sum, z) => sum + (z.slope_movement || 0), 0) / zones.length).toFixed(2)
    : '0';

  // Determine statuses
  const rainfallStatus = parseFloat(avgRainfall) > 40 ? 'critical' : parseFloat(avgRainfall) > 25 ? 'elevated' : 'nominal';
  const poreStatus = parseFloat(avgPorePressure) > 80 ? 'elevated' : 'nominal';
  
  const metrics = [
    {
      category: 'Environmental Conditions',
      items: [
        { label: 'Rainfall Intensity', value: avgRainfall, unit: 'mm/h', status: rainfallStatus },
        { label: 'Pore Pressure (kPa)', value: avgPorePressure, unit: 'kPa', status: poreStatus },
        { label: 'Slope Displacement', value: avgSlopeMovement, unit: 'mm', status: 'nominal' }
      ]
    },
    {
      category: 'Energy Operations',
      items: [
        { label: 'Solar Generation', value: energy?.solar_output || '0', unit: 'kW', status: 'nominal' },
        { label: 'Wind Generation', value: energy?.wind_output || '0', unit: 'kW', status: 'nominal' },
        { label: 'Grid Integration', value: energy?.grid_status || '0', unit: '%', status: 'nominal' }
      ]
    },
    {
      category: 'Network Status',
      items: [
        { label: 'Active Zones', value: zones.length.toString(), unit: 'zones', status: 'nominal' },
        { label: 'Data Latency', value: '12', unit: 'ms', status: 'nominal' },
        { label: 'Communication', value: '99.8', unit: '%', status: 'nominal' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    if (status === 'critical') return '#dc2626';
    if (status === 'elevated') return '#92400e';
    return '#64748b';
  };

  return (
    <div className="space-y-6">
      {metrics.map((section) => (
        <div key={section.category}>
          <div className="text-xs text-[#64748b] uppercase tracking-wide mb-3">
            {section.category}
          </div>

          <div className="space-y-3">
            {section.items.map((item) => (
              <div key={item.label} className="pb-3 border-b border-[#e5e7eb]">
                <div className="text-xs text-[#64748b] mb-1">{item.label}</div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-lg tabular-nums"
                    style={{ color: getStatusColor(item.status), fontWeight: 600 }}
                  >
                    {item.value}
                  </span>
                  {item.unit && (
                    <span className="text-sm text-[#64748b]">{item.unit}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
