import { recolorFabricPixels } from './fabricPixels';

const MAX_CACHE_ENTRIES = 8;
const recolorCache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();
const imageCache = new Map<string, Promise<HTMLImageElement>>();
function loadImage(src: string): Promise<HTMLImageElement> {
  const cached=imageCache.get(src);
  if(cached) { imageCache.delete(src);imageCache.set(src,cached);return cached; }
  const promise=new Promise<HTMLImageElement>((resolve,reject)=>{
    const img=new Image();
    if(/^https?:/.test(src)) img.crossOrigin='anonymous';
    img.onload=()=>resolve(img);
    img.onerror=()=>{imageCache.delete(src);reject(new Error(`Image decode failed: ${src}`));};
    img.src=src;
  });
  imageCache.set(src,promise);
  if(imageCache.size>10) imageCache.delete(imageCache.keys().next().value!);
  return promise;
}
export async function recolorGarmentImage(imageSrc: string,maskSrc: string,targetHex: string,baseFabricLuminance=100): Promise<string> {
  const key=`${imageSrc}|${maskSrc}|${targetHex.toLowerCase()}|${baseFabricLuminance}`;
  const cached=recolorCache.get(key);
  if(cached) {recolorCache.delete(key);recolorCache.set(key,cached);return cached;}
  if(inFlight.has(key)) return inFlight.get(key)!;
  const promise=(async()=>{
    const [img,mask]=await Promise.all([loadImage(imageSrc),loadImage(maskSrc)]);
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
    recolorFabricPixels(data.data,weights.data,targetHex,baseFabricLuminance);
    ctx.putImageData(data,0,0);
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Image encoding failed')),'image/png'));
    canvas.width=canvas.height=0;
    const url=URL.createObjectURL(blob);
    if(recolorCache.size>=MAX_CACHE_ENTRIES) {
      const oldest=recolorCache.keys().next().value!;
      URL.revokeObjectURL(recolorCache.get(oldest)!);recolorCache.delete(oldest);
    }
    recolorCache.set(key,url);
    return url;
  })().finally(()=>inFlight.delete(key));
  inFlight.set(key,promise);
  return promise;
}
