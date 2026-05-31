#!/bin/bash
# C5-REAL INJECTION: TRANSMISIÓN RTMP
# USO: ./transmitir.sh [TU_STREAM_KEY]

if [ -z "$1" ]; then
    echo "ERROR C5: Se requiere Stream Key de YouTube."
    echo "Uso: ./transmitir.sh xxxx-xxxx-xxxx-xxxx-xxxx"
    exit 1
fi

STREAM_KEY=$1
TARGET_FILE="out/El_Ultimo_Solo_de_Gon_Master_V2.mp4"

if [ ! -f "$TARGET_FILE" ]; then
    echo "CRÍTICO: No se encuentra $TARGET_FILE"
    exit 1
fi

echo "[CORTEX-SIM] INICIANDO INYECCIÓN RTMP EN BUCLE INFINITO..."
echo "[CORTEX-SIM] Target: $TARGET_FILE"

# -re = Lee a la velocidad nativa del video
# -stream_loop -1 = Bucle infinito
ffmpeg -re -stream_loop -1 -i "$TARGET_FILE" -c:v copy -c:a copy -f flv "rtmp://global-live.mux.com:5222/app/$STREAM_KEY"
