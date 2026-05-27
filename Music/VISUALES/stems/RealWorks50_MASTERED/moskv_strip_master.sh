#!/bin/bash
# ═══════════════════════════════════════════════════════════
# THE MOSKV STRIP — Sovereign Mastering Engine (x50 Parallel)
# ═══════════════════════════════════════════════════════════
# Chain: EQ Correctiva → Glue Comp → EQ Tonal → Saturación → 
#        Stereo Width → Limiter → Loudness Normalization
# Target: Digital Streaming (-11 LUFS) | -1.0 dBTP
# ═══════════════════════════════════════════════════════════

INPUT_DIR="$HOME/Desktop/RealWorks50_RAW"
OUTPUT_DIR="$HOME/Desktop/RealWorks50_MASTERED"
PARALLEL_WORKERS=50

master_track() {
    local input_file="$1"
    local filename=$(basename "$input_file")
    local output_file="$OUTPUT_DIR/${filename%.*}_MASTERED.flac"
    
    echo "[MOSKV-STRIP] Processing: $filename"
    
    ffmpeg -y -i "$input_file" \
        -af "
            highpass=f=25:poles=2,
            lowpass=f=19500:poles=2,
            equalizer=f=80:t=o:w=1.5:g=2.0,
            equalizer=f=250:t=o:w=2.0:g=-1.5,
            equalizer=f=400:t=o:w=2.0:g=-1.0,
            equalizer=f=2500:t=o:w=1.5:g=1.5,
            equalizer=f=8000:t=o:w=2.0:g=2.0,
            equalizer=f=12000:t=o:w=1.5:g=1.5,
            acompressor=threshold=0.125:ratio=2:attack=30:release=200:makeup=1:knee=6,
            equalizer=f=60:t=o:w=1.0:g=1.0,
            equalizer=f=3000:t=o:w=1.5:g=1.0,
            equalizer=f=10000:t=o:w=2.0:g=1.5,
            acompressor=threshold=0.25:ratio=4:attack=5:release=50:makeup=1:knee=3,
            afftdn=nf=-70,
            stereotools=mlev=1.0:slev=1.08:sbal=0:phase=0,
            alimiter=limit=0.891:level=true:attack=0.5:release=50:asc=true:asc_level=0.8,
            loudnorm=I=-11:LRA=7:TP=-1.0:print_format=summary
        " \
        -sample_fmt s32 \
        -ar 44100 \
        "$output_file" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "[✓ MASTERED] $filename"
    else
        echo "[✗ FAILED] $filename"
    fi
}

export -f master_track
export OUTPUT_DIR

echo "═══════════════════════════════════════════════════════════"
echo "  THE MOSKV STRIP — Sovereign Mastering Engine"
echo "  Workers: $PARALLEL_WORKERS | Target: -11 LUFS / -1.0 dBTP"
echo "═══════════════════════════════════════════════════════════"
echo ""

TRACK_COUNT=$(find "$INPUT_DIR" -name "*.flac" | wc -l | tr -d ' ')
echo "[INIT] Found $TRACK_COUNT tracks to master"
echo "[INIT] Launching $PARALLEL_WORKERS parallel workers..."
echo ""

START_TIME=$(date +%s)

find "$INPUT_DIR" -name "*.flac" -print0 | \
    xargs -0 -P "$PARALLEL_WORKERS" -I {} bash -c 'master_track "$@"' _ {}

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  MASTERING COMPLETE"
echo "  Tracks: $TRACK_COUNT | Time: ${ELAPSED}s | Workers: $PARALLEL_WORKERS"
echo "═══════════════════════════════════════════════════════════"

MASTERED_COUNT=$(find "$OUTPUT_DIR" -name "*_MASTERED.flac" | wc -l | tr -d ' ')
echo "  Output: $OUTPUT_DIR"
echo "  Mastered: $MASTERED_COUNT / $TRACK_COUNT"
echo "═══════════════════════════════════════════════════════════"
