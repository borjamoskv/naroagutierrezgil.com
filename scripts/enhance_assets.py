import os
import glob
from PIL import Image, ImageEnhance
import shutil

# Rutas
ASSETS_DIR = "/Users/borjafernandezangulo/10_PROJECTS/naroagutierrezgil.com/public/assets"
BRAIN_DIR = "/Users/borjafernandezangulo/.gemini/antigravity/brain/258d0c59-bf04-4f17-8119-fd83895a51a0"

def process_image(filepath):
    try:
        img = Image.open(filepath)
        # Convert to RGB if it has alpha and we want to do heavy processing, but webp supports alpha.
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGBA')
            
        # Enhancements for maximum exergy (hyperrealistic pop art look)
        enhancer_contrast = ImageEnhance.Contrast(img)
        img = enhancer_contrast.enhance(1.15)
        
        enhancer_sharpness = ImageEnhance.Sharpness(img)
        img = enhancer_sharpness.enhance(1.3)
        
        enhancer_color = ImageEnhance.Color(img)
        img = enhancer_color.enhance(1.1)

        # Output path (force webp)
        base = os.path.splitext(filepath)[0]
        out_path = base + ".webp"
        
        # Save optimized WebP
        img.save(out_path, "WEBP", quality=90, method=6)
        print(f"Enhanced and saved: {os.path.basename(out_path)}")
        
        # Remove original if it was not webp or if we overwrote it, we don't need the jpg anymore to save space.
        if filepath != out_path and os.path.exists(filepath):
            os.remove(filepath)
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    # 1. Copy generated artworks
    generated_images = glob.glob(os.path.join(BRAIN_DIR, "*.jpg"))
    for gen_img in generated_images:
        dest = os.path.join(ASSETS_DIR, os.path.basename(gen_img))
        shutil.copy2(gen_img, dest)
        print(f"Copied generated image: {os.path.basename(gen_img)}")
        
    # 2. Process all images
    all_images = glob.glob(os.path.join(ASSETS_DIR, "*.*"))
    for img_path in all_images:
        ext = os.path.splitext(img_path)[1].lower()
        if ext in ['.jpg', '.jpeg', '.png', '.webp']:
            # don't process SVG
            process_image(img_path)

if __name__ == "__main__":
    main()
