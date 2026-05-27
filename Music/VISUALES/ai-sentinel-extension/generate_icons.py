import os
from PIL import Image, ImageDraw

def generate_icon(size):
    # Create image with transparent background
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Outer circle (deep blue border)
    # Color #2B3BE5 -> (43, 59, 229)
    border_width = max(1, size // 12)
    draw.ellipse(
        [border_width, border_width, size - border_width, size - border_width],
        outline=(43, 59, 229, 255),
        width=border_width
    )
    
    # Inner circle (dark charcoal / black background for contrast)
    inner_padding_bg = border_width + 1
    draw.ellipse(
        [inner_padding_bg, inner_padding_bg, size - inner_padding_bg, size - inner_padding_bg],
        fill=(10, 10, 10, 255)
    )
    
    # Center circle (crimson red core)
    # Color #E03131 -> (224, 49, 49)
    inner_padding = border_width * 2 + 1
    draw.ellipse(
        [inner_padding, inner_padding, size - inner_padding, size - inner_padding],
        fill=(224, 49, 49, 255)
    )
    
    # Draw white exclamation mark for larger sizes
    if size >= 48:
        # Exclamation point line
        line_top = size // 3
        line_bottom = size * 3 // 5
        line_width = max(2, size // 16)
        draw.line(
            [(size // 2, line_top), (size // 2, line_bottom)],
            fill=(255, 255, 255, 255),
            width=line_width
        )
        # Dot
        dot_radius = max(1, size // 20)
        dot_y = size * 3 // 4
        draw.ellipse(
            [size // 2 - dot_radius, dot_y - dot_radius, size // 2 + dot_radius, dot_y + dot_radius],
            fill=(255, 255, 255, 255)
        )
        
    os.makedirs("icons", exist_ok=True)
    img.save(f"icons/icon-{size}.png")
    print(f"Generated icons/icon-{size}.png")

for size in [16, 48, 128]:
    generate_icon(size)
