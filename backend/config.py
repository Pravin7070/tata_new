import os
from pathlib import Path

# Base directory for the backend
BASE_DIR = Path(__file__).resolve().parent

# Model configuration
MODEL_PATH = str(BASE_DIR / "best.onnx")
MODEL_DEVICE = "cpu"
CONFIDENCE_THRESHOLD = 0.45
