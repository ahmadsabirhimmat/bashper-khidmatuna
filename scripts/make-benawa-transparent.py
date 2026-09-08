"""Strip the white JPG backdrop from the Benawa logo and emit transparent PNGs."""

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "Benawa Logo.jpg"

OUT_UI = [
    ROOT / "mobileProject" / "assets" / "images" / "benawa-logo.png",
    ROOT / "provider" / "src" / "assets" / "benawa-logo.png",
    ROOT / "admin" / "src" / "assets" / "benawa-logo.png",
]
OUT_DARK = ROOT / "mobileProject" / "assets" / "images" / "benawa-logo-dark.png"
OUT_SPLASH = ROOT / "mobileProject" / "assets" / "images" / "splash-icon.png"

WHITE_MIN = 228
FRINGE_MIN = 210
INK_MAX = 70


def is_backdrop(r, g, b, floor=WHITE_MIN):
    return r >= floor and g >= floor and b >= floor and abs(r - g) < 18 and abs(g - b) < 18


def is_neutral(r, g, b, slack=22):
    return abs(r - g) < slack and abs(g - b) < slack


def is_ink(r, g, b, a, floor=INK_MAX):
    return a > 40 and r <= floor and g <= floor and b <= floor and is_neutral(r, g, b)


def is_whiteish(r, g, b, a, floor=215):
    return a > 40 and r >= floor and g >= floor and b >= floor and is_neutral(r, g, b)


def flood_clear(pixels, width, height):
    visited = bytearray(width * height)
    queue = deque()

    def enqueue(x, y):
        if x < 0 or y < 0 or x >= width or y >= height:
            return
        idx = y * width + x
        if visited[idx]:
            return
        visited[idx] = 1
        queue.append(idx)

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        idx = queue.popleft()
        x = idx % width
        y = idx // width
        r, g, b, _a = pixels[x, y]
        if not is_backdrop(r, g, b):
            continue
        pixels[x, y] = (r, g, b, 0)
        enqueue(x - 1, y)
        enqueue(x + 1, y)
        enqueue(x, y - 1)
        enqueue(x, y + 1)


def punch_year_zero(pixels, width, height):
    """Clear the enclosed white counter in 2013's 0. Book pages sit much higher."""
    y0, y1 = int(height * 0.78), int(height * 0.88)
    x0, x1 = int(width * 0.38), int(width * 0.62)
    visited = set()
    punched = 0

    def seed_white(x, y):
        r, g, b, a = pixels[x, y]
        return is_whiteish(r, g, b, a, floor=200)

    for sy in range(y0, y1):
        for sx in range(x0, x1):
            if (sx, sy) in visited or not seed_white(sx, sy):
                continue
            queue = deque([(sx, sy)])
            visited.add((sx, sy))
            cells = []
            while queue:
                x, y = queue.popleft()
                cells.append((x, y))
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if (nx, ny) in visited or nx < x0 or nx >= x1 or ny < y0 or ny >= y1:
                        continue
                    if seed_white(nx, ny):
                        visited.add((nx, ny))
                        queue.append((nx, ny))
            if 20 <= len(cells) <= 4000:
                for x, y in cells:
                    r, g, b, _a = pixels[x, y]
                    pixels[x, y] = (r, g, b, 0)
                punched += 1
    return punched


def soften_fringe(pixels, width, height):
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0 or not is_backdrop(r, g, b, FRINGE_MIN):
                continue
            neighbors = []
            if x > 0:
                neighbors.append(pixels[x - 1, y][3])
            if x + 1 < width:
                neighbors.append(pixels[x + 1, y][3])
            if y > 0:
                neighbors.append(pixels[x, y - 1][3])
            if y + 1 < height:
                neighbors.append(pixels[x, y + 1][3])
            if min(neighbors) > 0:
                continue
            darkness = (255 - r) + (255 - g) + (255 - b)
            alpha = max(0, min(255, int(darkness * 4.2)))
            pixels[x, y] = (r, g, b, alpha)


def crop_content(image, pad=12):
    alpha = image.getchannel("A")
    box = alpha.getbbox()
    if not box:
        return image
    left, top, right, bottom = box
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(image.width, right + pad)
    bottom = min(image.height, bottom + pad)
    return image.crop((left, top, right, bottom))


def ink_row_counts(pixels, width, height):
    counts = [0] * height
    for y in range(height):
        n = 0
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if is_ink(r, g, b, a):
                n += 1
        counts[y] = n
    return counts


