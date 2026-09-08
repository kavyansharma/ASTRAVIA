import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, Eye, EyeOff, Shield, Activity, 
  MapPin, Compass, Sliders, Maximize2, Zap, AlertCircle
} from 'lucide-react';
import { DetectionResult, InfrastructureAsset, FloodPolygonFeature } from '../types';

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewerProps {
  detectionResult: DetectionResult | null;
  onMapClickCoordinates?: (lat: number, lng: number) => void;
  selectedAsset: InfrastructureAsset | null;
  onSelectAsset: (asset: InfrastructureAsset | null) => void;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  detectionResult,
  onMapClickCoordinates,
  selectedAsset,
  onSelectAsset
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Layers state
  const [showFloodPolygons, setShowFloodPolygons] = useState(true);
  const [showInfrastructure, setShowInfrastructure] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [activeBasemap, setActiveBasemap] = useState<'satellite' | 'dark' | 'topo'>('satellite');
  const [polygonOpacity, setPolygonOpacity] = useState(0.65);
  
  // Swipe / Split Screen Comparison Mode
  const [isSwipeMode, setIsSwipeMode] = useState(false);
  const [swipePosition, setSwipePosition] = useState(50); // percentage

  // Cursor coordinates
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Layer groups
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayerRef = useRef<L.GeoJSON | null>(null);
  const infraMarkerGroupRef = useRef<L.LayerGroup | null>(null);
  const shelterMarkerGroupRef = useRef<L.LayerGroup | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Basemap URLs
  const basemapUrls = {
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialLat = detectionResult?.center?.lat ?? 39.4699;
    const initialLng = detectionResult?.center?.lng ?? -0.3763;
    const initialZoom = detectionResult?.zoom_level ?? 12;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    tileLayerRef.current = L.tileLayer(basemapUrls[activeBasemap], {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    infraMarkerGroupRef.current = L.layerGroup().addTo(map);
    shelterMarkerGroupRef.current = L.layerGroup().addTo(map);
    routesLayerGroupRef.current = L.layerGroup().addTo(map);

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setMouseCoords({ lat: Number(e.latlng.lat.toFixed(5)), lng: Number(e.latlng.lng.toFixed(5)) });
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClickCoordinates) {
        onMapClickCoordinates(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Basemap when changed
  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }
    tileLayerRef.current = L.tileLayer(basemapUrls[activeBasemap], {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(mapRef.current);
  }, [activeBasemap]);

  // Update Map Center and Layers when Detection Result Changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !detectionResult) return;

    // Fly to new center
    map.flyTo([detectionResult.center.lat, detectionResult.center.lng], detectionResult.zoom_level, {
      duration: 1.5
    });

    // 1. Update Flood Polygons
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    if (showFloodPolygons && detectionResult.flood_polygons) {
      const geoLayer = L.geoJSON(detectionResult.flood_polygons as any, {
        style: (feature: any) => {
          const props = feature.properties || {};
          return {
            color: props.color || '#00F0FF',
            weight: 2,
            opacity: 0.9,
            fillColor: props.color || '#00F0FF',
            fillOpacity: (props.fill_opacity || 0.6) * polygonOpacity
          };
        },
        onEachFeature: (feature: any, layer: L.Layer) => {
          const p = feature.properties || {};
          layer.bindPopup(`
            <div class="p-2 text-slate-100 font-sans">
              <div class="flex items-center gap-1.5 mb-1">
                <span class="w-2.5 h-2.5 rounded-full" style="background:${p.color}"></span>
                <strong class="font-mono text-xs uppercase text-cyber-cyan">${p.zone_type || 'Flood Inundation Zone'}</strong>
              </div>
              <div class="text-xs space-y-1 mt-1 text-slate-300">
                <div><strong>Severity:</strong> <span class="text-rose-400 font-semibold">${p.severity || 'HIGH'}</span></div>
                ${p.depth_range_meters ? `<div><strong>Estimated Depth:</strong> ${p.depth_range_meters}</div>` : ''}
                ${p.water_velocity_ms ? `<div><strong>Flow Velocity:</strong> ${p.water_velocity_ms} m/s</div>` : ''}
                ${p.ndwi_mean ? `<div><strong>NDWI Mean Spectral Index:</strong> ${p.ndwi_mean}</div>` : ''}
              </div>
            </div>
          `);
        }
      });

      geoLayer.addTo(map);
      polygonLayerRef.current = geoLayer;
    }

    // 2. Update Infrastructure Markers
    if (infraMarkerGroupRef.current) {
      infraMarkerGroupRef.current.clearLayers();

      if (showInfrastructure && detectionResult.risk_assessment.vulnerable_assets) {
        detectionResult.risk_assessment.vulnerable_assets.forEach((asset) => {
          const iconColor = asset.status === 'inundated' 
            ? '#F43F5E' 
            : asset.status === 'vulnerable' 
              ? '#F59E0B' 
              : '#10B981';

          const iconHtml = `
            <div style="
              background: ${iconColor};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 10px ${iconColor};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              color: white;
              font-weight: bold;
              cursor: pointer;
            ">
              ${asset.type === 'hospital' ? '🏥' : asset.type === 'power_substation' ? '⚡' : asset.type === 'bridge' ? '🌉' : '🏢'}
            </div>
          `;

          const customIcon = L.divIcon({
            className: 'custom-infra-marker',
            html: iconHtml,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([asset.lat, asset.lng], { icon: customIcon });
          marker.bindPopup(`
            <div class="p-2 text-slate-100 font-sans min-w-[200px]">
              <div class="text-[10px] font-mono tracking-widest text-slate-400 uppercase">${asset.type.replace('_', ' ')}</div>
              <h4 class="font-bold text-sm text-white mb-1">${asset.name}</h4>
              <div class="text-xs space-y-1 text-slate-300">
                <div>Status: <span class="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold" style="background:${iconColor}33; color:${iconColor}">${asset.status}</span></div>
                <div>Elevation: <strong>${asset.elevation_meters}m</strong></div>
                <div>Capacity / Pop: <strong>${asset.capacity_or_population.toLocaleString()}</strong></div>
                <div>Est. Damage: <strong class="text-rose-400">$${(asset.damage_estimate_usd / 1000000).toFixed(2)}M USD</strong></div>
              </div>
            </div>
          `);

          marker.on('click', () => {
            onSelectAsset(asset);
          });

          infraMarkerGroupRef.current?.addLayer(marker);
        });
      }
    }

    // 3. Update Shelters & Evacuation Routes
    if (shelterMarkerGroupRef.current) {
      shelterMarkerGroupRef.current.clearLayers();

      if (showShelters && detectionResult.risk_assessment.recommended_shelters) {
        detectionResult.risk_assessment.recommended_shelters.forEach((shelter, idx) => {
          const shelterLat = detectionResult.center.lat + (idx === 0 ? 0.045 : idx === 1 ? -0.040 : 0.030);
          const shelterLng = detectionResult.center.lng + (idx === 0 ? -0.015 : idx === 1 ? -0.035 : 0.040);

          const shelterIcon = L.divIcon({
            className: 'shelter-marker',
            html: `
              <div style="
                background: #10B981;
                width: 26px;
                height: 26px;
                border-radius: 6px;
                border: 2px solid white;
                box-shadow: 0 0 12px #10B981;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
                color: white;
              ">🛡️</div>
            `,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });

          const shelterMarker = L.marker([shelterLat, shelterLng], { icon: shelterIcon });
          shelterMarker.bindPopup(`
            <div class="p-2 text-slate-100 font-sans">
              <span class="text-[10px] font-mono text-emerald-400 font-bold uppercase">SAFE HIGH-GROUND SHELTER</span>
              <h4 class="font-bold text-sm text-white">${shelter.name}</h4>
              <div class="text-xs space-y-1 mt-1 text-slate-300">
                <div>Capacity: <strong>${shelter.capacity.toLocaleString()} persons</strong></div>
                <div>Occupancy: <strong>${shelter.occupancy_current}</strong></div>
                <div>Status: <span class="text-emerald-400 font-semibold">${shelter.status}</span></div>
                <div>Elevation: <strong>${shelter.elevation}</strong></div>
              </div>
            </div>
          `);
          shelterMarkerGroupRef.current?.addLayer(shelterMarker);
        });
      }
    }

    // 4. Update Evacuation Routes Polylines
    if (routesLayerGroupRef.current) {
      routesLayerGroupRef.current.clearLayers();

      if (showRoutes && detectionResult.risk_assessment.evacuation_routes_status) {
        // Safe route corridor north
        const safeCoords: [number, number][] = [
          [detectionResult.center.lat - 0.01, detectionResult.center.lng],
          [detectionResult.center.lat + 0.02, detectionResult.center.lng + 0.01],
          [detectionResult.center.lat + 0.05, detectionResult.center.lng + 0.02]
        ];
        const safePolyline = L.polyline(safeCoords, {
          color: '#10B981',
          weight: 4,
          dashArray: '6, 8',
          opacity: 0.85
        }).bindPopup('<div class="p-1 font-mono text-xs text-emerald-400 font-bold">PRIMARY EVACUATION ARTERIAL (OPEN)</div>');

        // Blocked route corridor
        const blockedCoords: [number, number][] = [
          [detectionResult.center.lat - 0.02, detectionResult.center.lng - 0.03],
          [detectionResult.center.lat, detectionResult.center.lng - 0.01],
          [detectionResult.center.lat + 0.02, detectionResult.center.lng + 0.01]
        ];
        const blockedPolyline = L.polyline(blockedCoords, {
          color: '#F43F5E',
          weight: 4,
          dashArray: '4, 6',
          opacity: 0.85
        }).bindPopup('<div class="p-1 font-mono text-xs text-rose-400 font-bold">CRITICAL: ROUTE BLOCKED BY WATER</div>');

        routesLayerGroupRef.current.addLayer(safePolyline);
        routesLayerGroupRef.current.addLayer(blockedPolyline);
      }
    }

  }, [detectionResult, showFloodPolygons, showInfrastructure, showShelters, showRoutes, polygonOpacity]);

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col rounded-xl overflow-hidden border border-space-700 bg-space-950 shadow-2xl">
      
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

      {/* Swipe Comparison Overlay (Split Screen: Baseline Optical vs Flood Segmentation) */}
      {isSwipeMode && detectionResult && (
        <div className="absolute inset-0 pointer-events-none z-10 flex">
          {/* Left Side: Before Imagery */}
          <div 
            className="h-full overflow-hidden border-r-2 border-cyber-cyan relative"
            style={{ width: `${swipePosition}%` }}
          >
            <img 
              src={detectionResult.before_imagery_url} 
              alt="Pre-Disaster Baseline" 
              className="absolute inset-0 w-full h-full object-cover filter contrast-125 brightness-90"
            />
            <div className="absolute top-4 left-4 bg-space-900/85 backdrop-blur-md px-3 py-1 rounded border border-space-600 text-xs font-mono text-slate-200">
              PRE-DISASTER SATELLITE BASELINE
            </div>
          </div>

          {/* Right Side: Post-Disaster AI Detection */}
          <div 
            className="h-full overflow-hidden relative"
            style={{ width: `${100 - swipePosition}%` }}
          >
            <img 
              src={detectionResult.after_imagery_url} 
              alt="Post-Flood Satellite AI Detection" 
              className="absolute inset-0 w-full h-full object-cover filter contrast-110 saturate-150"
            />
            <div className="absolute top-4 right-4 bg-space-900/85 backdrop-blur-md px-3 py-1 rounded border border-cyber-cyan/50 text-xs font-mono text-cyber-cyan font-bold glow-cyan">
              POST-DISASTER AI INUNDATION MASK
            </div>
          </div>

          {/* Draggable Divider Handle */}
          <div 
            className="absolute top-0 bottom-0 pointer-events-auto cursor-ew-resize flex items-center justify-center -ml-4 w-8 z-30"
            style={{ left: `${swipePosition}%` }}
            onMouseDown={(e) => {
              const handleMouseMove = (moveEvent: MouseEvent) => {
                if (!mapContainerRef.current) return;
                const rect = mapContainerRef.current.getBoundingClientRect();
                const newPos = Math.max(5, Math.min(95, ((moveEvent.clientX - rect.left) / rect.width) * 100));
                setSwipePosition(newPos);
              };
              const handleMouseUp = () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
              };
              window.addEventListener('mousemove', handleMouseMove);
              window.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className="w-8 h-8 rounded-full bg-cyber-cyan text-space-950 flex items-center justify-center font-bold shadow-lg glow-cyan text-xs">
              ↔
            </div>
          </div>
        </div>
      )}

      {/* Floating Tactical HUD Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        
        {/* Basemap & Swipe Controls */}
        <div className="bg-space-900/90 backdrop-blur-md border border-space-700/80 rounded-lg p-2.5 shadow-xl flex flex-col gap-2 text-xs font-mono">
          
          <div className="flex items-center justify-between gap-3 text-slate-300 border-b border-space-800 pb-1.5 font-bold">
            <span className="flex items-center gap-1 text-cyber-cyan">
              <Layers className="w-3.5 h-3.5" /> MAP LAYERS
            </span>
            <button
              onClick={() => setIsSwipeMode(!isSwipeMode)}
              className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                isSwipeMode ? 'bg-cyber-cyan text-space-950 font-bold' : 'bg-space-800 text-slate-300 hover:text-white'
              }`}
            >
              {isSwipeMode ? 'EXIT SWIPE' : 'SWIPE COMPARE'}
            </button>
          </div>

          {/* Basemap Switcher */}
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveBasemap('satellite')}
              className={`px-2 py-1 rounded text-[10px] uppercase transition-all ${
                activeBasemap === 'satellite' ? 'bg-cyber-blue/30 text-cyber-cyan border border-cyber-cyan/40' : 'bg-space-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setActiveBasemap('dark')}
              className={`px-2 py-1 rounded text-[10px] uppercase transition-all ${
                activeBasemap === 'dark' ? 'bg-cyber-blue/30 text-cyber-cyan border border-cyber-cyan/40' : 'bg-space-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tactical Dark
            </button>
            <button
              onClick={() => setActiveBasemap('topo')}
              className={`px-2 py-1 rounded text-[10px] uppercase transition-all ${
                activeBasemap === 'topo' ? 'bg-cyber-blue/30 text-cyber-cyan border border-cyber-cyan/40' : 'bg-space-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Topo/DEM
            </button>
          </div>

          {/* Layer Toggles */}
          <div className="flex flex-col gap-1.5 pt-1">
            <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyber-cyan"></span> Flood Inundation Vector
              </span>
              <input
                type="checkbox"
                checked={showFloodPolygons}
                onChange={(e) => setShowFloodPolygons(e.target.checked)}
                className="rounded bg-space-800 border-space-600 text-cyber-cyan focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical Infrastructure
              </span>
              <input
                type="checkbox"
                checked={showInfrastructure}
                onChange={(e) => setShowInfrastructure(e.target.checked)}
                className="rounded bg-space-800 border-space-600 text-cyber-cyan focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe High Shelters
              </span>
              <input
                type="checkbox"
                checked={showShelters}
                onChange={(e) => setShowShelters(e.target.checked)}
                className="rounded bg-space-800 border-space-600 text-cyber-cyan focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Evacuation Routes
              </span>
              <input
                type="checkbox"
                checked={showRoutes}
                onChange={(e) => setShowRoutes(e.target.checked)}
                className="rounded bg-space-800 border-space-600 text-cyber-cyan focus:ring-0"
              />
            </label>
          </div>

          {/* Opacity Slider */}
          <div className="pt-1.5 border-t border-space-800">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Mask Opacity</span>
              <span className="text-cyber-cyan font-mono">{Math.round(polygonOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={polygonOpacity}
              onChange={(e) => setPolygonOpacity(parseFloat(e.target.value))}
              className="w-full accent-cyber-cyan bg-space-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

        </div>

      </div>

      {/* Map Legend & Telemetry Readout (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="bg-space-900/90 backdrop-blur-md border border-space-700/80 rounded-lg p-2.5 shadow-xl text-xs font-mono text-slate-300 space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-cyber-cyan tracking-wider flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-cyber-cyan animate-pulse" /> INUNDATION DEPTH CLASSIFICATION
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#00F0FF]"></span>
              <span>&gt; 2.5m (Deep Core)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#0088FF]"></span>
              <span>1.0m - 2.5m (Severe)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#3B82F6]"></span>
              <span>0.3m - 1.0m (Shallow)</span>
            </div>
          </div>
          {mouseCoords && (
            <div className="text-[10px] text-slate-400 pt-1 border-t border-space-800 flex items-center justify-between">
              <span>CURSOR TELEMETRY:</span>
              <span className="text-cyber-cyan font-mono">{mouseCoords.lat}°N, {mouseCoords.lng}°E</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
