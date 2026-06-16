#!/usr/bin/env python3
"""
OUROBOROS-∞ | SINGULARITY DAEMON (v2.0)
----------------------------------------
SYS_ID: OUROBOROS_INFINITY_L5_ACTIVE
STATE: C5-REAL
AESTHETIC: INDUSTRIAL_NOIR_2026

Description: Autonomous entropy scanner and structural mutator.
Phase 2: Transitioned from passive Observability to Active Autopoiesis.
The daemon now applies physical corrections (Linting, Purging, Rollbacks)
when thermodynamic thresholds are breached.
"""

import os
import math
import json
import time
import subprocess
from datetime import datetime, timezone

class OuroborosDaemon:
    def __init__(self, target_dir):
        self.target_dir = target_dir
        self.MAX_LINES_PER_FILE = 400

    def scan_entropy(self):
        total_files = 0
        total_lines = 0
        high_entropy_files = []

        print(f"[OUROBOROS-∞] Iniciando escaneo topológico L5 en: {self.target_dir}")
        time.sleep(0.5)

        for root, _, files in os.walk(self.target_dir):
            if any(ignore in root for ignore in ['.git', '.gemini', 'node_modules', 'venv', '.venv']):
                continue
            
            for file in files:
                if file.endswith(('.py', '.js', '.ts', '.rs', '.md')):
                    filepath = os.path.join(root, file)
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            lines = f.readlines()
                            line_count = len(lines)
                            total_files += 1
                            total_lines += line_count
                            
                            if line_count > self.MAX_LINES_PER_FILE:
                                high_entropy_files.append({
                                    "file": filepath,
                                    "lines": line_count,
                                    "status": "CRITICAL_BLOAT"
                                })
                    except Exception:
                        pass 

        return self.generate_report(total_files, total_lines, high_entropy_files)

    def generate_report(self, files, lines, high_entropy_files):
        degradation_level = (len(high_entropy_files) / max(files, 1)) * 100
        
        status = "SOBERANO"
        if degradation_level > 5: status = "DERIVA"
        if degradation_level > 15: status = "DECADENCIA"
        if degradation_level > 30: status = "COLAPSO"

        report = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metrics": {
                "structural_degradation_pct": round(degradation_level, 2),
                "system_status": status
            },
            "vectors_of_anergy": high_entropy_files
        }
        
        print(f"[OUROBOROS-∞] Estado de Entropía Estructural: {status} ({round(degradation_level, 2)}%)")
        self.trigger_autopoiesis(status, high_entropy_files)
        
        return report

    def trigger_autopoiesis(self, status, anergy_vectors):
        """Phase 2: Active execution against entropy."""
        if status == "SOBERANO":
            print("[OUROBOROS-∞] Sistema estabilizado. No se requiere mutación.")
            return

        print(f"\n[OUROBOROS-∞] ALERTA DE DEGRADACIÓN ({status}). INICIANDO AUTOPOIESIS...")
        
        for vector in anergy_vectors:
            filepath = vector["file"]
            print(f"[!] Target aisado: {filepath}")
            
            if status == "DERIVA":
                # L1 Healing: Auto-format to reduce syntax entropy
                print(f"    > Ejecutando purga sintáctica (Formateo C5)...")
                # Using dummy echo for safety in this demonstration, but logically this is the trigger.
                subprocess.run(["echo", f"Aplicando formateo estricto a {filepath}"])
                
            elif status in ["DECADENCIA", "COLAPSO"]:
                # L3 Healing: Genetic Rollback
                print(f"    > Entropía crítica superada. Iniciando Rollback Genético...")
                print(f"    > Revertiendo masa de código a su último estado estable en Git.")
                subprocess.run(["git", "checkout", "HEAD", "--", filepath], cwd=self.target_dir)
                print(f"    > {filepath} purgado y restaurado al Ledger inmutable.")

if __name__ == "__main__":
    target = os.getcwd()
    daemon = OuroborosDaemon(target)
    report = daemon.scan_entropy()
    
    os.makedirs(".cortex/ouroboros", exist_ok=True)
    log_path = f".cortex/ouroboros/entropy_scan_{int(time.time())}.json"
    with open(log_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n[OUROBOROS-∞] Mutación estructural completada. Telemetría cristalizada en: {log_path}")
