"""
Detector registry and manager for SpaceGuard.
Allows dynamic plug-and-play of new disaster models.
"""
from typing import Dict, List, Any
from backend.detectors.base import BaseDisasterDetector
from backend.detectors.flood import FloodDetector
from backend.detectors.wildfire import WildfireDetector
from backend.detectors.cyclone import CycloneDetector
from backend.models.schemas import ScanRequest, DetectionResult

class DetectorManager:
    """
    Central registry managing disaster detection engines.
    """
    def __init__(self):
        self._detectors: Dict[str, BaseDisasterDetector] = {}
        # Register default operational models
        self.register(FloodDetector())
        self.register(WildfireDetector())
        self.register(CycloneDetector())

    def register(self, detector: BaseDisasterDetector):
        self._detectors[detector.hazard_type] = detector

    def get_detector(self, hazard_type: str) -> BaseDisasterDetector:
        if hazard_type not in self._detectors:
            # Fallback to flood if unknown
            return self._detectors["flood"]
        return self._detectors[hazard_type]

    def list_available_detectors(self) -> List[Dict[str, Any]]:
        return [
            {
                "hazard_type": k,
                "metadata": v.model_metadata
            }
            for k, v in self._detectors.items()
        ]

    async def run_detection(self, request: ScanRequest) -> DetectionResult:
        detector = self.get_detector(request.hazard_type)
        return await detector.analyze(request)

# Singleton instance
detector_manager = DetectorManager()
