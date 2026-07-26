#!/usr/bin/env python3
"""Pipeline de assets para la experiencia 'capitulos' de naroa.online.

- Copia/procesa 10 imagenes desde ~/Downloads a public/capitulos/img/
- Si lado mayor < 1200px: upscale 2x Lanczos
  (JPEGs pequenos: antes, MedianFilter(3) mezclado al 40% para no amplificar artefactos)
- Tras el resize: UnsharpMask(radius=1.4, percent=55, threshold=3)
- Salida: webp q92 method=6 con slug limpio + placeholder blur- ~24px webp q40
- Color dominante: media reduciendo a 1x1
- Emite manifest parcial JSON (descripcion/focalPoint se completan tras inspeccion visual)
"""
import json
import os
from PIL import Image, ImageFilter

SRC = "/Users/borjafernandezangulo/Downloads"
DST = "/Users/borjafernandezangulo/10_PROJECTS/naroa.online/public/capitulos/img"
MANIFEST_PARTIAL = "/Users/borjafernandezangulo/10_PROJECTS/naroa.online/public/capitulos/manifest.partial.json"

JOBS = [
    ("1.jpg", "obra-1"),
    ("13.jpg", "obra-13"),
    ("amor-en-conserva-CMHRIKXx.webp", "amor-en-conserva"),
    ("audrey-hepburn-DbIBTtIp.webp", "audrey"),
    ("autoretrato.jpeg", "autoretrato"),
    ("baroque-farrokh-mjg4ClA9.webp", "baroque-farrokh"),
    ("cantin.jpeg", "cantinflas"),
    ("divinos-amy-Celol3XJ.webp", "amy"),
    ("divinos-johnny-gl9M1ZKj.webp", "johnny"),
    ("divinos-marilyn-By8KYPMI.webp", "marilyn"),
]

MIN_SIDE = 1200
BLUR_SIDE = 24

os.makedirs(DST, exist_ok=True)
entries = []

for filename, slug in JOBS:
    src_path = os.path.join(SRC, filename)
    img = Image.open(src_path)
    src_format = (img.format or "").upper()
    img = img.convert("RGB")
    ow, oh = img.size
    largest = max(ow, oh)

    upscaled = False
    median_softened = False
    if largest < MIN_SIDE:
        # JPEGs pequenos: mediana 3 mezclada 40% ANTES del upscale
        if src_format in ("JPEG", "JPG"):
            img = Image.blend(img, img.filter(ImageFilter.MedianFilter(3)), 0.4)
            median_softened = True
        img = img.resize((ow * 2, oh * 2), Image.LANCZOS)
        upscaled = True
        # Unsharp suave tras el resize
        img = img.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=3))

    w, h = img.size

    out_name = f"{slug}.webp"
    out_path = os.path.join(DST, out_name)
    img.save(out_path, "WEBP", quality=92, method=6)

    # Placeholder difuso ~24px
    scale = BLUR_SIDE / max(w, h)
    bw = max(1, round(w * scale))
    bh = max(1, round(h * scale))
    blur = img.resize((bw, bh), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.8))
    blur_name = f"blur-{slug}.webp"
    blur_path = os.path.join(DST, blur_name)
    blur.save(blur_path, "WEBP", quality=40, method=6)

    # Color dominante (media 1x1)
    r, g, b = img.resize((1, 1), Image.LANCZOS).getpixel((0, 0))
    dominant = f"#{r:02x}{g:02x}{b:02x}"

    entries.append({
        "slug": slug,
        "file": f"img/{out_name}",
        "blur": f"img/{blur_name}",
        "w": w,
        "h": h,
        "dominantColor": dominant,
        "_src": filename,
        "_srcFormat": src_format,
        "_origWxH": f"{ow}x{oh}",
        "_upscaled2x": upscaled,
        "_medianBlend40": median_softened,
        "_bytes": os.path.getsize(out_path),
        "_blurBytes": os.path.getsize(blur_path),
    })

with open(MANIFEST_PARTIAL, "w", encoding="utf-8") as f:
    json.dump(entries, f, ensure_ascii=False, indent=2)

for e in entries:
    print(f"{e['slug']:16s} {e['_origWxH']:>11s} -> {e['w']}x{e['h']}  "
          f"up2x={e['_upscaled2x']} med40={e['_medianBlend40']}  "
          f"{e['_bytes']/1024:7.1f} KB  blur={e['_blurBytes']/1024:5.1f} KB  {e['dominantColor']}")
print(f"\nManifest parcial: {MANIFEST_PARTIAL}")