def first_ink_band(counts, min_count, min_span=8, gap=6):
    start = next((y for y, c in enumerate(counts) if c >= min_count), None)
    if start is None:
        return None
    end = start
    gap_run = 0
    for y in range(start, len(counts)):
        if counts[y] >= max(4, min_count // 3):
            end = y
            gap_run = 0
        else:
            gap_run += 1
            if gap_run >= gap and end - start >= min_span:
                break
    return start, end


def year_ink_band(counts, height):
    y0, y1 = int(height * 0.78), int(height * 0.88)
    start = end = None
    for y in range(y0, y1):
        if counts[y] >= 8:
            if start is None:
                start = y
            end = y
    if start is None:
        return None
    return start - 2, end + 2


def recolor_ink_white(image, bands):
    """Turn black lettering white so it reads on navy splash / dark UI."""
    out = image.copy()
    pixels = out.load()
    width, height = out.size
    for y0, y1 in bands:
        y0 = max(0, y0)
        y1 = min(height - 1, y1)
        for y in range(y0, y1 + 1):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                if a < 12 or not is_neutral(r, g, b, slack=28):
                    continue
                luma = (r + g + b) / 3
                if luma >= 168:
                    continue
                lift = (168 - luma) / 168
                nr = min(255, int(r + (255 - r) * (0.55 + 0.45 * lift)))
                ng = min(255, int(g + (255 - g) * (0.55 + 0.45 * lift)))
                nb = min(255, int(b + (255 - b) * (0.55 + 0.45 * lift)))
                na = min(255, max(a, int(a + (255 - a) * lift * 0.35)))
                pixels[x, y] = (nr, ng, nb, na)
    return out


def thicken_band(image, y0, y1):
    """Add a 1px light halo so thin Pashto reads on navy."""
    pixels = image.load()
    width, height = image.size
    y0 = max(1, y0)
    y1 = min(height - 2, y1)
    targets = []
    for y in range(y0, y1 + 1):
        for x in range(1, width - 1):
            r, g, b, a = pixels[x, y]
            if a > 90:
                continue
            strong = 0
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                nr, ng, nb, na = pixels[nx, ny]
                if na > 180 and is_neutral(nr, ng, nb) and (nr + ng + nb) / 3 > 180:
                    strong += 1
            if strong:
                targets.append((x, y, min(255, 90 + strong * 50)))
    for x, y, alpha in targets:
        pixels[x, y] = (255, 255, 255, alpha)


def make_dark_logo(logo):
    pixels = logo.load()
    width, height = logo.size
    counts = ink_row_counts(pixels, width, height)
    min_count = max(10, width // 80)
    top_cap = int(height * 0.075)
    top_band = first_ink_band(counts[: top_cap + 6], min_count=min_count, min_span=6, gap=3)
    year_band = year_ink_band(counts, height)
    bands = []
    if top_band:
        bands.append((max(0, top_band[0] - 2), min(top_cap, top_band[1] + 2)))
        print(f"dark text band top {bands[-1]}")
    if year_band:
        bands.append(year_band)
        print(f"dark text band year {year_band}")
    if not bands:
        print("warning: no ink bands found for dark variant")
        return logo
    dark = recolor_ink_white(logo, bands)
    if top_band:
        thicken_band(dark, bands[0][0], bands[0][1])
    return dark


def make_splash(logo, size=1024, margin=0.12):
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    max_w = int(size * (1 - margin * 2))
    max_h = int(size * (1 - margin * 2))
    fitted = logo.copy()
    fitted.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    x = (size - fitted.width) // 2
    y = (size - fitted.height) // 2
    canvas.paste(fitted, (x, y), fitted)
    return canvas


def main():
    source = Image.open(SRC).convert("RGBA")
    pixels = source.load()
    flood_clear(pixels, source.width, source.height)
    soften_fringe(pixels, source.width, source.height)
    logo = crop_content(source)
    punched = punch_year_zero(logo.load(), logo.width, logo.height)
    print(f"punched {punched} year-zero hole(s) at {logo.size}")
    dark = make_dark_logo(logo)

    ui = logo.copy()
    ui.thumbnail((720, 840), Image.Resampling.LANCZOS)
    for path in OUT_UI:
        path.parent.mkdir(parents=True, exist_ok=True)
        ui.save(path, "PNG", optimize=True)
        print(f"wrote {path} {ui.size}")

    dark_ui = dark.copy()
    dark_ui.thumbnail((720, 840), Image.Resampling.LANCZOS)
    OUT_DARK.parent.mkdir(parents=True, exist_ok=True)
    dark_ui.save(OUT_DARK, "PNG", optimize=True)
    print(f"wrote {OUT_DARK} {dark_ui.size}")

    splash = make_splash(dark)
    splash.save(OUT_SPLASH, "PNG", optimize=True)
    print(f"wrote {OUT_SPLASH} {splash.size}")


if __name__ == "__main__":
    main()
