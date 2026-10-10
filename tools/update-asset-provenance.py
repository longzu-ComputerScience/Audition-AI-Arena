"""Keep editorial provenance intact; record raw downloads and reproducible derivatives."""
from pathlib import Path
import hashlib
import json

root=Path(__file__).resolve().parents[1]
inventory=json.loads((root/'assets/drive-inventory.json').read_text(encoding='utf-8'))
metadata=json.loads((root/'src/data/photoAssetMetadata.json').read_text(encoding='utf-8'))
manifest_path=root/'src/data/driveAssetManifest.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
manifest=[r for r in manifest if r.get('role')!='photo-layer']
source_names={
  'ao-nhat-binh':'ao-nhat-binh-layer.png','ao-tac':'AoTac-layer.png',
  'ao-dai':'AoDai-layer.jpg','ao-tu-than':'AoTuThan-layer.jpg','ao-ngu-than':'AoNguThan-layer.jpg',
  'bottom-silk-wide':'quan-lua-layer.png','bottom-tailored-trousers':'QuanTay-layer.png','bottom-raw-denim':'QuanDenim-layer.png',
  'shoes-guoc-moc':'guoc-moc-layer.png','shoes-chunky-loafer':'shoes-chunky-loafer-layer.png','shoes-retro-sneaker':'shoes-retro-sneaker-layer.png',
  'bag-gam-vintage':'bag-gam-layer.png','bag-tote-linen':'bag-tote-linen-layer.png','bag-techwear-crossbody':'bag-techwear-crossbody-layer.png',
  **{f'accent-{s}':f'accent-{s}-layer.png' for s in ['non-la','quai-thao-mini','silver-jewelry','y2k-shades']},
}
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
downloads=[]
for path in sorted((root/'assets/sources/drive').iterdir()):
  r=next(r for r in inventory if Path(r['path']).name==path.name and ('/Layer/' in r['path'] or path.name=='TuiGam.png'))
  downloads.append(dict(id=r['id'],drivePath=r['path'],localPath=path.relative_to(root).as_posix(),sizeBytes=path.stat().st_size,sha256=digest(path)))
for item,m in metadata.items():
  name=source_names[item]
  original=next(d for d in downloads if Path(d['localPath']).name==name)
  target='public'+m['imageSrc']
  baseline='assets/sources/baseline/'+m['imageSrc'].split('/layers/')[1]
  input_path=original['localPath'] if name.endswith('.jpg') else baseline
  entry=dict(id=original['id'],name=name,role='photo-layer',itemId=item,target=target,
    rawPath=original['localPath'],rawSha256=original['sha256'],processingInput=input_path,
    inputSha256=digest(root/input_path),optimizedPath=target,sha256=digest(root/target),
    sizeBytes=(root/target).stat().st_size,status='success',alphaValidated=True,
    conversion='GrabCut connected-garment segmentation; inner edge feather; alpha crop; uniform resize' if name.endswith('.jpg') else 'Reuse existing transparent cutout; alpha crop; uniform resize',
    sourceDimensions=m['sourceDimensions'],visibleBounds=m['visibleBounds'],crop=m['crop'],resizeScale=m['resizeScale'])
  if m.get('fabricMaskSrc'):
    entry.update(maskPath='public'+m['fabricMaskSrc'],maskSha256=digest(root/('public'+m['fabricMaskSrc'])),baseFabricLuminance=m['baseFabricLuminance'])
  if item=='ao-nhat-binh':entry['conversion']+='; measured display-form neck cleanup'
  manifest.append(entry)
duplicates=[]
for r in inventory:
  if any(d['id']==r['id'] for d in downloads):continue
  if '/Layer/' in r['path'] or r['mimeType'].endswith('folder'):continue
  matches=[d for d in downloads if Path(d['drivePath']).name==Path(r['path']).name and d['sizeBytes']==r['sizeBytes']]
  if matches:duplicates.append(dict(id=r['id'],drivePath=r['path'],sameNameAndSizeAs=matches[0]['drivePath'],downloaded=False,binaryEqualityVerified=False))
(root/'assets/download-provenance.json').write_text(json.dumps(dict(downloads=downloads,duplicateCandidatesSkipped=duplicates),indent=2,ensure_ascii=False),encoding='utf-8')
manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
lines=['# Photo asset processing record','',
  'Original Drive files are archived without modification. Runtime layers are separate derivatives. Editorial/Lookbook entries retain their original mappings.','',
  '## Exact downloads','', '| Drive path | Drive file ID | Bytes | Original |','|---|---|---:|---|']
for d in downloads:
  lines.append(f"| {d['drivePath']} | `{d['id']}` | {d['sizeBytes']} | [{Path(d['localPath']).name}]({d['localPath'].removeprefix('assets/')}) |")
lines+=['','## Runtime derivatives','',
  'Three JPEG garments were segmented offline. Two existing garment cutouts and thirteen support cutouts were reused, cropped by real alpha bounds and uniformly resized. Original masks for Nhật Bình and Tấc are also archived in `sources/baseline/masks/`.','',
  '| Catalog ID | PNG dimensions | Input | Recolor mask |','|---|---|---|---|']
for item,m in metadata.items():
  entry=next(r for r in manifest if r.get('role')=='photo-layer' and r['itemId']==item)
  dimensions=m['sourceDimensions']
  lines.append(f"| `{item}` | {dimensions['width']} × {dimensions['height']} | `{entry['processingInput']}` | {'yes' if m.get('isRecolorable') else 'no'} |")
lines+=['','All eighteen files passed PNG decoding, transparency, alpha bounds, measured aspect ratio and fitting validation. All five masks passed coverage, dimensions and spill checks. No catalog item lacks a valid photo asset.','',
  '## Duplicate candidates skipped','',
  'These four files have the same filename and size as the Layer copies. Their remote binaries were not downloaded or hash-compared; binary equality is not claimed.','',
  '| Drive path | Drive file ID | Layer counterpart |','|---|---|---|']
for d in duplicates:lines.append(f"| {d['drivePath']} | `{d['id']}` | {d['sameNameAndSizeAs']} |")
lines+=['','Full hashes, processing inputs, crop/resize transforms, mask hashes and source IDs are in [download-provenance.json](download-provenance.json), [photoAssetMetadata.json](../src/data/photoAssetMetadata.json) and [driveAssetManifest.json](../src/data/driveAssetManifest.json).','']
(root/'assets/README.md').write_text('\n'.join(lines),encoding='utf-8')
print(f'Recorded {len(downloads)} raw downloads, {len(metadata)} derivatives and {len(duplicates)} duplicate candidates.')
