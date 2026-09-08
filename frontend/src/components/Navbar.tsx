import React, { useState, useEffect } from 'react';
import { 
  Satellite, Radio, AlertTriangle, ShieldCheck, 
  FileText, Download, Activity, Globe, Flame, Waves, Wind
} from 'lucide-react';
import { DetectionResult } from '../types';
import { checkBackendHealth } from '../services/api';

interface NavbarProps {
  currentHazard: 'flood' | 'wildfire' | 'cyclone';
  onSelectHazard: (hazard: 'flood' | 'wildfire' | 'cyclone') => void;
  detectionResult: DetectionResult | null;
  onOpenSitrep: () => void;
  onOpenAlertModal: () => void;
  onExportGeoJSON: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentHazard,
  onSelectHazard,
  detectionResult,
  onOpenSitrep,
  onOpenAlertModal,
  onExportGeoJSON
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkBackendHealth().then((res) => setIsBackendConnected(res.online));
  }, []);

  const isLive = detectionResult?.weather_telemetry?.is_live_feed ?? true;
  const isSimulatedAI = detectionResult?.is_simulated_ai ?? false;

  return (
    <header className="sticky top-0 z-50 bg-space-900/90 backdrop-blur-md border-b border-space-700/80 px-4 py-2.5">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Mission Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyber-blue/10 border border-cyber-cyan/40 glow-cyan">
            <Satellite className="w-5 h-5 text-cyber-cyan animate-pulse-slow" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyber-cyan"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider text-white font-mono flex items-center gap-1.5">
                SPACE<span className="text-cyber-cyan">GUARD</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-space-800 text-cyber-cyan border border-cyber-cyan/30 font-semibold tracking-widest">
                DEFENSE-EO v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span className="text-emerald-400 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> SATELLITE UPLINK ACTIVE
              </span>
              <span>•</span>
              <span className="text-slate-400">{utcTime || 'SYNCHRONIZING...'}</span>
            </p>
          </div>
        </div>

        {/* Hazard Module Tabs (Modular Multi-Disaster Extensibility) */}
        <div className="flex items-center bg-space-950/80 p-1 rounded-lg border border-space-700">
          <button
            onClick={() => onSelectHazard('flood')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
              currentHazard === 'flood'
                ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-space-800'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>FLOOD DETECTION</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">LIVE</span>
          </button>

          <button
            onClick={() => onSelectHazard('wildfire')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
              currentHazard === 'wildfire'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-space-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>WILDFIRE</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-space-800 text-slate-400 font-mono">MODULAR</span>
          </button>

          <button
            onClick={() => onSelectHazard('cyclone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
              currentHazard === 'cyclone'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-space-800'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>CYCLONE</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-space-800 text-slate-400 font-mono">MODULAR</span>
          </button>
        </div>

        {/* Data Source & Operational Badges */}
        <div className="flex items-center gap-2">
          {/* Backend Connection Status Badge */}
          <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono ${
            isBackendConnected === true
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              : isBackendConnected === false
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              : 'bg-space-800/90 text-slate-400 border-space-700'
          }`} title={isBackendConnected ? 'FastAPI Backend Online' : 'FastAPI Offline - Standalone Mode Active'}>
            <Activity className="w-3.5 h-3.5" />
            <span>{isBackendConnected === true ? 'BACKEND CONNECTED' : isBackendConnected === false ? 'STANDALONE MODE' : 'CHECKING API...'}</span>
          </div>

          {/* Real Weather Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-space-800/90 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>OPEN-METEO REAL WEATHER</span>
          </div>

          {/* AI Simulation / Real Satellite Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono ${
            isSimulatedAI 
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
              : 'bg-cyber-blue/10 border-cyber-cyan/40 text-cyber-cyan'
          }`}>
            {isSimulatedAI ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>{isSimulatedAI ? 'AI BENCHMARK SIMULATION' : 'SENTINEL-2 L2A MULTI-SPECTRAL'}</span>
          </div>

          {/* Action Buttons */}
          <button
            onClick={onOpenSitrep}
            disabled={!detectionResult}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 border border-space-600 text-xs font-mono transition-all hover:border-cyber-cyan/50 disabled:opacity-40 disabled:pointer-events-none"
            title="Generate Disaster Situation Brief (SITREP)"
          >
            <FileText className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>SITREP BRIEF</span>
          </button>

          <button
            onClick={onOpenAlertModal}
            disabled={!detectionResult}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white font-mono text-xs font-semibold shadow-md transition-all glow-rose disabled:opacity-40 disabled:pointer-events-none"
          >
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
            <span>DISPATCH ALERT</span>
          </button>

          <button
            onClick={onExportGeoJSON}
            disabled={!detectionResult}
            className="p-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-300 border border-space-600 transition-all hover:text-white disabled:opacity-40 disabled:pointer-events-none"
            title="Export Flood Polygons as GeoJSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
