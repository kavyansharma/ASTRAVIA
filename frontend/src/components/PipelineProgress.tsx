import React from 'react';
import { CheckCircle2, Clock, Activity, Cpu, Layers } from 'lucide-react';
import { DetectionStageLog } from '../types';

interface PipelineProgressProps {
  logs: DetectionStageLog[];
  isLoading: boolean;
}

export const PipelineProgress: React.FC<PipelineProgressProps> = ({ logs, isLoading }) => {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="bg-space-900/80 backdrop-blur-md border border-space-700 rounded-xl p-3 shadow-lg">
      <div className="flex items-center justify-between border-b border-space-800 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyber-cyan animate-pulse" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            AI PROCESSING PIPELINE TELEMETRY
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-cyber-cyan border border-cyber-cyan/30">
          {isLoading ? 'PROCESSING...' : 'PIPELINE COMPLETE (6/6 STAGES)'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {logs.map((log, index) => (
          <div
            key={log.stage_id || index}
            className="flex flex-col p-2 rounded-lg bg-space-950/60 border border-space-800 text-xs font-mono"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] text-cyber-cyan font-bold">STAGE 0{index + 1}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h4 className="text-[11px] font-bold text-slate-200 line-clamp-1 mb-1">
              {log.title}
            </h4>
            <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight flex-1">
              {log.description}
            </p>
            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 mt-1 border-t border-space-800/80">
              <span className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-cyber-cyan" /> {log.duration_ms}ms
              </span>
              <span className="text-emerald-400">OK</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
