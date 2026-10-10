import { test, expect, Page } from '@playwright/test';
import fs from 'node:fs';
import { SUPPORT_ITEMS, resolveCoreGarmentColor } from '../../src/data/mockFashionData';
import { outfitKey, rankOutfits, recommendOutfitDecision } from '../../src/utils/outfitRecommendation';
import { computeActualRemix } from '../../src/utils/fashionCalculations';
import { RecommendationTrace } from '../../src/utils/stylingState';
const metadata=JSON.parse(fs.readFileSync(new URL('../../src/data/photoAssetMetadata.json',import.meta.url),'utf8'));

async function begin(page: Page, core='ao-nhat-binh', occasion?: string) {
  await page.goto('/');
  await page.getByRole('button',{name:'Đã Hiểu',exact:true}).click();
  await page.getByRole('button',{name:'Bỏ qua giới thiệu',exact:true}).click();
  await page.locator('#select-core-garment').selectOption(core);
  if(occasion) await page.locator('#select-occasion').selectOption({label:occasion});
  await page.getByRole('button',{name:/Tiếp tục chọn phong cách/}).click();
}
async function enter(page: Page) {
  await page.getByRole('button',{name:'Vào Remix Studio',exact:true}).click();
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('href',/^blob:/);
  await expect(page.locator('[data-pending-layer]')).toHaveCount(0);
  await page.waitForTimeout(220); // Finish the normal, localized opacity entrance before sampling.
}
async function trace(page: Page): Promise<RecommendationTrace> {
  return JSON.parse((await page.locator('[data-recommendation-trace]').getAttribute('data-recommendation-trace'))!);
}
async function assertEngineAndPhotos(page: Page) {
  const value = await trace(page);
  const ids=value.chosenKey.split('|');
  const items={bottom:SUPPORT_ITEMS.bottom.find(i=>i.id===ids[0])!,shoes:SUPPORT_ITEMS.shoes.find(i=>i.id===ids[1])!,bag:SUPPORT_ITEMS.bag.find(i=>i.id===ids[2])!,accent:SUPPORT_ITEMS.accent.find(i=>i.id===ids[3])??null};
  const ranked=rankOutfits(value.context,items,value.locks);
  expect(value.ranking).toEqual(ranked.map(r=>({key:outfitKey(r.items),score:r.score})));
  expect(value.bestKey).toBe(outfitKey(ranked[0].items));
  expect(value.dimensions).toEqual(ranked.find(r=>outfitKey(r.items)===value.chosenKey)!.dimensions);
  expect(computeActualRemix(items)).toBe(ranked.find(r=>outfitKey(r.items)===value.chosenKey)!.actualRemix);
  expect(Number(await page.locator('#remix-dial-slider').inputValue())).toBe(value.context.targetRemix);
  for(const slot of ['bottom','shoes','bag'] as const) await expect(page.locator(`#photo-layer-${slot} image`)).toHaveAttribute('href',metadata[items[slot].id].imageSrc);
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-garment-id',value.context.coreGarment);
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-fabric-color',resolveCoreGarmentColor(value.context.coreGarment,value.context.preferredColor).hex);
  if(items.accent) await expect(page.locator('#photo-layer-accent image')).toHaveAttribute('href',new RegExp(items.accent.id));
  else await expect(page.locator('#photo-layer-accent')).toHaveCount(0);
  return value;
}
async function selectSlot(page: Page, slot: 'bottom'|'shoes'|'bag'|'accent', index: number) {
  const label={bottom:'Phần dưới',shoes:'Giày',bag:'Túi',accent:'Phụ kiện'}[slot];
  await page.getByRole('button',{name:new RegExp(`^Chọn nhanh ${label}[^:]*:`)}).click();
  await page.getByRole('option',{name:new RegExp(SUPPORT_ITEMS[slot][index].name)}).click();
  // Quick selection deliberately remains open; Escape must close and return focus to its button.
  await page.keyboard.press('Escape');
}
async function watchLayer(page: Page, changing: string) {
  await page.evaluate(changing=>{
    const fixed=['core','bottom','shoes','bag','accent'].filter(s=>s!==changing);
    const nodes=fixed.map(s=>document.querySelector(`#photo-layer-${s} image`));
    const urls=nodes.map(n=>n?.getAttribute('href'));
    const svg=document.querySelector('svg[aria-label^="Mannequin"]')!;
    const rect=svg.getBoundingClientRect();
    const failures:string[]=[];
    (window as any).layerWatch={failures,frames:0,stop:false};
    const sample=()=>{
      const watch=(window as any).layerWatch;
      if(watch.stop)return;
      watch.frames++;
      fixed.forEach((slot,i)=>{
        const next=document.querySelector(`#photo-layer-${slot} image`);
        if(next!==nodes[i]||next?.getAttribute('href')!==urls[i]) failures.push(`changed ${slot}`);
      });
      if(document.querySelector('g[id^="core-ao-"]'))failures.push('SVG core flash');
      if(document.querySelector('svg[aria-label^="Mannequin"]')!==svg)failures.push('stage remounted');
      if(Math.abs(svg.getBoundingClientRect().height-rect.height)>.2)failures.push('stage resized');
      if(Number(getComputedStyle(document.querySelector('#photo-layer-core')!.parentElement!).opacity)<.99)failures.push('whole core faded');
      requestAnimationFrame(sample);
    };requestAnimationFrame(sample);
  },changing);
}
async function stopWatch(page: Page) {
  return page.evaluate(()=>{const watch=(window as any).layerWatch;watch.stop=true;return {failures:[...new Set(watch.failures)],frames:watch.frames};});
}

