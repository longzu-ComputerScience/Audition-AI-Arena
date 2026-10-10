import { ActiveSupportItems, SetupData, SupportCategoryId, SupportOption } from '../types';
import { SUPPORT_ITEMS } from '../data/mockFashionData';
import { computeActualRemix } from './fashionCalculations';
import { ManualSlots, recommendOutfit } from './outfitRecommendation';

export interface StylingState {
  setupData: SetupData;
  items: ActiveSupportItems;
  targetRemix: number;
  manualSlots: ManualSlots;
}
export const DEFAULT_SETUP: SetupData = {
  coreGarment: 'ao-ngu-than', occasion: 'Chụp ảnh kỷ niệm / Lookbook', location: 'Đại Nội Huế',
  style: 'Thanh lịch', preferredColor: 'Để hệ thống gợi ý',
};
export function createStylingState(): StylingState {
  const targetRemix = 15;
  return { setupData: DEFAULT_SETUP, targetRemix, manualSlots: {},
    items: recommendOutfit({ ...DEFAULT_SETUP, targetRemix, includeAccent: false }).items };
}
export type StylingAction =
  | { type: 'setup'; data: Partial<SetupData> }
  | { type: 'target'; value: number }
  | { type: 'select'; category: SupportCategoryId; item: SupportOption }
  | { type: 'add-accent' }
  | { type: 'remove-accent' };
export function stylingReducer(state: StylingState, action: StylingAction): StylingState {
  if (action.type === 'setup') {
    const setupData = { ...state.setupData, ...action.data };
    if ((Object.keys(action.data) as (keyof SetupData)[]).every(k => setupData[k] === state.setupData[k])) return state;
    const context = { ...setupData, targetRemix: state.targetRemix, includeAccent: state.items.accent !== null };
    return { ...state, setupData, items: recommendOutfit(context, state.items, state.manualSlots).items };
  }
  if (action.type === 'target') {
    const targetRemix = Number.isFinite(action.value) ? Math.max(0, Math.min(100, action.value)) : state.targetRemix;
    if (targetRemix === state.targetRemix) return state;
    // A deliberate dial change requests a new automatic search; null accent stays null.
    return { ...state, targetRemix, manualSlots: {}, items: recommendOutfit({ ...state.setupData, targetRemix, includeAccent: state.items.accent !== null }, state.items).items };
  }
  const category = action.type === 'select' ? action.category : 'accent';
  const item = action.type === 'select' ? SUPPORT_ITEMS[category].find(i => i.id === action.item.id) : action.type === 'add-accent' ? SUPPORT_ITEMS.accent[0] : null;
  if (action.type === 'select' && !item) return state;
  const items = { ...state.items, [category]: item };
  return { ...state, items, targetRemix: computeActualRemix(items), manualSlots: { ...state.manualSlots, [category]: true } };
}
