const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== TESTING FABRIC RECOLORING ALGORITHM ===\n');

const w = 1792, h = 2400;
execSync('convert public/images/layers/ao-nhat-binh.png /tmp/nb_test_src.rgba');
execSync('convert public/images/layers/masks/ao-nhat-binh-fabric-mask.png /tmp/nb_test_mask.rgba');

const src = fs.readFileSync('/tmp/nb_test_src.rgba');
const mask = fs.readFileSync('/tmp/nb_test_mask.rgba');

function recolorImage(targetHex) {
  const cleanHex = targetHex.replace('#', '');
  const tr = parseInt(cleanHex.slice(0, 2), 16);
  const tg = parseInt(cleanHex.slice(2, 4), 16);
  const tb = parseInt(cleanHex.slice(4, 6), 16);
  
  const targetLum = 0.299 * tr + 0.587 * tg + 0.114 * tb;
  const isLight = targetLum > 160;

  const out = Buffer.from(src);
  const baseRedLum = 68; // Average luminance of red fabric in original photo

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const mVal = mask[idx]; // 0 to 255
      if (mVal === 0) continue;

      const r = src[idx], g = src[idx + 1], b = src[idx + 2];
      const origLum = 0.299 * r + 0.587 * g + 0.114 * b;
      const weight = mVal / 255;

      let nr, ng, nb;
      if (!isLight) {
        // Normal / Dark tones: scale target color by relative shading
        const shade = Math.min(2.2, Math.max(0.15, origLum / baseRedLum));
        nr = Math.min(255, Math.max(0, tr * shade));
        ng = Math.min(255, Math.max(0, tg * shade));
        nb = Math.min(255, Math.max(0, tb * shade));
      } else {
        // Light / Cream / White tones: preserve contrast without washing out folds
        const normLum = Math.min(1.0, Math.max(0.0, (origLum - 25) / 110));
        // Shadow color is warm beige, highlight color is target tone
        const shadowFactor = 0.65 + normLum * 0.45;
        nr = Math.min(255, Math.max(0, tr * shadowFactor));
        ng = Math.min(255, Math.max(0, tg * shadowFactor));
        nb = Math.min(255, Math.max(0, tb * shadowFactor));
      }

      // Smooth blend
      out[idx] = Math.round((1 - weight) * r + weight * nr);
      out[idx + 1] = Math.round((1 - weight) * g + weight * ng);
      out[idx + 2] = Math.round((1 - weight) * b + weight * nb);
    }
  }

  return out;
}

const testColors = [
  { name: 'blue_royal', hex: '#1D4E89' },
  { name: 'cream_ivory', hex: '#EDE8DF' },
  { name: 'emerald_dark', hex: '#1C494A' },
  { name: 'golden_silk', hex: '#D4AF37' },
];

for (const c of testColors) {
  const buf = recolorImage(c.hex);
  fs.writeFileSync(`/tmp/nb_recolor_${c.name}.rgba`, buf);
  execSync(`convert -size ${w}x${h} -depth 8 /tmp/nb_recolor_${c.name}.rgba -resize 600x /tmp/nb_preview_${c.name}.jpg`);
  console.log(`✓ Generated /tmp/nb_preview_${c.name}.jpg for ${c.name} (${c.hex})`);
}

console.log('\nAll test recoloring passes completed successfully!');