test('cold entry, revisit and delayed swaps keep unchanged photo nodes and stage geometry',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    (window as any).svgFlashCount=0;
    new MutationObserver(()=>{if(document.querySelector('main[data-active-step="3"] g[id^="core-ao-"]'))(window as any).svgFlashCount++;}).observe(document,{subtree:true,childList:true});
  });
  await page.route('**/layers/ao-nhat-binh.png',async route=>{await new Promise(r=>setTimeout(r,500));await route.continue();});
  await begin(page);await enter(page);
  await expect(page.locator('#photo-layer-accent')).toHaveCount(0);
  const reports=[];
  for(const [slot,index] of [['bottom',1],['shoes',1],['bag',1],['accent',3]] as const){
    const id=SUPPORT_ITEMS[slot][index].id;
    const file=slot==='bottom'?'bottoms':slot==='shoes'?'shoes':slot==='bag'?'bags':'accessories';
    await page.route(`**/layers/${file}/${id}.png`,async route=>{await new Promise(r=>setTimeout(r,500));await route.continue();});
    await watchLayer(page,slot);
    await selectSlot(page,slot,index);
    await expect(page.locator(`#photo-layer-${slot} image`)).toHaveAttribute('href',new RegExp(id));
    await page.waitForTimeout(230);
    const report=await stopWatch(page);expect(report.frames).toBeGreaterThan(10);expect(report.failures).toEqual([]);reports.push({slot,...report});
  }
  await assertEngineAndPhotos(page);
  const prior=await trace(page);
  for(let i=0;i<3;i++){
    await page.locator('header nav button').nth(0).click();
    await expect(page.locator('#select-core-garment')).toHaveValue('ao-nhat-binh');
    await page.locator('header nav button').nth(1).click();
    await expect(page.getByRole('button',{name:'Vào Remix Studio',exact:true})).toBeVisible();
    await enter(page);expect((await trace(page)).chosenKey).toBe(prior.chosenKey);
  }
  expect(await page.evaluate(()=>(window as any).svgFlashCount)).toBe(0);expect(errors).toEqual([]);
  fs.mkdirSync('artifacts/stabilization/qa',{recursive:true});
  fs.writeFileSync(`artifacts/stabilization/qa/layers-${info.project.name}.json`,JSON.stringify(reports,null,2));
  await page.screenshot({path:`artifacts/stabilization/qa/app-${info.project.name}.png`,fullPage:true});
});

