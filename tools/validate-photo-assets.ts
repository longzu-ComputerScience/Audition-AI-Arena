import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { PHOTO_LAYER_CONFIG } from '../src/data/layeredOutfitMap';
import { CORE_ITEMS, SUPPORT_ITEMS } from '../src/data/mockFashionData';
import assert from 'node:assert/strict';
const configs=Object.entries(PHOTO_LAYER_CONFIG).flatMap(([category,items])=>Object.values(items).map(c=>({...c,category})));
assert.equal(configs.length,18);
assert.equal(new Set(configs.map(c=>c.imageSrc)).size,configs.length,'Unexpected duplicate paths');
for(const c of configs){
  const expected=c.category==='core'?Object.keys(CORE_ITEMS):SUPPORT_ITEMS[c.category as keyof typeof SUPPORT_ITEMS].map(i=>i.id);
  assert.ok(expected.includes(c.catalogId));
  assert.ok(Object.values(c.svgPlacement).every(Number.isFinite));
  assert.ok(c.svgPlacement.width>0&&c.svgPlacement.height>0);
  assert.ok(Math.abs(c.svgPlacement.width/c.svgPlacement.height-c.sourceDimensions.width/c.sourceDimensions.height)<.001,'Distorted placement');
  const p=c.svgPlacement,b=c.visibleBounds,d=c.sourceDimensions;
  const x0=p.x+b.minX*p.width/d.width,x1=p.x+b.maxX*p.width/d.width;
  const y0=p.y+b.minY*p.height/d.height,y1=p.y+b.maxY*p.height/d.height;
  assert.ok(x0>=-1&&x1<=301&&y0>=-1&&y1<=600,`${c.catalogId}: visible image clipped`);
}
let combinations=0;
for(const core of Object.keys(CORE_ITEMS)) for(const bottom of SUPPORT_ITEMS.bottom) for(const shoes of SUPPORT_ITEMS.shoes)
  for(const bag of SUPPORT_ITEMS.bag) for(const accent of [null,...SUPPORT_ITEMS.accent]){
    for(const [category,id] of [['core',core],['bottom',bottom.id],['shoes',shoes.id],['bag',bag.id],['accent',accent?.id]]){
      if(id)assert.ok(PHOTO_LAYER_CONFIG[category as keyof typeof PHOTO_LAYER_CONFIG][id]?.validated);
    }combinations++;
  }
assert.equal(combinations,675);
fs.mkdirSync('artifacts',{recursive:true});
fs.writeFileSync('artifacts/photo-config.json',JSON.stringify(configs,null,2));
const result=spawnSync('python',['tools/validate-photo-assets.py','artifacts/photo-config.json'],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status??1);
console.log(`Validated 18 layer configurations, five masks and ${combinations} combinations.`);
