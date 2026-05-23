import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useSCLOU, type ZoneReading } from "../hooks/useSCLOU";
import {
  CorridorOverviewSection,
  EnergyOperationsSection,
  StabilityMonitoringSection,
} from './components/SCLOUSections';

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [zoneHistory, setZoneHistory] = useState<ZoneReading[][]>([]);

  const { zones, energy, alerts, isLoading, error } = useSCLOU();

  useEffect(() => {
    if (!zones.length) return;
    setZoneHistory((previous) => [...previous, zones].slice(-12));
  }, [zones]);

  if (isLoading && !zones.length) {
    return <div className="p-10 text-gray-500">Loading SCLOU System...</div>;
  }

  return (
    <div className="flex size-full overflow-hidden bg-[#f8f9fa] text-[#1f2937]">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header alerts={alerts} />

        <div
          className={`flex-1 min-h-0 p-6 ${
            activeSection === 'overview' ? 'overflow-hidden' : 'overflow-auto'
          }`}
        >
          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Backend connection issue: {error}
            </div>
          ) : null}

          {activeSection === 'overview' ? (
            <div className="h-full min-h-0">
              <CorridorOverviewSection zones={zones} energy={energy} alerts={alerts} zoneHistory={zoneHistory} />
            </div>
          ) : null}

          {activeSection === 'stability' ? (
            <StabilityMonitoringSection zones={zones} energy={energy} alerts={alerts} zoneHistory={zoneHistory} />
          ) : null}

          {activeSection === 'energy' ? (
            <EnergyOperationsSection zones={zones} energy={energy} alerts={alerts} zoneHistory={zoneHistory} />
          ) : null}
        </div>
      </div>
    </div>
  );
}