import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Copy, Check, X, Printer, ShieldCheck
} from 'lucide-react';
import { DetectionResult } from '../types';
import { generateSitrepText } from '../services/api';

interface SitrepReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectionResult: DetectionResult | null;
}

export const SitrepReportModal: React.FC<SitrepReportModalProps> = ({
  isOpen,
  onClose,
  detectionResult
}) => {
  const [reportText, setReportText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !detectionResult) return;
    setIsLoading(true);
    generateSitrepText(detectionResult)
      .then((text) => setReportText(text))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [isOpen, detectionResult]);

  if (!isOpen || !detectionResult) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SPACEGUARD_SITREP_${detectionResult.scan_id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-space-900 border border-cyber-cyan/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden glow-cyan">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-space-950 border-b border-space-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyber-cyan" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                DISASTER SITUATION REPORT (SITREP)
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                MISSION ID: {detectionResult.scan_id} • AUTONOMOUS SATELLITE BRIEF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 border border-space-700 text-xs font-mono"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyber-cyan" />}
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 border border-space-700 text-xs font-mono"
              title="Download Markdown brief"
            >
              <Download className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>EXPORT .MD</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-300 border border-space-700"
              title="Print Brief"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-slate-300 space-y-4 bg-space-950/60 leading-relaxed select-text">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 animate-pulse">
              GENERATING EXECUTIVE DISASTER BRIEF...
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-slate-200 text-xs leading-relaxed bg-space-900/90 p-4 rounded-xl border border-space-800">
              {reportText}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-space-950 border-t border-space-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED BY SPACEGUARD EARTH OBSERVATION PIPELINE
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyber-blue/20 hover:bg-cyber-blue/30 text-cyber-cyan border border-cyber-cyan/40 font-bold"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};
