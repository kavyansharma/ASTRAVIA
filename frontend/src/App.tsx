import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MapViewer } from './components/MapViewer';
import { AnalysisControlPanel } from './components/AnalysisControlPanel';
import { PipelineProgress } from './components/PipelineProgress';
import { RiskMetricsPanel } from './components/RiskMetricsPanel';
import { InfrastructureList } from './components/InfrastructureList';
import { AlertCenter } from './components/AlertCenter';
import { SitrepReportModal } from './components/SitrepReportModal';
import { 
  DisasterScenario, DetectionResult, ScanRequest, 
  InfrastructureAsset, AlertDispatch 
} from './types';
import { fetchScenarios, executeScan } from './services/api';
import { AlertTriangle, Satellite, Radio, CheckCircle2 } from 'lucide-react';

export function App() {
  const [scenarios, setScenarios] = useState<DisasterScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('brazil_porto_alegre_2024');
  const [currentHazard, setCurrentHazard] = useState<'flood' | 'wildfire' | 'cyclone'>('flood');
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<InfrastructureAsset | null>(null);
  const [isSitrepOpen, setIsSitrepOpen] = useState<boolean>(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show Toast Notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load scenarios on mount and trigger initial scan
  useEffect(() => {
    fetchScenarios().then((data) => {
      setScenarios(data);
      if (data.length > 0) {
        const initialScenario = data[0];
        setSelectedScenarioId(initialScenario.id);
        handleRunScan({
          scenario_id: initialScenario.id,
          hazard_type: 'flood',
          ndwi_threshold: 0.20,
          ai_sensitivity: 0.85,
          use_live_weather: true
        });
      }
    });
  }, []);

  const handleRunScan = async (request: ScanRequest) => {
    setIsLoading(true);
    showToast(`Initiating ${request.hazard_type.toUpperCase()} spectral scan & AI inference...`);
    try {
      const result = await executeScan(request);
      setDetectionResult(result);
      showToast(`Scan complete: ${result.risk_assessment.inundated_area_km2} km² hazard zone detected.`);
    } catch (err) {
      console.error(err);
      showToast('Error during satellite analysis. Loaded fallback telemetry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectScenario = (scenario: DisasterScenario) => {
    setSelectedScenarioId(scenario.id);
    handleRunScan({
      scenario_id: scenario.id,
      hazard_type: currentHazard,
      ndwi_threshold: 0.20,
      ai_sensitivity: 0.85,
      use_live_weather: true
    });
  };

  const handleSelectHazard = (hazard: 'flood' | 'wildfire' | 'cyclone') => {
    setCurrentHazard(hazard);
    handleRunScan({
      scenario_id: selectedScenarioId,
      hazard_type: hazard,
      ndwi_threshold: 0.20,
      ai_sensitivity: 0.85,
      use_live_weather: true
    });
  };

  const handleExportGeoJSON = () => {
    if (!detectionResult?.flood_polygons) return;
    const jsonStr = JSON.stringify(detectionResult.flood_polygons, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SPACEGUARD_HAZARD_EXTENT_${detectionResult.scan_id}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported GeoJSON flood extent vector polygons.');
  };

  const handleAlertDispatched = (alert: AlertDispatch) => {
    showToast(`CIVIL DEFENSE ALERT BROADCAST TRANSMITTED: ${alert.alert_id}`);
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Mission Navbar */}
      <Navbar
        currentHazard={currentHazard}
        onSelectHazard={handleSelectHazard}
        detectionResult={detectionResult}
        onOpenSitrep={() => setIsSitrepOpen(true)}
        onOpenAlertModal={() => setIsAlertOpen(true)}
        onExportGeoJSON={handleExportGeoJSON}
      />

      {/* Main Operational Command Center Layout */}
      <main className="flex-1 p-3 lg:p-4 max-w-[1920px] w-full mx-auto flex flex-col gap-4">
        
        {/* Real-Time Processing Pipeline Telemetry (Collapsible / Active) */}
        {detectionResult && (
          <PipelineProgress
            logs={detectionResult.processing_pipeline_logs}
            isLoading={isLoading}
          />
        )}

        {/* Primary Command Center View: Left Control/Inventory, Center/Right Interactive Map, Bottom Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          
          {/* Left Column: Analysis Dispatch & Infrastructure Inventory */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
            <div className="h-[480px]">
              <AnalysisControlPanel
                scenarios={scenarios}
                selectedScenarioId={selectedScenarioId}
                onSelectScenario={handleSelectScenario}
                onRunScan={handleRunScan}
                isLoading={isLoading}
                currentHazard={currentHazard}
              />
            </div>

            <div className="flex-1 min-h-[340px]">
              <InfrastructureList
                assets={detectionResult?.risk_assessment?.vulnerable_assets || []}
                selectedAsset={selectedAsset}
                onSelectAsset={setSelectedAsset}
              />
            </div>
          </div>

          {/* Center & Right Column: Interactive Map Command Center & Tactical HUD */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
            
            {/* Interactive Leaflet Map Viewer */}
            <div className="h-[520px] xl:h-[580px] w-full">
              <MapViewer
                detectionResult={detectionResult}
                selectedAsset={selectedAsset}
                onSelectAsset={setSelectedAsset}
                onMapClickCoordinates={(lat, lng) => {
                  showToast(`Target coordinate locked: ${lat}°N, ${lng}°E`);
                }}
              />
            </div>

            {/* Tactical Risk Assessment & Impact Metrics Panel */}
            <div className="flex-1">
              <RiskMetricsPanel
                risk={detectionResult?.risk_assessment || null}
                weather={detectionResult?.weather_telemetry}
              />
            </div>

          </div>

        </div>

      </main>

      {/* Floating System Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-space-900 border border-cyber-cyan/60 text-slate-100 font-mono text-xs shadow-2xl glow-cyan animate-bounce">
          <Satellite className="w-4 h-4 text-cyber-cyan animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Situation Report Modal */}
      <SitrepReportModal
        isOpen={isSitrepOpen}
        onClose={() => setIsSitrepOpen(false)}
        detectionResult={detectionResult}
      />

      {/* Alert Dispatch Center Modal */}
      <AlertCenter
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        detectionResult={detectionResult}
        onAlertDispatched={handleAlertDispatched}
      />

    </div>
  );
}
export default App;
