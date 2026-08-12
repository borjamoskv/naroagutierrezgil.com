import os
import sys
import re
import json
import time
import glob
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor

BASE_DIR = "/Users/borjafernandezangulo/10_PROJECTS/naroagutierrezgil.com/public/images/facebook_albums"
PHOTOS_DIR = os.path.join(BASE_DIR, "photos")
CATALOG_FILE = os.path.join(BASE_DIR, "catalog.json")

os.makedirs(PHOTOS_DIR, exist_ok=True)

# List of known target album URLs and photo streams
TARGET_URLS = [
    "https://www.facebook.com/naroa.gg/photos_albums",
    "https://www.facebook.com/naroa.gg/photos",
    "https://www.facebook.com/naroa.gg/photos_by",
    "https://www.facebook.com/naroa.gg/photos_of",
    "https://www.facebook.com/media/set/?set=a.484427777066&type=3",
    "https://www.facebook.com/media/set/?set=a.10151623817592067&type=3",
    "https://www.facebook.com/media/set/?set=a.10150098036687067&type=3",
    "https://www.facebook.com/media/set/?set=a.486537392066&type=3",
    "https://www.facebook.com/media/set/?set=a.10156672476487067&type=3",
    "https://www.facebook.com/media/set/?set=a.10150886285742067&type=3",
    "https://www.facebook.com/media/set/?set=a.10156630228197067&type=3",
    "https://www.facebook.com/media/set/?set=a.10154034660647067&type=3",
    "https://www.facebook.com/photo/?fbid=10162323770827067&set=a.484427777066&setextract",
    "https://www.facebook.com/photo/?fbid=10166439568202067&set=a.10151623817592067&setextract",
    "https://www.facebook.com/photo/?fbid=10160297482422067&set=a.10150098036687067&setextract",
    "https://www.facebook.com/photo/?fbid=486540862066&set=a.486537392066&setextract",
    "https://www.facebook.com/photo/?fbid=10156672495862067&set=a.10156672476487067&setextract",
    "https://www.facebook.com/photo/?fbid=10156636704362067&set=a.10150886285742067&setextract",
    "https://www.facebook.com/photo/?fbid=10156630228222067&set=a.10156630228197067&setextract",
    "https://www.facebook.com/photo/?fbid=10154034661507067&set=a.10154034660647067&setextract"
]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
]

def download_url_worker(idx, url):
    ua = USER_AGENTS[idx % len(USER_AGENTS)]
    print(f"[*] [Worker-{idx}] Iniciando descarga de: {url}", flush=True)
    cmd = [
        "gallery-dl",
        "--directory", PHOTOS_DIR,
        "--user-agent", ua,
        "--retries", "5",
        "--sleep", "1",
        url
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        print(f"[✓] [Worker-{idx}] Finalizado para: {url}", flush=True)
        return res.stdout
    except Exception as e:
        print(f"[!] [Worker-{idx}] Error en {url}: {e}", flush=True)
        return str(e)

def generate_catalog():
    print("[*] Consolidando catálogo e imágenes...", flush=True)
    images = glob.glob(os.path.join(BASE_DIR, "**", "*.jpg"), recursive=True)
    catalog = []
    seen = set()

    for path in sorted(images):
        fname = os.path.basename(path)
        if fname in seen:
            continue
        seen.add(fname)

        # Move to PHOTOS_DIR if in subfolder
        dest_path = os.path.join(PHOTOS_DIR, fname)
        if path != dest_path:
            shutil.move(path, dest_path)

        size_kb = round(os.path.getsize(dest_path) / 1024, 2)
        rel_url = f"/images/facebook_albums/photos/{fname}"
        catalog.append({
            "id": fname.replace(".jpg", ""),
            "filename": fname,
            "url": rel_url,
            "size_kb": size_kb
        })

    with open(CATALOG_FILE, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    print(f"[✓] Catálogo generado con éxito: {len(catalog)} imágenes registradas en {CATALOG_FILE}", flush=True)
    return catalog

if __name__ == "__main__":
    print(f"[*] Arrancando Motor Multi-Hilo Avanzado (Workers: {len(TARGET_URLS)})...", flush=True)
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(download_url_worker, i, u) for i, u in enumerate(TARGET_URLS)]
        for f in futures:
            f.result()

    catalog = generate_catalog()
    print(f"[✓] PROCESO COMPLETADO. Total imágenes en catálogo: {len(catalog)}")
