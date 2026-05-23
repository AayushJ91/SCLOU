import { Activity, Gauge, Battery, Zap, Shield, Cloud, Map, Network } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: Activity, navigable: true },
    { id: 'stability', label: 'Stability Monitoring', icon: Gauge, navigable: true },
    { id: 'energy', label: 'Energy Operations', icon: Battery, navigable: true },
    { id: 'energy-flow', label: 'Energy Flow', icon: Zap, navigable: false },
    { id: 'reinforcement', label: 'Reinforcement Health', icon: Shield, navigable: false },
    { id: 'environmental', label: 'Environmental Systems', icon: Cloud, navigable: false },
    { id: 'corridor-map', label: 'Corridor Map', icon: Map, navigable: false },
    { id: 'nodes', label: 'Node Management', icon: Network, navigable: false },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#e5e7eb] flex flex-col">
      <div className="p-6 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 border-2 border-[#1e3a5f] flex items-center justify-center">
            <Activity size={20} className="text-[#1e3a5f]" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-xl tracking-tight text-[#1e3a5f]" style={{ fontWeight: 600 }}>
              SCLOU
            </div>
          </div>
        </div>
        <div className="text-xs text-[#64748b] leading-relaxed">
          Stability Control & Load Optimization Unit
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.navigable && activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.navigable) onSectionChange(item.id);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md mb-1 transition-colors ${
                isActive
                  ? 'bg-[#f1f5f9] text-[#1e3a5f]'
                  : 'text-[#64748b] hover:bg-[#f8fafc]'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-sm" style={{ fontWeight: isActive ? 500 : 400 }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#e5e7eb]">
        <div className="text-xs text-[#64748b] mb-2">System Version</div>
        <div className="text-sm text-[#1e3a5f]">v2.4.1 (Build 2847)</div>
      </div>
    </aside>
  );
}
