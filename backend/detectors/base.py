"""
Base interface and contract for all SpaceGuard disaster detection models.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any
from backend.models.schemas import DetectionResult, ScanRequest

class BaseDisasterDetector(ABC):
    """
    Abstract interface for AI/Spectral hazard detectors.
    Allows SpaceGuard to plug in Flood, Wildfire, Cyclone, or custom ML models interchangeably.
    """
    
    @property
    @abstractmethod
    def hazard_type(self) -> str:
        """Returns the hazard type identifier (e.g. 'flood', 'wildfire', 'cyclone')"""
        pass

    @property
    @abstractmethod
    def model_metadata(self) -> Dict[str, Any]:
        """Returns model version, architecture, spectral bands used, and calibration info"""
        pass

    @abstractmethod
    async def analyze(self, request: ScanRequest) -> DetectionResult:
        """
        Executes the detection pipeline on satellite data or coordinate bounding box.
        Returns full DetectionResult with GeoJSON masks, risk scores, and telemetry.
        """
        pass
