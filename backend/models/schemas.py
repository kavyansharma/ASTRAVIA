"""
Data models and Pydantic schemas for SPACEGUARD.
"""
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

class GeoPoint(BaseModel):
    lat: float
    lng: float

class BoundingBox(BaseModel):
    min_lat: float
    min_lng: float
    max_lat: float
    max_lng: float

class InfrastructureAsset(BaseModel):
    id: str
    name: str
    type: Literal["hospital", "power_substation", "bridge", "school", "evacuation_shelter", "water_treatment", "telecom_tower", "residential_cluster", "agricultural_zone"]
    lat: float
    lng: float
    status: Literal["operational", "vulnerable", "inundated", "compromised", "offline"]
    capacity_or_population: int = Field(default=0, description="e.g. bed count, megawatt capacity, student count or residents")
    elevation_meters: float = 0.0
    distance_to_water_km: Optional[float] = None
    damage_estimate_usd: float = 0.0
    criticality: Literal["critical", "high", "medium", "low"] = "high"

class GeoJSONGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[Any]

class FloodPolygonFeature(BaseModel):
    type: str = "Feature"
    properties: Dict[str, Any] = Field(default_factory=dict)
    geometry: GeoJSONGeometry

class FloodGeoJSONCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[FloodPolygonFeature] = Field(default_factory=list)

class WeatherTelemetry(BaseModel):
    location_name: str
    lat: float
    lng: float
    timestamp: str
    precipitation_mm_hr: float
    past_24h_precipitation_mm: float
    forecast_24h_precipitation_mm: float
    soil_moisture_percentage: float
    river_discharge_m3_s: Optional[float] = None
    wind_speed_kmh: float
    temperature_c: float
    humidity_percentage: float
    flood_weather_risk_score: float = Field(ge=0.0, le=100.0, description="Atmospheric flood risk index (0-100)")
    data_source: Literal["OPEN_METEO_LIVE", "SYNTHETIC_BENCHMARK"] = "OPEN_METEO_LIVE"
    is_live_feed: bool = True

class RiskAssessment(BaseModel):
    total_area_analyzed_km2: float
    inundated_area_km2: float
    inundation_percentage: float
    estimated_affected_population: int
    population_in_critical_zone: int
    infrastructure_summary: Dict[str, int] = Field(
        default_factory=lambda: {
            "hospitals_at_risk": 0,
            "power_substations_threatened": 0,
            "bridges_inundated": 0,
            "schools_affected": 0,
            "residential_clusters_flooded": 0,
            "agricultural_hectares_lost": 0
        }
    )
    vulnerable_assets: List[InfrastructureAsset] = Field(default_factory=list)
    estimated_economic_loss_usd: float
    evacuation_urgency_index: float = Field(ge=0.0, le=100.0, description="Urgency score 0-100")
    recommended_shelters: List[Dict[str, Any]] = Field(default_factory=list)
    evacuation_routes_status: List[Dict[str, Any]] = Field(default_factory=list)
    severity_level: Literal["ADVISORY", "WATCH", "WARNING", "EMERGENCY_CRITICAL"] = "WARNING"

class DetectionStageLog(BaseModel):
    stage_id: str
    title: str
    description: str
    completed: bool = True
    duration_ms: int = 0
    timestamp: str

class DetectionResult(BaseModel):
    scan_id: str
    hazard_type: Literal["flood", "wildfire", "cyclone"] = "flood"
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    region_name: str
    coordinates: BoundingBox
    center: GeoPoint
    zoom_level: int = 12
    data_source: Literal["SENTINEL_2_L2A", "LANDSAT_8_OLI", "SYNTHETIC_BENCHMARK", "USER_UPLOADED_GEO"]
    is_simulated_ai: bool = False
    ai_model_name: str = "SpaceGuard-HydroSegment-v2.4 (NDWI + Deep Multi-Scale ResNet)"
    confidence_score: float = Field(ge=0.0, le=1.0, default=0.92)
    before_imagery_url: str
    after_imagery_url: str
    water_mask_url: Optional[str] = None
    depth_heatmap_url: Optional[str] = None
    flood_polygons: FloodGeoJSONCollection
    risk_assessment: RiskAssessment
    weather_telemetry: Optional[WeatherTelemetry] = None
    processing_pipeline_logs: List[DetectionStageLog] = Field(default_factory=list)

class ScanRequest(BaseModel):
    scenario_id: Optional[str] = None
    hazard_type: Literal["flood", "wildfire", "cyclone"] = "flood"
    center_lat: Optional[float] = None
    center_lng: Optional[float] = None
    bbox: Optional[BoundingBox] = None
    ndwi_threshold: float = Field(default=0.2, ge=-1.0, le=1.0)
    ai_sensitivity: float = Field(default=0.85, ge=0.1, le=1.0)
    use_live_weather: bool = True
    custom_image_base64: Optional[str] = None

class DisasterScenario(BaseModel):
    id: str
    name: str
    country: str
    hazard_type: Literal["flood", "wildfire", "cyclone"]
    description: str
    historical_date: str
    center: GeoPoint
    zoom_level: int
    bbox: BoundingBox
    thumbnail_url: str
    is_historical_benchmark: bool = True
    satellite_mission: str = "Copernicus Sentinel-2 (ESA)"

class AlertDispatch(BaseModel):
    alert_id: str
    timestamp: str
    severity: Literal["ADVISORY", "WATCH", "WARNING", "EMERGENCY_CRITICAL"]
    region_name: str
    target_authorities: List[str]
    channel: Literal["CIVIL_DEFENSE_SMS", "CAP_XML_FEED", "WEBHOOK", "EMERGENCY_BROADCAST"]
    message: str
    affected_radius_km: float
    status: Literal["QUEUED", "TRANSMITTED", "ACKNOWLEDGED"] = "TRANSMITTED"
