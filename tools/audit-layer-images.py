"""Development-only image inventory/contact sheet. Requires Pillow; no runtime service."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
out = root / 'artifacts'
out.mkdir(exist_ok=True)
paths = sorted((root / 'assets/sources/drive').glob('*')) + sorted((root / 'public/images/layers').rglob('*.png'))
paths = [p for p in paths if 'masks' not in p.parts and not ('public' in p.parts and 'sources' in p.parts)]
records = []
sheet = Image.new('RGB', (1200, ((len(paths) + 4) // 5) * 310), '#e8e4dc')
draw = ImageDraw.Draw(sheet)
for n, p in enumerate(paths):
    im = Image.open(p).convert('RGBA')
    alpha = im.getchannel('A')
    bounds = alpha.point(lambda a: 255 if a > 20 else 0).getbbox()
    hist = alpha.histogram()
    records.append(dict(path=p.relative_to(root).as_posix(), width=im.width, height=im.height,
                        bounds=bounds, transparentFraction=sum(hist[:20]) / (im.width * im.height),
                        sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
    im.thumbnail((230, 263))
    x, y = n % 5 * 240, n // 5 * 310
    sheet.paste(im, (x + (240-im.width)//2, y), im)
    label = ('Drive/' if 'assets' in p.parts else 'Local/') + p.name
    draw.text((x+4, y+266), label[:34], fill='black')
sheet.save(out / 'layer-audit.jpg', quality=90)
(out / 'layer-audit.json').write_text(json.dumps(records, indent=2), encoding='utf-8')
print(json.dumps(records, indent=2))
