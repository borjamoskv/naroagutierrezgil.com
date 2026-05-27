import os
import json
import random
import math
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageFont

# CONSTANTS - AESTHETIC OMEGA
BG_COLOR = (10, 10, 10)  # #0A0A0A
NEON_BLUE = (43, 59, 229)  # #2B3BE5
NEON_GLOW_LIGHT = (80, 100, 255)
BRIGHT_WHITE = (245, 245, 245)
MUTED_GREY = (100, 100, 105)
ALERT_RED = (229, 43, 80)

SECTORS = ["SECTOR_ALPHA", "SECTOR_BETA", "SECTOR_GAMMA", "SECTOR_DELTA", "SECTOR_EPSILON", "SECTOR_OMEGA"]
SIDES = ["ESTE_LADO", "OTRO_LADO", "NINGUN_LADO"]
COMPLIANCE_STATUS = ["SECURED", "BREACHED", "LIMINAL", "UNSTABLE"]

def get_glow_color(base_color, factor):
    return tuple(min(255, int(c * factor)) for c in base_color)

def draw_grid(draw, width, height, spacing=50, color=(20, 20, 25)):
    for x in range(0, width, spacing):
        draw.line([(x, 0), (x, height)], fill=color, width=1)
    for y in range(0, height, spacing):
        draw.line([(0, y), (width, y)], fill=color, width=1)

def draw_noise_grain(img, intensity=12):
    width, height = img.size
    pixels = img.load()
    for x in range(width):
        for y in range(height):
            noise = random.randint(-intensity, intensity)
            r, g, b = pixels[x, y][:3]
            pixels[x, y] = (
                max(0, min(255, r + noise)),
                max(0, min(255, g + noise)),
                max(0, min(255, b + noise))
            )

def draw_glow_line(img, draw, start, end, color=NEON_BLUE, max_thickness=8):
    # Draw glow layers using blurred lines
    for i in range(max_thickness, 0, -2):
        alpha = int(255 * (1 - (i / max_thickness)))
        glow_c = get_glow_color(color, 1.0 - (i / max_thickness) * 0.5)
        draw.line([start, end], fill=glow_c, width=i)
    # Core bright line
    draw.line([start, end], fill=BRIGHT_WHITE, width=2)

