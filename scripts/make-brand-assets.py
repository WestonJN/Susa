#!/usr/bin/env python3
"""Regenerate public/og-image.png, icon-192.png and icon-512.png.

Usage: python3 scripts/make-brand-assets.py "Brand Name" "Tagline"
Needs Pillow (pip install pillow). Re-run whenever the trading name changes.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

name = sys.argv[1] if len(sys.argv) > 1 else "Susa"
tagline = sys.argv[2] if len(sys.argv) > 2 else "Furniture removals and truck transport in Johannesburg"
out = Path(__file__).resolve().parent.parent / "public"

NAVY, AMBER, WHITE = (15, 42, 67), (245, 158, 11), (255, 255, 255)
FONT_CANDIDATES = [
    "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]


def font(size: int) -> ImageFont.FreeTypeFont:
    for p in FONT_CANDIDATES:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def truck(d: ImageDraw.ImageDraw, x: int, y: int, s: float) -> None:
    """Same mark as public/favicon.svg, drawn on a 64-unit grid scaled by s."""
    d.rounded_rectangle([x, y, x + 64 * s, y + 64 * s], radius=14 * s, fill=NAVY)
    d.polygon([(x + 10 * s, y + 38 * s), (x + 38 * s, y + 38 * s), (x + 38 * s, y + 22 * s), (x + 14 * s, y + 22 * s), (x + 10 * s, y + 26 * s)], fill=AMBER)
    d.polygon([(x + 40 * s, y + 26 * s), (x + 48 * s, y + 26 * s), (x + 56 * s, y + 34 * s), (x + 56 * s, y + 38 * s), (x + 40 * s, y + 38 * s)], fill=AMBER)
    for cx in (22, 46):
        d.ellipse([x + (cx - 5) * s, y + 39 * s, x + (cx + 5) * s, y + 49 * s], fill=WHITE)


# Icons
for size in (192, 512):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    truck(ImageDraw.Draw(img), 0, 0, size / 64)
    img.save(out / f"icon-{size}.png")

# Open Graph card 1200x630
og = Image.new("RGB", (1200, 630), NAVY)
d = ImageDraw.Draw(og)
d.rectangle([0, 600, 1200, 630], fill=AMBER)
truck(d, 80, 90, 2.2)
d.text((80, 290), name, font=font(110), fill=WHITE)
d.text((80, 430), tagline, font=font(38), fill=(214, 230, 244))
og.save(out / "og-image.png", optimize=True)
print("wrote og-image.png, icon-192.png, icon-512.png")
