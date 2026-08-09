#!/usr/bin/env python3
"""
Pipeline de assets para el carrusel parallax de naroa.online.

- Lee originales de img/src/
- Si lado mayor < 1200px: mediana(3) mezclada 40% (solo JPEGs pequenos)
  -> upscale 2x Lanczos -> UnsharpMask(1.4, 55, 3)
- Guarda webp q92 method=6 con slug limpio en img/
- Genera blur-{slug}.webp (~24px lado mayor, q40)
- Calcula color dominante (median-cut, cluster mas frecuente)
- Escribe manifest.json en la raiz de public/carrusel/
"""
import json
from pathlib import Path

from PIL import Image, ImageFilter

BASE = Path(__file__).resolve().parent
SRC = BASE / "img" / "src"
OUT = BASE / "img"
MANIFEST = BASE / "manifest.json"

MIN_SIDE = 1200
BLUR_SIDE = 24

# slug -> (archivo fuente, descripcion, focalPoint, capasSugeridas)
ITEMS = {
    "roisin-lapiz": (
        "107590796_4093189104089104_8579394152081488805_n.jpg",
        "Retrato a lapiz de mujer con melena al viento y labios rosa fucsia como "
        "unico acento; busto centrado-derecha sobre fondo blanco; paleta grafito + rosa.",
        {"x": 0.56, "y": 0.42},
        ["figura", "fondo"],
    ),
    "guitarrista": (
        "107606755_4088663064541708_490817533121466606_n.jpg",
        "Dibujo a lapiz de guitarrista de blues sonriente con Gibson SG en diagonal; "
        "figura a la izquierda y mastil hacia la esquina superior derecha; grafito sobre blanco.",
        {"x": 0.34, "y": 0.28},
        ["guitarra", "figura", "fondo"],
    ),
    "chico-pez": (
        "107742658_4097484643659550_3561547213104938734_n.jpg",
        "Retrato a lapiz de joven con la barbilla apoyada en la mano junto a un vaso "
        "de agua con un pez; cara a la derecha, vaso a la izquierda; grafito con mesa sombreada.",
        {"x": 0.58, "y": 0.34},
        ["vaso-pez", "figura", "mesa", "fondo"],
    ),
    "pippi": (
        "pipi.jpg",
        "Pippi Calzaslargas sonriente con trenzas al viento, ojos azules y mono al hombro; "
        "busto centrado sobre fondo blanco; grafito con acentos azul y verde lima.",
        {"x": 0.43, "y": 0.40},
        ["mono", "pippi", "fondo"],
    ),
    "pippi-cartas": (
        "images (15).jpeg",
        "Cuadro con marco dorado barroco sobre pared verde botella: Pippi asoma tras un "
        "abanico de cartas (reinas y joker) sobre fondo de cuadros rojos; paleta dorado/rojo/verde.",
        {"x": 0.44, "y": 0.42},
        ["marco", "cartas", "escena-interior", "pared"],
    ),
    "roisin-full": (
        "roisin.webp",
        "Obra mixta enmarcada: retrato de mujer con labios rosa sobre tartan escoces, "
        "plumas negras desbordando el marco blanco sobre pared roja; paleta rojo/negro/rosa.",
        {"x": 0.60, "y": 0.46},
        ["plumas", "retrato", "tartan", "marco", "pared"],
    ),
    "roisin-detalle": (
        "roisyn.jpeg",
        "Detalle del retrato: primer plano del rostro con labios fucsia y mechon cubriendo "
        "un ojo, plumas negras y tartan al fondo; encuadre vertical estrecho.",
        {"x": 0.34, "y": 0.44},
        ["rostro", "plumas-fondo"],
    ),
}


def dominant_color(img: Image.Image) -> str:
    small = img.convert("RGB").resize((50, 50), Image.Resampling.BILINEAR)
    q = small.quantize(colors=5, method=Image.Quantize.MEDIANCUT)
    colors = sorted(q.getcolors(), key=lambda c: c[0], reverse=True)
    r, g, b = q.getpalette()[colors[0][1] * 3: colors[0][1] * 3 + 3]
    return f"#{r:02x}{g:02x}{b:02x}"


def process(slug: str, src_name: str):
    img = Image.open(SRC / src_name)
    img = img.convert("RGB")
    w0, h0 = img.size
    steps = []

    if max(w0, h0) < MIN_SIDE:
        if src_name.lower().endswith((".jpg", ".jpeg")):
            blurred_noise = img.filter(ImageFilter.MedianFilter(size=3))
            img = Image.blend(img, blurred_noise, 0.4)
            steps.append("mediana3@40%")
        img = img.resize((w0 * 2, h0 * 2), Image.Resampling.LANCZOS)
        steps.append("upscale2x-lanczos")
        img = img.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=3))
        steps.append("unsharp(1.4/55/3)")

    out_file = OUT / f"{slug}.webp"
    img.save(out_file, "WEBP", quality=92, method=6)

    # blur placeholder: lado mayor ~24px
    w, h = img.size
    scale = BLUR_SIDE / max(w, h)
    blur = img.resize((max(1, round(w * scale)), max(1, round(h * scale))),
                      Image.Resampling.LANCZOS)
    blur_file = OUT / f"blur-{slug}.webp"
    blur.save(blur_file, "WEBP", quality=40, method=6)

    return {
        "orig_size": (w0, h0),
        "final_size": img.size,
        "dominant": dominant_color(img),
        "out_bytes": out_file.stat().st_size,
        "blur_bytes": blur_file.stat().st_size,
        "steps": steps or ["reencode-solamente"],
    }


def main():
    manifest = []
    for slug, (src_name, desc, focal, capas) in ITEMS.items():
        info = process(slug, src_name)
        w, h = info["final_size"]
        manifest.append({
            "slug": slug,
            "file": f"img/{slug}.webp",
            "blur": f"img/blur-{slug}.webp",
            "w": w,
            "h": h,
            "dominantColor": info["dominant"],
            "focalPoint": focal,
            "descripcion": desc,
            "capasSugeridas": capas,
            "fuente": src_name,
        })
        print(f"{slug:16s} {info['orig_size'][0]}x{info['orig_size'][1]}"
              f" -> {w}x{h}  {info['out_bytes']/1024:7.1f} KB"
              f"  blur {info['blur_bytes']/1024:5.1f} KB  {info['dominant']}"
              f"  [{'+'.join(info['steps'])}]")

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
                        encoding="utf-8")
    print(f"\nmanifest.json -> {MANIFEST}")


if __name__ == "__main__":
    main()
