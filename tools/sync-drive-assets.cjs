const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== SYNCING NEW DRIVE ASSETS (LOOKBOOK & BAGS & ACCESSORIES) ===\n');

const DIRS = [
  'public/images/catalog/lookbook',
  'public/images/catalog/bags',
  'public/images/catalog/accessories',
  'public/images/catalog/sources',
];

DIRS.forEach((d) => fs.mkdirSync(d, { recursive: true }));

const NEW_ASSETS = [
  // A. Five LookBook Images
  {
    id: '1S1pmpU_1eKTQjkwTB1LEiC730tSEeP6v',
    name: 'LookBook_AoNhatBinh.png',
    target: 'public/images/catalog/lookbook/ao-nhat-binh.webp',
    role: 'lookbook',
    garmentId: 'ao-nhat-binh',
    resizeWidth: 1400,
  },
  {
    id: '1Fri202tpG8br8T9uxCu6PRj1XeKHllzA',
    name: 'LookBook_AoTac.png',
    target: 'public/images/catalog/lookbook/ao-tac.webp',
    role: 'lookbook',
    garmentId: 'ao-tac',
    resizeWidth: 1400,
  },
  {
    id: '1E4IRlfP0vyNcTkJMUHuc2QisVl8UDu93',
    name: 'LookBook_AoDai.png',
    target: 'public/images/catalog/lookbook/ao-dai.webp',
    role: 'lookbook',
    garmentId: 'ao-dai',
    resizeWidth: 1400,
  },
  {
    id: '1OQ9VSdY5wcJWVG9qmdzEKbfuhVmBKv4B',
    name: 'LookBook_AoTuThan.png',
    target: 'public/images/catalog/lookbook/ao-tu-than.webp',
    role: 'lookbook',
    garmentId: 'ao-tu-than',
    resizeWidth: 1400,
  },
  {
    id: '1gm2C7hKYUlXM6umjZ0cZB-qkY7rqTn8S',
    name: 'LookBook_AoNguThan.png',
    target: 'public/images/catalog/lookbook/ao-ngu-than.webp',
    role: 'lookbook',
    garmentId: 'ao-ngu-than',
    resizeWidth: 1400,
  },

  // B. Crossbody Bag
  {
    id: '1iB-8sCwIi9zWEvBl4gbRbfC4RcWKd_3S',
    name: 'TuiDeoCheo.png',
    target: 'public/images/catalog/bags/bag-techwear-crossbody.webp',
    role: 'catalog',
    itemId: 'bag-techwear-crossbody',
    resizeWidth: 800,
  },

  // C. Accessories from Drive Phụ kiện folder
  {
    id: '1F3Af9sDtcQtuputIDdK6aDnOSu6zhKg-',
    name: 'NonLa.png',
    target: 'public/images/catalog/accessories/accent-non-la.webp',
    role: 'catalog',
    itemId: 'accent-non-la',
    resizeWidth: 800,
  },
  {
    id: '10Bac1z5b2OBHVWyMa9EXXytcQBfEANzo',
    name: 'KinhMat.png',
    target: 'public/images/catalog/accessories/accent-y2k-shades.webp',
    role: 'catalog',
    itemId: 'accent-y2k-shades',
    resizeWidth: 800,
  },
  {
    id: '1l8ZEuLVlos4Vw7uaGMuUjh4dxfGC_qsS',
    name: 'NonQuaiThao.png',
    target: 'public/images/catalog/accessories/accent-quai-thao-mini.webp',
    role: 'catalog',
    itemId: 'accent-quai-thao-mini',
    resizeWidth: 800,
  },
  {
    id: '1iCnek_dDJKp7IBVKj8nhHh_yaYUiWVjF',
    name: 'ChuoiBac.png',
    target: 'public/images/catalog/accessories/accent-silver-jewelry.webp',
    role: 'catalog',
    itemId: 'accent-silver-jewelry',
    resizeWidth: 800,
  },
];

const existingManifestPath = 'src/data/driveAssetManifest.json';
let manifest = [];
if (fs.existsSync(existingManifestPath)) {
  manifest = JSON.parse(fs.readFileSync(existingManifestPath, 'utf8'));
}

const manifestMap = new Map();
manifest.forEach((item) => manifestMap.set(item.id, item));

for (const asset of NEW_ASSETS) {
  const tmpSrc = `/tmp/drive_sync_${asset.name}`;
  console.log(`Processing ${asset.name} (Drive ID: ${asset.id})...`);

  if (!fs.existsSync(tmpSrc)) {
    console.log(`  Downloading from Google Drive...`);
    execSync(`curl -s -L "https://drive.google.com/uc?export=download&id=${asset.id}" -o "${tmpSrc}"`);
  }

  // Verify binary type
  const fileType = execSync(`file "${tmpSrc}"`).toString();
  if (!fileType.includes('image') && !fileType.includes('PNG') && !fileType.includes('JPEG')) {
    console.error(`  ERROR: Invalid file type for ${asset.name}: ${fileType.trim()}`);
    continue;
  }

  // Save to catalog sources
  const rawDest = `public/images/catalog/sources/${asset.name}`;
  fs.copyFileSync(tmpSrc, rawDest);

  // Convert to WebP
  execSync(`convert "${tmpSrc}" -resize ${asset.resizeWidth}x -quality 90 "${asset.target}"`);
  const stat = fs.statSync(asset.target);
  console.log(`  ✓ Generated ${asset.target} (${(stat.size / 1024).toFixed(1)} KB)`);

  manifestMap.set(asset.id, {
    id: asset.id,
    name: asset.name,
    target: asset.target,
    role: asset.role,
    garmentId: asset.garmentId,
    itemId: asset.itemId,
    rawPath: rawDest,
    optimizedPath: asset.target,
    sizeBytes: stat.size,
    status: 'success',
  });
}

const updatedManifest = Array.from(manifestMap.values());
fs.writeFileSync(existingManifestPath, JSON.stringify(updatedManifest, null, 2));
console.log(`\nUpdated ${existingManifestPath} with ${updatedManifest.length} total entries.`);
