// Reproducible measurements on the real application, with normal animations.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const phase=process.argv[2]??'before',dir=`artifacts/stabilization/${phase}`;
fs.mkdirSync(dir,{recursive:true});
if(phase==='before' && fs.existsSync(`${dir}/profile.json`))throw new Error('Baseline already recorded. Use another phase name to preserve before evidence.');
const important=['assets/sources/drive/guoc-moc-layer.png','public/images/layers/shoes/shoes-guoc-moc.png','public/images/catalog/shoes/shoes-guoc-moc.webp'];
const files=important.map(path=>({path,bytes:fs.statSync(path).size,modifiedUtc:fs.statSync(path).mtime.toISOString(),sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')}));
if(phase==='before')fs.copyFileSync(important[0],`${dir}/user-guoc-source.png`);
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-precise-memory-info']});
const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'no-preference'});
await page.addInitScript(()=>{
  window.qa={longTasks:[],shifts:[],activeUrls:new Set(),createdUrls:0,maxActiveUrls:0};
  new PerformanceObserver(list=>window.qa.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});
  new PerformanceObserver(list=>window.qa.shifts.push(...list.getEntries().map(e=>({start:e.startTime,value:e.value,recentInput:e.hadRecentInput})))).observe({type:'layout-shift',buffered:true});
  const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);
  URL.createObjectURL=blob=>{const url=create(blob);window.qa.activeUrls.add(url);window.qa.createdUrls++;window.qa.maxActiveUrls=Math.max(window.qa.maxActiveUrls,window.qa.activeUrls.size);return url;};
  URL.revokeObjectURL=url=>{window.qa.activeUrls.delete(url);revoke(url);};
  window.armTransition=selector=>{
    window.transitionResult=null;
    document.addEventListener('click',()=>{
      const start=performance.now(),frames=[];
      const visible=el=>{
        if(!el||!el.getClientRects().length)return false;
        let opacity=1;
        for(let p=el;p&&p.tagName!=='BODY';p=p.parentElement)opacity*=Number(getComputedStyle(p).opacity);
        return opacity>.5;
      };
      function frame(){
        const el=document.querySelector(selector),photo=document.querySelector('#photo-layer-core image');
        frames.push({ms:performance.now()-start,visible:visible(el),photo:visible(photo),svg:visible(document.querySelector('g[id^="core-ao-"]')),y:el?.getBoundingClientRect().top,scroll:scrollY});
        if(performance.now()-start<1000)requestAnimationFrame(frame);
        else window.transitionResult={selector,firstContentMs:frames.find(f=>f.visible)?.ms??null,firstPhotoMs:frames.find(f=>f.photo)?.ms??null,svgFrames:frames.filter(f=>f.svg).length,frames};
      }requestAnimationFrame(frame);
    },{once:true,capture:true});
  };
});
async function enter(){
  await page.goto('http://127.0.0.1:3000/');
  await page.getByRole('button',{name:'Đã Hiểu',exact:true}).click();
  await page.getByRole('button',{name:'Bỏ qua giới thiệu',exact:true}).click();
  await page.locator('#select-core-garment').selectOption('ao-nhat-binh');
  await page.getByRole('button',{name:/Tiếp tục chọn phong cách/}).click();
  await page.getByRole('button',{name:'Vào Remix Studio',exact:true}).waitFor();
}
const navigation=[];
async function transition(label,selector,button){
  await page.evaluate(selector=>window.armTransition(selector),selector);
  await button.click();
  await page.waitForFunction(()=>window.transitionResult!==null);
  navigation.push({label,...await page.evaluate(()=>window.transitionResult)});
}
await enter();
await transition('first Concept to Remix','svg[aria-label^="Mannequin"]',page.getByRole('button',{name:'Vào Remix Studio',exact:true}));
await page.locator('#photo-layer-core image').waitFor();
await page.evaluate(()=>window.scrollTo(0,0));
await page.screenshot({path:`${dir}/studio-desktop.png`,fullPage:true});
for(let i=0;i<5;i++){
  await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
  await transition(`Remix to Discovery ${i+1}`,'#select-core-garment',page.locator('header nav button').nth(0));
  await transition(`Discovery to Concept ${i+1}`,'main h1',page.locator('header nav button').nth(1));
  await transition(`Concept to Discovery ${i+1}`,'#select-core-garment',page.locator('header nav button').nth(0));
  await transition(`Discovery to Remix ${i+1}`,'svg[aria-label^="Mannequin"]',page.locator('header nav button').nth(2));
}
const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');await cdp.send('HeapProfiler.collectGarbage');
const memory=(await cdp.send('Performance.getMetrics')).metrics.find(m=>m.name==='JSHeapUsedSize')?.value;
const observations=await page.evaluate(()=>({longTasks:window.qa.longTasks,shifts:window.qa.shifts,activeUrls:window.qa.activeUrls.size,createdUrls:window.qa.createdUrls,maxActiveUrls:window.qa.maxActiveUrls}));
const stress=[];
if(phase==='final'){
  for(let cycle=0;cycle<2;cycle++){
    for(const core of ['ao-nhat-binh','ao-tac','ao-dai','ao-tu-than','ao-ngu-than']){
      await page.locator('header nav button').nth(0).click();
      await page.locator('#select-core-garment').selectOption(core);
      await page.locator('header nav button').nth(1).click();
      for(const color of ['Để hệ thống gợi ý','Xanh lam','Đỏ son','Trắng / kem','Đen','Xanh ngọc']){
        await page.getByRole('button',{name:color,exact:true}).click();
        await page.getByRole('button',{name:'Vào Remix Studio',exact:true}).click();
        await page.waitForFunction(({core,color})=>{
          const encoded=document.querySelector('[data-recommendation-trace]')?.getAttribute('data-recommendation-trace');
          const image=document.querySelector('#photo-layer-core image');
          return encoded&&JSON.parse(encoded).context.preferredColor===color&&image?.getAttribute('data-garment-id')===core&&!document.querySelector('[data-pending-layer]');
        },{core,color});
        await page.locator('header nav button').nth(1).click();
      }
    }
    await cdp.send('HeapProfiler.collectGarbage');
    const heap=(await cdp.send('Performance.getMetrics')).metrics.find(m=>m.name==='JSHeapUsedSize')?.value;
    const caches=await page.evaluate(async()=>{
      // Vite versions dependency URLs. Import the existing instances, not fresh empty caches.
      const resources=performance.getEntriesByType('resource').map(e=>e.name);
      const existing=path=>resources.find(url=>new URL(url).pathname===path);
      const photos=await import(existing('/src/utils/photoImageCache.ts')),fabric=await import(existing('/src/utils/fabricRecolor.ts'));
      return {...photos.photoCacheSnapshot(),...fabric.recolorCacheSnapshot(),activeUrls:window.qa.activeUrls.size,createdUrls:window.qa.createdUrls,maxActiveUrls:window.qa.maxActiveUrls};
    });
    stress.push({cycle:cycle+1,selections:30,heapBytes:heap,...caches});
    if(!caches.recolors || !caches.images || caches.recolors>8 || caches.images>24 || caches.activeUrls>8 || caches.inFlight)throw new Error(`Empty, unbounded or unfinished cache: ${JSON.stringify(caches)}`);
  }
  await page.getByRole('button',{name:'Vào Remix Studio',exact:true}).click();
  await page.locator('#photo-layer-core image').waitFor();
}
const stressObservations=phase==='final'?await page.evaluate(()=>({longTasks:window.qa.longTasks,shifts:window.qa.shifts,activeUrls:window.qa.activeUrls.size,maxActiveUrls:window.qa.maxActiveUrls})):null;
// Delay only a not-yet-selected bag; observe the entire main photo during the change.
await page.route('**/bag-tote-linen.png',async route=>{await new Promise(r=>setTimeout(r,700));await route.continue();});
await page.getByRole('button',{name:/Tủ Đồ Phối Kèm/}).click();
await page.getByRole('button',{name:'Thay đổi',exact:true}).nth(2).click();
await transition('delayed tote swap','svg[aria-label^="Mannequin"]',page.getByRole('option',{name:/Túi Tote/}));
await page.unrouteAll({behavior:'wait'});
await page.goto('http://127.0.0.1:3000/tools/visual-fixture.html');
for(const core of ['ao-nhat-binh','ao-tac','ao-dai','ao-tu-than','ao-ngu-than']){
  await page.evaluate(core=>window.setTestOutfit({core,bottom:1,shoes:0,bag:0,accent:1,color:'Để hệ thống gợi ý'}),core);
  await page.waitForFunction(()=>document.querySelector('#photo-layer-core image')?.getAttribute('href')?.startsWith('blob:')&&!document.body.innerText.includes('Đang xử lý'));
  await page.waitForTimeout(150);
  await page.locator('svg[aria-label^="Mannequin"]').screenshot({path:`${dir}/${core}-gam-mini.png`});
}
const summary={phase,head:execFileSync('git',['rev-parse','HEAD']).toString().trim(),branch:execFileSync('git',['branch','--show-current']).toString().trim(),files,navigation,observations,heapBytes:memory,stress,stressObservations};
fs.writeFileSync(`${dir}/profile.json`,JSON.stringify(summary,null,2));
await browser.close();
console.log(JSON.stringify({phase,navigation:navigation.map(({label,firstContentMs,firstPhotoMs,svgFrames})=>({label,firstContentMs,firstPhotoMs,svgFrames})),maxLongTaskMs:Math.max(0,...observations.longTasks.map(t=>t.duration)),activeUrls:observations.activeUrls,files}));
