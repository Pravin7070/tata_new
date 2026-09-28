import os
import sys
import numpy as np

# Adjust sys.path to run properly
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from edge.edge_inference import EdgeInference
from edge.realtime_manager import RealtimeManager
import cv2

# We'll create a mock model class to inject into EdgeInference or just test AIEngine
from edge.terrain_service import engine

print("Testing AIEngine logic directly...")
ai_engine = engine.engine

if not ai_engine:
    print("AIEngine failed to load.")
    sys.exit(1)

print("AIEngine loaded successfully.")

# Mock detection outputs for YOLO
class MockBoxes:
    def __init__(self, cls_id, conf, xyxy):
        self.cls = np.array([cls_id])
        self.conf = np.array([conf])
        self.xyxy = np.array([xyxy])
    def __len__(self):
        return 1

class MockResult:
    def __init__(self, boxes, names):
        self.boxes = boxes
        self.names = names

class MockModel:
    def __init__(self, names):
        self.names = names
        
    def __call__(self, frame, conf, iou, imgsz, verbose=False):
        return self.results
        
    def set_results(self, cls_id, conf, xyxy):
        boxes = MockBoxes(cls_id, conf, xyxy)
        result = MockResult(boxes, self.names)
        self.results = [result]

# Replace the internal YOLO model
mock_names = {
    0: "pothole",
    1: "gravel",
    2: "sand",
    3: "wood_logs"
}
mock_model = MockModel(mock_names)
ai_engine.pipeline.detector.model = mock_model

test_cases = [
    (0, "Pothole"),
    (1, "Gravel"),
    (2, "Mud"),
    (3, "Rock")
]

frame = np.zeros((480, 640, 3), dtype=np.uint8)

for cls_id, expected_terrain in test_cases:
    print(f"\n--- Testing class ID {cls_id} -> Expected Terrain {expected_terrain} ---")
    mock_model.set_results(cls_id, 0.95, [100, 100, 200, 200])
    
    # Process frame
    result = ai_engine.analyze_frame(frame, current_speed=60)
    
    if "status" in result and result["status"] == "error":
        print(f"Error: {result['message']}")
        continue
        
    fc = result.get("FrameCommand", {})
    
    print(f"Terrain: {fc.get('Terrain')}")
    print(f"Drive Mode: {fc.get('DriveMode')}")
    print(f"Suspension/RideHeight: {fc.get('RideHeight')}")
    print(f"Speed: {fc.get('RecommendedSpeed')}")
    print(f"Animation: {fc.get('Animation')}")
    
print("\nTests completed.")
