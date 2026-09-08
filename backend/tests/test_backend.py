"""
Unit tests for SPACEGUARD API and detection engines.
"""
import asyncio
from backend.models.schemas import ScanRequest
from backend.detectors.manager import detector_manager
from backend.data.scenarios import BENCHMARK_SCENARIOS

def test_detector_manager_registration():
    detectors = detector_manager.list_available_detectors()
    hazard_types = [d["hazard_type"] for d in detectors]
    assert "flood" in hazard_types
    assert "wildfire" in hazard_types
    assert "cyclone" in hazard_types

def test_flood_detection_pipeline():
    async def _run():
        request = ScanRequest(
            scenario_id=BENCHMARK_SCENARIOS[0].id,
            hazard_type="flood",
            ai_sensitivity=0.85,
            use_live_weather=False
        )
        result = await detector_manager.run_detection(request)
        assert result.hazard_type == "flood"
        assert result.risk_assessment.inundated_area_km2 > 0
        assert len(result.flood_polygons.features) > 0
        assert len(result.processing_pipeline_logs) > 0
        assert result.risk_assessment.infrastructure_summary["hospitals_at_risk"] >= 0
    asyncio.run(_run())

def test_wildfire_detection_pipeline():
    async def _run():
        request = ScanRequest(
            hazard_type="wildfire",
            center_lat=34.05,
            center_lng=-118.25,
            use_live_weather=False
        )
        result = await detector_manager.run_detection(request)
        assert result.hazard_type == "wildfire"
        assert result.risk_assessment.severity_level is not None
    asyncio.run(_run())
