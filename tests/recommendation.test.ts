import test from 'node:test';
import assert from 'node:assert/strict';
import { CORE_ITEMS, SUPPORT_ITEMS, OCCASIONS, LOCATIONS, STYLES, PREFERRED_COLOR_OPTIONS } from '../src/data/mockFashionData';
import { recommendOutfit, recommendOutfitDecision, rankOutfits, outfitKey, scoreOutfit, RecommendationContext } from '../src/utils/outfitRecommendation';
import { computeActualRemix, evaluateGuardrail } from '../src/utils/fashionCalculations';
import { createStylingState, stylingReducer, DEFAULT_SETUP } from '../src/utils/stylingState';

const base: RecommendationContext = { ...DEFAULT_SETUP, targetRemix: 50, includeAccent: false };
test('each context dimension changes actual rankings in meaningful cases', () => {
  const alternatives: Partial<RecommendationContext>[] = [
    {occasion:'Đi chơi cuối tuần'}, {location:'Tràng An'}, {style:'Đường phố (Streetwear)'},
    {preferredColor:'Xanh lam'}, {coreGarment:'ao-tu-than'},
  ];
  for (const change of alternatives) {
    let influenced = false;
    let winnerChanged = false;
    for(const targetRemix of [25,35,45,50,60,70,80]) {
      const a=rankOutfits({...base,targetRemix,includeAccent:true});
      const b=rankOutfits({...base,...change,targetRemix,includeAccent:true});
      if(a.map(r=>outfitKey(r.items)).join()!==b.map(r=>outfitKey(r.items)).join()) influenced=true;
      if(outfitKey(a[0].items)!==outfitKey(b[0].items))winnerChanged=true;
    }
    assert.ok(influenced,JSON.stringify(change));
    // Catalog thresholds need not line up with the seven representative dial values.
    for(let targetRemix=0;targetRemix<=100&&!winnerChanged;targetRemix++){
      const a=recommendOutfit({...base,targetRemix,includeAccent:true});
      const b=recommendOutfit({...base,...change,targetRemix,includeAccent:true});
      winnerChanged=outfitKey(a.items)!==outfitKey(b.items);
    }
    assert.ok(winnerChanged,`No chosen outfit changed: ${JSON.stringify(change)}`);
  }
  for(const style of STYLES) {
    const other=style==='Thanh lịch'?'Năng động':'Thanh lịch';
    assert.notDeepEqual(rankOutfits({...base,style}).map(r=>outfitKey(r.items)),rankOutfits({...base,style:other}).map(r=>outfitKey(r.items)));
  }
  assert.notEqual(outfitKey(recommendOutfit({...base,occasion:'Sự kiện trang trọng',targetRemix:51}).items),
    outfitKey(recommendOutfit({...base,occasion:'Đi chơi cuối tuần',targetRemix:51}).items));
});
test('deterministic order, ties, attainable endpoints and stable small dial changes', () => {
  assert.deepEqual(rankOutfits(base),rankOutfits(base));
  for(const targetRemix of [0,15,50,80,100,NaN]) {
    const context={...base,targetRemix};
    const result=recommendOutfit(context);
    const nearest=Math.min(...rankOutfits(context).map(r=>r.distance));
    assert.ok(result.distance<=nearest+8);
    assert.ok(Number.isFinite(result.score));
  }
  const previous=recommendOutfit({...base,targetRemix:50}).items;
  assert.equal(outfitKey(recommendOutfit({...base,targetRemix:51},previous).items),outfitKey(previous));
  const low=recommendOutfit({...base,targetRemix:0}),high=recommendOutfit({...base,targetRemix:100});
  assert.ok(low.actualRemix<high.actualRemix-60);
});
test('manual choices stay locked through setup changes; target explicitly releases locks', () => {
  let state=createStylingState();
  state=stylingReducer(state,{type:'select',category:'bottom',item:SUPPORT_ITEMS.bottom[2]});
  assert.equal(state.targetRemix,computeActualRemix(state.items));
  for(const data of [{occasion:OCCASIONS[1]},{location:LOCATIONS[9]},{style:STYLES[4]},{preferredColor:'Đen'},{coreGarment:'ao-dai' as const}]) {
    state=stylingReducer(state,{type:'setup',data});
    assert.equal(state.items.bottom.id,'bottom-raw-denim');assert.equal(state.items.accent,null);
  }
  assert.strictEqual(stylingReducer(state,{type:'setup',data:{style:state.setupData.style}}),state);
  state=stylingReducer(state,{type:'target',value:0});
  assert.equal(state.items.bottom.id,'bottom-silk-wide');assert.deepEqual(state.manualSlots,{});
  state=stylingReducer(state,{type:'add-accent'});
  assert.ok(state.items.accent);
  state=stylingReducer(state,{type:'remove-accent'});
  state=stylingReducer(state,{type:'target',value:100});
  assert.equal(state.items.accent,null);
  assert.equal(state.setupData.coreGarment,'ao-dai');
});
test('actual Remix excludes core and null accent; catalog and guardrail stay consistent', () => {
  const items={bottom:SUPPORT_ITEMS.bottom[0],shoes:SUPPORT_ITEMS.shoes[0],bag:SUPPORT_ITEMS.bag[0],accent:null};
  assert.equal(computeActualRemix(items),15);
  assert.equal(computeActualRemix({...items,accent:SUPPORT_ITEMS.accent[2]}),35);
  const c={...base,occasion:'Sự kiện trang trọng',targetRemix:100};
  const r=recommendOutfit(c);
  assert.equal(r.caution,evaluateGuardrail('',CORE_ITEMS[c.coreGarment],r.items,c,r.actualRemix).status==='yellow');
  assert.equal(scoreOutfit({...base,preferredColor:'Xanh lam'},items).dimensions.color===scoreOutfit({...base,preferredColor:'Đỏ son'},items).dimensions.color,false);
});
test('context explanations distinguish unchanged optimum, hysteresis and manual intent; refresh is explicit',()=>{
  let state=createStylingState();
  const originalItems=state.items;
  state=stylingReducer(state,{type:'setup',data:{location:'Tràng An'}});
  assert.strictEqual(state.items,originalItems);assert.equal(state.trace.reason,'same-best');
  state=stylingReducer(state,{type:'select',category:'bottom',item:SUPPORT_ITEMS.bottom[2]});
  state=stylingReducer(state,{type:'setup',data:{occasion:'Sự kiện trang trọng'}});
  assert.equal(state.trace.reason,'manual');assert.ok(state.manualSlots.bottom);
  const target=state.targetRemix;
  state=stylingReducer(state,{type:'refresh'});
  assert.deepEqual(state.manualSlots,{});assert.equal(state.targetRemix,target);assert.equal(state.items.accent,null);
  assert.equal(state.trace.chosenKey,state.trace.bestKey);
  const again=stylingReducer(state,{type:'refresh'});assert.strictEqual(again.items,state.items);
  let hysteresisFound=false;
  for(let targetRemix=0;targetRemix<=100&&!hysteresisFound;targetRemix++){
    const context={...base,targetRemix},current=recommendOutfit(context).items;
    for(const style of STYLES){
      const changed={...context,style},decision=recommendOutfitDecision(changed,current);
      if(decision.keptByHysteresis){hysteresisFound=true;assert.equal(outfitKey(decision.chosen.items),outfitKey(current));assert.equal(outfitKey(recommendOutfitDecision(changed,current,{},false).chosen.items),outfitKey(decision.best.items));break;}
    }
  }
  assert.ok(hysteresisFound);
});
test('full setup matrix covers five garments, seven occasions, eleven locations, five styles and eleven colors', () => {
  let count=0;
  for(const coreGarment of Object.keys(CORE_ITEMS) as RecommendationContext['coreGarment'][]) for(const occasion of OCCASIONS)
    for(const location of LOCATIONS) for(const style of STYLES) for(const preferredColor of PREFERRED_COLOR_OPTIONS) {
      const c={coreGarment,occasion,location,style,preferredColor,targetRemix:50,includeAccent:count%2===0};
      const r=recommendOutfit(c);
      for(const slot of ['bottom','shoes','bag','accent'] as const) {
        const item=r.items[slot];
        if(item) assert.ok(SUPPORT_ITEMS[slot].some(i=>i.id===item.id));
      }
      assert.equal(r.items.accent!==null,c.includeAccent);
      assert.equal(r.actualRemix,computeActualRemix(r.items));
      assert.ok(r.actualRemix>=0&&r.actualRemix<=100);
      assert.ok(r.distance<=8);count++;
    }
  assert.equal(count,21175);
});
