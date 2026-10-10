import {
  CORE_ITEMS,
  SUPPORT_ITEMS,
  OCCASIONS,
  LOCATIONS,
  PREFERRED_COLOR_OPTIONS,
  COLOR_MAP,
  resolveCoreGarmentColor,
} from '../data/mockFashionData';
import { CoreItem, SupportOption, CoreVietPhucId } from '../types';

export interface GenerateOutfitRequestPayload {
  coreId: string;
  bottomId: string;
  shoesId: string;
  bagId: string;
  accentId?: string | null;
  occasion?: string;
  location?: string;
  style?: string;
  preferredColor?: string;
}

export interface ValidatedOutfitSelection {
  core: CoreItem;
  bottom: SupportOption;
  shoes: SupportOption;
  bag: SupportOption;
  accent: SupportOption | null;
  occasion: string;
  location: string;
  style: string;
  preferredColor: string;
}

/**
 * Validates the raw request payload strictly against trusted catalog constants.
 */
export function validateAndResolveOutfit(
  payload: unknown
): { valid: true; data: ValidatedOutfitSelection } | { valid: false; error: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Dữ liệu yêu cầu không hợp lệ (cần JSON object).' };
  }

  const p = payload as Partial<GenerateOutfitRequestPayload>;

  if (!p.coreId || typeof p.coreId !== 'string') {
    return { valid: false, error: 'Thiếu mã Việt phục chính (coreId).' };
  }
  const core =
    CORE_ITEMS[p.coreId as CoreVietPhucId] ||
    Object.values(CORE_ITEMS).find((c) => c.id === p.coreId);
  if (!core) {
    return { valid: false, error: `Việt phục không tồn tại trong danh mục: ${p.coreId}` };
  }

  if (!p.bottomId || typeof p.bottomId !== 'string') {
    return { valid: false, error: 'Thiếu mã trang phục phần dưới (bottomId).' };
  }
  const bottom = SUPPORT_ITEMS.bottom.find((b) => b.id === p.bottomId);
  if (!bottom) {
    return { valid: false, error: `Trang phục dưới không tồn tại: ${p.bottomId}` };
  }

  if (!p.shoesId || typeof p.shoesId !== 'string') {
    return { valid: false, error: 'Thiếu mã giày dép (shoesId).' };
  }
  const shoes = SUPPORT_ITEMS.shoes.find((s) => s.id === p.shoesId);
  if (!shoes) {
    return { valid: false, error: `Giày dép không tồn tại: ${p.shoesId}` };
  }

  if (!p.bagId || typeof p.bagId !== 'string') {
    return { valid: false, error: 'Thiếu mã túi xách (bagId).' };
  }
  const bag = SUPPORT_ITEMS.bag.find((b) => b.id === p.bagId);
  if (!bag) {
    return { valid: false, error: `Túi xách không tồn tại: ${p.bagId}` };
  }

  let accent: SupportOption | null = null;
  if (p.accentId) {
    accent = SUPPORT_ITEMS.accent?.find((a) => a.id === p.accentId) || null;
  }

  // Normalize occasion and location against known options or default safely
  const occasion =
    typeof p.occasion === 'string' && OCCASIONS.includes(p.occasion)
      ? p.occasion
      : 'Dạo phố cuối tuần';

  const location =
    typeof p.location === 'string' && LOCATIONS.includes(p.location)
      ? p.location
      : 'Bảo tàng / Không gian triển lãm';

  const style =
    typeof p.style === 'string' && p.style.trim().length > 0 && p.style.length < 100
      ? p.style.trim()
      : 'Hiện đại tối giản (Modern Minimalist)';

  const preferredColor =
    typeof p.preferredColor === 'string' &&
    ((PREFERRED_COLOR_OPTIONS as readonly string[]).includes(p.preferredColor) || Boolean(COLOR_MAP[p.preferredColor]))
      ? p.preferredColor
      : 'Để hệ thống gợi ý';

  return {
    valid: true,
    data: {
      core,
      bottom,
      shoes,
      bag,
      accent,
      occasion,
      location,
      style,
      preferredColor,
    },
  };
}

/**
 * Builds a structured, high-fidelity fashion editorial prompt for Gemini image models.
 */
