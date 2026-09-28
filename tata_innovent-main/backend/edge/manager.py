from .realtime_manager import RealtimeManager
from .state_manager import update_status

edge_manager = RealtimeManager()


import asyncio

def start_edge(source=0) -> bool:
    print(f"start_edge called with source: {source}")
    try:
        edge_manager.loop = asyncio.get_running_loop()
    except Exception as e:
        print(f"Could not get running loop: {e}")
        
    if edge_manager.running:
        print("Stopping existing edge_manager...")
        edge_manager.stop()

    edge_manager.source = source
    started = edge_manager.start()
    print(f"edge_manager.start() returned {started}")
    if not started:
        update_status(False)
        return False

    print("Calling start_background...")
    edge_manager.start_background()
    update_status(True)
    return True


def stop_edge():
    if edge_manager.running:
        edge_manager.stop()
    update_status(False)
