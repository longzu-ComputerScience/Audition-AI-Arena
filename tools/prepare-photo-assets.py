"""Repeatable offline cutouts, textile masks and measured fitting metadata.

Requires Pillow, numpy, opencv-python. GrabCut uses spatial foreground/background seeds,
not global deletion of white pixels. Original Drive binaries remain in assets/sources/drive.
"""
import hashlib
import json
import sys
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
LAYERS = ROOT / 'public/images/layers'
SOURCES = ROOT / 'assets/sources/drive'
cv2.setRNGSeed(0)

def segment(name):
    rgb = np.array(Image.open(SOURCES / name).convert('RGB'))
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    h, w = rgb.shape[:2]
    mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    # Background and shadow are achromatic, primary textiles are colored. Use them
    # as seeds only: the graph cut retains connected highlights within the cloth.
    mask[(hsv[:, :, 1] > 25) & (hsv[:, :, 2] < 249)] = cv2.GC_PR_FGD
    mask[(hsv[:, :, 1] > 65) & (hsv[:, :, 2] < 235)] = cv2.GC_FGD
    mask[:65] = mask[-45:] = cv2.GC_BGD
    mask[:, :55] = mask[:, -55:] = cv2.GC_BGD
    cv2.grabCut(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), mask, None,
                np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64), 6, cv2.GC_INIT_WITH_MASK)
    foreground = np.isin(mask, [cv2.GC_FGD, cv2.GC_PR_FGD]).astype(np.uint8)
    # Keep the connected garment, remove disconnected floor-shadow islands.
    count, labels, stats, _ = cv2.connectedComponentsWithStats(foreground, 8)
    largest = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
    foreground = (labels == largest).astype(np.uint8)
    # Feather only the inner boundary; no exterior white/shadow halo is added.
    distance = cv2.distanceTransform(foreground, cv2.DIST_L2, 3)
    alpha = np.clip(distance * 255 / 1.5, 0, 255).astype(np.uint8)
    return Image.fromarray(np.dstack([rgb, alpha]))

def fabric_mask(item, image):
    a = np.array(image)
    hsv = cv2.cvtColor(a[:, :, :3], cv2.COLOR_RGB2HSV)
    hue, sat = hsv[:, :, 0], hsv[:, :, 1]
    h, w = a.shape[:2]
    if item == 'ao-nhat-binh':
        main = ((hue < 12) | (hue > 170)) & (sat > 110)
        # Protect the entire rectangular collar/bib, cuffs, wave hem and medallions.
        protected = Image.new('L', image.size)
        d = ImageDraw.Draw(protected)
        d.rectangle((750, 310, 1048, 1120), fill=255)
        d.rectangle((0, 700, 552, 1400), fill=255)
        d.rectangle((1240, 700, w, 1400), fill=255)
        d.rectangle((0, 1460, w, h), fill=255)
        for x, y, rx, ry in [(635,670,48,88),(1135,680,48,90),(720,790,54,90),(1060,790,54,90),
                              (555,1040,60,75),(1245,1040,60,75),(690,1260,58,80),(1080,1260,58,80),
                              (660,550,38,45),(1110,550,38,45),(565,840,42,52),(1240,840,42,52)]:
            d.ellipse((x-rx, y-ry, x+rx, y+ry), fill=255)
        main &= np.array(protected) == 0
    elif item == 'ao-tac':
        main = a[:,:,3] > 20
    elif item == 'ao-dai':
        main = a[:,:,3] > 20
        # Preserve actual purple floral pixels and their fine stems, not a rectangular
        # patch of the original pink cloth around them.
        flowers = np.zeros((h,w), np.uint8)
        flowers[120:230,300:425] = ((hue[120:230,300:425] > 140) &
                                   (hue[120:230,300:425] < 170) & (sat[120:230,300:425] > 60)).astype(np.uint8)
        main &= cv2.dilate(flowers, np.ones((3,3),np.uint8)) == 0
    elif item == 'ao-tu-than':
        main = a[:,:,3] > 20
        # The distinct back/inner lining is preserved, not recolored as outer cloth.
        for y in range(110, 390):
            left = int(400 + (y - 110) * .17)
            right = int(496 - (y - 110) * .17)
            main[y, left:right] = False
        # Yellow sash is excluded by hue; expand the protected edge by one pixel.
        sash = ((hue >= 14) & (hue < 45) & (sat > 40)).astype(np.uint8)
        main &= cv2.dilate(sash, np.ones((5,5), np.uint8)) == 0
    else:
        main = a[:,:,3] > 20
        # Only the distinct white collar piping, not the surrounding fabric.
        piping = np.zeros((h,w), bool)
        piping[145:220,385:505] = (sat[145:220,385:505] < 35) & (hsv[145:220,385:505,2] > 150)
        main &= ~piping
        # Narrow fastener masks preserve the row of buttons, without freezing a whole
        # square of the surrounding primary cloth in the source color.
        fasteners = np.zeros((h,w), np.uint8)
        for x,y in [(449,211),(372,222),(379,250),(333,430),(332,505)]:
            cv2.circle(fasteners,(x,y),5,255,-1)
        main &= fasteners == 0
    main &= a[:, :, 3] > 20
    # Only alpha is a weight. White RGB avoids accidental squaring of feathered values.
    weight = (main.astype(np.uint8) * 255)
    weight = cv2.GaussianBlur(weight, (3,3), .6)
    weight[~main] = 0
    weight[a[:, :, 3] == 0] = 0
    mask = np.dstack([np.full_like(weight, 255)] * 3 + [weight])
    lum = .299*a[:,:,0] + .587*a[:,:,1] + .114*a[:,:,2]
    base = float(np.median(lum[weight > 200]))
    return Image.fromarray(mask), round(base, 2)

