import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('all 675 catalog outfits render their selected photo layers',async({page})=>{
  await page.goto('/tools/visual-fixture.html');
  const count=await page.evaluate(async()=>{
    const path='/src/data/mockFashionData.ts';
    const {CORE_ITEMS,SUPPORT_ITEMS,resolveCoreGarmentColor}=await import(path);
    const fittingPath='/src/data/layeredOutfitMap.ts';
    const {getPhotoLayerConfig}=await import(fittingPath);
    let count=0;
    for(const core of Object.keys(CORE_ITEMS)) for(let bottom=0;bottom<3;bottom++)
      for(let shoes=0;shoes<3;shoes++) for(let bag=0;bag<3;bag++) for(const accent of [null,0,1,2,3]) {
        window.setTestOutfit({core:core as any,bottom,shoes,bag,accent,color:'Để hệ thống gợi ý'});
        const deadline=Date.now()+10_000;
        while(true){
          await new Promise(requestAnimationFrame);
          const c=document.querySelector('#photo-layer-core image');
          const expected=[SUPPORT_ITEMS.bottom[bottom].id,SUPPORT_ITEMS.shoes[shoes].id,SUPPORT_ITEMS.bag[bag].id];
          const selected=['bottom','shoes','bag'].every((slot,i)=>document.querySelector(`#photo-layer-${slot} image`)?.getAttribute('href')===getPhotoLayerConfig(slot,expected[i]).imageSrc);
          const a=document.querySelector('#photo-layer-accent image');
          const correctAccent=accent===null?!a:a?.getAttribute('href')?.includes(SUPPORT_ITEMS.accent[accent].id);
          if(c?.getAttribute('data-garment-id')===core && c.getAttribute('data-fabric-color')===resolveCoreGarmentColor(core,'Để hệ thống gợi ý').hex && selected&&correctAccent)break;
          if(Date.now()>deadline)throw new Error(`Incomplete photo outfit: ${[core,bottom,shoes,bag,accent].join('|')}`);
        }
        count++;
      }
    return count;
  });
  expect(count).toBe(675);
});

test('real masks preserve alpha, protected decoration and folds for 30 recolors',async({page})=>{
  await page.goto('/tools/visual-fixture.html');
  const reports=await page.evaluate(async()=>{
    const cfgPath='/src/data/layeredOutfitMap.ts',recolorPath='/src/utils/fabricRecolor.ts',palettePath='/src/data/mockFashionData.ts';
    const {PHOTO_LAYER_CONFIG}=await import(cfgPath),{recolorGarmentImage}=await import(recolorPath),{resolveCoreGarmentColor}=await import(palettePath);
    async function pixels(src:string){
      const image=new Image();image.src=src;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
      const context=canvas.getContext('2d')!;context.drawImage(image,0,0);
      return context.getImageData(0,0,canvas.width,canvas.height).data;
    }
    const report=[];
    for(const [core,c] of Object.entries(PHOTO_LAYER_CONFIG.core) as [string,any][]){
      const source=await pixels(c.imageSrc),mask=await pixels(c.fabricMaskSrc);
      for(const color of ['Để hệ thống gợi ý','Xanh lam','Đỏ son','Trắng / kem','Đen','Xanh ngọc']){
        const hex=resolveCoreGarmentColor(core,color).hex;
        const output=await pixels(await recolorGarmentImage(c.imageSrc,c.fabricMaskSrc,hex,c.baseFabricLuminance));
        let changed=0,protectedCount=0,folds=0,lastLum=-1,lastOut=-1;
        const samples:[number,number][]=[];
        for(let p=0;p<source.length;p+=4){
          if(source[p+3]!==output[p+3])throw new Error(`${core}: alpha changed`);
          if(source[p+3]!==255)continue;
          const delta=Math.max(...[0,1,2].map(i=>Math.abs(source[p+i]-output[p+i])));
          if(mask[p+3]===0){protectedCount++;if(delta>1)throw new Error(`${core}: protected detail recolored`);}
          if(mask[p+3]>240){if(delta>10)changed++; if(p%80===0)samples.push([source[p]*.299+source[p+1]*.587+source[p+2]*.114,output[p]*.299+output[p+1]*.587+output[p+2]*.114]);}
        }
        samples.sort((a,b)=>a[0]-b[0]);
        for(const [lum,out] of samples){if(lum>lastLum+2){if(out+3>=lastOut)folds++;lastLum=lum;lastOut=out;}}
        if(changed<1000||folds<8)throw new Error(`${core}/${hex}: insufficient recolor or lost folds`);
        if(core!=='ao-tac'&&protectedCount<50)throw new Error(`${core}: decorations lack protection`);
        report.push({core,color,hex,changed,protectedCount,folds});
      }
    }
    return report;
  });
  expect(reports).toHaveLength(30);
  fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/recolor-validation.json',JSON.stringify(reports,null,2));
});

