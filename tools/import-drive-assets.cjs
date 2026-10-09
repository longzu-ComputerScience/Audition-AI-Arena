const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== IMPORTING & OPTIMIZING GOOGLE DRIVE ASSETS ===\n');

// Load scan manifest
const manifest = JSON.parse(fs.readFileSync('/tmp/drive_manifest.json', 'utf8'));
const files = manifest.files;

// Target folders
const DIRS = [
  'public/images/catalog/garments/ao-nhat-binh',
  'public/images/catalog/garments/ao-tac',
  'public/images/catalog/garments/ao-dai',
  'public/images/catalog/garments/ao-tu-than',
  'public/images/catalog/garments/ao-ngu-than',
  'public/images/catalog/bottoms',
  'public/images/catalog/shoes',
  'public/images/catalog/bags',
  'public/images/catalog/accessories',
  'public/images/catalog/sources',
];

DIRS.forEach(d => fs.mkdirSync(d, { recursive: true }));

const ASSET_SPECS = [
  // 1. Áo Dài
  { id: '1NF8jh1KmvXkX-cg1CdZVG-GGDlDtuwo8', name: 'AoDai_full.png', target: 'public/images/catalog/garments/ao-dai/full.webp', role: 'editorial', garmentId: 'ao-dai', view: 'full' },
  { id: '1_5JhK8J_qZOeOmdZGI3i4HFOxfGBkFLg', name: 'AoDai_nghieng.png', target: 'public/images/catalog/garments/ao-dai/nghieng.webp', role: 'editorial', garmentId: 'ao-dai', view: 'nghieng' },
  { id: '1C31ClNKKsxT1Bs-Hg7n-U9i_EjvRNkN2', name: 'AoDai_zoom.png', target: 'public/images/catalog/garments/ao-dai/zoom.webp', role: 'editorial', garmentId: 'ao-dai', view: 'zoom' },

  // 2. Áo Ngũ Thân
  { id: '1TgG2W9wsZBjhRRsWtj9hH4OEAfR3-J6L', name: 'AoNguThan_full.png', target: 'public/images/catalog/garments/ao-ngu-than/full.webp', role: 'editorial', garmentId: 'ao-ngu-than', view: 'full' },
  { id: '1KTavW-D-aW6xbIzvK6g2tkbpmvNC_np9', name: 'AoNguThan_nghieng.png', target: 'public/images/catalog/garments/ao-ngu-than/nghieng.webp', role: 'editorial', garmentId: 'ao-ngu-than', view: 'nghieng' },
  { id: '1FS-km_ET99_l4SZoHBV8y7Tg68ukn79H', name: 'AoNguThan_zoom.png', target: 'public/images/catalog/garments/ao-ngu-than/zoom.webp', role: 'editorial', garmentId: 'ao-ngu-than', view: 'zoom' },

  // 3. Áo Nhật Bình
  { id: '1lB7qJeO5HbfCtQgALwCZMZVD3528EOV3', name: 'AoNhatBinh_full.png', target: 'public/images/catalog/garments/ao-nhat-binh/full.webp', role: 'editorial', garmentId: 'ao-nhat-binh', view: 'full' },
  { id: '1-Cj_ND3SQdphS5aqY-DShPkm0Xnjln-3', name: 'AoNhatBinh_nghieng.png', target: 'public/images/catalog/garments/ao-nhat-binh/nghieng.webp', role: 'editorial', garmentId: 'ao-nhat-binh', view: 'nghieng' },
  { id: '1eXjQF3whda0Ok49iFedzoe-SQlJfaqwa', name: 'AoNhatBinh_zoom.png', target: 'public/images/catalog/garments/ao-nhat-binh/zoom.webp', role: 'editorial', garmentId: 'ao-nhat-binh', view: 'zoom' },

  // 4. Áo Tấc
  { id: '170Mox16bSrZUsrLvlvaOR7DmwCyM0M4V', name: 'AoTac_full.png', target: 'public/images/catalog/garments/ao-tac/full.webp', role: 'editorial', garmentId: 'ao-tac', view: 'full' },
  { id: '1jHPncHid2K8gok6baehUkB9hBtETHs5g', name: 'AoTac_nghieng.png', target: 'public/images/catalog/garments/ao-tac/nghieng.webp', role: 'editorial', garmentId: 'ao-tac', view: 'nghieng' },
  { id: '1XiZVDYj82Uix6oQT93xyfFmOOrDmOSQj', name: 'AoTac_zoom.png', target: 'public/images/catalog/garments/ao-tac/zoom.webp', role: 'editorial', garmentId: 'ao-tac', view: 'zoom' },

  // 5. Áo Tứ Thân
  { id: '1DSfZBTIMEZBweF1zeicuNZMkpvXKsYDu', name: 'AoTuThan_full.png', target: 'public/images/catalog/garments/ao-tu-than/full.webp', role: 'editorial', garmentId: 'ao-tu-than', view: 'full' },
  { id: '1ZFsXQ6BZVYpNH1a8v1a0Oe1TniE5LEZk', name: 'AoTuThan_nghieng.png', target: 'public/images/catalog/garments/ao-tu-than/nghieng.webp', role: 'editorial', garmentId: 'ao-tu-than', view: 'nghieng' },
  { id: '1yvr5TAQWDfpBp7B6fjrn7EcenXtN5zJo', name: 'AoTuThan_zoom.png', target: 'public/images/catalog/garments/ao-tu-than/zoom.webp', role: 'editorial', garmentId: 'ao-tu-than', view: 'zoom' },

  // 6. Bottoms
  { id: '1mce6MmTWce8A_03l9q9eUVFMkSwqSnSI', name: 'QuanLua.png', target: 'public/images/catalog/bottoms/bottom-silk-wide.webp', role: 'catalog', itemId: 'bottom-silk-wide' },
  { id: '1NaTvqFNg-04AhKf5pAaIglakioIkHMu0', name: 'QuanDenim.png', target: 'public/images/catalog/bottoms/bottom-raw-denim.webp', role: 'catalog', itemId: 'bottom-raw-denim' },
  { id: '1r9MQpONgSmZKLSQdz3xZCR-2Iv5RG6-4', name: 'QuanTay.png', target: 'public/images/catalog/bottoms/quan-tay-archive.webp', role: 'catalog-unmapped', note: 'Formal trousers in Drive, kept in catalog manifest without mismapping to cargo linen' },

  // 7. Shoes
  { id: '18P9q31nTWnA3fDR9Kimz57HQPxbJVXXi', name: 'GuocMoc.png', target: 'public/images/catalog/shoes/shoes-guoc-moc.webp', role: 'catalog', itemId: 'shoes-guoc-moc' },
  { id: '1hSYspAxInXPg54xAPGerSBZDIUGlA_7s', name: 'Chunky.png', target: 'public/images/catalog/shoes/shoes-chunky-loafer.webp', role: 'catalog', itemId: 'shoes-chunky-loafer' },
  { id: '1EwrfEpDrjlT0Oh7gn8EajGZpW8lefLjk', name: 'Sneaker.png', target: 'public/images/catalog/shoes/shoes-retro-sneaker.webp', role: 'catalog', itemId: 'shoes-retro-sneaker' },

  // 8. Bags
  { id: '1vGHZpo586kC6qk_yqY4545JrM2Mx09Wb', name: 'TuiGam.png', target: 'public/images/catalog/bags/bag-gam-vintage.webp', role: 'catalog', itemId: 'bag-gam-vintage' },
  { id: '1DGCuUdDSTw0N4qg9PjFVN_diAxs6AjjR', name: 'TuiTote.png', target: 'public/images/catalog/bags/bag-tote-linen.webp', role: 'catalog', itemId: 'bag-tote-linen' },
];

