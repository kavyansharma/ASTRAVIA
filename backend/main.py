"""
SpaceGuard Backend FastAPI Application.
AI-powered Satellite Intelligence Platform for Disaster Detection & Risk Assessment.
"""
import uuid
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

from backend.models.schemas import (
    ScanRequest, DetectionResult, DisasterScenario,
    AlertDispatch, WeatherTelemetry, InfrastructureAsset
)
from backend.data.scenarios import BENCHMARK_SCENARIOS, get_scenario_infrastructure
from backend.detectors.manager import detector_manager
from backend.services.weather_service import fetch_live_weather
from backend.services.report_generator import generate_markdown_sitrep

app = FastAPI(
    title="SPACEGUARD Satellite Intelligence API",
    description="Operational Earth Observation API for early disaster detection, flood segmentation, and geospatial risk assessment.",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite default port 5173 / localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory scan and alert history
SCAN_HISTORY: Dict[str, DetectionResult] = {}
ALERT_HISTORY: List[AlertDispatch] = []

@app.get("/api/health")
async def health_check():
    """System health check and mission telemetry"""
    return {
        "status": "OPERATIONAL",
        "service": "SPACEGUARD Satellite Intelligence Engine",
        "utc_time": datetime.utcnow().isoformat() + "Z",
        "satellite_constellations": ["Copernicus Sentinel-2A/B", "Sentinel-1 SAR", "Landsat-8/9 OLI"],
        "detectors_registered": [d["hazard_type"] for d in detector_manager.list_available_detectors()]
    }

@app.get("/api/scenarios", response_model=List[DisasterScenario])
async def list_scenarios():
    """Retrieve benchmark curated disaster scenarios"""
    return BENCHMARK_SCENARIOS

@app.get("/api/detectors")
async def list_detectors():
    """List registered modular disaster detector models"""
    return detector_manager.list_available_detectors()

@app.post("/api/scans/analyze", response_model=DetectionResult)
async def analyze_swath(request: ScanRequest):
    """
    Executes AI segmentation, NDWI index extraction, and risk assessment pipeline.
    """
    try:
        result = await detector_manager.run_detection(request)
        SCAN_HISTORY[result.scan_id] = result
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")

@app.get("/api/scans/{scan_id}", response_model=DetectionResult)
async def get_scan_by_id(scan_id: str):
    """Fetch previous scan result by ID"""
    if scan_id not in SCAN_HISTORY:
        raise HTTPException(status_code=404, detail="Scan ID not found")
    return SCAN_HISTORY[scan_id]

@app.get("/api/weather/live", response_model=WeatherTelemetry)
async def get_live_weather(lat: float, lng: float, location_name: str = "Target Swath"):
    """
    Fetch real-time Open-Meteo precipitation, wind, soil moisture, and atmospheric risk.
    """
    return await fetch_live_weather(lat, lng, location_name)

@app.get("/api/infrastructure/{scenario_id}", response_model=List[InfrastructureAsset])
async def get_infrastructure(scenario_id: str, lat: float = 39.4699, lng: float = -0.3763):
    """Fetch critical infrastructure inventory for a region"""
    return get_scenario_infrastructure(scenario_id, lat, lng)

@app.post("/api/alerts/dispatch", response_model=AlertDispatch)
async def dispatch_emergency_alert(alert_payload: Dict[str, Any]):
    """
    Dispatches early warning alert to Civil Defense / CAP (Common Alerting Protocol) channels.
    """
    new_alert = AlertDispatch(
        alert_id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
        timestamp=datetime.utcnow().isoformat() + "Z",
        severity=alert_payload.get("severity", "EMERGENCY_CRITICAL"),
        region_name=alert_payload.get("region_name", "Monitored Sector"),
        target_authorities=alert_payload.get("target_authorities", ["National Emergency Management Agency", "State Disaster Response Force", "Civil Defense"]),
        channel=alert_payload.get("channel", "CIVIL_DEFENSE_SMS"),
        message=alert_payload.get("message", "FLASH FLOOD WARNING: Imminent inundation detected via SpaceGuard Satellite Analysis."),
        affected_radius_km=float(alert_payload.get("affected_radius_km", 25.0)),
        status="TRANSMITTED"
    )
    ALERT_HISTORY.insert(0, new_alert)
    return new_alert

@app.get("/api/alerts", response_model=List[AlertDispatch])
async def list_alerts():
    """List recent dispatched alerts"""
    return ALERT_HISTORY

@app.post("/api/reports/sitrep", response_class=PlainTextResponse)
async def generate_sitrep_endpoint(result: DetectionResult):
    """Generate Markdown SITREP situation report"""
    return generate_markdown_sitrep(result)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
