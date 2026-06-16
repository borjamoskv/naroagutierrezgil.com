#!/bin/bash
# C5-REAL
# TARGET: NOTCH_LED
# OP: INT_HW_PY3_GREEN

echo "[MAC-CONTROL-Ω] STATE: INITIATE_BEACON"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/notch_beacon.py" --duration 0.05

echo "[MAC-CONTROL-Ω] STATE: BEACON_TERMINATED"
