# 🛰️ SPACEGUARD: AI-Powered Satellite Intelligence Platform for Early Disaster Detection & Risk Assessment

SPACEGUARD is an operational, aerospace-grade Earth Observation (EO) satellite intelligence platform engineered for rapid disaster detection, multi-spectral flood segmentation, critical infrastructure exposure analysis, and civil defense early warning dispatch.

---

## 🌟 Key Capabilities & Features

1. **Multi-Spectral Spectral & Deep Segmentation Pipeline**:
   - Computes **NDWI (Normalized Difference Water Index)** using Sentinel-2 Green (B03) and NIR (B08) optical bands.
   - Computes **MNDWI** using Short-Wave Infrared (SWIR B11/B12) for urban flood penetration.
   - Adaptive Otsu thresholding & morphological smoothing producing multi-tier GeoJSON inundation depth zones (*Critical >2.5m, Severe 1.0-2.5m, Moderate 0.3-1.0m*).

2. **Real-Time Weather & Atmospheric Ground Truth**:
   - Direct integration with **Open-Meteo live API** delivering real-time precipitation rates (mm/hr), 24h accumulation, soil moisture saturation (%), and atmospheric flood risk indices.
   - Distinct badges clearly differentiating `🟢 REAL ATMOSPHERIC DATA` vs `🟡 AI SIMULATION / BENCHMARK RUNS`.

3. **Geospatial Risk & Critical Infrastructure Impact Engine**:
   - Spatial intersection of flood extent polygons with critical assets (Hospitals, Power Substations, Bridges, Schools, Residential Zones, Agricultural Croplands).
   - Inundated surface area calculation (km² and % of monitored swath).
   - Direct demographic exposure count (civilians in high-risk red zone).
   - Estimated direct economic damage index in USD ($M).
   - Evacuation Urgency Index gauge (0-100 score).

4. **Tactical Command Center Interface**:
   - **Interactive Leaflet Geospatial Map**: High-res satellite basemaps, tactical dark mode, Topo/DEM overlays.
   - **Split-Screen Swipe Comparison**: Real-time slider comparing pre-disaster satellite baseline vs post-flood AI inundation mask.
   - **Layer Controls**: Toggle Inundation Polygons, Infrastructure Markers, Safe High-Ground Shelters, and Evacuation Arterials with opacity calibration.
   - **Global Curated Benchmarks**: Rio Grande do Sul (Brazil), Sindh Indus Basin (Pakistan), Valencia Flash Floods (Spain), Derna Dam Collapse (Libya), Central Europe Danube Floods (Austria/Czechia), Kerala Monsoon Inundation.
   - **Custom Satellite Upload**: Ingestion and processing of custom GeoTIFF / Satellite PNG imagery.

5. **Automated SITREP & Early Warning Dispatch**:
   - One-click executive **Situation Report (SITREP)** generation in structured Markdown and exportable file formats.
   - **Emergency Alert Dispatcher** supporting Civil Defense SMS-CB, Common Alerting Protocol (CAP v1.2), and Emergency Webhooks.

6. **Modular Multi-Hazard Architecture**:
   - Pluggable `BaseDisasterDetector` interface supporting:
     - `FloodDetector` (Operational MVP)
     - `WildfireDetector` (NBR burn scar & thermal infrared anomaly)
     - `CycloneDetector` (Radar SAR storm surge & wind swath)

---

## 🏗️ Architecture & Technology Stack

```
SPACEGUARD
├── backend/                  # Python FastAPI Backend
│   ├── detectors/            # Modular Disaster Detectors
│   │   ├── base.py           # BaseDisasterDetector Abstract Interface
│   │   ├── flood.py          # NDWI + HydroSegment-v2.4 Flood Detector
│   │   ├── wildfire.py       # NBR + Thermal PyroScan Wildfire Detector
│   │   ├── cyclone.py        # SAR + VortexSurge Cyclone Detector
│   │   └── manager.py        # Detector Registry & Dispatcher
│   ├── services/             # Core Business Engines
│   │   ├── risk_engine.py    # Shapely Geospatial Risk & Infrastructure Engine
│   │   ├── weather_service.py# Open-Meteo Real-Time Weather Integration
│   │   └── report_generator.py # Humanitarian SITREP Markdown Generator
│   ├── data/                 # Curated Scenarios & Infrastructure Data
│   ├── models/schemas.py     # Pydantic Schemas & GeoJSON Models
│   └── main.py               # FastAPI REST API Application
│
└── frontend/                 # React + TypeScript Frontend
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx             # Mission Telemetry & Hazard Tabs
    │   │   ├── MapViewer.tsx          # Leaflet Map with Before/After Swipe
    │   │   ├── AnalysisControlPanel.tsx# Scenario Selector & Calibration
    │   │   ├── PipelineProgress.tsx   # 6-Stage AI Progress Telemetry
    │   │   ├── RiskMetricsPanel.tsx   # Tactical Impact HUD & Weather
    │   │   ├── InfrastructureList.tsx # Asset Exposure Drilldown
    │   │   ├── AlertCenter.tsx        # CAP Alert Dispatch Modal
    │   │   └── SitrepReportModal.tsx  # Executive SITREP Brief Modal
    │   ├── services/api.ts            # Typed API Client with Fallbacks
    │   ├── types/index.ts             # TypeScript Type Definitions
    │   └── App.tsx                    # Master Command Center Coordinator
```

---

## 🚀 Quickstart & Running Locally

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Install Python dependencies
py -m pip install fastapi uvicorn pydantic shapely numpy pillow httpx python-multipart pytest

# Start FastAPI server on port 8000
py -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
*API Swagger Documentation is available at `http://127.0.0.1:8000/docs`*

### 3. Frontend Setup
```bash
# Navigate to frontend folder
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server on port 5173
npm run dev
```
*Open `http://127.0.0.1:5173` in your browser.*

### 4. Running Backend Tests
```bash
py -m pytest backend/tests
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System telemetry & constellation uplink status |
| `GET` | `/api/scenarios` | Curated benchmark disaster datasets |
| `GET` | `/api/detectors` | Registered modular AI hazard detectors |
| `POST` | `/api/scans/analyze` | Execute AI segmentation & risk analysis pipeline |
| `GET` | `/api/weather/live` | Live Open-Meteo precipitation & soil telemetry |
| `GET` | `/api/infrastructure/{id}` | Critical infrastructure spatial asset inventory |
| `POST` | `/api/alerts/dispatch` | Transmit Civil Defense CAP emergency alert |
| `POST` | `/api/reports/sitrep` | Generate executive markdown SITREP report |

---

## 🛡️ License
Built for Disaster Resilience & Earth Observation Intelligence.
