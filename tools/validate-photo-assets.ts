import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { PHOTO_LAYER_CONFIG } from '../src/data/layeredOutfitMap';
import { CORE_ITEMS, SUPPORT_ITEMS } from '../src/data/mockFashionData';
import assert from 'node:assert/strict';
import { getOutfitLayerConfig } from '../src/data/photoLayerFitting';
function bounds(c: NonNullable<ReturnType<typeof getOutfitLayerConfig>>) {
  const p=c.svgPlacement,b=c.visibleBounds,s=p.width/c.sourceDimensions.width;
  return {x:p.x+b.minX*s,y:p.y+b.minY*s,width:b.width*s,height:b.height*s};
}
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
      if(id){
        const config=getOutfitLayerConfig(core,category as keyof typeof PHOTO_LAYER_CONFIG,id,bag.id)!;
        const box=bounds(config);
        assert.ok(Math.abs(config.svgPlacement.width/config.svgPlacement.height-config.sourceDimensions.width/config.sourceDimensions.height)<.001);
        assert.ok(box.x>=-1&&box.y>=-1&&box.x+box.width<=301&&box.y+box.height<=600,`${core}/${id}: outfit fitting clipped`);
      }
    }combinations++;
    if(accent?.id==='accent-quai-thao-mini'){
      const a=bounds(getOutfitLayerConfig(core,'accent',accent.id,bag.id)!),b=bounds(getOutfitLayerConfig(core,'bag',bag.id)!);
      assert.ok(!(a.x < b.x+b.width+6 && a.x+a.width+6 > b.x && a.y < b.y+b.height+6 && a.y+a.height+6 > b.y),`${core}/${bag.id}: mini overlaps bag`);
    }
  }
assert.equal(combinations,675);
fs.mkdirSync('artifacts',{recursive:true});
fs.writeFileSync('artifacts/photo-config.json',JSON.stringify(configs,null,2));
const result=spawnSync('python',['tools/validate-photo-assets.py','artifacts/photo-config.json'],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status??1);
console.log(`Validated 18 layer configurations, five masks and ${combinations} combinations.`);