const importedManifest = [];

for (const spec of ASSET_SPECS) {
  const tmpSrc = `/tmp/drive_raw_${spec.name}`;
  console.log(`Downloading ${spec.name} (Drive ID: ${spec.id})...`);
  try {
    if (!fs.existsSync(tmpSrc)) {
      execSync(`curl -s -L "https://drive.google.com/uc?export=download&id=${spec.id}" -o "${tmpSrc}"`);
    }
    // Verify it is a valid image
    const fileType = execSync(`file "${tmpSrc}"`).toString();
    if (!fileType.includes('image') && !fileType.includes('PNG') && !fileType.includes('JPEG')) {
      throw new Error(`Invalid file type: ${fileType.trim()}`);
    }

    // Also copy raw source
    const rawDest = `public/images/catalog/sources/${spec.name}`;
    if (!fs.existsSync(rawDest)) {
      fs.copyFileSync(tmpSrc, rawDest);
    }

    // Create optimized WebP
    const resizeWidth = spec.role === 'editorial' ? 1200 : 800;
    execSync(`convert "${tmpSrc}" -resize ${resizeWidth}x -quality 90 "${spec.target}"`);
    const stat = fs.statSync(spec.target);
    console.log(`  ✓ Created ${spec.target} (${(stat.size / 1024).toFixed(1)} KB)`);

    importedManifest.push({
      ...spec,
      rawPath: rawDest,
      optimizedPath: spec.target,
      sizeBytes: stat.size,
      status: 'success'
    });
  } catch (err) {
    console.error(`  ✗ Failed ${spec.name}:`, err.message);
    importedManifest.push({
      ...spec,
      status: 'error',
      error: err.message
    });
  }
}

fs.writeFileSync('src/data/driveAssetManifest.json', JSON.stringify(importedManifest, null, 2));
console.log('\nSaved src/data/driveAssetManifest.json with', importedManifest.length, 'records.');
