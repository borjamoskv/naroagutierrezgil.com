#!/bin/bash
set -e
cd /Users/borjafernandezangulo/Music/VISUALES/remotion-forge

echo "Rendering missing acts..."

[ ! -f "out/acto3.mp4" ] && npx remotion render GonIntervaloProhibidoActo3 out/acto3.mp4
[ ! -f "out/rap_battle.mp4" ] && npx remotion render GonPantojaRap out/rap_battle.mp4 --concurrency=2
[ ! -f "out/laundry.mp4" ] && npx remotion render LaundryOrgy out/laundry.mp4
[ ! -f "out/acto4.mp4" ] && npx remotion render Acto4PazChiquito out/acto4.mp4
[ ! -f "out/acto4_5_maletin.mp4" ] && npx remotion render Acto4-5Maletin out/acto4_5_maletin.mp4
[ ! -f "out/acto5.mp4" ] && npx remotion render Acto5FitoConcert out/acto5.mp4
[ ! -f "out/acto6.mp4" ] && npx remotion render Acto6Rayohead out/acto6.mp4
[ ! -f "out/acto8_torneo.mp4" ] && npx remotion render Acto8Torneo out/acto8_torneo.mp4
[ ! -f "out/acto9_recreativas.mp4" ] && npx remotion render Acto9Recreativas out/acto9_recreativas.mp4
[ ! -f "out/acto10_flashback.mp4" ] && npx remotion render Acto10Flashback out/acto10_flashback.mp4
[ ! -f "out/epilogo.mp4" ] && npx remotion render Epilogo out/epilogo.mp4
[ ! -f "out/acto11_podcast.mp4" ] && npx remotion render Acto11Podcast out/acto11_podcast.mp4
[ ! -f "out/acto12_marmol.mp4" ] && npx remotion render Acto12Marmol out/acto12_marmol.mp4

echo "Creating concat list..."
cat << 'LIST' > concat_list.txt
file 'out/acto1.mp4'
file 'out/acto2.mp4'
file 'out/acto3.mp4'
file 'out/rap_battle.mp4'
file 'out/laundry.mp4'
file 'out/acto4.mp4'
file 'out/acto4_5_maletin.mp4'
file 'out/acto5.mp4'
file 'out/acto6.mp4'
file 'out/acto7_pirri.mp4'
file 'out/acto8_torneo.mp4'
file 'out/acto9_recreativas.mp4'
file 'out/acto10_flashback.mp4'
file 'out/epilogo.mp4'
file 'out/acto11_podcast.mp4'
file 'out/acto12_marmol.mp4'
LIST

echo "Concatenating into TODA_LA_PELI_PULP_4K_V3.mp4..."
ffmpeg -y -f concat -safe 0 -i concat_list.txt -c copy TODA_LA_PELI_PULP_4K_V3.mp4
echo "DONE!"