test('native context controls reach scoring, manual locks survive, explicit refresh releases them',async({page},info)=>{
  await begin(page,'ao-ngu-than','Sự kiện trang trọng');await enter(page);
  const reports:RecommendationTrace[]=[];
  await page.locator('#remix-dial-slider').fill('51');
  await page.getByRole('button',{name:'Phối lại tự động',exact:true}).click();
  reports.push(await assertEngineAndPhotos(page));
  for(const [field,value] of [['occasion','Đi chơi cuối tuần'],['location','Tràng An']] as const){
    await page.locator('header nav button').nth(0).click();
    await page.locator(`#select-${field}`).selectOption({label:value});
    await page.locator('header nav button').nth(2).click();
    await expect.poll(async()=>(await trace(page)).context[field]).toBe(value);
    const next=await assertEngineAndPhotos(page);reports.push(next);
    if(field==='occasion'){
      expect(next.bestKey).not.toBe(reports[0].bestKey);
      if(next.chosenKey===reports[0].chosenKey){expect(next.reason).toBe('hysteresis');await expect(page.getByText(/gợi ý mới chỉ khác rất ít/)).toBeVisible();}
      await page.getByRole('button',{name:'Phối lại tự động',exact:true}).click();
      const refreshed=await assertEngineAndPhotos(page);expect(refreshed.chosenKey).not.toBe(reports[0].chosenKey);reports.push(refreshed);
    }
  }
  // At a feasible middle dial, a distinctly different occasion really changes selected IDs.
  expect(reports[2].chosenKey).not.toBe(reports[0].chosenKey);
  await page.locator('header nav button').nth(1).click();
  await page.getByRole('button',{name:'Đường phố (Streetwear)',exact:true}).click();
  await page.getByRole('button',{name:'Xanh lam',exact:true}).click();
  await enter(page);
  const styled=await assertEngineAndPhotos(page);expect(styled.context.style).toBe('Đường phố (Streetwear)');expect(styled.context.preferredColor).toBe('Xanh lam');reports.push(styled);
  expect(styled.dimensions.style).not.toBe(reports[3].dimensions.style);
  expect(styled.dimensions.color).not.toBe(reports[3].dimensions.color);
  await selectSlot(page,'bottom',2);expect((await trace(page)).locks.bottom).toBe(true);
  await page.locator('header nav button').nth(0).click();
  await page.locator('#select-occasion').selectOption({label:'Sự kiện trang trọng'});
  await page.locator('#select-core-garment').selectOption('ao-dai');
  await page.locator('header nav button').nth(2).click();
  const locked=await assertEngineAndPhotos(page);expect(locked.chosenKey.split('|')[0]).toBe('bottom-raw-denim');expect(locked.reason).toBe('manual');reports.push(locked);
  await expect(page.getByText(/Giữ món bạn chọn:/)).toBeVisible();
  await page.getByRole('button',{name:'Phối lại tự động',exact:true}).click();
  const refreshed=await assertEngineAndPhotos(page);expect(refreshed.locks).toEqual({});expect(refreshed.chosenKey).toBe(refreshed.bestKey);expect(refreshed.context.includeAccent).toBe(false);reports.push(refreshed);
  await page.getByRole('button',{name:'Phối lại tự động',exact:true}).click();expect((await trace(page)).chosenKey).toBe(refreshed.chosenKey);
  for(const value of ['0','50','80','100']){await page.locator('#remix-dial-slider').fill(value);await assertEngineAndPhotos(page);}
  fs.mkdirSync('artifacts/stabilization/qa',{recursive:true});fs.writeFileSync(`artifacts/stabilization/qa/context-${info.project.name}.json`,JSON.stringify(reports,null,2));
});

for(const failure of ['missing','decode','recolor'] as const) test(`actual app ${failure} failure is localized and recovers on a working selection`,async({page})=>{
  if(failure==='recolor') await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(callback,...args){if(!(window as any).recolorRecovered)callback(null);else original.call(this,callback,...args);};});
  else await page.route('**/layers/ao-nhat-binh.png',route=>failure==='missing'?route.abort():route.fulfill({status:200,contentType:'image/png',body:'invalid image bytes'}));
  await begin(page);await page.getByRole('button',{name:'Vào Remix Studio',exact:true}).click();
  await expect(page.locator('#core-ao-nhat-binh')).toBeVisible();
  await expect(page.getByText(/Chưa thể tải ảnh màu thực tế/)).toBeVisible();
  await expect(page.locator('#photo-layer-bottom image')).toBeVisible();
  await page.unrouteAll({behavior:'wait'});await page.evaluate(()=>(window as any).recolorRecovered=true);
  await page.locator('header nav button').nth(0).click();await page.locator('#select-core-garment').selectOption('ao-dai');await page.locator('header nav button').nth(2).click();
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-garment-id','ao-dai');
  await page.locator('header nav button').nth(0).click();await page.locator('#select-core-garment').selectOption('ao-nhat-binh');await page.locator('header nav button').nth(2).click();
  await expect(page.locator('#photo-layer-core image')).toHaveAttribute('data-garment-id','ao-nhat-binh');await expect(page.locator('#core-ao-nhat-binh')).toHaveCount(0);
});

