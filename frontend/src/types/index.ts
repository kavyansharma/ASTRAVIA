export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  min_lat: number;
  min_lng: number;
  max_lat: number;
  max_lng: number;
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: 'hospital' | 'power_substation' | 'bridge' | 'school' | 'evacuation_shelter' | 'water_treatment' | 'telecom_tower' | 'residential_cluster' | 'agricultural_zone';
  lat: number;
  lng: number;
  status: 'operational' | 'vulnerable' | 'inundated' | 'compromised' | 'offline';
  capacity_or_population: number;
  elevation_meters: number;
  distance_to_water_km?: number;
  damage_estimate_usd: number;
  criticality: 'critical' | 'high' | 'medium' | 'low';
}

export interface FloodPolygonFeature {
  type: 'Feature';
  properties: {
    id: string;
    severity: 'CRITICAL' | 'SEVERE' | 'MODERATE' | 'LOW';
    depth_range_meters?: string;
    water_velocity_ms?: number;
    ndwi_mean?: number;
    color: string;
    fill_opacity: number;
    zone_type: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

export interface FloodGeoJSONCollection {
  type: 'FeatureCollection';
  features: FloodPolygonFeature[];
}

export interface WeatherTelemetry {
  location_name: string;
  lat: number;
  lng: number;
  timestamp: string;
  precipitation_mm_hr: number;
  past_24h_precipitation_mm: number;
  forecast_24h_precipitation_mm: number;
  soil_moisture_percentage: number;
  river_discharge_m3_s?: number;
  wind_speed_kmh: number;
  temperature_c: number;
  humidity_percentage: number;
  flood_weather_risk_score: number;
  data_source: 'OPEN_METEO_LIVE' | 'SYNTHETIC_BENCHMARK';
  is_live_feed: boolean;
}

export interface RiskAssessment {
  total_area_analyzed_km2: number;
  inundated_area_km2: number;
  inundation_percentage: number;
  estimated_affected_population: number;
  population_in_critical_zone: number;
  infrastructure_summary: {
    hospitals_at_risk: number;
    power_substations_threatened: number;
    bridges_inundated: number;
    schools_affected: number;
    residential_clusters_flooded: number;
    agricultural_hectares_lost: number;
  };
  vulnerable_assets: InfrastructureAsset[];
  estimated_economic_loss_usd: number;
  evacuation_urgency_index: number;
  recommended_shelters: Array<{
    name: string;
    capacity: number;
    occupancy_current: string;
    status: string;
    elevation: string;
  }>;
  evacuation_routes_status: Array<{
    corridor: string;
    status: string;
    risk_level: string;
    recommended_for: string;
  }>;
  severity_level: 'ADVISORY' | 'WATCH' | 'WARNING' | 'EMERGENCY_CRITICAL';
}

export interface DetectionStageLog {
  stage_id: string;
  title: string;
  description: string;
  completed: boolean;
  duration_ms: number;
  timestamp: string;
}

export interface DetectionResult {
  scan_id: string;
  hazard_type: 'flood' | 'wildfire' | 'cyclone';
  timestamp: string;
  region_name: string;
  coordinates: BoundingBox;
  center: GeoPoint;
  zoom_level: number;
  data_source: 'SENTINEL_2_L2A' | 'LANDSAT_8_OLI' | 'SYNTHETIC_BENCHMARK' | 'USER_UPLOADED_GEO';
  is_simulated_ai: boolean;
  ai_model_name: string;
  confidence_score: number;
  before_imagery_url: string;
  after_imagery_url: string;
  water_mask_url?: string;
  depth_heatmap_url?: string;
  flood_polygons: FloodGeoJSONCollection;
  risk_assessment: RiskAssessment;
  weather_telemetry?: WeatherTelemetry;
  processing_pipeline_logs: DetectionStageLog[];
}

export interface DisasterScenario {
  id: string;
  name: string;
  country: string;
  hazard_type: 'flood' | 'wildfire' | 'cyclone';
  description: string;
  historical_date: string;
  center: GeoPoint;
  zoom_level: number;
  bbox: BoundingBox;
  thumbnail_url: string;
  is_historical_benchmark: boolean;
  satellite_mission: string;
}

export interface AlertDispatch {
  alert_id: string;
  timestamp: string;
  severity: 'ADVISORY' | 'WATCH' | 'WARNING' | 'EMERGENCY_CRITICAL';
  region_name: string;
  target_authorities: string[];
  channel: 'CIVIL_DEFENSE_SMS' | 'CAP_XML_FEED' | 'WEBHOOK' | 'EMERGENCY_BROADCAST';
  message: string;
  affected_radius_km: number;
  status: 'QUEUED' | 'TRANSMITTED' | 'ACKNOWLEDGED';
}

export interface ScanRequest {
  scenario_id?: string;
  hazard_type: 'flood' | 'wildfire' | 'cyclone';
  center_lat?: number;
  center_lng?: number;
  bbox?: BoundingBox;
  ndwi_threshold: number;
  ai_sensitivity: number;
  use_live_weather: boolean;
  custom_image_base64?: string;
}
