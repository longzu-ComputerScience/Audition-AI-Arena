import { ActiveSupportItems, SetupData, SupportCategoryId, SupportOption } from '../types';
import { SUPPORT_ITEMS } from '../data/mockFashionData';
import { computeActualRemix } from './fashionCalculations';
import { ManualSlots, recommendOutfitDecision, outfitKey, RecommendationContext } from './outfitRecommendation';

export interface RecommendationTrace {
  trigger: 'initial' | 'setup' | 'target' | 'refresh' | 'manual' | 'add-accent';
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
  // Context changes deserve a fresh recommendation; hysteresis smooths only small dial moves.
  const decision = recommendOutfitDecision(context,current,locks,trigger === 'target');
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
  // Explicit opt-out must outlive setup changes, dial moves, and refresh.
  // A null accessory is a user preference only after they remove it.
  accentOptedOut: boolean;
  trace: RecommendationTrace;
}
export const DEFAULT_SETUP: SetupData = {
  coreGarment: 'ao-ngu-than', occasion: 'Chụp ảnh kỷ niệm / Lookbook', location: 'Đại Nội Huế',
  style: 'Thanh lịch', preferredColor: 'Để hệ thống gợi ý',
};
export function createStylingState(): StylingState {
  // Begin with a balanced heritage/modern remix so context can influence the
  // wardrobe; the user may set any target explicitly with the existing dial.
  const targetRemix = 45;
  return { setupData: DEFAULT_SETUP, targetRemix, manualSlots: {}, accentOptedOut: false,
    ...search({ ...DEFAULT_SETUP, targetRemix, includeAccent: true },undefined,{},'initial') };
}
export type StylingAction =
  | { type: 'setup'; data: Partial<SetupData> }
  | { type: 'target'; value: number }
  | { type: 'select'; category: SupportCategoryId; item: SupportOption }
  | { type: 'add-accent' }
  | { type: 'remove-accent' }
  | { type: 'refresh' };
// Explicit refresh releases item locks, not the user's accessory opt-out.
export function stylingReducer(state: StylingState, action: StylingAction): StylingState {
  if (action.type === 'setup') {
    const setupData = { ...state.setupData, ...action.data };
    if ((Object.keys(action.data) as (keyof SetupData)[]).every(k => setupData[k] === state.setupData[k])) return state;
    const context = { ...setupData, targetRemix: state.targetRemix, includeAccent: !state.accentOptedOut };
    return { ...state, setupData, ...search(context,state.items,state.manualSlots,'setup') };
  }
  if (action.type === 'target') {
    const targetRemix = Number.isFinite(action.value) ? Math.max(0, Math.min(100, action.value)) : state.targetRemix;
    if (targetRemix === state.targetRemix) return state;
    // A deliberate dial change releases item locks but never reverses an explicit
    // "Không sử dụng" decision for the optional accessory.
    return { ...state, targetRemix, manualSlots: {}, ...search({ ...state.setupData, targetRemix, includeAccent: !state.accentOptedOut },state.items,{},'target') };
  }
  if(action.type === 'refresh') return { ...state, manualSlots:{}, ...search({ ...state.setupData,targetRemix:state.targetRemix,includeAccent:!state.accentOptedOut },state.items,{},'refresh') };
  if(action.type === 'add-accent') {
    if (!state.accentOptedOut && state.items.accent) return state;
    // Re-enable automatic accessory selection in the current context, keeping
    // other manually selected pieces but not locking an arbitrary first item.
    const manualSlots={...state.manualSlots, accent:false};
    return { ...state, accentOptedOut:false, manualSlots,
      ...search({ ...state.setupData,targetRemix:state.targetRemix,includeAccent:true },state.items,manualSlots,'add-accent') };
  }
  const category = action.type === 'select' ? action.category : 'accent';
  const item = action.type === 'select' ? SUPPORT_ITEMS[category].find(i => i.id === action.item.id) : null;
  if (action.type === 'select' && !item) return state;
  const items = { ...state.items, [category]: item };
  const targetRemix=computeActualRemix(items), manualSlots={ ...state.manualSlots, [category]: true };
  const accentOptedOut = category === 'accent' ? item === null : state.accentOptedOut;
  return { ...state, targetRemix, manualSlots, accentOptedOut,
    ...search({...state.setupData,targetRemix,includeAccent:!accentOptedOut},items,manualSlots,'manual') };
}