def save_asset(item, im, path, neck=None, target_neck=None, target_hem=None):
    original_size = im.size
    mask, base = fabric_mask(item, im) if item.startswith('ao-') else (None, None)
    bounds = im.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox()
    crop = (max(0,bounds[0]-6), max(0,bounds[1]-6), min(im.width,bounds[2]+6), min(im.height,bounds[3]+6))
    im = im.crop(crop)
    factor = min(1, (1200 if mask else 800) / max(im.size))
    size = tuple(round(n * factor) for n in im.size)
    im = im.resize(size, Image.Resampling.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, optimize=True)
    b = im.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox()
    record = dict(sourceDimensions=dict(width=im.width, height=im.height),
                  visibleBounds=dict(minX=b[0], maxX=b[2]-1, minY=b[1], maxY=b[3]-1,
                                     width=b[2]-b[0], height=b[3]-b[1], centerX=(b[0]+b[2]-1)/2),
                  imageSrc='/' + path.relative_to(ROOT/'public').as_posix(),
                  originalDimensions=dict(width=original_size[0],height=original_size[1]),
                  crop=list(crop), resizeScale=factor, sha256=hashlib.sha256(path.read_bytes()).hexdigest())
    if mask:
        mask = mask.crop(crop).resize(size, Image.Resampling.LANCZOS)
        mask_path = LAYERS/'masks'/f'{item}-fabric-mask.png'
        mask.save(mask_path, optimize=True)
        record.update(fabricMaskSrc='/' + mask_path.relative_to(ROOT/'public').as_posix(),
                      isRecolorable=True, baseFabricLuminance=base)
        nx, ny = (neck[0]-crop[0])*factor, (neck[1]-crop[1])*factor
        hem = (bounds[3]-1-crop[1])*factor
        record.update(fittingAnchors=dict(neck=[nx,ny], hem=[nx,hem]),
                      targetNeck=target_neck, targetHem=target_hem)
    return record

