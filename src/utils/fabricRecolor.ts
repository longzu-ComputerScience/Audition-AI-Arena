/**
 * In-browser canvas-based fabric recoloring engine.
 * Applies luminance-preserving color transformation onto masked fabric regions
 * while strictly preserving embroidery, decorative borders, and textile texture.
 */

const recolorCache = new Map<string, string>();

function parseHexRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return [140, 59, 36];
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return [140, 59, 36];
  }
  return [r, g, b];
}

export async function recolorGarmentImage(
  imageSrc: string,
  maskSrc: string,
  targetHex: string
): Promise<string> {
  const cacheKey = `${imageSrc}::${maskSrc}::${targetHex.toLowerCase()}`;
  if (recolorCache.has(cacheKey)) {
    return recolorCache.get(cacheKey)!;
  }

  // Load both source image and fabric mask
  const [img, mask] = await Promise.all([loadImage(imageSrc), loadImage(maskSrc)]);

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return imageSrc;

  // Draw source image
  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imgData.data;

  // Draw mask to a secondary canvas to read mask alpha/gray values
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!maskCtx) return imageSrc;

  maskCtx.drawImage(mask, 0, 0, canvas.width, canvas.height);
  const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
  const maskPixels = maskData.data;

  const [tr, tg, tb] = parseHexRgb(targetHex);
  const targetLum = 0.299 * tr + 0.587 * tg + 0.114 * tb;
  const isLight = targetLum > 160;
  const baseRedLum = 68; // Base red silk luminance in original photograph

  const totalLen = pixels.length;
  for (let i = 0; i < totalLen; i += 4) {
    const maskVal = maskPixels[i]; // 0 to 255
    if (maskVal === 0) continue;

    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const origLum = 0.299 * r + 0.587 * g + 0.114 * b;
    const weight = maskVal / 255;

    let nr: number, ng: number, nb: number;
    if (!isLight) {
      // Normal and dark colors: luminance-preserving shading factor
      const shade = Math.min(2.2, Math.max(0.15, origLum / baseRedLum));
      nr = Math.min(255, Math.max(0, tr * shade));
      ng = Math.min(255, Math.max(0, tg * shade));
      nb = Math.min(255, Math.max(0, tb * shade));
    } else {
      // Light / cream / white tones: preserve natural textile shadow depth without washout
      const normLum = Math.min(1.0, Math.max(0.0, (origLum - 25) / 110));
      const shadowFactor = 0.65 + normLum * 0.45;
      nr = Math.min(255, Math.max(0, tr * shadowFactor));
      ng = Math.min(255, Math.max(0, tg * shadowFactor));
      nb = Math.min(255, Math.max(0, tb * shadowFactor));
    }

    // Perceptual blend by mask weight
    pixels[i] = Math.round((1 - weight) * r + weight * nr);
    pixels[i + 1] = Math.round((1 - weight) * g + weight * ng);
    pixels[i + 2] = Math.round((1 - weight) * b + weight * nb);
  }

  ctx.putImageData(imgData, 0, 0);
  const dataUrl = canvas.toDataURL('image/png');
  recolorCache.set(cacheKey, dataUrl);

  return dataUrl;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
