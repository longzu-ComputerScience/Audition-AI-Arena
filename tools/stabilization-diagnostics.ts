import fs from 'node:fs';
import { OCCASIONS, LOCATIONS, STYLES, SUPPORT_ITEMS } from '../src/data/mockFashionData';
import { recommendOutfitDecision, outfitKey } from '../src/utils/outfitRecommendation';
import { DEFAULT_SETUP, createStylingState, stylingReducer } from '../src/utils/stylingState';

const examples=[];
for(const targetRemix of [15,35,51,80]) for(const [field,values] of [['occasion',OCCASIONS],['location',LOCATIONS],['style',STYLES]] as const) {
  const base={...DEFAULT_SETUP,targetRemix,includeAccent:false};
  const current=recommendOutfitDecision(base).chosen.items;
  for(const value of values){
    const context={...base,[field]:value},result=recommendOutfitDecision(context,current);
    examples.push({field,value,targetRemix,current:outfitKey(current),chosen:outfitKey(result.chosen.items),best:outfitKey(result.best.items),hysteresis:result.keptByHysteresis,
      score:result.chosen.score,bestScore:result.best.score,dimensions:result.chosen.dimensions,top3:result.ranked.slice(0,3).map(r=>({key:outfitKey(r.items),score:r.score,actual:r.actualRemix}))});
  }
}
let manual=createStylingState();
manual=stylingReducer(manual,{type:'select',category:'bottom',item:SUPPORT_ITEMS.bottom[2]});
manual=stylingReducer(manual,{type:'setup',data:{occasion:'Sự kiện trang trọng',location:'Tràng An',style:'Năng động'}});
const refreshed=stylingReducer(manual,{type:'refresh'});
fs.mkdirSync('artifacts/stabilization/qa',{recursive:true});
fs.writeFileSync('artifacts/stabilization/qa/recommendation-diagnostics.json',JSON.stringify({weightsUnchanged:true,examples,manual:manual.trace,refreshed:refreshed.trace},null,2));
console.log(JSON.stringify({examples:examples.length,changed:examples.filter(e=>e.chosen!==e.current).length,hysteresis:examples.filter(e=>e.hysteresis).length,manual:manual.trace.chosenKey,refreshed:refreshed.trace.chosenKey}));
