import { ActiveSupportItems, CoreVietPhucId, SetupData, SupportCategoryId, SupportOption } from '../types';
import { CORE_ITEMS, SUPPORT_ITEMS, resolveCoreGarmentColor } from '../data/mockFashionData';
import { computeActualRemix, isSolemnOccasion } from './fashionCalculations';

export interface RecommendationContext extends SetupData {
  targetRemix: number;
  includeAccent: boolean;
}
export type ManualSlots = Partial<Record<SupportCategoryId, boolean>>;
type Traits = { formal: number; mobile: number; heritage: number; simple: number; street: number };
// Visual/material traits, not a fixed outfit per style. Values are in [0,1].
const TRAITS: Record<string, Traits> = {
  'bottom-silk-wide': { formal: .95, mobile: .65, heritage: 1, simple: .8, street: .1 },
  'bottom-tailored-trousers': { formal: 1, mobile: .75, heritage: .4, simple: 1, street: .45 },
  'bottom-raw-denim': { formal: .3, mobile: .85, heritage: .1, simple: .65, street: 1 },
  'shoes-guoc-moc': { formal: .8, mobile: .3, heritage: 1, simple: .65, street: .15 },
  'shoes-chunky-loafer': { formal: .95, mobile: .7, heritage: .3, simple: .85, street: .8 },
  'shoes-retro-sneaker': { formal: .35, mobile: 1, heritage: .25, simple: .7, street: 1 },
  'bag-gam-vintage': { formal: .95, mobile: .45, heritage: 1, simple: .2, street: .1 },
  'bag-tote-linen': { formal: .4, mobile: 1, heritage: .55, simple: 1, street: .55 },
  'bag-techwear-crossbody': { formal: .25, mobile: 1, heritage: .05, simple: .65, street: 1 },
  'accent-silver-jewelry': { formal: .95, mobile: .8, heritage: .85, simple: .8, street: .5 },
  'accent-quai-thao-mini': { formal: .65, mobile: .65, heritage: .9, simple: .25, street: .65 },
  'accent-y2k-shades': { formal: .2, mobile: .95, heritage: .05, simple: .8, street: 1 },
  'accent-non-la': { formal: .7, mobile: .6, heritage: 1, simple: .7, street: .15 },
};
type LocationKind = 'ceremonial' | 'historic' | 'urban' | 'outdoor' | 'artistic';
export const LOCATION_CONTEXT: Record<string, LocationKind> = {
  'Đại Nội Huế': 'ceremonial', 'Văn Miếu – Quốc Tử Giám': 'ceremonial',
  'Phố cổ Hội An': 'historic', 'Hồ Hoàn Kiếm': 'historic',
  'Hà Nội': 'urban', 'Huế': 'urban', 'Đà Nẵng': 'urban', 'TP. Hồ Chí Minh': 'urban',
  'Ninh Bình': 'outdoor', 'Tràng An': 'outdoor', 'Đường sách / Bảo tàng Mỹ thuật': 'artistic',
};
export const RECOMMENDATION_WEIGHTS = {
  remix: .48, occasion: .13, location: .07, style: .12, color: .09, core: .07, cohesion: .04,
} as const;
export type ScoreDimensions = Record<keyof typeof RECOMMENDATION_WEIGHTS, number>;
export interface RankedOutfit {
  items: ActiveSupportItems;
  actualRemix: number;
  distance: number;
  score: number;
  dimensions: ScoreDimensions;
  caution: boolean;
  rationale: string;
}
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;
export function outfitKey(items: ActiveSupportItems): string {
  return [items.bottom.id, items.shoes.id, items.bag.id, items.accent?.id ?? ''].join('|');
}
function hsl(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16) / 255);
  const hi = Math.max(r, g, b), lo = Math.min(r, g, b), delta = hi - lo, l = (hi + lo) / 2;
  let h = 0;
  if (delta) h = hi === r ? ((g - b) / delta + 6) % 6 : hi === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return [h * 60, delta ? delta / (1 - Math.abs(2 * l - 1)) : 0, l];
}
// Hue relationships plus lightness/undertone balance; large regions need more restraint.
export function colorHarmony(coreHex: string, itemHex: string, region: number): number {
  const [h1, s1, l1] = hsl(coreHex), [h2, s2, l2] = hsl(itemHex);
  const hue = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));
  const analogous = Math.max(0, 1 - hue / 65), complementary = Math.max(0, 1 - Math.abs(180 - hue) / 65);
  const contrast = Math.abs(l1 - l2);
  const warm1 = h1 < 75 || h1 > 320, warm2 = h2 < 75 || h2 > 320;
  // Near-neutral black, ivory, beige and indigo still differ in contrast and undertone.
  const neutral = s2 < .25 || l2 < .18 || l2 > .84;
  const relationship = neutral ? .7 + .2 * contrast : .35 + .4 * Math.max(analogous, complementary);
  const undertone = warm1 === warm2 ? .07 : .03;
  return clamp(relationship + undertone + .15 * contrast - region * Math.max(0, s1 + s2 - 1.2) * .35);
}
function styleScore(t: Traits, style: string): number {
  switch (style) {
    case 'Thanh lịch': return .75 * t.formal + .25 * t.simple;
    case 'Năng động': return .8 * t.mobile + .2 * t.street;
    case 'Tối giản': return .85 * t.simple + .15 * t.formal;
    case 'Hoài cổ (Vintage)': return .85 * t.heritage + .15 * t.formal;
    case 'Đường phố (Streetwear)': case 'Streetwear': return .85 * t.street + .15 * t.mobile;
    default: return .5;
  }
}
function occasionScore(t: Traits, occasion: string): number {
  switch (occasion) {
    case 'Sự kiện trang trọng': return .85 * t.formal + .15 * t.simple;
    case 'Lễ tốt nghiệp / Bế giảng': return .75 * t.formal + .25 * t.mobile;
    case 'Đám cưới / Ăn hỏi bạn bè': return .8 * t.formal + .2 * t.heritage;
    case 'Đón Tết cổ truyền': return .65 * t.heritage + .35 * t.formal;
    case 'Đi chơi cuối tuần': return .85 * t.mobile + .15 * t.simple;
    case 'Lễ hội ở trường': return .5 * t.mobile + .3 * t.street + .2 * t.heritage;
    case 'Chụp ảnh kỷ niệm / Lookbook': return .45 * t.street + .35 * t.heritage + .2 * (1 - t.simple);
    default: return .5;
  }
}
function locationScore(t: Traits, location: string): number {
  switch (LOCATION_CONTEXT[location]) {
    case 'ceremonial': return .55 * t.heritage + .45 * t.formal;
    case 'historic': return .5 * t.heritage + .5 * t.mobile;
    case 'outdoor': return .9 * t.mobile + .1 * t.simple;
    case 'artistic': return .4 * t.street + .3 * t.simple + .3 * t.heritage;
    // A city alone tells us little about the venue: this stays a mild mobility signal.
    case 'urban': return .6 + .2 * t.mobile + .2 * t.simple;
    default: return .5;
  }
}
function coreScore(id: CoreVietPhucId, item: SupportOption): number {
  const t = TRAITS[item.id];
  const formal = id === 'ao-nhat-binh' || id === 'ao-tac';
  let score = formal ? .6 * t.formal + .4 * t.heritage : id === 'ao-tu-than' ? .65 * t.heritage + .35 * t.mobile : id === 'ao-dai' ? .65 * t.simple + .35 * t.formal : .5 * t.formal + .5 * t.simple;
  if (formal && item.id === 'bag-techwear-crossbody') score -= .3; // Strap obscures chest details.
  if (id === 'ao-nhat-binh' && item.id === 'accent-silver-jewelry') score -= .2; // Elaborate collar already draws attention.
  if (id === 'ao-tu-than' && item.id === 'accent-quai-thao-mini') score += .15;
  return clamp(score);
}
export function scoreOutfit(context: RecommendationContext, items: ActiveSupportItems): RankedOutfit {
  const active = [items.bottom, items.shoes, items.bag, ...(items.accent ? [items.accent] : [])];
  const actualRemix = computeActualRemix(items);
  const target = Number.isFinite(context.targetRemix) ? Math.max(0, Math.min(100, context.targetRemix)) : 50;
  const distance = Math.abs(actualRemix - target);
  const coreHex = resolveCoreGarmentColor(context.coreGarment, context.preferredColor).hex;
  const caution = isSolemnOccasion(context.occasion) && actualRemix >= 80;
  const dimensions: ScoreDimensions = {
    remix: clamp(1 - distance / 30),
    occasion: clamp(mean(active.map(i => occasionScore(TRAITS[i.id], context.occasion))) - (caution ? .3 : 0)),
    location: mean(active.map(i => locationScore(TRAITS[i.id], context.location))),
    style: mean(active.map(i => styleScore(TRAITS[i.id], context.style))),
    color: mean(active.map(i => .8 * colorHarmony(coreHex, i.colorHex, i.category === 'bottom' ? .8 : .3) + .2 * colorHarmony(coreHex, i.accentHex, .1))),
    core: mean(active.map(i => coreScore(context.coreGarment, i))),
    cohesion: clamp(1 - (Math.max(...active.map(i => i.modernityScore)) - Math.min(...active.map(i => i.modernityScore))) / 150),
  };
  const score = (Object.keys(RECOMMENDATION_WEIGHTS) as (keyof ScoreDimensions)[]).reduce((s, k) => s + dimensions[k] * RECOMMENDATION_WEIGHTS[k], 0);
  const rationale = `Gợi ý tại máy cho ${CORE_ITEMS[context.coreGarment].name}: hướng ${context.style.toLowerCase()}, dịp ${context.occasion.toLowerCase()} tại ${context.location}; phối với sắc ${resolveCoreGarmentColor(context.coreGarment, context.preferredColor).name}. Remix thực tế ${actualRemix}% / mục tiêu ${target}%.${caution ? ' Mức Remix này nổi bật trong bối cảnh trang trọng; cân nhắc phụ kiện tiết chế.' : ''}`;
  return { items, actualRemix, distance, score, dimensions, caution, rationale };
}
export function rankOutfits(context: RecommendationContext, current?: ActiveSupportItems, manual: ManualSlots = {}): RankedOutfit[] {
  const options = (category: SupportCategoryId): (SupportOption | null)[] => {
    if (category === 'accent' && !context.includeAccent) return [null];
    if (manual[category] && current) return [current[category]];
    return SUPPORT_ITEMS[category];
  };
  const ranked: RankedOutfit[] = [];
  for (const bottom of options('bottom')) for (const shoes of options('shoes')) for (const bag of options('bag')) for (const accent of options('accent')) {
    ranked.push(scoreOutfit(context, { bottom: bottom!, shoes: shoes!, bag: bag!, accent }));
  }
  const nearest = Math.min(...ranked.map(r => r.distance));
  // Outside nearest achievable distance + 8 points, use a steep bounded soft penalty.
  // This respects impossible 0/100 endpoints and manual locks without excluding the catalog.
  for (const r of ranked) r.score -= Math.min(1, Math.max(0, r.distance - nearest - 8) * .035);
  return ranked.sort((a, b) => b.score - a.score || a.distance - b.distance || (outfitKey(a.items) < outfitKey(b.items) ? -1 : outfitKey(a.items) > outfitKey(b.items) ? 1 : 0));
}
export function recommendOutfit(context: RecommendationContext, current?: ActiveSupportItems, manual: ManualSlots = {}): RankedOutfit {
  const ranked = rankOutfits(context, current, manual);
  const best = ranked[0];
  const previous = current && ranked.find(r => outfitKey(r.items) === outfitKey(current));
  // 1.2 percentage points hysteresis: keep the current outfit for insignificant improvements.
  return previous && best.score - previous.score <= .012 ? previous : best;
}
