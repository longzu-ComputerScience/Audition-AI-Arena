/** Mask alpha is the sole confidence weight; garment alpha is never changed. */
export function recolorFabricPixels(pixels: Uint8ClampedArray, mask: Uint8ClampedArray, targetHex: string, baseLuminance: number): void {
  if (pixels.length !== mask.length || !/^#[0-9a-f]{6}$/i.test(targetHex) || !Number.isFinite(baseLuminance) || baseLuminance <= 0) {
    throw new Error('Invalid textile pixels, mask, color or luminance');
  }
  const rgb = [1,3,5].map(i => parseInt(targetHex.slice(i,i+2),16));
  for (let i=0;i<pixels.length;i+=4) {
    if (!pixels[i+3] || !mask[i+3]) continue;
    const weight=mask[i+3]/255;
    const lum=.299*pixels[i]+.587*pixels[i+1]+.114*pixels[i+2];
    const shade=Math.max(.12,Math.min(2.2,lum/baseLuminance));
    // Highlights roll toward white rather than hard-clipping individual channels.
    const highlight=shade>1?(shade-1)/(shade+.6)*.65:0;
    for(let c=0;c<3;c++) {
      const value=shade<=1?rgb[c]*shade:rgb[c]+(255-rgb[c])*highlight;
      pixels[i+c]=Math.round(pixels[i+c]*(1-weight)+value*weight);
    }
  }
}
