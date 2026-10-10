"""Decode, transparency and mask checks for the actual configured runtime assets."""
import json
import hashlib
import sys
from pathlib import Path
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
records = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
reports = []
for c in records:
    path = root / 'public' / c['imageSrc'].lstrip('/')
    assert hashlib.sha256(path.read_bytes()).hexdigest() == c['sha256'], f'{path}: derivative differs from measured metadata'
    with Image.open(path) as raw:
        assert raw.format == 'PNG' and 'A' in raw.getbands(), f'{path}: missing real alpha'
        raw.load()
        a = np.array(raw.convert('RGBA'))
    h,w = a.shape[:2]
    assert (w,h) == (c['sourceDimensions']['width'],c['sourceDimensions']['height'])
    alpha = a[:,:,3]
    fraction = float((alpha<20).mean())
    assert fraction > .04, f'{path}: suspicious opaque background'
    assert (alpha>220).mean() > .08, f'{path}: empty/over-segmented garment'
    ys,xs = np.where(alpha>20)
    actual = [int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())]
    b = c['visibleBounds']
    assert actual == [b['minX'],b['minY'],b['maxX'],b['maxY']], f'{path}: stale alpha bounds'
    report = {'id':c['catalogId'],'dimensions':[w,h],'transparentFraction':round(fraction,4),'alphaBounds':actual}
    if c.get('isRecolorable'):
        m = Image.open(root/'public'/c['fabricMaskSrc'].lstrip('/')).convert('RGBA')
        assert m.size == (w,h), f'{path}: mask dimensions'
        weight = np.array(m)[:,:,3]
        coverage = float((weight>20).sum()/(alpha>20).sum())
        assert .1 < coverage <= 1, f'{path}: invalid primary textile coverage {coverage}'
        if c['catalogId'] != 'ao-tac':
            # A small floral cluster or piping can occupy less than 1% of the cloth.
            assert ((weight == 0) & (alpha > 220)).sum() > 50, f'{path}: no protected decoration'
        assert (weight[alpha==0]>20).sum()/max(1,(weight>20).sum()) < .003, f'{path}: mask spills outside garment'
        assert 0 < c['baseFabricLuminance'] < 255
        report['fabricCoverage']=round(coverage,4)
    reports.append(report)
(root/'artifacts/asset-validation.json').write_text(json.dumps(reports,indent=2),encoding='utf-8')
provenance=root/'assets/download-provenance.json'
if provenance.exists():
    for source in json.loads(provenance.read_text(encoding='utf-8'))['downloads']:
        path=root/source['localPath']
        assert path.stat().st_size==source['sizeBytes']
        assert hashlib.sha256(path.read_bytes()).hexdigest()==source['sha256'], f'{path}: original download changed'
        if source.get('originalDownload',{}).get('archivedPath'):
            archived=source['originalDownload']
            original=root/archived['archivedPath']
            assert original.stat().st_size==archived['sizeBytes']
            assert hashlib.sha256(original.read_bytes()).hexdigest()==archived['sha256'], 'Archived original changed'
print(json.dumps(reports,indent=2))
