import sys
import cv2
from pathlib import Path
sys.path.insert(0, r"C:\tata_innovent\ai-engine")

from main import AIEngine

model_path = r"C:\tata_innovent\backend\best.pt"
video_path = r"C:\tata_innovent\backend\best.mp4"

print("Initializing AI Engine...")
engine = AIEngine(model_path=model_path)

cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("❌ Could not open video.")
    exit()

frame_no = 0
found = False

print("\nStarting video processing via AI Engine...\n")
while True:
    ret, frame = cap.read()
    
    if not ret:
        break
        
    frame_no += 1
    
    result = engine.analyze_frame(frame)
    fc = result.get('FrameCommand', {})
    
    count = fc.get('DetectionCount', 0)
    if count > 0:
        print(f"\n========== Frame {frame_no} ==========")
        print(f"DetectionCount: {count}")
        print(f"DriveMode: {fc.get('DriveMode')}")
        print(f"Terrain: {fc.get('Terrain')}")
        print(f"Detections: {fc.get('Detections')}")
        found = True
        break
        
print(f"Total processed: {frame_no}, found={found}")
cap.release()

cap.release()
cv2.destroyAllWindows()

print("Finished")