import sys
from pathlib import Path
ai_engine_root = Path("C:/tata_innovent/ai-engine")
sys.path.append(str(ai_engine_root))

try:
    from main import AIEngine
    engine = AIEngine(model_path="C:/tata_innovent/backend/best.pt")
    print("Success")
except Exception as e:
    import traceback
    traceback.print_exc()
