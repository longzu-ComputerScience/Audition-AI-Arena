const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== VIỆT PHỤC REMIX: CUTOUT GENERATOR ===\n');

// 1. Process Quần Lụa
console.log('1. Processing Quần Lụa (bottom-silk-wide)...');
const qlW = 2048, qlH = 2048;
execSync('convert public/images/layers/sources/quan-lua-original.png /tmp/ql_raw.rgba');
const qlSrc = fs.readFileSync('/tmp/ql_raw.rgba');
const qlDst = Buffer.from(qlSrc);

const qlIsBgCandidate = new Uint8Array(qlW * qlH);
for (let y = 0; y < qlH; y++) {
  for (let x = 0; x < qlW; x++) {
    const idx = (y * qlW + x) * 4;
    const r = qlSrc[idx], g = qlSrc[idx + 1], b = qlSrc[idx + 2];
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const sat = maxC - minC;
    
    // Everything below y=1920 is floor/shadow
    if (y >= 1920) {
      qlIsBgCandidate[y * qlW + x] = 1;
    } else if (y < 148) {
      qlIsBgCandidate[y * qlW + x] = 1;
    } else if (minC >= 238 && sat <= 10) {
      qlIsBgCandidate[y * qlW + x] = 1;
    } else if (minC >= 230 && sat <= 6) {
      qlIsBgCandidate[y * qlW + x] = 1;
    }
  }
}

// Flood fill from borders
const qlIsBg = new Uint8Array(qlW * qlH);
const qlQueue = new Int32Array(qlW * qlH);
let qlHead = 0, qlTail = 0;

function qlPush(p) {
  if (!qlIsBg[p] && qlIsBgCandidate[p]) {
    qlIsBg[p] = 1;
    qlQueue[qlTail++] = p;
  }
}

for (let x = 0; x < qlW; x++) {
  qlPush(x);
  qlPush((qlH - 1) * qlW + x);
}
for (let y = 0; y < qlH; y++) {
  qlPush(y * qlW);
  qlPush(y * qlW + (qlW - 1));
}

while (qlHead < qlTail) {
  const curr = qlQueue[qlHead++];
  const x = curr % qlW;
  const y = (curr / qlW) | 0;
  if (x > 0) qlPush(curr - 1);
  if (x < qlW - 1) qlPush(curr + 1);
  if (y > 0) qlPush(curr - qlW);
  if (y < qlH - 1) qlPush(curr + qlW);
}

// Anti-aliased boundary feathering
for (let y = 0; y < qlH; y++) {
  for (let x = 0; x < qlW; x++) {
    const p = y * qlW + x;
    const idx = p * 4;
    if (qlIsBg[p]) {
      qlDst[idx + 3] = 0; // Transparent
    } else {
      // Check 3x3 neighborhood for edge feathering
      let bgNeighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= qlW || ny < 0 || ny >= qlH || qlIsBg[ny * qlW + nx]) {
            bgNeighbors++;
          }
        }
      }
      if (bgNeighbors > 0) {
        // Soft anti-aliased edge
        const alpha = Math.round(255 * (1 - (bgNeighbors / 9) * 0.7));
        qlDst[idx + 3] = Math.max(30, Math.min(255, alpha));
      } else {
        qlDst[idx + 3] = 255; // Solid opaque
      }
    }
  }
}

fs.writeFileSync('/tmp/ql_processed.rgba', qlDst);
execSync(`convert -size ${qlW}x${qlH} -depth 8 /tmp/ql_processed.rgba public/images/layers/quan-lua.png`);
console.log('✓ Saved public/images/layers/quan-lua.png');

// 2. Process Áo Nhật Bình
console.log('\n2. Processing Áo Nhật Bình (ao-nhat-binh)...');
const nbW = 1792, nbH = 2400;
execSync('convert public/images/layers/sources/ao-nhat-binh-original.png /tmp/nb_raw.rgba');
const nbSrc = fs.readFileSync('/tmp/nb_raw.rgba');
const nbDst = Buffer.from(nbSrc);

const nbIsBgCandidate = new Uint8Array(nbW * nbH);
for (let y = 0; y < nbH; y++) {
  for (let x = 0; x < nbW; x++) {
    const idx = (y * nbW + x) * 4;
    const r = nbSrc[idx], g = nbSrc[idx + 1], b = nbSrc[idx + 2];
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const sat = maxC - minC;
    
    // Everything below y=2212 is floor/ground shadow beneath the hem
    if (y >= 2212) {
      nbIsBgCandidate[y * nbW + x] = 1;
    } else if (minC >= 170 && sat <= 20) {
      nbIsBgCandidate[y * nbW + x] = 1;
    }
    
    // Protect chest panel & collar: collar starts at y=330 down to chest y=1100, width x=[760..1030]
    if (y >= 330 && y <= 1100 && x >= 760 && x <= 1030) {
      nbIsBgCandidate[y * nbW + x] = 0;
    }
  }
}

const nbIsBg = new Uint8Array(nbW * nbH);
const nbQueue = new Int32Array(nbW * nbH);
let nbHead = 0, nbTail = 0;

function nbPush(p) {
  if (!nbIsBg[p] && nbIsBgCandidate[p]) {
    nbIsBg[p] = 1;
    nbQueue[nbTail++] = p;
  }
}

for (let x = 0; x < nbW; x++) {
  nbPush(x);
  nbPush((nbH - 1) * nbW + x);
}
for (let y = 0; y < nbH; y++) {
  nbPush(y * nbW);
  nbPush(y * nbW + (nbW - 1));
}
// Seed neck opening at top
nbPush(10 * nbW + 896);

while (nbHead < nbTail) {
  const curr = nbQueue[nbHead++];
  const x = curr % nbW;
  const y = (curr / nbW) | 0;
  if (x > 0) nbPush(curr - 1);
  if (x < nbW - 1) nbPush(curr + 1);
  if (y > 0) nbPush(curr - nbW);
  if (y < nbH - 1) nbPush(curr + nbW);
}

// Anti-aliased boundary feathering
for (let y = 0; y < nbH; y++) {
  for (let x = 0; x < nbW; x++) {
    const p = y * nbW + x;
    const idx = p * 4;
    if (nbIsBg[p]) {
      nbDst[idx + 3] = 0; // Transparent
    } else {
      let bgNeighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= nbW || ny < 0 || ny >= nbH || nbIsBg[ny * nbW + nx]) {
            bgNeighbors++;
          }
        }
      }
      if (bgNeighbors > 0) {
        const alpha = Math.round(255 * (1 - (bgNeighbors / 9) * 0.7));
        nbDst[idx + 3] = Math.max(30, Math.min(255, alpha));
      } else {
        nbDst[idx + 3] = 255;
      }
    }
  }
}

fs.writeFileSync('/tmp/nb_processed.rgba', nbDst);
execSync(`convert -size ${nbW}x${nbH} -depth 8 /tmp/nb_processed.rgba public/images/layers/ao-nhat-binh.png`);
console.log('✓ Saved public/images/layers/ao-nhat-binh.png');

console.log('\n=== COMPLETE ===');
