import { CloudRain, Check } from 'lucide-react';
import type { Alert } from '../../hooks/useSCLOU';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  alerts: Alert[];
}

export function Header({ alerts }: HeaderProps) {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="h-20 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-8">
      <div>
        <h1 className="text-2xl text-[#1e3a5f] tracking-tight mb-1" style={{ fontWeight: 600 }}>
          Adaptive Corridor Intelligence Platform
        </h1>
        <div className="text-sm text-[#64748b]">
          Mumbai-Nagpur Expressway Corridor Management System
        </div>
      </div>

      <div className="flex items-center gap-6">
        <NotificationCenter alerts={alerts} />

        <div className="flex items-center gap-2 px-4 py-2 bg-[#f0fdf4] border border-[#86efac] rounded">
          <div className="w-2 h-2 rounded-full bg-[#10b981]" />
          <span className="text-sm text-[#166534]" style={{ fontWeight: 500 }}>
            OPERATIONAL
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#64748b]">
          <CloudRain size={16} />
          <span className="text-sm">23°C, Clear</span>
        </div>

        <div className="text-right">
          <div className="text-sm text-[#1e3a5f] tabular-nums" style={{ fontWeight: 500 }}>
            {currentTime}
          </div>
          <div className="text-xs text-[#64748b]">{currentDate}</div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-[#f8fafc] border border-[#e5e7eb] rounded">
          <Check size={14} className="text-[#10b981]" />
          <span className="text-xs text-[#64748b]">247 Nodes Active</span>
        </div>
      </div>
    </header>
  );
}
