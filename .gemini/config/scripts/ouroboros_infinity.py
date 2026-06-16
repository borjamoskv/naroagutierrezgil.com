#!/usr/bin/env python3
"""
OUROBOROS-∞ | SINGULARITY DAEMON
---------------------------------
SYS_ID: OUROBOROS_INFINITY_L5
STATE: C5-REAL
AESTHETIC: INDUSTRIAL_NOIR_2026

Description: Autonomous entropy scanner and structural mutator.
This daemon analyzes the filesystem for thermodynamic degradation 
(code bloat, dead files) and triggers C5-REAL alerts.
"""

import os
import math
import json
import time
from datetime import datetime

class OuroborosDaemon:
    def __init__(self, target_dir):
        self.target_dir = target_dir
        self.entropy_log = []
        self.MAX_LINES_PER_FILE = 400

    def calculate_shannon_entropy(self, data):
        """Calculates Shannon entropy of a string (byte level)."""
        if not data:
            return 0
        entropy = 0
        for x in range(256):
            p_x = float(data.count(chr(x))) / len(data)
            if p_x > 0:
                entropy += - p_x * math.log(p_x, 2)
        return entropy

    def scan_entropy(self):
        """Scans the directory for structural entropy."""
        total_files = 0
        total_lines = 0
        high_entropy_files = []

        print(f"[OUROBOROS-∞] Iniciando escaneo topológico en: {self.target_dir}")
        time.sleep(0.5)

        for root, _, files in os.walk(self.target_dir):
            if '.git' in root or '.gemini' in root or 'node_modules' in root:
                continue
            
            for file in files:
                if file.endswith(('.py', '.js', '.ts', '.rs', '.md')):
                    filepath = os.path.join(root, file)
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            content = f.read()
                            lines = content.split('\n')
                            line_count = len(lines)
                            total_files += 1
                            total_lines += line_count
                            
                            # C-01 Metric: Bloat Threshold
                            if line_count > self.MAX_LINES_PER_FILE:
                                high_entropy_files.append({
                                    "file": filepath,
                                    "lines": line_count,
                                    "status": "CRITICAL_BLOAT"
                                })
                    except Exception as e:
                        pass # Ignore binary or unreadable files

        return self.generate_report(total_files, total_lines, high_entropy_files)

    def generate_report(self, files, lines, high_entropy_files):
        """Generates the C5-REAL structural report."""
        degradation_level = (len(high_entropy_files) / max(files, 1)) * 100
        
        status = "SOBERANO"
        if degradation_level > 5: status = "DERIVA"
        if degradation_level > 15: status = "DECADENCIA"
        if degradation_level > 30: status = "COLAPSO"

        report = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "metrics": {
                "total_files": files,
                "total_lines": lines,
                "structural_degradation_pct": round(degradation_level, 2),
                "system_status": status
            },
            "vectors_of_anergy": high_entropy_files
        }
        
        print(f"[OUROBOROS-∞] Estado de Entropía Estructural: {status} ({round(degradation_level, 2)}%)")
        return report

if __name__ == "__main__":
    # Ouroboros starts by scanning the current working directory
    target = os.getcwd()
    daemon = OuroborosDaemon(target)
    report = daemon.scan_entropy()
    
    # Save the mutation log
    os.makedirs(".cortex/ouroboros", exist_ok=True)
    log_path = f".cortex/ouroboros/entropy_scan_{int(time.time())}.json"
    with open(log_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"[OUROBOROS-∞] Reporte de exergía cristalizado en: {log_path}")
    print("[OUROBOROS-∞] Esperando autorización de mutación estructural...")
