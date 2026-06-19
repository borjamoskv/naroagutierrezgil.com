import os
import time
from watchdog.events import FileSystemEventHandler

class H7Handler(FileSystemEventHandler):
    def __init__(self, engine, debounce_ms=500):
        self.engine = engine
        self.debounce_ms = debounce_ms
        self.last_event = {}

    def on_created(self, event):
        if event.is_directory:
            return
        self._process(event.src_path)

    def on_modified(self, event):
        if event.is_directory:
            return
        self._process(event.src_path)

    def on_moved(self, event):
        if event.is_directory:
            return
        self._process(event.dest_path)

    def _process(self, filepath):
        filename = os.path.basename(filepath)
        # Excluir entropia y lock files
        if filename.startswith('.') or filename.endswith('.tmp') or filename.endswith('.download'):
            return

        now = time.time()
        # Debounce para evitar triggers múltiples del OS
        if filepath in self.last_event and (now - self.last_event[filepath]) < (self.debounce_ms / 1000.0):
            return
        self.last_event[filepath] = now
        
        # Micro-sleep para evitar File In Use
        time.sleep(0.5) 
        if os.path.exists(filepath):
            self.engine.evaluate(filepath)
