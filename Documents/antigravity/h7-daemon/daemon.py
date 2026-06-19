import time
import os
from watchdog.observers import Observer
from watcher import H7Handler
from engine import RulesEngine

def main():
    print("# C5-REAL: Inicializando H7 Daemon...")
    engine = RulesEngine('rules.yaml')
    
    # Target directory to watch
    watch_path = os.path.expanduser("~/Desktop")
    if not os.path.exists(watch_path):
        print(f"Warning: {watch_path} no existe.")
        return

    event_handler = H7Handler(engine)
    observer = Observer()
    observer.schedule(event_handler, watch_path, recursive=False)
    observer.start()
    
    print(f"H7 activo. Monitoreando: {watch_path} | Feedback: OSC (Audio)")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\nH7: Terminación manual.")
    observer.join()

if __name__ == "__main__":
    main()
