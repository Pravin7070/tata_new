import os
import sys
import importlib.util
from pathlib import Path
from ultralytics import YOLO
import config

class EdgeInference:
    def __init__(self):
        # Resolve the absolute path from config
        model_path = config.MODEL_PATH

        # If model does not exist, YOLO will attempt to download it automatically.
        self.model = YOLO(model_path, task="detect")
        self.running = True
        self.engine = self._load_ai_engine(model_path)

    def _load_ai_engine(self, model_path):
        ai_engine_root = Path(__file__).resolve().parent.parent.parent / "ai-engine"
        main_py_path = ai_engine_root / "main.py"

        if not main_py_path.exists():
            return None

        try:
            added_to_path = False
            ai_engine_str = str(ai_engine_root)
            if ai_engine_str not in sys.path:
                sys.path.append(ai_engine_str)
                added_to_path = True

            spec = importlib.util.spec_from_file_location("edge_ai_engine", str(main_py_path))
            ai_module = importlib.util.module_from_spec(spec)
            
            spec.loader.exec_module(ai_module)
            AIEngine = ai_module.AIEngine

            if added_to_path:
                sys.path.remove(ai_engine_str)
                
            return AIEngine(model_path=model_path)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return None

    def start(self):
        self.running = True

    def stop(self):
        self.running = False

    def infer(self, frame):
        if not self.running:
            return None

        if self.engine:
            try:
                return self.engine.analyze_frame(frame)
            except Exception:
                pass

        results = self.model(frame)
        parsed_detections = []
        
        if len(results) > 0:
            result = results[0]
            if result.boxes is not None:
                for box in result.boxes:
                    cls_id = int(box.cls[0].item())
                    conf = float(box.conf[0].item())
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    
                    class_name = result.names.get(cls_id, f"Unknown_{cls_id}")
                    
                    parsed_detections.append({
                        "name": class_name,
                        "confidence": conf,
                        "box": {
                            "x1": x1,
                            "y1": y1,
                            "x2": x2,
                            "y2": y2
                        }
                    })
        return parsed_detections
