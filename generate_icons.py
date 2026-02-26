from PIL import Image, ImageDraw, ImageFont
import os

def generate_icon(size, path):
    img = Image.new('RGB', (size, size), color='#ec4899')
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(size * 0.6))
    except (IOError, OSError):
        font = ImageFont.load_default()
    
    text = "B"
    # Center text approximately
    draw.text((size * 0.25, size * 0.15), text, fill="#fdf2f8", font=font)
    img.save(path)

generate_icon(192, 'public/pwa-192x192.png')
generate_icon(512, 'public/pwa-512x512.png')
generate_icon(180, 'public/apple-touch-icon.png')
print("Icons generated successfully!")
