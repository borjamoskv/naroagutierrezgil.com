import os
import sys
import subprocess
from concurrent.futures import ThreadPoolExecutor

urls = [
    "https://www.facebook.com/media/set/?set=a.484427777066&type=3",
    "https://www.facebook.com/media/set/?set=a.10151623817592067&type=3",
    "https://www.facebook.com/media/set/?set=a.10150098036687067&type=3",
    "https://www.facebook.com/media/set/?set=a.486537392066&type=3",
    "https://www.facebook.com/media/set/?set=a.10156672476487067&type=3",
    "https://www.facebook.com/media/set/?set=a.10150886285742067&type=3",
    "https://www.facebook.com/media/set/?set=a.10156630228197067&type=3",
    "https://www.facebook.com/media/set/?set=a.10154034660647067&type=3",
    "https://www.facebook.com/naroa.gg/photos",
    "https://www.facebook.com/naroa.gg/photos_by",
    "https://www.facebook.com/naroa.gg/photos_of"
]

out_dir = "/Users/borjafernandezangulo/10_PROJECTS/naroagutierrezgil.com/public/images/facebook_albums/{category}/{album_id}"

def download_target(url):
    print(f"[+] Launching worker for {url}...", flush=True)
    cmd = [
        "gallery-dl",
        "--directory", out_dir,
        "--write-metadata",
        url
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    print(f"[✓] Worker finished for {url}", flush=True)
    return res.stdout

if __name__ == "__main__":
    print(f"[*] Starting multi-threaded parallel download workers (Pool size: 10)...", flush=True)
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(download_target, u) for u in urls]
        for f in futures:
            f.result()
    print("[✓] ALL PARALLEL DOWNLOAD WORKERS COMPLETED.", flush=True)
