// Snapshot the original renderer without resetting or changing the working checkout.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { chromium } from '@playwright/test';
fs.mkdirSync('artifacts/baseline',{recursive:true});
fs.mkdirSync('assets/sources/baseline/masks',{recursive:true});
const original=path=>execFileSync('git',['show',`4a62e4e32a4702d49338ee333b028387efd205cd:${path}`]);
for(const file of ['ao-nhat-binh-fabric-mask.png','ao-tac-fabric-mask.png'])
  fs.writeFileSync(`assets/sources/baseline/masks/${file}`,original(`public/images/layers/masks/${file}`));
let component=original('src/components/MannequinCanvas.tsx').toString()
  .replaceAll("'../data/layeredOutfitMap'","'./layeredOutfitMap'")
  .replaceAll("'../utils/fabricRecolor'","'./fabricRecolor'")
  .replaceAll("'../data/","'../../src/data/").replaceAll("'../types'","'../../src/types'");
fs.writeFileSync('artifacts/baseline/MannequinCanvas.tsx','// @ts-nocheck\n'+component);
fs.writeFileSync('artifacts/baseline/layeredOutfitMap.ts','// @ts-nocheck\n'+original('src/data/layeredOutfitMap.ts').toString().replaceAll('/images/layers/','/assets/sources/baseline/'));
fs.writeFileSync('artifacts/baseline/fabricRecolor.ts','// @ts-nocheck\n'+original('src/utils/fabricRecolor.ts').toString());
let fixture=fs.readFileSync('tools/visual-fixture.tsx','utf8')
  .replace("'../src/components/MannequinCanvas'","'./MannequinCanvas'")
  .replaceAll("'../src/","'../../src/");
fs.writeFileSync('artifacts/baseline/fixture.tsx','// @ts-nocheck\n'+fixture);
fs.writeFileSync('artifacts/baseline/index.html',fs.readFileSync('tools/visual-fixture.html','utf8').replace('/tools/visual-fixture.tsx','/artifacts/baseline/fixture.tsx'));
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:3000/artifacts/baseline/index.html');
await page.getByRole('radio',{name:'Photo Layers (Demo)',exact:true}).click();
for(const core of ['ao-nhat-binh','ao-tac']){
  await page.evaluate(core=>window.setTestOutfit({core,bottom:0,shoes:0,bag:0,accent:null,color:'Để hệ thống gợi ý'}),core);
  await page.waitForFunction(()=>document.querySelector('#photo-layer-core image')?.getAttribute('href')?.startsWith('data:')&&!document.body.innerText.includes('Đang xử lý'));
  await page.waitForTimeout(150);
  await page.locator('svg[aria-label^="Mannequin"]').screenshot({path:`artifacts/visual/before-${core}.png`});
}
await browser.close();
console.log('Captured original renderer from inspected Git HEAD for Nhật Bình and Tấc.');
