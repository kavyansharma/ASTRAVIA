"""
Automated Disaster Situation Report (SITREP) Generator for SpaceGuard.
Produces structured humanitarian relief, civil defense, and executive briefings.
"""
from datetime import datetime
from backend.models.schemas import DetectionResult

def generate_markdown_sitrep(result: DetectionResult) -> str:
    """
    Generates an executive SITREP Markdown document from detection results.
    """
    risk = result.risk_assessment
    weather = result.weather_telemetry

    weather_text = "N/A"
    if weather:
        weather_text = f"""- **Live Precipitation:** {weather.precipitation_mm_hr} mm/hr (Past 24h: {weather.past_24h_precipitation_mm} mm)
- **Forecast 24h Rain:** {weather.forecast_24h_precipitation_mm} mm
- **Soil Moisture Saturation:** {weather.soil_moisture_percentage}%
- **Atmospheric Flood Risk Index:** {weather.flood_weather_risk_score}/100 ({weather.data_source})"""

    vulnerable_hospitals = [a for a in risk.vulnerable_assets if a.type == "hospital"]
    hosp_text = "\n".join([f"  - **{h.name}**: Status `{h.status.upper()}` | Capacity: {h.capacity_or_population} beds | Elevation: {h.elevation_meters}m" for h in vulnerable_hospitals[:4]]) or "  - No critical medical facilities directly submerged."

    shelters_text = "\n".join([f"  - **{s['name']}**: Capacity {s['capacity']} | Elevation: {s.get('elevation', 'N/A')} | Status: `{s['status']}`" for s in risk.recommended_shelters])

    report = f"""# SPACEGUARD SATELLITE DISASTER INTELLIGENCE BRIEF (SITREP)
**Mission ID:** `{result.scan_id}`  
**Hazard Classification:** `{result.hazard_type.upper()}`  
**Target Area:** {result.region_name}  
**Coordinates BBox:** `[{result.coordinates.min_lat}, {result.coordinates.min_lng}]` to `[{result.coordinates.max_lat}, {result.coordinates.max_lng}]`  
**Timestamp (UTC):** {result.timestamp}  
**Severity Level:** **{risk.severity_level}** (Urgency Score: **{risk.evacuation_urgency_index}/100**)  
**AI Model Pipeline:** {result.ai_model_name} (Confidence: {int(result.confidence_score * 100)}%)  
**Data Verification:** `{'🟢 REAL SATELLITE & ATMOSPHERIC FEED' if not result.is_simulated_ai else '🟡 BENCHMARK / SIMULATED AI RUN'}`

---

## 1. EXECUTIVE SUMMARY
Satellite analysis reveals an estimated **{risk.inundated_area_km2} km²** ({risk.inundation_percentage}%) of the target region is submerged or in active hazard envelope. An estimated **{risk.estimated_affected_population:,} civilians** reside within the affected swath, with **{risk.population_in_critical_zone:,} individuals** located in the immediate high-risk red zone requiring immediate evacuation priority.

Estimated direct physical asset and infrastructure damage index: **${risk.estimated_economic_loss_usd:,.2f} USD**.

---

## 2. ATMOSPHERIC & METEOROLOGICAL TELEMETRY
{weather_text}

---

## 3. CRITICAL INFRASTRUCTURE IMPACT MATRIX
- **Hospitals & Medical Centers at Risk:** {risk.infrastructure_summary.get('hospitals_at_risk', 0)}
- **Power Grid Substations Threatened:** {risk.infrastructure_summary.get('power_substations_threatened', 0)}
- **Bridges & Overpasses Inundated:** {risk.infrastructure_summary.get('bridges_inundated', 0)}
- **Educational Facilities Affected:** {risk.infrastructure_summary.get('schools_affected', 0)}
- **Agricultural Land Lost:** {risk.infrastructure_summary.get('agricultural_hectares_lost', 0):,} Hectares

### Priority Medical Assets:
{hosp_text}

---

## 4. EMERGENCY SHELTER & EVACUATION DIRECTIVES
### Designated Safe High-Ground Shelters:
{shelters_text}

### Evacuation Arterials:
""" + "\n".join([f"- **{r['corridor']}**: Status `{r['status']}` (Risk: {r['risk_level']}) - Guidance: {r['recommended_for']}" for r in risk.evacuation_routes_status]) + """

---
*Report generated autonomously by SpaceGuard Autonomous Earth Observation Pipeline.*
"""
    return report
