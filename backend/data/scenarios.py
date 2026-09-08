"""
Curated real-world and benchmark disaster scenarios for SpaceGuard.
Includes coordinates, bounding boxes, baseline imagery, and known infrastructure assets.
"""
from typing import List, Dict, Any
from backend.models.schemas import DisasterScenario, InfrastructureAsset, GeoPoint, BoundingBox

BENCHMARK_SCENARIOS: List[DisasterScenario] = [
    DisasterScenario(
        id="brazil_porto_alegre_2024",
        name="Rio Grande do Sul Catastrophic Inundation",
        country="Brazil",
        hazard_type="flood",
        description="Historic torrential rains led to unprecedented flooding of Guaíba Lake and the Taquari-Antas basin, submerging 80% of Porto Alegre metropolitan area and cutting off Salgado Filho Airport.",
        historical_date="May 2024",
        center=GeoPoint(lat=-30.0346, lng=-51.2177),
        zoom_level=12,
        bbox=BoundingBox(min_lat=-30.1500, min_lng=-51.3500, max_lat=-29.9000, max_lng=-51.0500),
        thumbnail_url="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
        satellite_mission="Sentinel-2A MSI + Sentinel-1 SAR (ESA)"
    ),
    DisasterScenario(
        id="pakistan_sindh_indus_2022",
        name="Sindh Province Indus Basin Mega-Flood",
        country="Pakistan",
        hazard_type="flood",
        description="Extreme monsoon rains created an inland sea stretching across 100km of the Indus River floodplains in Sindh and Balochistan, displacing over 8 million people.",
        historical_date="August 2022",
        center=GeoPoint(lat=27.5580, lng=68.2020),
        zoom_level=11,
        bbox=BoundingBox(min_lat=27.2000, min_lng=67.8000, max_lat=27.9000, max_lng=68.6000),
        thumbnail_url="https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80",
        satellite_mission="Landsat-8 OLI + Copernicus Sentinel-2"
    ),
    DisasterScenario(
        id="spain_valencia_2024",
        name="Valencia Flash Flood & Turia Basin Surge",
        country="Spain",
        hazard_type="flood",
        description="A violent DANA (isolated high-level depression) triggered sudden torrential torrents across the Rambla del Poyo and Turia basin, trapping urban transport and flooding southern suburbs.",
        historical_date="October 2024",
        center=GeoPoint(lat=39.4699, lng=-0.3763),
        zoom_level=12,
        bbox=BoundingBox(min_lat=39.3500, min_lng=-0.5000, max_lat=39.5500, max_lng=-0.2500),
        thumbnail_url="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
        satellite_mission="Copernicus Sentinel-2 L2A"
    ),
    DisasterScenario(
        id="libya_derna_2023",
        name="Derna Wadi Dam Collapse & Coastal Inundation",
        country="Libya",
        hazard_type="flood",
        description="Storm Daniel struck Cyrenaica causing the catastrophic collapse of the Abu Mansur and Derna dams, sweeping entire downtown neighborhoods into the Mediterranean Sea.",
        historical_date="September 2023",
        center=GeoPoint(lat=32.7667, lng=22.6367),
        zoom_level=13,
        bbox=BoundingBox(min_lat=32.7000, min_lng=22.5500, max_lat=32.8200, max_lng=22.7200),
        thumbnail_url="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
        satellite_mission="Sentinel-2 + PlanetScope SuperDove"
    ),
    DisasterScenario(
        id="europe_danube_2024",
        name="Central Europe Storm Boris / Danube Flooding",
        country="Austria / Czechia / Poland",
        hazard_type="flood",
        description="Exceptional multi-day rainfall from Storm Boris triggered extreme cresting on the Danube, Oder, and Vistula river systems, testing flood defense walls across Vienna, Wroclaw, and Ostrava.",
        historical_date="September 2024",
        center=GeoPoint(lat=48.2082, lng=16.3738),
        zoom_level=12,
        bbox=BoundingBox(min_lat=48.1200, min_lng=16.2500, max_lat=48.3000, max_lng=16.5000),
        thumbnail_url="https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80",
        satellite_mission="Sentinel-1 SAR + Sentinel-2 MSI"
    ),
    DisasterScenario(
        id="india_kerala_monsoon",
        name="Kerala Western Ghats Periyar River Floods",
        country="India",
        hazard_type="flood",
        description="Intense monsoon precipitation forced dam spillways open along the Periyar and Pamba rivers, inundating Kochi lowlands and displacing hundreds of thousands into relief camps.",
        historical_date="Monsoon Benchmark",
        center=GeoPoint(lat=10.0159, lng=76.3419),
        zoom_level=12,
        bbox=BoundingBox(min_lat=9.8500, min_lng=76.2000, max_lat=10.1800, max_lng=76.5000),
        thumbnail_url="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        satellite_mission="RISAT-1 / Sentinel-2 / Cartosat"
    )
]

