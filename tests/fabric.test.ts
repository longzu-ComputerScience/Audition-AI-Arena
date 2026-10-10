import test from 'node:test';
import assert from 'node:assert/strict';
import { recolorFabricPixels } from '../src/utils/fabricPixels';
test('recolor uses mask alpha exactly once and preserves transparency, trim and folds',()=>{
  const source=new Uint8ClampedArray([150,90,90,128,150,90,90,255,70,45,45,255,200,180,30,255,255,255,255,0]);
  const mask=new Uint8ClampedArray([255,255,255,128,255,255,255,255,255,255,255,255,255,255,255,0,255,255,255,255]);
  for(const color of ['#1D4E89','#C23B22','#F5EFEB','#1A1817','#267365']) {
    const p=source.slice();recolorFabricPixels(p,mask,color,110);
    assert.deepEqual([p[3],p[7],p[11],p[15],p[19]],[128,255,255,255,0]);
    assert.deepEqual(p.slice(12,16),source.slice(12,16));assert.deepEqual(p.slice(16),source.slice(16));
    assert.ok(p[4]+p[5]+p[6]>p[8]+p[9]+p[10]);
    for(let c=0;c<3;c++) assert.ok(Math.abs(p[c]-(source[c]+(p[4+c]-source[c])*128/255))<=1);
  }
});
test('invalid color or mask fails honestly rather than returning unchanged photo',()=>{
  assert.throws(()=>recolorFabricPixels(new Uint8ClampedArray(4),new Uint8ClampedArray(8),'#ffffff',100));
  assert.throws(()=>recolorFabricPixels(new Uint8ClampedArray(4),new Uint8ClampedArray(4),'invalid',100));
});
