import { recolorFabricPixels } from './fabricPixels';
import { loadPhotoImage, forgetPhotoImage } from './photoImageCache';

const MAX_CACHE_ENTRIES = 8;
const recolorCache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();
const leases = new Map<string, number>();
export function recolorCacheSnapshot() { return { recolors:recolorCache.size, inFlight:inFlight.size, leasedUrls:leases.size }; }
const cacheKey = (image: string, mask: string, hex: string, base=100) => `${image}|${mask}|${hex.toLowerCase()}|${base}`;
function prune() {
  for (const [key, url] of recolorCache) {
    if (recolorCache.size <= MAX_CACHE_ENTRIES) break;
    if (leases.has(url)) continue;
    recolorCache.delete(key); forgetPhotoImage(url); URL.revokeObjectURL(url);
  }
}
export function peekRecoloredGarmentImage(image: string, mask: string, hex: string, base=100) {
  return recolorCache.get(cacheKey(image, mask, hex, base));
}
export function retainRecoloredImage(url: string) {
  leases.set(url, (leases.get(url) ?? 0) + 1);
  return () => { const count=(leases.get(url) ?? 1)-1; if(count) leases.set(url,count); else leases.delete(url); prune(); };
}
export async function recolorGarmentImage(imageSrc: string,maskSrc: string,targetHex: string,baseFabricLuminance=100): Promise<string> {
  const key=cacheKey(imageSrc,maskSrc,targetHex,baseFabricLuminance);
  const cached=recolorCache.get(key);
  if(cached) {recolorCache.delete(key);recolorCache.set(key,cached);return cached;}
  if(inFlight.has(key)) return inFlight.get(key)!;
  const promise=(async()=>{
    const [img,mask]=await Promise.all([loadPhotoImage(imageSrc),loadPhotoImage(maskSrc)]);
    if(img.naturalWidth!==mask.naturalWidth||img.naturalHeight!==mask.naturalHeight) throw new Error('Fabric mask dimension mismatch');
    const canvas=document.createElement('canvas');
    canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx) throw new Error('Canvas unavailable');
    ctx.drawImage(img,0,0);
    const data=ctx.getImageData(0,0,canvas.width,canvas.height);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(mask,0,0);
    const weights=ctx.getImageData(0,0,canvas.width,canvas.height);
    // Preserve the exact pixel algorithm, but yield between bounded chunks on slow devices.
    let lastYield=performance.now();
    for(let offset=0;offset<data.data.length;offset+=65536) {
      recolorFabricPixels(data.data.subarray(offset,offset+65536),weights.data.subarray(offset,offset+65536),targetHex,baseFabricLuminance);
      if(performance.now()-lastYield>8) { await new Promise<void>(resolve=>setTimeout(resolve,0));lastYield=performance.now(); }
    }
    ctx.putImageData(data,0,0);
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Image encoding failed')),'image/png'));
    canvas.width=canvas.height=0;
    const url=URL.createObjectURL(blob);
    try { await loadPhotoImage(url); } catch(error) { forgetPhotoImage(url);URL.revokeObjectURL(url);throw error; }
    recolorCache.set(key,url);
    prune();
    return url;
  })().finally(()=>inFlight.delete(key));
  inFlight.set(key,promise);
  return promise;
}
