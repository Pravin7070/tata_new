import cv2
import time
import threading
import asyncio
import json
from .terrain_service import process
from app.websocket.ws import manager
from .state_manager import update
from app.database.database import SessionLocal
from app.models.models import AnalysisResult

class RealtimeManager:
    def __init__(self, source=0, fps=15, save_interval=10):
        self.source = source
        self.fps = fps
        self.cap = None
        self.running = False
        self.frame_count = 0
        self.save_interval = save_interval
        self._lock = threading.Lock()
        self._thread = None

    def start(self, source=None):
        if source is not None:
            self.source = source

        if self.running:
            return True

        self.frame_count = 0
        print(f"RealtimeManager: Opening source {self.source}")
        self.cap = cv2.VideoCapture(self.source)
        if not self.cap.isOpened():
            print(f"RealtimeManager: Failed to open source {self.source}")
            self.running = False
            return False

        self.running = True
        return True

    def start_background(self):
        if self._thread and self._thread.is_alive():
            print("RealtimeManager: Thread is already alive.")
            return

        print("RealtimeManager: Starting background thread.")
        self._thread = threading.Thread(target=self.run, daemon=True)
        self._thread.start()

    def stop(self):
        with self._lock:
            if self.cap and self.cap.isOpened():
                self.cap.release()
            self.running = False

    def _persist_detection(self, detection):
        try:
            db = SessionLocal()
            record = AnalysisResult(video_id=0, result_data=detection)
            db.add(record)
            db.commit()
            db.close()
        except Exception:
            pass

    def run(self):
        if not self.cap or not self.cap.isOpened():
            if not self.start():
                return

        while self.running:
            ret, frame = self.cap.read()
            if not ret:
                print(f"Failed to read frame from cap, ret={ret}.")
                # If using live camera (source 0 or digit), stop the loop
                if str(self.source).isdigit():
                    print("Camera source ended or failed, stopping processing loop.")
                    self.running = False
                    break
                else:
                    print("Restarting video.")
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue

            if self.frame_count % 15 == 0:
                print(f"Processing frame {self.frame_count} from {self.source}")

            detection = process(frame)
            update({
                'timestamp': time.time(),
                'frame_shape': frame.shape,
                'detections': detection,
            })

            # Print raw detection for debugging (Step 1 requested by user)
            print(f"Raw detection from process(frame): {detection}")

            # RealtimeManager should become only a bridge.
            telemetry = {
                "type": "telemetry",
                "frame": self.frame_count,
                "timestamp": round(time.time(), 2),
                "terrain": "WAITING FOR AI",
                "confidence": None,
                "severity": "N/A",
                "suspension": "N/A",
                "drive_mode": "N/A",
                "target_speed": None,
                "alert": None,
                "animation": None,
                "detections": []
            }

            if isinstance(detection, dict) and "FrameCommand" in detection:
                fc = detection["FrameCommand"]
                
                formatted_detections = []
                for det in fc.get("Detections", []):
                    bbox = det.get('BoundingBox', {})
                    formatted_bbox = {}
                    if bbox and frame.shape[1] > 0 and frame.shape[0] > 0:
                        formatted_bbox = {
                            "x": bbox.get('x', 0) / frame.shape[1],
                            "y": bbox.get('y', 0) / frame.shape[0],
                            "w": bbox.get('width', 0) / frame.shape[1],
                            "h": bbox.get('height', 0) / frame.shape[0]
                        }
                    formatted_detections.append({
                        "class": det.get("Terrain", "Object"),
                        "confidence": det.get("Confidence", 0.0),
                        "severity": det.get("Severity", 0.0),
                        "bbox": formatted_bbox
                    })

                # Retrieve confidence of primary threat if available
                primary_threat = fc.get("PrimaryThreat")
                best_confidence = None
                if primary_threat:
                    primary_dets = [d for d in formatted_detections if d["class"] == primary_threat]
                    if primary_dets:
                        best_confidence = max(d["confidence"] for d in primary_dets)
                
                telemetry.update({
                    "frame": fc.get("FrameNumber", self.frame_count),
                    "terrain": primary_threat or ("NO TERRAIN DETECTED" if not formatted_detections else "WAITING FOR AI"),
                    "confidence": best_confidence,
                    "severity": fc.get("ThreatLevel", "N/A"),
                    "suspension": fc.get("RideHeight", "N/A"),
                    "drive_mode": fc.get("DriveMode", "N/A"),
                    "target_speed": fc.get("RecommendedSpeed"),
                    "alert": fc.get("SteeringRecommendation"),
                    "animation": fc.get("Animation"),
                    "detections": formatted_detections
                })
            elif isinstance(detection, list) and len(detection) > 0:
                # Fallback if raw YOLO result dict is returned
                best_det = detection[0]
                if isinstance(best_det, dict) and 'name' in best_det:
                    telemetry["terrain"] = best_det['name']
                    telemetry["confidence"] = float(best_det.get('confidence', best_det.get('conf', 0.0)))
                    
                formatted_detections = []
                for det in detection:
                    if isinstance(det, dict) and 'box' in det and frame.shape[1] > 0 and frame.shape[0] > 0:
                        box = det['box']
                        formatted_detections.append({
                            "class": det.get("name", "Object"),
                            "confidence": float(det.get("confidence", det.get("conf", 0.0))),
                            "severity": "Unknown",
                            "bbox": {
                                "x": box.get('x1', 0) / frame.shape[1],
                                "y": box.get('y1', 0) / frame.shape[0],
                                "w": (box.get('x2', 0) - box.get('x1', 0)) / frame.shape[1],
                                "h": (box.get('y2', 0) - box.get('y1', 0)) / frame.shape[0]
                            }
                        })
                telemetry["detections"] = formatted_detections
            elif isinstance(detection, list):
                telemetry["terrain"] = "NO TERRAIN DETECTED"

            try:
                if hasattr(self, 'loop') and self.loop:
                    asyncio.run_coroutine_threadsafe(manager.broadcast(json.dumps(telemetry)), self.loop)
                else:
                    asyncio.run(manager.broadcast(json.dumps(telemetry)))
            except Exception as e:
                print(f"RealtimeManager Broadcast Error: {e}")

            self.frame_count += 1
            if self.frame_count % self.save_interval == 0 and detection:
                self._persist_detection(detection)

            time.sleep(1.0 / self.fps)
