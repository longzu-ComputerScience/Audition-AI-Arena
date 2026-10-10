import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStylistPayload,generateHeuristicExpertStyling,resolveStylistGuardrail } from '../src/server/stylistService';
import { validateAndResolveOutfit,buildFashionEditorialPrompt } from '../src/server/promptBuilder';
import { CORE_ITEMS, PREFERRED_COLOR_OPTIONS, resolveCorePalette, preferredColorForHex, resolveCoreGarmentColor } from '../src/data/mockFashionData';
const payload={coreId:'ao-dai',bottomId:'bottom-tailored-trousers',shoesId:'shoes-chunky-loafer',bagId:'bag-techwear-crossbody',accentId:null,
  occasion:'Sự kiện trang trọng',location:'Đại Nội Huế',style:'Thanh lịch',preferredColor:'Xanh lam',targetRemix:95,actualRemix:NaN};
test('stylist derives actual Remix from current catalog and labels local fallback honestly',()=>{
  const v=validateStylistPayload(payload);assert.ok(v.valid&&v.data);
  assert.equal(v.data.actualRemix,78);
  const r=generateHeuristicExpertStyling(v.data);
  assert.equal(r.modelUsed,'Local Context Stylist');assert.match(r.review,/Gợi ý tại máy/);
  assert.ok(r.suggestedItems?.every(i=>i.itemId!=='bottom-cargo-linen'&&i.category!=='accent'));
});
test('illustration prompt includes current exact garment color and optional state',()=>{
  const v=validateAndResolveOutfit(payload);assert.ok(v.valid&&v.data);
  const prompt=buildFashionEditorialPrompt(v.data);
  assert.match(prompt,/#1D4E89/i);assert.match(prompt,/Quần Tây/);
  assert.equal(validateAndResolveOutfit({...payload,bottomId:'bottom-cargo-linen'}).valid,false);
});
test('every existing Studio swatch round-trips through the shared context and AI color',()=>{
  for(const core of Object.values(CORE_ITEMS))for(const color of PREFERRED_COLOR_OPTIONS)
    for(const swatch of resolveCorePalette(core.id,color)){
      const preferred=preferredColorForHex(swatch.hex);
      assert.ok(preferred,`${core.id}/${color}/${swatch.name}`);
      assert.equal(resolveCoreGarmentColor(core.id,preferred).hex.toLowerCase(),swatch.hex.toLowerCase());
      const v=validateAndResolveOutfit({...payload,coreId:core.id,preferredColor:preferred});
      assert.ok(v.valid&&v.data);assert.ok(buildFashionEditorialPrompt(v.data).toLowerCase().includes(swatch.hex.toLowerCase()));
    }
});
test('AI assessment cannot weaken the shared structural or solemn-occasion guardrail',()=>{
  const high=validateStylistPayload({...payload,bottomId:'bottom-raw-denim',shoesId:'shoes-retro-sneaker'}).data!;
  assert.equal(resolveStylistGuardrail(high,{status:'green',reason:'OK'}).status,'yellow');
  const structural={...high,userQuery:'cắt bỏ tà'};
  assert.equal(resolveStylistGuardrail(structural,{status:'green'}).status,'orange');
  assert.equal(resolveStylistGuardrail(high,{status:'orange',reason:'AI có lưu ý thêm'}).status,'orange');
});