export function buildFashionEditorialPrompt(selection: ValidatedOutfitSelection): string {
  const { core, bottom, shoes, bag, accent, occasion, location, style, preferredColor } =
    selection;

  // Garment-specific cultural silhouette keywords
  const garmentSilhouetteGuides: Record<string, string> = {
    'ao-nhat-binh':
      'Traditional Vietnamese Áo Nhật Bình ceremonial robe, featuring a structured rectangular standing collar decorated with traditional embroidery, prominent five-element ngũ hành multi-colored horizontal bands on wide sleeves, worn open down the front revealing the inner modern styling.',
    'ao-tac':
      'Traditional Vietnamese Áo Tấc loose ceremonial tunic, featuring expansive flowing pagoda sleeves, high standing Mandarin collar with delicate buttons, knee-length graceful hemline made of flowing luxurious silk.',
    'ao-dai':
      'Classic Vietnamese Áo Dài, featuring a tailored upright collar, five discrete front buttons, fitted chest and long split front and back panels hanging down to mid-calf over modern trousers.',
    'ao-tu-than':
      'Traditional Northern Vietnamese Áo Tứ Thân four-panel tunic, featuring an open flowing outer bodice with side panels draped naturally, worn with graceful layered sashes at the waist.',
    'ao-ngu-than':
      'Traditional Vietnamese Áo Ngũ Thân five-panel tunic, asymmetrical buttoned flap from collar across right chest with 5 traditional buttons, tailored straight hemline.',
  };

  const garmentSilhouette =
    garmentSilhouetteGuides[core.id] ||
    `${core.name} (${core.era}), authentic Vietnamese traditional silhouette.`;

  const resolvedFabricColor = resolveCoreGarmentColor(core.id, preferredColor);

  const primaryGarmentColorInstruction =
    core.id === 'ao-tu-than'
      ? `The main fabric of the primary Vietnamese traditional garment (${core.name}) must be predominantly ${resolvedFabricColor.englishName} (reference HEX: ${resolvedFabricColor.hex}). Apply this color strictly to the outer four-panel robe and sleeves only, while preserving the inner yếm bodice and waist sash in their traditional contrasting colors. Keep the pants, bag, footwear, accessories, and background visually distinct from the primary garment fabric color.`
      : `The main fabric of the primary Vietnamese traditional garment (${core.name}) must be predominantly ${resolvedFabricColor.englishName} (reference HEX: ${resolvedFabricColor.hex}). Apply this color to the main body and sleeves/outer fabric only. Preserve the traditional collar, decorative trim, buttons, embroidery, and culturally distinctive details in their original colors. Keep the pants, bag, footwear, accessories, and background visually distinct from the primary garment fabric color.`;

  const colorHint =
    preferredColor && preferredColor !== 'Để hệ thống gợi ý'
      ? `Main color accent theme: ${preferredColor} (${resolvedFabricColor.englishName}, ${resolvedFabricColor.hex}) on the primary traditional garment, paired with harmonious heritage tones (${core.palette.map((p) => p.name).join(', ')}). `
      : `Primary garment fabric in ${resolvedFabricColor.englishName} (${resolvedFabricColor.hex}), accompanied by traditional Vietnamese pigments (${core.palette.map((p) => p.name).join(', ')}). `;

  let accentSection: string;
  if (!accent) {
    accentSection =
      'No optional accessories, no hats or additional headwear, keeping a clean minimalist profile.';
  } else if (accent.id === 'accent-non-la') {
    accentSection = `Fashion accessory: ${accent.name} (${accent.material}). Traditional Vietnamese nón lá conical leaf hat, handcrafted from natural leaves over a bamboo rib frame, worn naturally on the model's head. Preserve the recognizable pointed conical silhouette and wide curved brim. Do not confuse it with the flat ceremonial nón quai thao. Keep the model's face and the traditional garment details visible. Wear only this single conical hat with no duplicate headwear.`;
  } else if (accent.id === 'accent-quai-thao-mini') {
    accentSection = `Fashion accessory: ${accent.name} (${accent.material}, ${accent.editorialNote}). Miniature flat round ceremonial nón quai thao accessory styled at the waist/hip or held in hand, not a conical nón lá and with no hat worn on the head.`;
  } else if (accent.id === 'accent-y2k-shades') {
    accentSection = `Fashion accessory: ${accent.name} (${accent.material}, ${accent.editorialNote}). Sleek slim silver Y2K sunglasses worn on the face, with no hat or headwear.`;
  } else {
    accentSection = `Fashion accessory: ${accent.name} (${accent.material}, ${accent.editorialNote}). Silver lotus pendant necklace at the neckline, with no hat or headwear.`;
  }

  return [
    'A high-end contemporary fashion editorial portrait illustration.',
    'Subject: ONE full-body, front-facing model standing in a confident, elegant fashion pose wearing a complete hybrid Vietnamese heritage remix outfit.',
    `Primary Core Garment: ${core.name}. ${garmentSilhouette} ${primaryGarmentColorInstruction}`,
    `Bottom Wear: ${bottom.name} - ${bottom.material}, ${bottom.editorialNote}. Seamlessly coordinated beneath the core tunic.`,
    `Footwear: ${shoes.name} - ${shoes.material}, ${shoes.editorialNote}. Visible on feet on the floor.`,
    `Bag / Carry: ${bag.name} - ${bag.material}, ${bag.editorialNote}. Styled naturally with the ensemble.`,
    accentSection,
    `Occasion & Setting: ${occasion} in ${location}.`,
    `Style Direction: ${style}. ${colorHint}`,
    'Aesthetics & Photography Direction: Vogue/Harper\'s Bazaar editorial lookbook, soft directional warm studio lighting, neutral warm cream and earthen background, exquisite textile textures (mulberry silk, organic linen, leather craftsmanship), harmonious proportions, crisp 3:4 portrait framing, front-facing full-length view showing the complete outfit from head to shoes.',
  ].join(' ');
}