test('a failed support decode affects only that slot and retry restores its photo',async({page})=>{
  await begin(page);await enter(page);
  await page.route('**/bags/bag-techwear-crossbody.png',route=>route.fulfill({contentType:'image/png',body:'invalid'}));
  await watchLayer(page,'bag');await selectSlot(page,'bag',2);
  await expect(page.locator('#bag-techwear-crossbody')).toBeVisible();
  expect((await stopWatch(page)).failures).toEqual([]);
  await expect(page.getByText(/Một món chưa tải được ảnh/)).toBeVisible();
  await page.unrouteAll({behavior:'wait'});await selectSlot(page,'bag',0);await selectSlot(page,'bag',2);
  await expect(page.locator('#photo-layer-bag image')).toHaveAttribute('href',/techwear/);
});

test('rapid native selections and colors ignore stale completion without showing a wrong photo',async({page},info)=>{
  await begin(page,'ao-dai');await enter(page);
  await page.route('**/bags/bag-techwear-crossbody.png',async route=>{await new Promise(r=>setTimeout(r,500));await route.continue();});
  await watchLayer(page,'bag');
  await page.getByRole('button',{name:/^Chọn nhanh Túi xách:/}).click();
  for(const index of [2,1,2,0]) await page.getByRole('option',{name:new RegExp(SUPPORT_ITEMS.bag[index].name)}).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#photo-layer-bag image')).toHaveAttribute('href',/bag-gam-vintage/);
  await page.waitForTimeout(600);
  expect((await stopWatch(page)).failures).toEqual([]);
  await page.evaluate(async()=>{
    const modulePath='/src/data/mockFashionData.ts';const {resolveCoreGarmentColor}=await import(modulePath);
    const failures:string[]=[];(window as any).colorFailures=failures;
    const observer=new MutationObserver(()=>{
      const image=document.querySelector('#photo-layer-core image');
      const encoded=document.querySelector('[data-recommendation-trace]')?.getAttribute('data-recommendation-trace');
      if(image && encoded){const {context}=JSON.parse(encoded);if(image.getAttribute('data-fabric-color')!==resolveCoreGarmentColor(context.coreGarment,context.preferredColor).hex)failures.push('stale fabric color');}
      if(document.querySelector('g[id^="core-ao-"]'))failures.push('SVG core flash');
    });observer.observe(document.querySelector('main')!,{attributes:true,childList:true,subtree:true});
    for(let i=0;i<12;i++){
      const buttons=[...document.querySelectorAll<HTMLButtonElement>('button[aria-label^="Chọn màu "]')];
      buttons[i%buttons.length].click();await new Promise(resolve=>setTimeout(resolve,15));
    }
    (window as any).stopColorWatch=()=>observer.disconnect();
  });
  await expect(page.locator('[data-pending-layer]')).toHaveCount(0);
  await page.waitForTimeout(500);
  await assertEngineAndPhotos(page);
  const failures=await page.evaluate(()=>{(window as any).stopColorWatch();return (window as any).colorFailures;});expect(failures).toEqual([]);
  await page.unrouteAll({behavior:'wait'});
  fs.mkdirSync('artifacts/stabilization/qa',{recursive:true});await page.screenshot({path:`artifacts/stabilization/qa/rapid-${info.project.name}.png`,fullPage:true});
});

for(const index of [2,3]) test(`failed head accessory ${index} keeps the new eye/head alignment and recovers`,async({page})=>{
  await begin(page);await enter(page);
  const item=SUPPORT_ITEMS.accent[index];
  await page.route(`**/accessories/${item.id}.png`,route=>route.fulfill({contentType:'image/png',body:'invalid PNG'}));
  await watchLayer(page,'accent');await selectSlot(page,'accent',index);
  await expect(page.locator(`#${item.id}`)).toHaveAttribute('transform','translate(0 8)');
  expect((await stopWatch(page)).failures).toEqual([]);
  await page.unrouteAll({behavior:'wait'});await selectSlot(page,'accent',1);await selectSlot(page,'accent',index);
  await expect(page.locator('#photo-layer-accent image')).toHaveAttribute('href',new RegExp(item.id));
});
