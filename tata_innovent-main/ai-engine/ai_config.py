"""
Configuration module for AI Engine
"""

from dataclasses import dataclass
from pathlib import Path


# ---------------------------------------------------------
# Project Paths
# ---------------------------------------------------------

AI_ENGINE_DIR = Path(__file__).resolve().parent

# Default model bundled with the AI Engine.
# This can later be changed to the trained custom terrain model.
DEFAULT_MODEL_PATH = AI_ENGINE_DIR / "yolov8n.pt"


@dataclass
class TerrainConfig:
    """Configuration for terrain types and their detection parameters"""

    TERRAIN_TYPES = [
        "Pothole",
        "Rock",
        "Mud",
        "Gravel"
    ]

    MODEL_CLASS_MAP = {
        "pothole": "Pothole",
        "gravel": "Gravel",
        "sand": "Mud",
        "wood_logs": "Rock",
        "wood logs": "Rock"
    }

    # Confidence thresholds for each terrain type
    CONFIDENCE_THRESHOLDS = {
        "Pothole": 0.20,
        "Rock": 0.20,
        "Mud": 0.20,
        "Gravel": 0.20
    }

    # Severity levels for each terrain
    SEVERITY_LEVELS = {
        "Pothole": {
            "min": 60.0,
            "max": 100.0,
            "level": "Critical"
        },
        "Rock": {
            "min": 30.0,
            "max": 70.0,
            "level": "High"
        },
        "Mud": {
            "min": 40.0,
            "max": 80.0,
            "level": "High"
        },
        "Gravel": {
            "min": 25.0,
            "max": 65.0,
            "level": "Medium"
        }
    }


@dataclass
class ModelConfig:
    """Model-related configuration"""

    # Existing default model.
    # This is resolved relative to ai_config.py, so the
    # application does not depend on the terminal's current path.
    MODEL_NAME = str(DEFAULT_MODEL_PATH)

    CONFIDENCE_THRESHOLD = 0.20
    IOU_THRESHOLD = 0.45
    IMAGE_SIZE = 640

    # CPU is currently used because PyTorch installed in the
    # current environment is the CPU build.
    DEVICE = "cpu"


@dataclass
class ProcessingConfig:
    """Configuration for video/frame processing"""

    FRAME_EXTRACTION_RATE = 10
    MAX_FRAMES_PER_VIDEO = 300
    OUTPUT_IMAGE_SIZE = (640, 480)
    VIDEO_EXTENSIONS = [
        ".mp4",
        ".avi",
        ".mov",
        ".mkv"
    ]


@dataclass
class DecisionConfig:
    """Configuration for decision engine"""

    # Drive modes based on severity
    DRIVE_MODES = {
        "Safe": {
            "min_speed": 40,
            "max_speed": 100,
            "ride_height": "Normal"
        },
        "Cautious": {
            "min_speed": 20,
            "max_speed": 50,
            "ride_height": "Normal"
        },
        "Offroad": {
            "min_speed": 10,
            "max_speed": 40,
            "ride_height": "High"
        },
        "Critical": {
            "min_speed": 0,
            "max_speed": 15,
            "ride_height": "Maximum"
        }
    }

    # Risk level thresholds
    RISK_LEVELS = {
        "Low": (0, 25),
        "Medium": (25, 50),
        "High": (50, 75),
        "Critical": (75, 100)
    }


# ---------------------------------------------------------
# Global configuration
# ---------------------------------------------------------

TERRAIN_CONFIG = TerrainConfig()
MODEL_CONFIG = ModelConfig()
PROCESSING_CONFIG = ProcessingConfig()
DECISION_CONFIG = DecisionConfig()