def draw_industrial_fence(draw, width, height, style=0):
    # Draw concrete posts and wires
    y_pos = int(height * 0.7)
    post_color = (30, 30, 32)
    wire_color = MUTED_GREY
    
    if style == 0:  # standard wire fence
        # Posts
        for x in range(100, width, 150):
            draw.rectangle([x-5, y_pos-150, x+5, height], fill=post_color)
            # Diagonal braces
            draw.line([(x-5, y_pos-150), (x-25, y_pos-50)], fill=post_color, width=3)
        # Horizontal wires
        for y in range(y_pos-130, y_pos, 30):
            draw.line([(0, y), (width, y)], fill=wire_color, width=1)
            # Subtle barbed wire loops
            for x in range(30, width, 40):
                draw.arc([x-10, y-10, x+10, y+10], 0, 180, fill=NEON_BLUE, width=1)
    elif style == 1:  # Brutalist checkpoint silhouette
        draw.rectangle([100, y_pos-250, 250, height], fill=(15, 15, 17))
        draw.rectangle([100, y_pos-270, 250, y_pos-250], fill=NEON_BLUE)
        # Antenna
        draw.line([(175, y_pos-270), (175, y_pos-350)], fill=MUTED_GREY, width=2)
        draw.ellipse([172, y_pos-355, 178, y_pos-349], fill=ALERT_RED)
    elif style == 2:  # Pure geometry portal
        draw.rectangle([width//2 - 100, y_pos-300, width//2 + 100, height], outline=MUTED_GREY, width=3)
        # Inner portal line
        draw.line([(width//2, y_pos-300), (width//2, height)], fill=NEON_BLUE, width=2)

def apply_glitch(img, severity=1):
    if severity == 0:
        return img
    
    width, height = img.size
    # Vertical slice offsets
    for _ in range(random.randint(2, 5 * severity)):
        slice_y = random.randint(100, height - 100)
        slice_h = random.randint(10, 50 * severity)
        offset = random.randint(-40, 40) * severity
        
        # Crop slice and paste offset
        box = (0, slice_y, width, min(height, slice_y + slice_h))
        slice_img = img.crop(box)
        img.paste(slice_img, (offset, slice_y))
        
    # RGB Split effect
    if random.random() < 0.5 * severity:
        r, g, b = img.split()
        # Shift channels
        r_offset = random.randint(-5, 5)
        g_offset = random.randint(-5, 5)
        
        r_shifted = Image.new("L", img.size)
        r_shifted.paste(r, (r_offset, 0))
        g_shifted = Image.new("L", img.size)
        g_shifted.paste(g, (0, g_offset))
        
        img = Image.merge("RGB", (r_shifted, g_shifted, b))
        
    return img

def add_telemetry_text(draw, width, height, token_id, sector, side, compliance):
    box_color = (25, 25, 30)
    draw.rectangle([40, 40, 320, 160], outline=box_color, width=1)
    draw.rectangle([40, 40, 320, 65], fill=(15, 15, 20))
    
    try:
        font = ImageFont.load_default()
    except:
        font = None
        
    text_lines = [
        f"SYS_RECON: v2.026",
        f"TOKEN_ID: #{token_id:04d}",
        f"SECTOR: {sector}",
        f"COMPLIANCE: {compliance}",
        f"STATE: {side}"
    ]
    
    y = 48
    for line in text_lines:
        draw.text((50, y), line, fill=BRIGHT_WHITE if "STATE" in line else MUTED_GREY, font=font)
        y += 20

def generate_piece(token_id, output_dir_images, output_dir_metadata):
    # Reproducible seed per token
    random.seed(token_id)
    
    # Select Traits deterministically
    sector = random.choice(SECTORS)
    side = random.choice(SIDES)
    compliance = random.choice(COMPLIANCE_STATUS)
    
    fence_style = random.randint(0, 2)
    glitch_severity = random.choice([0, 1, 2, 3])  # 0 = none, 3 = heavy
    
    # Map visual themes
    if side == "ESTE_LADO":
        border_direction = "DIAGONAL_UP"
        primary_color = NEON_BLUE
    elif side == "OTRO_LADO":
        border_direction = "DIAGONAL_DOWN"
        primary_color = NEON_BLUE
    else:  # NINGUN_LADO (Liminal/Unstable)
        border_direction = "CROSS"
        primary_color = ALERT_RED
        glitch_severity = max(glitch_severity, 2)  # forced unstable glitching
        
    # Build Image
    width, height = 1000, 1000
    img = Image.new("RGB", (width, height), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Layer 1: Grid
    draw_grid(draw, width, height, spacing=40, color=(15, 15, 20))
    
    # Layer 2: Fence / Checkpoint Silhouettes
    draw_industrial_fence(draw, width, height, style=fence_style)
    
    # Layer 3: The FRONTERA Glowing Neon lines
    if border_direction == "DIAGONAL_UP":
        draw_glow_line(img, draw, (100, 900), (900, 100), primary_color)
    elif border_direction == "DIAGONAL_DOWN":
        draw_glow_line(img, draw, (100, 100), (900, 900), primary_color)
    elif border_direction == "CROSS":
        draw_glow_line(img, draw, (500, 100), (500, 900), primary_color)
        draw_glow_line(img, draw, (100, 500), (900, 500), primary_color)
        
    # Layer 4: Telemetry Data
    add_telemetry_text(draw, width, height, token_id, sector, side, compliance)
    
    # Layer 5: Glitch Processing
    img = apply_glitch(img, severity=glitch_severity)
    
    # Layer 6: Noise Grain
    draw_noise_grain(img, intensity=10)
    
    # Save Image
    image_filename = f"frontera_{token_id:04d}.png"
    image_path = os.path.join(output_dir_images, image_filename)
    img.save(image_path, "PNG")
    
    # Save Metadata JSON
    metadata = {
        "name": f"FRONTERA #{token_id:04d}",
        "description": "Liminal space art collection. Generated programmatically under the Industrial Noir 2026 paradigm. High-exergy sovereign cryptographical assets.",
        "image": f"ipfs://placeholder_cid/{image_filename}",
        "attributes": [
            {"trait_type": "Sector", "value": sector},
            {"trait_type": "Side", "value": side},
            {"trait_type": "Compliance", "value": compliance},
            {"trait_type": "Glitch Intensity", "value": ["None", "Low", "Medium", "High"][glitch_severity]},
            {"trait_type": "Structural Style", "value": ["Wire Fence", "Brutalist Checkpoint", "Geometric Portal"][fence_style]}
        ]
    }
    
    metadata_filename = f"frontera_{token_id:04d}.json"
    metadata_path = os.path.join(output_dir_metadata, metadata_filename)
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=4)
        
    return metadata

def main():
    print("🤖 Starting C5-REAL generative art factory...")
    output_images = "FRONTERA/images"
    output_metadata = "FRONTERA/metadata"
    
    total_supply = 1111
    
    print(f"Generating {total_supply} unique assets...")
    for i in range(1, total_supply + 1):
        if i % 100 == 0 or i == 1:
            print(f"-> Generating #{i}...")
        generate_piece(i, output_images, output_metadata)
        
    print("✨ Generative pipeline complete. 1,111 unique assets created in FRONTERA/")

if __name__ == "__main__":
    main()
