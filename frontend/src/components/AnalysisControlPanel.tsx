import React, { useState } from 'react';
import { 
  Play, Sliders, UploadCloud, RefreshCw, 
  MapPin, CloudRain, Cpu, Info, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import { DisasterScenario, ScanRequest } from '../types';

interface AnalysisControlPanelProps {
  scenarios: DisasterScenario[];
  selectedScenarioId: string;
  onSelectScenario: (scenario: DisasterScenario) => void;
  onRunScan: (request: ScanRequest) => void;
  isLoading: boolean;
  currentHazard: 'flood' | 'wildfire' | 'cyclone';
}

export const AnalysisControlPanel: React.FC<AnalysisControlPanelProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onRunScan,
  isLoading,
  currentHazard
}) => {
  const [ndwiThreshold, setNdwiThreshold] = useState<number>(0.20);
  const [aiSensitivity, setAiSensitivity] = useState<number>(0.85);
  const [useLiveWeather, setUseLiveWeather] = useState<boolean>(true);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customImageName, setCustomImageName] = useState<string>('');

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setCustomImage(null);
    setCustomImageName('');
  };

  const handleInitiateScan = () => {
    const request: ScanRequest = {
      scenario_id: customImage ? undefined : selectedScenario?.id,
      hazard_type: currentHazard,
      center_lat: selectedScenario?.center?.lat,
      center_lng: selectedScenario?.center?.lng,
      bbox: selectedScenario?.bbox,
      ndwi_threshold: ndwiThreshold,
      ai_sensitivity: aiSensitivity,
      use_live_weather: useLiveWeather,
      custom_image_base64: customImage || undefined
    };
    onRunScan(request);
  };

  return (
    <div className="flex flex-col h-full bg-space-900/80 backdrop-blur-md border border-space-700 rounded-xl p-4 shadow-xl overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-space-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyber-blue/20 border border-cyber-cyan/40 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              ANALYSIS DISPATCH
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              TARGET SWATH & SPECTRAL INFERENCE
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-space-700">
          MODE: {currentHazard.toUpperCase()}
        </span>
      </div>

      {/* Scenario Benchmark Selector */}
      <div className="mb-4">
        <label className="block text-xs font-mono text-slate-300 mb-2 font-semibold flex items-center justify-between">
          <span>CURATED DISASTER SCENARIOS</span>
          <span className="text-[10px] text-cyber-cyan">BENCHMARK DATA</span>
        </label>
        
        <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
          {scenarios.map((scenario) => {
            const isSelected = scenario.id === selectedScenarioId && !customImage;
            return (
              <button
                key={scenario.id}
                onClick={() => {
                  handleClearImage();
                  onSelectScenario(scenario);
                }}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-cyber-blue/15 border-cyber-cyan/60 glow-cyan shadow-md'
                    : 'bg-space-950/60 border-space-800 hover:border-space-600 hover:bg-space-800/50'
                }`}
              >
                <img
                  src={scenario.thumbnail_url}
                  alt={scenario.name}
                  className="w-12 h-12 rounded object-cover border border-space-700 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-cyber-cyan' : 'text-slate-200'}`}>
                      {scenario.name}
                    </h3>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-space-800 text-slate-400 border border-space-700 flex-shrink-0">
                      {scenario.country}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                    {scenario.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[9px] font-mono text-slate-400">
                    <span>📅 {scenario.historical_date}</span>
                    <span>•</span>
                    <span className="text-cyber-cyan">🛰️ {scenario.satellite_mission.split(' ')[0]}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Satellite Image Upload */}
      <div className="mb-4">
        <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold flex items-center justify-between">
          <span>CUSTOM SATELLITE RASTER / GEOTIFF</span>
          <span className="text-[10px] text-slate-400">USER INPUT</span>
        </label>

        {customImage ? (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyber-blue/10 border border-cyber-cyan/40">
            <div className="flex items-center gap-2 overflow-hidden">
              <img src={customImage} alt="Custom upload" className="w-8 h-8 rounded object-cover border border-cyber-cyan" />
              <div className="min-w-0">
                <p className="text-xs text-white font-mono truncate font-semibold">{customImageName || 'Uploaded Satellite Imagery'}</p>
                <p className="text-[10px] text-cyber-cyan font-mono">Ready for AI segmentation</p>
              </div>
            </div>
            <button
              onClick={handleClearImage}
              className="p-1 rounded hover:bg-space-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed border-space-700 hover:border-cyber-cyan/50 hover:bg-space-800/40 cursor-pointer transition-all">
            <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
            <span className="text-xs text-slate-300 font-medium">Drop GeoTIFF / Satellite PNG here</span>
            <span className="text-[10px] text-slate-400 font-mono">Supports Sentinel-2 L2A & Landsat bands</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        )}
      </div>

      {/* AI & Spectral Calibration Parameters */}
      <div className="space-y-3 p-3 rounded-lg bg-space-950/70 border border-space-800 mb-4">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyber-cyan">
          <Sliders className="w-3.5 h-3.5" />
          <span>SPECTRAL & AI CALIBRATION</span>
        </div>

        {/* NDWI Threshold Slider */}
        <div>
          <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
            <span>NDWI Water Index Threshold</span>
            <span className="text-cyber-cyan font-bold">{ndwiThreshold.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-0.2"
            max="0.6"
            step="0.02"
            value={ndwiThreshold}
            onChange={(e) => setNdwiThreshold(parseFloat(e.target.value))}
            className="w-full accent-cyber-cyan bg-space-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-0.5">
            <span>-0.20 (Broad Lowlands)</span>
            <span>+0.20 (Standard)</span>
            <span>+0.60 (Open Deep Water)</span>
          </div>
        </div>

        {/* AI Model Sensitivity Slider */}
        <div>
          <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
            <span>AI Segmentation Sensitivity</span>
            <span className="text-cyber-cyan font-bold">{Math.round(aiSensitivity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="1.0"
            step="0.05"
            value={aiSensitivity}
            onChange={(e) => setAiSensitivity(parseFloat(e.target.value))}
            className="w-full accent-cyber-cyan bg-space-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-0.5">
            <span>Conservative (40%)</span>
            <span>Balanced (85%)</span>
            <span>Aggressive (100%)</span>
          </div>
        </div>

        {/* Real Weather Toggle */}
        <label className="flex items-center justify-between text-xs font-mono text-slate-300 cursor-pointer pt-1 border-t border-space-800">
          <span className="flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open-Meteo Live Weather Telemetry</span>
          </span>
          <input
            type="checkbox"
            checked={useLiveWeather}
            onChange={(e) => setUseLiveWeather(e.target.checked)}
            className="rounded bg-space-800 border-space-600 text-emerald-500 focus:ring-0"
          />
        </label>
      </div>

      {/* Mission Execution Action Button */}
      <button
        onClick={handleInitiateScan}
        disabled={isLoading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyber-cyan via-blue-500 to-indigo-600 text-space-950 font-mono font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg glow-cyan hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none mt-auto"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-space-950" />
            <span>RUNNING AI SPECTRAL INFERENCE...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-space-950" />
            <span>INITIATE AI SCAN & RISK ANALYSIS</span>
          </>
        )}
      </button>

    </div>
  );
};
