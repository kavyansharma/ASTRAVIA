import React from 'react';
import { 
  AlertTriangle, Users, DollarSign, Building2, 
  Waves, CloudRain, ShieldAlert, TrendingUp, Droplets, Wind
} from 'lucide-react';
import { RiskAssessment, WeatherTelemetry } from '../types';

interface RiskMetricsPanelProps {
  risk: RiskAssessment | null;
  weather?: WeatherTelemetry;
}

export const RiskMetricsPanel: React.FC<RiskMetricsPanelProps> = ({ risk, weather }) => {
  if (!risk) {
    return (
      <div className="bg-space-900/80 backdrop-blur-md border border-space-700 rounded-xl p-6 text-center text-slate-400 font-mono text-xs">
        SELECT A REGION AND RUN AI INFERENCE TO DISPLAY RISK METRICS
      </div>
    );
  }

  const severityColor = 
    risk.severity_level === 'EMERGENCY_CRITICAL' ? 'text-rose-400 border-rose-500/40 bg-rose-500/10' :
    risk.severity_level === 'WARNING' ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' :
    'text-cyber-cyan border-cyber-cyan/40 bg-cyber-blue/10';

  return (
    <div className="flex flex-col gap-3">
      
      {/* Top Threat Banner */}
      <div className={`flex items-center justify-between p-3 rounded-xl border ${severityColor}`}>
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 animate-bounce" />
          <div>
            <div className="text-xs font-mono font-bold tracking-wider">
              HAZARD SEVERITY LEVEL: {risk.severity_level}
            </div>
            <div className="text-[10px] opacity-80 font-mono">
              EVACUATION URGENCY RATING: {risk.evacuation_urgency_index}/100
            </div>
          </div>
        </div>

        {/* Urgency Meter Bar */}
        <div className="w-32 hidden sm:block">
          <div className="flex justify-between text-[9px] font-mono mb-1">
            <span>URGENCY</span>
            <span>{risk.evacuation_urgency_index}%</span>
          </div>
          <div className="w-full bg-space-950 h-2 rounded-full overflow-hidden border border-space-700">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-1000"
              style={{ width: `${risk.evacuation_urgency_index}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4-Card Primary Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Submerged Area */}
        <div className="p-3 rounded-xl bg-space-900/80 border border-space-700 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>INUNDATED AREA</span>
            <Waves className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {risk.inundated_area_km2.toLocaleString()} <span className="text-xs font-normal text-slate-400">km²</span>
          </div>
          <div className="text-[10px] font-mono text-cyber-cyan mt-1 flex items-center gap-1">
            <span>{risk.inundation_percentage}% of swath submerged</span>
          </div>
        </div>

        {/* Population at Risk */}
        <div className="p-3 rounded-xl bg-space-900/80 border border-space-700 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>POPULATION EXPOSED</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {risk.estimated_affected_population.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-rose-400 mt-1 flex items-center gap-1">
            <span>{risk.population_in_critical_zone.toLocaleString()} in red zone</span>
          </div>
        </div>

        {/* Economic Loss Estimate */}
        <div className="p-3 rounded-xl bg-space-900/80 border border-space-700 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>EST. DIRECT DAMAGE</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            ${(risk.estimated_economic_loss_usd / 1000000).toFixed(1)} <span className="text-xs font-normal text-slate-400">M USD</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Infrastructure & Cropland loss
          </div>
        </div>

        {/* Critical Infrastructure Tally */}
        <div className="p-3 rounded-xl bg-space-900/80 border border-space-700 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
            <span>CRITICAL ASSETS HIT</span>
            <Building2 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {risk.infrastructure_summary.hospitals_at_risk + risk.infrastructure_summary.power_substations_threatened + risk.infrastructure_summary.bridges_inundated} <span className="text-xs font-normal text-slate-400">sites</span>
          </div>
          <div className="text-[10px] font-mono text-amber-300 mt-1">
            {risk.infrastructure_summary.hospitals_at_risk} Hosp • {risk.infrastructure_summary.power_substations_threatened} Power • {risk.infrastructure_summary.bridges_inundated} Bridges
          </div>
        </div>

      </div>

      {/* Live Atmospheric Telemetry Bar (Open-Meteo Integration) */}
      {weather && (
        <div className="p-3 rounded-xl bg-space-950/80 border border-space-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-200 font-bold flex items-center gap-1.5">
                <span>ATMOSPHERIC GROUND TRUTH</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                  {weather.data_source}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Live Open-Meteo satellite-calibrated precipitation feed
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
            <div>
              <div className="text-slate-400 text-[10px]">CURRENT RAIN</div>
              <div className="font-bold text-cyber-cyan">{weather.precipitation_mm_hr} mm/hr</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">PAST 24H ACCUM</div>
              <div className="font-bold text-white">{weather.past_24h_precipitation_mm} mm</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">SOIL SATURATION</div>
              <div className="font-bold text-amber-400">{weather.soil_moisture_percentage}%</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">WEATHER RISK</div>
              <div className="font-bold text-rose-400">{weather.flood_weather_risk_score}/100</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