def main():
    metadata = {}
    specs = [
        ('ao-nhat-binh', 'ao-nhat-binh.png', None, [896,328], [150,105], 414),
        ('ao-tac', 'ao-tac.png', None, [447,146], [150,105], 435),
        ('ao-dai', 'ao-dai.png', 'AoDai-layer.jpg', [447,87], [150,105], 510),
        ('ao-tu-than', 'ao-tu-than.png', 'AoTuThan-layer.jpg', [447,88], [150,105], 485),
        ('ao-ngu-than', 'ao-ngu-than.png', 'AoNguThan-layer.jpg', [447,152], [150,105], 433),
    ]
    # Existing valid cutouts are preserved as reproducible originals before optimization.
    baseline = ROOT/'assets/sources/baseline'
    baseline.mkdir(parents=True,exist_ok=True)
    for item, name, source, neck, target, hem in specs:
        if source:
            im = segment(source)
        else:
            raw = baseline/name
            if not raw.exists(): raw.write_bytes((LAYERS/name).read_bytes())
            im = Image.open(raw).convert('RGBA')
        if item == 'ao-nhat-binh':
            # The older cutout left a white/gray display-form neck above the collar.
            # Clear just its measured opening, preserving the embroidered collar sides.
            cavity = Image.new('L', im.size)
            ImageDraw.Draw(cavity).polygon([(831,300),(956,300),(950,370),(897,559),(842,370)], fill=255)
            a = np.array(im)
            a[np.array(cavity)>0,3] = 0
            hsv = cv2.cvtColor(a[:,:,:3],cv2.COLOR_RGB2HSV)
            yy,xx = np.indices(a.shape[:2])
            outside = ((xx < 835-.46*(yy-328)) | (xx > 950+.46*(yy-328))) & (yy<425)
            a[outside & (hsv[:,:,1]<35) & (hsv[:,:,2]>150),3] = 0
            im = Image.fromarray(a)
        metadata[item] = save_asset(item, im, LAYERS/name, neck, target, hem)
    # Reuse all verified support assets; optimize without changing genuine pixels/design.
    supports = {
      'bottom-silk-wide':'quan-lua.png', 'bottom-tailored-trousers':'bottoms/bottom-tailored-trousers.png',
      'bottom-raw-denim':'bottoms/bottom-raw-denim.png', 'shoes-guoc-moc':'shoes/shoes-guoc-moc.png',
      'shoes-chunky-loafer':'shoes/shoes-chunky-loafer.png','shoes-retro-sneaker':'shoes/shoes-retro-sneaker.png',
      'bag-gam-vintage':'bags/bag-gam-vintage.png','bag-tote-linen':'bags/bag-tote-linen.png',
      'bag-techwear-crossbody':'bags/bag-techwear-crossbody.png',
      **{f'accent-{s}':f'accessories/accent-{s}.png' for s in ['non-la','quai-thao-mini','y2k-shades','silver-jewelry']}}
    for item, name in supports.items():
        raw = baseline/name
        raw.parent.mkdir(parents=True,exist_ok=True)
        if not raw.exists(): raw.write_bytes((LAYERS/name).read_bytes())
        metadata[item] = save_asset(item, Image.open(raw).convert('RGBA'), LAYERS/name)
    (ROOT/'src/data/photoAssetMetadata.json').write_text(json.dumps(metadata, indent=2),encoding='utf-8')
    print('Prepared', len(metadata), 'validated-candidate layers and five masks; run asset validator before use.')

if __name__ == '__main__':
    before = {}
    if '--verify-repeatable' in sys.argv:
        metadata = json.loads((ROOT/'src/data/photoAssetMetadata.json').read_text(encoding='utf-8'))
        for record in metadata.values():
            for key in ['imageSrc','fabricMaskSrc']:
                if key in record:
                    path=ROOT/'public'/record[key].lstrip('/')
                    before[path]=hashlib.sha256(path.read_bytes()).hexdigest()
    main()
    if before:
        for path,expected in before.items():
            assert hashlib.sha256(path.read_bytes()).hexdigest()==expected, f'Non-repeatable output: {path}'
        print(f'Repeated preparation produced identical SHA-256 for all {len(before)} layers/masks.')
