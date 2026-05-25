export function FoSStatusBlock({ zone }: any) {

  // ✅ Dynamic values from backend
  const corridorFoS = zone?.fos || 0;

  const zoneData = {
    zone: zone?.id || "Zone",
    district: zone?.district || "Unknown District",
    km: zone?.km || "N/A",
    fos: zone?.fos || 0,
    status: zone?.status || "Unknown",
    hydrologicalStress:
      zone?.rainfall > 50 ? "High" :
      zone?.rainfall > 30 ? "Moderate" : "Low",
    monitoring: "Active"
  };

  // ✅ Dynamic status logic
  const getStatusIndicator = () => {
    if (corridorFoS >= 1.5) return { color: '#10b981', bg: '#f0fdf4', label: 'Optimal' };
    if (corridorFoS >= 1.4) return { color: '#10b981', bg: '#f0fdf4', label: 'Stable' };
    if (corridorFoS >= 1.3) return { color: '#f59e0b', bg: '#fef3c7', label: 'Monitoring' };
    return { color: '#ef4444', bg: '#fee2e2', label: 'Advisory' };
  };

  const indicator = getStatusIndicator();

  return (
    <div className="bg-white border-2 border-[#e5e7eb] rounded-lg overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 bg-[#fafafa] border-b border-[#e5e7eb]">
        <div className="text-xs text-[#64748b] uppercase tracking-wide mb-1">
          Corridor Stability Status
        </div>
        <div className="text-lg text-[#1e3a5f]" style={{ fontWeight: 600 }}>
          Mumbai-Nagpur Expressway
        </div>
      </div>

      {/* Primary FoS Display */}
      <div className="px-6 py-8 bg-white">
        <div className="flex items-center justify-between mb-6">

          <div>
            <div className="text-xs text-[#64748b] uppercase tracking-wide mb-2">
              Corridor Factor of Safety
            </div>

            <div className="flex items-baseline gap-3">
              <div className="sm:text-3xl md:text-4xl text-5xl text-[#1e3a5f] tabular-nums" style={{ fontWeight: 600 }}>
                {corridorFoS.toFixed(2)}
              </div>
              <div className="text-lg text-[#64748b]">FoS</div>
            </div>
          </div>

          <div
            className="px-4 py-2 rounded-lg border-2"
            style={{
              backgroundColor: indicator.bg,
              borderColor: indicator.color
            }}
          >
            <div className="text-xs text-[#64748b] uppercase tracking-wide mb-1">
              Status
            </div>
            <div className="text-lg" style={{ color: indicator.color, fontWeight: 600 }}>
              {indicator.label}
            </div>
          </div>

        </div>

        {/* Threshold */}
        <div className="flex items-center gap-6 py-4 px-4 bg-[#fafafa] rounded-lg">
          <div className="flex-1">

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#64748b]">Design Threshold</span>
              <span className="text-xs text-[#64748b] tabular-nums">1.50</span>
            </div>

            <div className="h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(corridorFoS / 1.5) * 100}%`,
                  backgroundColor: indicator.color
                }}
              />
            </div>

          </div>
        </div>
      </div>

      {/* Zone Details */}
      <div className="px-6 py-5 bg-[#fffbeb] border-t-2 border-[#fcd34d]">

        <div className="text-xs text-[#92400e] uppercase tracking-wide mb-3" style={{ fontWeight: 600 }}>
          Primary Monitoring Zone
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div>
            <div className="text-xs text-[#64748b] mb-1">Zone</div>
            <div className="text-sm text-[#1e3a5f]" style={{ fontWeight: 600 }}>
              {zoneData.zone}
            </div>
            <div className="text-xs text-[#64748b]">{zoneData.district}</div>
          </div>

          <div>
            <div className="text-xs text-[#64748b] mb-1">Corridor Position</div>
            <div className="text-sm text-[#1e3a5f]" style={{ fontWeight: 600 }}>
              {zoneData.km}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#64748b] mb-1">Local FoS</div>
            <div className="text-sm text-[#1e3a5f]" style={{ fontWeight: 600 }}>
              {zoneData.fos.toFixed(2)}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#64748b] mb-1">Status</div>
            <div className="text-sm text-[#1e3a5f]" style={{ fontWeight: 600 }}>
              {zoneData.status}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#64748b] mb-1">Hydrological Stress</div>
            <div className="text-sm text-[#92400e]" style={{ fontWeight: 600 }}>
              {zoneData.hydrologicalStress}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#64748b] mb-1">Adaptive Monitoring</div>
            <div className="text-sm text-[#1e3a5f]" style={{ fontWeight: 600 }}>
              {zoneData.monitoring}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}