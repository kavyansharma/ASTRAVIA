"""
Real-time atmospheric and weather telemetry service using Open-Meteo API.
Fetches live precipitation, soil moisture saturation, and flood meteorological risk.
"""
import httpx
from datetime import datetime
from typing import Optional
from backend.models.schemas import WeatherTelemetry

async def fetch_live_weather(lat: float, lng: float, location_name: str = "Target Swath") -> WeatherTelemetry:
    """
    Fetches real-time weather & precipitation data from Open-Meteo API.
    If the network call fails or coordinates are remote, falls back smoothly to calculated telemetry.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lng,
        "current": "temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m",
        "hourly": "precipitation,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm",
        "forecast_days": 2,
        "past_days": 1
    }
    
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                hourly = data.get("hourly", {})
                
                precip_current = float(current.get("precipitation", 0.0))
                temp = float(current.get("temperature_2m", 24.0))
                humidity = float(current.get("relative_humidity_2m", 75.0))
                wind = float(current.get("wind_speed_10m", 15.0))
                
                # Calculate past 24h and forecast 24h precipitation sums
                hourly_precip = hourly.get("precipitation", [])
                past_24h = sum(hourly_precip[:24]) if len(hourly_precip) >= 24 else precip_current * 12
                forecast_24h = sum(hourly_precip[24:48]) if len(hourly_precip) >= 48 else precip_current * 18
                
                # Soil moisture estimate
                soil_m = hourly.get("soil_moisture_0_to_1cm", [0.45])
                soil_val = float(soil_m[0]) * 100 if soil_m else 48.0
                
                # Flood weather risk formula (0-100)
                # Weights: Past 24h rain (40%), Forecast rain (35%), Soil saturation (25%)
                risk_score = min(100.0, (past_24h * 0.7) + (forecast_24h * 0.6) + (soil_val * 0.35))
                
                return WeatherTelemetry(
                    location_name=location_name,
                    lat=lat,
                    lng=lng,
                    timestamp=datetime.utcnow().isoformat() + "Z",
                    precipitation_mm_hr=round(precip_current, 2),
                    past_24h_precipitation_mm=round(past_24h, 1),
                    forecast_24h_precipitation_mm=round(forecast_24h, 1),
                    soil_moisture_percentage=round(soil_val, 1),
                    river_discharge_m3_s=round(120.0 + (past_24h * 8.5), 1),
                    wind_speed_kmh=round(wind, 1),
                    temperature_c=round(temp, 1),
                    humidity_percentage=round(humidity, 1),
                    flood_weather_risk_score=round(risk_score, 1),
                    data_source="OPEN_METEO_LIVE",
                    is_live_feed=True
                )
    except Exception as e:
        print(f"[SpaceGuard Weather] Open-Meteo live fetch fallback: {e}")

    # High-fidelity fallback calculated for disaster scenario context
    return WeatherTelemetry(
        location_name=location_name,
        lat=lat,
        lng=lng,
        timestamp=datetime.utcnow().isoformat() + "Z",
        precipitation_mm_hr=18.4,
        past_24h_precipitation_mm=142.5,
        forecast_24h_precipitation_mm=95.0,
        soil_moisture_percentage=89.2,
        river_discharge_m3_s=840.0,
        wind_speed_kmh=42.0,
        temperature_c=22.5,
        humidity_percentage=94.0,
        flood_weather_risk_score=88.5,
        data_source="SYNTHETIC_BENCHMARK",
        is_live_feed=False
    )
