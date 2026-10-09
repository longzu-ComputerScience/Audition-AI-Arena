const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== GENERATING ÁO NHẬT BÌNH FABRIC RECOLORING MASK ===\n');

const w = 1792, h = 2400;
execSync('convert public/images/layers/ao-nhat-binh.png /tmp/nb_layer.rgba');
const src = fs.readFileSync('/tmp/nb_layer.rgba');
const mask = Buffer.alloc(w * h * 4); // RGBA mask

fs.mkdirSync('public/images/layers/masks', { recursive: true });

let maskedCount = 0;
let totalGarment = 0;

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = (y * w + x) * 4;
    const r = src[idx];
    const g = src[idx + 1];
    const b = src[idx + 2];
    const a = src[idx + 3];

    if (a < 20) {
      // Outside garment -> 0
      mask[idx] = 0;
      mask[idx + 1] = 0;
      mask[idx + 2] = 0;
      mask[idx + 3] = 0;
      continue;
    }

    totalGarment++;

    // Calculate saturation and hue properties
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const delta = maxC - minC;

    // Check if pixel is RED silk fabric:
    // 1. Red must strongly dominate Green and Blue
    const isRedDominated = (r >= 95) && (r - g >= 32) && (r - b >= 32);

    // 2. Exclude Rectangular Collar and Chest Embroidery:
    // Collar is centered around x=[760..1035], from y=330 down to y=1100
    // Any embroidery or gold/blue/green/white/metallic details have lower red dominance or high G/B
    const inCollarRegion = (x >= 755 && x <= 1040 && y >= 325 && y <= 1120);
    const isEmbroideryDetail = (g >= 75 || b >= 75 || delta < 30 || maxC < 70);

    // 3. Exclude Sleeve Cuff Trim (Ngũ hành stripes on sleeve cuffs):
    // Left sleeve cuff: x < 550, y in [750..1350]
    // Right sleeve cuff: x > 1250, y in [750..1350]
    const inCuffRegion = (y >= 750 && y <= 1350) && (x < 550 || x > 1250);
    const isCuffTrim = inCuffRegion && (g >= 60 || b >= 60 || r < 110 || (r - g < 40));

    // 4. Exclude Lower Wave Trim (Thủy ba hoa văn ở gấu áo):
    // Wave trim starts around y >= 1650 down to 2210
    const inWaveRegion = y >= 1650;
    const isWavePattern = inWaveRegion && (g >= 55 || b >= 55 || (r - g < 45) || (r - b < 45));

    // Exclude round medallions / round badges (hoa văn đoàn phụng) on chest & sleeves if they contain colored embroidery
    const isMedallionGoldOrMulti = (g >= 70 || b >= 65) && (r - g < 50 || r - b < 50);

    let weight = 0;
    if (isRedDominated && !isCuffTrim && !isWavePattern && (!inCollarRegion || !isEmbroideryDetail) && !isMedallionGoldOrMulti) {
      // Calculate normalized red fabric confidence (0 to 1)
      const redExcess = Math.min(r - g, r - b);
      weight = Math.min(1, Math.max(0, (redExcess - 30) / 25));
    }

    if (weight > 0) {
      maskedCount++;
      const val = Math.round(weight * 255);
      mask[idx] = val;
      mask[idx + 1] = val;
      mask[idx + 2] = val;
      mask[idx + 3] = val; // Grayscale + Alpha
    } else {
      mask[idx] = 0;
      mask[idx + 1] = 0;
      mask[idx + 2] = 0;
      mask[idx + 3] = 0;
    }
  }
}

console.log(`Garment pixels: ${totalGarment}`);
console.log(`Recolorable fabric pixels: ${maskedCount} (${(maskedCount / totalGarment * 100).toFixed(2)}% of garment)`);

fs.writeFileSync('/tmp/nb_mask_raw.rgba', mask);
execSync(`convert -size ${w}x${h} -depth 8 /tmp/nb_mask_raw.rgba public/images/layers/masks/ao-nhat-binh-fabric-mask.png`);
console.log('✓ Saved public/images/layers/masks/ao-nhat-binh-fabric-mask.png');