test('rapid garment and color changes cannot display a stale recolor; photos are the standard UI',async({page})=>{
  await page.goto('/tools/visual-fixture.html');
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-garment-id','ao-nhat-binh');
  await page.evaluate(async()=>{
    for(const core of ['ao-dai','ao-tu-than','ao-tac','ao-nhat-binh','ao-ngu-than']){
      window.setTestOutfit({core:core as any,color:'Xanh lam'});
      await new Promise(requestAnimationFrame);
    }
    window.setTestOutfit({core:'ao-dai',color:'Đỏ son'});
  });
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-garment-id','ao-dai');
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-fabric-color','#C23B22');
  await expect(page.getByRole('radiogroup',{name:'Chế độ hiển thị mannequin'})).toHaveCount(0);
  await page.evaluate(()=>window.setTestOutfit({core:'ao-tu-than',color:'Đen'}));
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-garment-id','ao-tu-than');
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-fabric-color','#1A1817');
});

test('returning to an evicted color during an unfinished recolor never reuses a revoked URL',async({page})=>{
  await page.goto('/tools/visual-fixture.html');
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-garment-id','ao-nhat-binh');
  const svgFrames=await page.evaluate(async()=>{
    // Import the module already used by this renderer, including Vite's version query.
    const moduleUrl=performance.getEntriesByType('resource').map(e=>e.name).find(n=>new URL(n).pathname==='/src/utils/fabricRecolor.ts')!;
    const {recolorGarmentImage,peekRecoloredGarmentImage}=await import(moduleUrl);
    const cfgUrl=performance.getEntriesByType('resource').map(e=>e.name).find(n=>new URL(n).pathname==='/src/data/photoLayerFitting.ts')!;
    const {PHOTO_LAYER_CONFIG}=await import(cfgUrl);
    const cfg=PHOTO_LAYER_CONFIG.core['ao-nhat-binh'];
    const first=document.querySelector('#photo-layer-core image')!;
    const originalColor=first.getAttribute('data-fabric-color')!;
    const originalEncoder=HTMLCanvasElement.prototype.toBlob;
    let finishEncoding: (()=>void)|undefined;
    HTMLCanvasElement.prototype.toBlob=function(callback,...args){
      HTMLCanvasElement.prototype.toBlob=originalEncoder;
      finishEncoding=()=>originalEncoder.call(this,callback,...args);
    };
    window.setTestOutfit({color:'Xanh lam'});
    while(!finishEncoding)await new Promise(requestAnimationFrame);
    for(let i=0;i<9;i++)await recolorGarmentImage(cfg.imageSrc,cfg.fabricMaskSrc,`#${(0x345600+i*517).toString(16)}`,cfg.baseFabricLuminance);
    if(peekRecoloredGarmentImage(cfg.imageSrc,cfg.fabricMaskSrc,originalColor,cfg.baseFabricLuminance))throw new Error('Test did not evict the original color');
    let svgFrames=0;
    const observer=new MutationObserver(()=>{if(document.querySelector('#core-ao-nhat-binh'))svgFrames++;});
    observer.observe(document.body,{childList:true,subtree:true});
    window.setTestOutfit({color:'Để hệ thống gợi ý'});
    const deadline=Date.now()+10000;
    while(true){
      await new Promise(requestAnimationFrame);
      const image=document.querySelector('#photo-layer-core image');
      const url=peekRecoloredGarmentImage(cfg.imageSrc,cfg.fabricMaskSrc,originalColor,cfg.baseFabricLuminance);
      if(url&&image?.getAttribute('href')===url)break;
      if(Date.now()>deadline)throw new Error('Original color did not recover');
    }
    observer.disconnect();finishEncoding!();
    return svgFrames;
  });
  expect(svgFrames).toBe(0);
});

for(const failure of ['source','mask'])test(`${failure} failure keeps a usable SVG garment`,async({page})=>{
  await page.route(failure==='mask'?'**/masks/ao-nhat-binh-fabric-mask.png':'**/layers/ao-nhat-binh.png',route=>route.abort());
  await page.goto('/tools/visual-fixture.html');
  await expect(page.locator('#core-ao-nhat-binh')).toBeVisible();
  await expect(page.locator('#photo-layer-core')).toHaveCount(0);
  await expect(page.getByText(/Chưa thể tải ảnh màu thực tế/)).toBeVisible();
});