def get_scenario_infrastructure(scenario_id: str, center_lat: float, center_lng: float) -> List[InfrastructureAsset]:
    """
    Generates realistic critical infrastructure points centered around the scenario area.
    """
    offsets = [
        ("hospital", "Central Memorial Hospital", 0.015, -0.012, "critical", 450, 18.5),
        ("hospital", "Metropolitan Regional Trauma Center", -0.022, 0.035, "critical", 600, 24.0),
        ("hospital", "St. Jude Community Clinic", 0.035, 0.018, "high", 120, 14.2),
        ("power_substation", "Grid Substation Alpha (500kV)", -0.018, -0.025, "critical", 550, 12.0),
        ("power_substation", "East River Distribution Plant", 0.028, -0.040, "high", 280, 8.5),
        ("bridge", "North Main Suspension Bridge", 0.005, 0.008, "critical", 15000, 6.0),
        ("bridge", "Highway 104 Overpass Viaduct", -0.032, 0.015, "critical", 22000, 5.0),
        ("school", "Lincoln Central High School", 0.018, 0.042, "medium", 1200, 22.0),
        ("school", "Riverside Primary Academy", -0.012, 0.010, "high", 650, 11.0),
        ("evacuation_shelter", "Civic Arena Emergency Shelter", 0.045, -0.015, "critical", 3500, 32.0),
        ("evacuation_shelter", "University Sports Complex Shelter", -0.040, -0.035, "critical", 2800, 29.0),
        ("water_treatment", "Municipal Water Filtration Facility", -0.008, -0.018, "critical", 85000, 7.5),
        ("telecom_tower", "Cellular Relay Station Tower-7", 0.038, 0.028, "medium", 40000, 35.0),
        ("residential_cluster", "Lowland Valley Residential District", -0.015, 0.005, "critical", 18500, 9.0),
        ("agricultural_zone", "East River Agri-Cropland Basin", 0.050, -0.055, "medium", 4500, 10.5),
    ]

    assets: List[InfrastructureAsset] = []
    for idx, (asset_type, name, dlat, dlng, crit, cap, elev) in enumerate(offsets):
        asset_lat = center_lat + dlat
        asset_lng = center_lng + dlng
        
        # Simple hydro-proximity heuristic: lower elevation and close proximity to center river line = vulnerable/inundated
        dist_factor = ((dlat**2 + dlng**2)**0.5) * 111.0 # approx km
        if elev < 10.0 or dist_factor < 2.0:
            status = "inundated" if elev < 8.0 else "vulnerable"
            damage = cap * 1800 if asset_type != "residential_cluster" else cap * 450
        elif dist_factor < 4.0:
            status = "vulnerable"
            damage = cap * 600
        else:
            status = "operational"
            damage = 0.0

        assets.append(
            InfrastructureAsset(
                id=f"{scenario_id}_asset_{idx+1}",
                name=f"{name}",
                type=asset_type,
                lat=round(asset_lat, 5),
                lng=round(asset_lng, 5),
                status=status,
                capacity_or_population=cap,
                elevation_meters=elev,
                distance_to_water_km=round(dist_factor, 2),
                damage_estimate_usd=damage,
                criticality=crit
            )
        )
    return assets
