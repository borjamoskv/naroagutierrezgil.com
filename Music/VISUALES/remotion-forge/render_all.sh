#!/bin/bash
set -e
echo "Starting rendering sequence for GON video visualizers (Acts 1, 2, and 3) with Concurrency=1 (Max Stable Exergy)..."

mkdir -p out

echo "Rendering Act 1..."
npx remotion render GonIntervaloProhibido out/acto1.mp4 --concurrency=1 --chromium-flags="--no-sandbox --disable-setuid-sandbox --disable-gpu"

echo "Rendering Act 2..."
npx remotion render GonIntervaloProhibidoActo2 out/acto2.mp4 --concurrency=1 --chromium-flags="--no-sandbox --disable-setuid-sandbox --disable-gpu"

echo "Rendering Act 3..."
npx remotion render GonIntervaloProhibidoActo3 out/acto3.mp4 --concurrency=1 --chromium-flags="--no-sandbox --disable-setuid-sandbox --disable-gpu"

echo "All rendering tasks completed successfully!"
