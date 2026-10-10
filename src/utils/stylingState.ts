import { ActiveSupportItems, SetupData, SupportCategoryId, SupportOption } from '../types';
import { SUPPORT_ITEMS } from '../data/mockFashionData';
import { computeActualRemix } from './fashionCalculations';
import { ManualSlots, recommendOutfitDecision, outfitKey, RecommendationContext } from './outfitRecommendation';

export interface RecommendationTrace {
  trigger: 'initial' | 'setup' | 'target' | 'refresh' | 'manual';
  reason: 'manual' | 'hysteresis' | 'same-best' | 'changed';
  context: RecommendationContext;
  locks: ManualSlots;
  chosenKey: string;
  bestKey: string;
  chosenScore: number;
  bestScore: number;
  dimensions: ReturnType<typeof recommendOutfitDecision>['chosen']['dimensions'];
  ranking: { key: string; score: number }[];
}
function search(context: RecommendationContext, current: ActiveSupportItems | undefined, locks: ManualSlots, trigger: RecommendationTrace['trigger']) {
  const decision = recommendOutfitDecision(context,current,locks,trigger !== 'refresh');
  const chosen = trigger === 'manual' ? current! : decision.chosen.items;
  const chosenKey = outfitKey(chosen), bestKey=outfitKey(decision.best.items);
  const ranked = decision.ranked.find(r => outfitKey(r.items) === chosenKey)!;
  const trace: RecommendationTrace = { trigger, context, locks, chosenKey,bestKey,
    chosenScore:ranked.score,bestScore:decision.best.score,dimensions:ranked.dimensions,
    reason:Object.values(locks).some(Boolean)?'manual':decision.keptByHysteresis?'hysteresis':current && chosenKey===outfitKey(current)?'same-best':'changed',
    ranking:decision.ranked.map(r => ({key:outfitKey(r.items),score:r.score})) };
  return { items:current && chosenKey===outfitKey(current)?current:chosen, trace };
}

export interface StylingState {
  setupData: SetupData;
  items: ActiveSupportItems;
  targetRemix: number;
  manualSlots: ManualSlots;
  trace: RecommendationTrace;
}
export const DEFAULT_SETUP: SetupData = {
  coreGarment: 'ao-ngu-than', occasion: 'Chụp ảnh kỷ niệm / Lookbook', location: 'Đại Nội Huế',
  style: 'Thanh lịch', preferredColor: 'Để hệ thống gợi ý',
};
export function createStylingState(): StylingState {
  const targetRemix = 15;
  return { setupData: DEFAULT_SETUP, targetRemix, manualSlots: {},
    ...search({ ...DEFAULT_SETUP, targetRemix, includeAccent: false },undefined,{},'initial') };
}
export type StylingAction =
  | { type: 'setup'; data: Partial<SetupData> }
  | { type: 'target'; value: number }
  | { type: 'select'; category: SupportCategoryId; item: SupportOption }
  | { type: 'add-accent' }
  | { type: 'remove-accent' }
  | { type: 'refresh' };
  // Explicit refresh is the user's intent to replace manual choices.
export function stylingReducer(state: StylingState, action: StylingAction): StylingState {
  if (action.type === 'setup') {
    const setupData = { ...state.setupData, ...action.data };
    if ((Object.keys(action.data) as (keyof SetupData)[]).every(k => setupData[k] === state.setupData[k])) return state;
    const context = { ...setupData, targetRemix: state.targetRemix, includeAccent: state.items.accent !== null };
    return { ...state, setupData, ...search(context,state.items,state.manualSlots,'setup') };
  }
  if (action.type === 'target') {
    const targetRemix = Number.isFinite(action.value) ? Math.max(0, Math.min(100, action.value)) : state.targetRemix;
    if (targetRemix === state.targetRemix) return state;
    // A deliberate dial change requests a new automatic search; null accent stays null.
    return { ...state, targetRemix, manualSlots: {}, ...search({ ...state.setupData, targetRemix, includeAccent: state.items.accent !== null },state.items,{},'target') };
  }
  if(action.type === 'refresh') return { ...state, manualSlots:{}, ...search({ ...state.setupData,targetRemix:state.targetRemix,includeAccent:state.items.accent!==null },state.items,{},'refresh') };
  const category = action.type === 'select' ? action.category : 'accent';
  const item = action.type === 'select' ? SUPPORT_ITEMS[category].find(i => i.id === action.item.id) : action.type === 'add-accent' ? SUPPORT_ITEMS.accent[0] : null;
  if (action.type === 'select' && !item) return state;
  const items = { ...state.items, [category]: item };
  const targetRemix=computeActualRemix(items), manualSlots={ ...state.manualSlots, [category]: true };
  return { ...state, targetRemix, manualSlots, ...search({...state.setupData,targetRemix,includeAccent:items.accent!==null},items,manualSlots,'manual') };
}
