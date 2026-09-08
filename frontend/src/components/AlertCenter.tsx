import React, { useState } from 'react';
import { 
  AlertTriangle, Radio, Send, CheckCircle2, 
  X, ShieldAlert, Bell, MessageSquare
} from 'lucide-react';
import { AlertDispatch, DetectionResult } from '../types';
import { dispatchAlert } from '../services/api';

interface AlertCenterProps {
  isOpen: boolean;
  onClose: () => void;
  detectionResult: DetectionResult | null;
  onAlertDispatched?: (alert: AlertDispatch) => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  isOpen,
  onClose,
  detectionResult,
  onAlertDispatched
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'CIVIL_DEFENSE_SMS' | 'CAP_XML_FEED' | 'WEBHOOK' | 'EMERGENCY_BROADCAST'>('CIVIL_DEFENSE_SMS');
  const [severity, setSeverity] = useState<'ADVISORY' | 'WATCH' | 'WARNING' | 'EMERGENCY_CRITICAL'>('EMERGENCY_CRITICAL');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [dispatchedAlert, setDispatchedAlert] = useState<AlertDispatch | null>(null);

  if (!isOpen) return null;

  const defaultMessage = detectionResult 
    ? `SPACEGUARD FLASH FLOOD WARNING: Imminent inundation detected at ${detectionResult.region_name}. Submerged area: ${detectionResult.risk_assessment.inundated_area_km2} km². Evacuate lowlands immediately.`
    : 'SPACEGUARD EMERGENCY ALERT: Immediate disaster response required.';

  const handleSendAlert = async () => {
    setIsSending(true);
    try {
      const alert = await dispatchAlert({
        severity,
        region_name: detectionResult?.region_name || 'Operational Swath',
        channel: selectedChannel,
        message: customMessage || defaultMessage,
        affected_radius_km: 25.0
      });
      setDispatchedAlert(alert);
      if (onAlertDispatched) onAlertDispatched(alert);
    } catch (err) {
      console.error('Dispatch failed', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-space-900 border border-rose-500/50 rounded-2xl shadow-2xl overflow-hidden glow-rose">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-rose-950/40 border-b border-rose-500/30">
          <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-sm">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
            <span>EARLY WARNING ALERT DISPATCH (CAP PROTOCOL)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 font-mono text-xs">
          
          {dispatchedAlert ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
              <h3 className="text-sm font-bold text-emerald-300">ALERT BROADCAST TRANSMITTED</h3>
              <p className="text-[11px] text-slate-300">Alert ID: <strong className="text-white">{dispatchedAlert.alert_id}</strong></p>
              <p className="text-[10px] text-slate-400">Broadcasted to Civil Defense Authorities via {dispatchedAlert.channel}</p>
              <button
                onClick={() => {
                  setDispatchedAlert(null);
                  onClose();
                }}
                className="mt-3 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                DISMISS
              </button>
            </div>
          ) : (
            <>
              {/* Severity Selection */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">SEVERITY LEVEL</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['EMERGENCY_CRITICAL', 'WARNING', 'WATCH', 'ADVISORY'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSeverity(lvl)}
                      className={`p-2 rounded-lg border transition-all text-left ${
                        severity === lvl 
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold' 
                          : 'bg-space-950 border-space-700 text-slate-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Broadcast Channel */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">TRANSMISSION CHANNEL</label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-space-950 border border-space-700 text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="CIVIL_DEFENSE_SMS">CIVIL DEFENSE CELL BROADCAST (SMS-CB)</option>
                  <option value="CAP_XML_FEED">COMMON ALERTING PROTOCOL (OASIS CAP v1.2)</option>
                  <option value="WEBHOOK">EMERGENCY OPERATIONS CENTER (EOC WEBHOOK)</option>
                  <option value="EMERGENCY_BROADCAST">PUBLIC BROADCAST RADIO / SIREN TRIGGER</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">ALERT DIRECTIVE MESSAGE</label>
                <textarea
                  rows={3}
                  value={customMessage || defaultMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-space-950 border border-space-700 text-slate-200 focus:outline-none focus:border-rose-500 text-xs"
                />
              </div>

              {/* Dispatch Action */}
              <button
                onClick={handleSendAlert}
                disabled={isSending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg glow-rose transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'TRANSMITTING OVER EMERGENCY BAND...' : 'DISPATCH CIVIL DEFENSE BROADCAST'}</span>
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
