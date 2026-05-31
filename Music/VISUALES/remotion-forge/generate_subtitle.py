import os
from PIL import Image, ImageDraw, ImageFont

# 1920x1080 transparent image
width, height = 1920, 1080
image = Image.new('RGBA', (width, height), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)

lines = [
    "¡¿PERO TÚ TE CREES QUE STOICHKOV TIENE EL RITMO BIOMECÁNICO QUE TENGO YO?!",
    "¡LE HE MEADO EN LA CARA EN EL DANCEFLOOR!"
]
font_size = 48

try:
    # Try common font paths on macOS
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Impact.ttf", font_size)
except IOError:
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except IOError:
        font = ImageFont.load_default()

# Draw each line centered horizontally
y_start = height - 220
line_height = font_size + 15

for i, line in enumerate(lines):
    # Get line dimensions
    bbox = draw.textbbox((0, 0), line, font=font)
    line_width = bbox[2] - bbox[0]
    
    x = (width - line_width) // 2
    y = y_start + i * line_height
    
    # Draw border/stroke
    stroke_width = 4
    for dx in range(-stroke_width, stroke_width + 1):
        for dy in range(-stroke_width, stroke_width + 1):
            if dx*dx + dy*dy <= stroke_width*stroke_width:
                draw.text((x + dx, y + dy), line, font=font, fill=(0, 0, 0, 255))
    
    # Draw main text in yellow
    draw.text((x, y), line, font=font, fill=(255, 255, 0, 255))

# Save image
os.makedirs("public", exist_ok=True)
image.save("public/subtitle.png")
print("Subtitle image successfully generated at public/subtitle.png")
