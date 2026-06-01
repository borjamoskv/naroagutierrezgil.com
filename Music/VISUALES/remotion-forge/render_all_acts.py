import subprocess
import time
import os

acts = [
    {"id": "GonIntervaloProhibido", "out": "out/acto1.mp4", "concurrency": 1},
    {"id": "GonIntervaloProhibidoActo2", "out": "out/acto2.mp4", "concurrency": 1},
    {"id": "GonIntervaloProhibidoActo3", "out": "out/acto3.mp4", "concurrency": 1},
    {"id": "GonPantojaRap", "out": "out/rap_battle.mp4", "concurrency": 2},
    {"id": "LaundryOrgy", "out": "out/laundry.mp4", "concurrency": 4},
    {"id": "Acto4PazChiquito", "out": "out/acto4.mp4", "concurrency": 4},
    {"id": "Acto4-5Maletin", "out": "out/acto4_5_maletin.mp4", "concurrency": 4},
    {"id": "Acto5FitoConcert", "out": "out/acto5.mp4", "concurrency": 4},
    {"id": "Acto6Rayohead", "out": "out/acto6.mp4", "concurrency": 4},
    {"id": "Acto7Pirri", "out": "out/acto7_pirri.mp4", "concurrency": 4},
    {"id": "Acto8Torneo", "out": "out/acto8_torneo.mp4", "concurrency": 4},
    {"id": "Acto9Recreativas", "out": "out/acto9_recreativas.mp4", "concurrency": 4},
    {"id": "Acto10Flashback", "out": "out/acto10_flashback.mp4", "concurrency": 4},
    {"id": "Epilogo", "out": "out/epilogo.mp4", "concurrency": 4},
    {"id": "Acto11Podcast", "out": "out/acto11_podcast.mp4", "concurrency": 4},
    {"id": "Acto12Marmol", "out": "out/acto12_marmol.mp4", "concurrency": 4}
]

os.makedirs("out", exist_ok=True)

print("Step 1: Bundling the project to ensure the latest changes are included...")
bundle_cmd = ["npx", "remotion", "bundle", "src/index.ts", "build"]
subprocess.run(bundle_cmd, check=True)
print("Bundling complete.")

print("\nStep 2: Starting render sequence for ALL Acts...")

for act in acts:
    if os.path.exists(act["out"]):
        print(f"\nSkipping {act['id']} because {act['out']} already exists.")
        continue

    print(f"\n==========================================")
    print(f"RENDERING FROM BUNDLE: {act['id']} -> {act['out']} (concurrency={act['concurrency']})")
    print(f"==========================================")
    
    start_time = time.time()
    
    cmd = [
        "npx", "remotion", "render",
        "build",
        act["id"],
        act["out"],
        f"--concurrency={act['concurrency']}",
        "--timeout-in-milliseconds=120000",
        "--chromium-flags=--no-sandbox --disable-setuid-sandbox --disable-gpu --disable-dev-shm-usage"
    ]
    
    subprocess.run(cmd, check=True)
    
    elapsed = time.time() - start_time
    print(f"FINISHED {act['id']} in {elapsed:.2f} seconds.")
    # Brief pause to let port and chromium resources clean up
    time.sleep(2)

print("\nALL RENDER COMMANDS COMPLETED SUCCESSFULLY!")
