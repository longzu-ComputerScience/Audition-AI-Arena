import { chromium } from '@playwright/test';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
fs.mkdirSync('artifacts/visual',{recursive:true});
await page.goto('http://127.0.0.1:3000/tools/visual-fixture.html');
const cases=[
  {core:'ao-nhat-binh',bottom:0,shoes:0,bag:0,accent:null},
  {core:'ao-nhat-binh',bottom:1,shoes:1,bag:0,accent:null},
  {core:'ao-tac',bottom:0,shoes:0,bag:0,accent:3},
  {core:'ao-tac',bottom:2,shoes:2,bag:1,accent:null},
  {core:'ao-dai',bottom:1,shoes:1,bag:0,accent:null},
  {core:'ao-dai',bottom:0,shoes:0,bag:0,accent:0},
  {core:'ao-tu-than',bottom:0,shoes:0,bag:0,accent:null},
  {core:'ao-tu-than',bottom:2,shoes:2,bag:1,accent:null},
  {core:'ao-ngu-than',bottom:1,shoes:1,bag:2,accent:null},
  {core:'ao-ngu-than',bottom:0,shoes:0,bag:0,accent:1},
  {core:'ao-ngu-than',bottom:2,shoes:2,bag:2,accent:2},
];
async function select(selection){
  await page.evaluate(s=>window.setTestOutfit(s),selection);
  await page.waitForFunction(()=>{
    const image=document.querySelector('#photo-layer-core image');
    const notice=document.body.innerText;
    return image?.getAttribute('href')?.startsWith('blob:')&&!notice.includes('Đang xử lý');
  });
  await page.waitForTimeout(100);
}
for(let i=0;i<cases.length;i++){
  await select({...cases[i],color:'Để hệ thống gợi ý'});
  await page.locator('#root > div > div').first().screenshot({path:`artifacts/visual/outfit-${String(i+1).padStart(2,'0')}.png`});
}
for(const core of ['ao-nhat-binh','ao-tac','ao-dai','ao-tu-than','ao-ngu-than'])
  for(const [name,color] of [['default','Để hệ thống gợi ý'],['blue','Xanh lam'],['red','Đỏ son'],['cream','Trắng / kem'],['dark','Đen'],['green','Xanh ngọc']]){
    await select({core,bottom:0,shoes:0,bag:0,accent:null,color});
    await page.locator('svg[aria-label^="Mannequin"]').screenshot({path:`artifacts/visual/${core}-${name}.png`});
  }
await page.setViewportSize({width:390,height:844});
await select({...cases[8],color:'Xanh lam'});
await page.screenshot({path:'artifacts/visual/mobile-photo.png',fullPage:true});
if(errors.length)throw new Error(errors.join('\n'));
await browser.close();
console.log('Captured 11 reference outfits, 30 garment/colors, mobile; no browser exceptions.');
