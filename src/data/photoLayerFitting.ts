import measuredAssets from './photoAssetMetadata.json';

/** Shared canonical A-pose, in the existing 300 × 600 viewBox. */
export const CANONICAL_MANNEQUIN_LANDMARKS = {
  headCenter: [150, 73], neckBase: [150, 116], shoulderLeft: [108, 134], shoulderRight: [192, 134],
  elbowLeft: [66, 208], elbowRight: [234, 208], wristLeft: [44, 280], wristRight: [256, 280],
  handLeft: [36, 294], handRight: [264, 294], waist: [150, 248], hip: [150, 280],
  ankleLeft: [135, 535], ankleRight: [165, 535],
} satisfies Record<string, [number, number]>;
export type PoseLandmarks = typeof CANONICAL_MANNEQUIN_LANDMARKS;
export interface LayerPhotoItemConfig {
  catalogId: string;
  name: string;
  imageSrc: string;
  fabricMaskSrc?: string;
  isRecolorable?: boolean;
  baseFabricLuminance?: number;
  sourceDimensions: { width: number; height: number };
  visibleBounds: { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number; centerX: number };
  svgPlacement: { x: number; y: number; width: number; height: number };
  preserveAspectRatio: string;
  renderOrder: number;
  fittingAnchors?: { neck: number[]; hem: number[] };
  hideArms?: boolean;
  bagCarryAnchor?: [number, number];
  validated: boolean;
}
export type GarmentPhotoLayerConfig = LayerPhotoItemConfig;
type Category = 'core' | 'bottom' | 'shoes' | 'bag' | 'accent';
export type PhotoLayerOutfitMap = Record<Category, Record<string, LayerPhotoItemConfig>>;
const names: Record<string, string> = {
  'ao-nhat-binh':'Áo Nhật Bình','ao-tac':'Áo Tấc','ao-dai':'Áo Dài','ao-tu-than':'Áo Tứ Thân','ao-ngu-than':'Áo Ngũ Thân',
  'bottom-silk-wide':'Quần Lụa','bottom-tailored-trousers':'Quần Tây','bottom-raw-denim':'Quần Denim',
  'shoes-guoc-moc':'Guốc Mộc','shoes-chunky-loafer':'Chunky Loafer','shoes-retro-sneaker':'Retro Sneaker',
  'bag-gam-vintage':'Túi Gấm','bag-tote-linen':'Túi Tote','bag-techwear-crossbody':'Túi Đeo Chéo',
  'accent-non-la':'Nón Lá','accent-y2k-shades':'Kính Y2K','accent-silver-jewelry':'Chuỗi Bạc','accent-quai-thao-mini':'Nón Quai Thao Mini',
};
/** Uniform scale about a measured anchor; no aspect-ratio distortion. */
function fit(source: number[], target: number[], scale: number, d: { width: number; height: number }) {
  return { x: target[0]-source[0]*scale, y: target[1]-source[1]*scale, width:d.width*scale, height:d.height*scale };
}
export const PHOTO_LAYER_CONFIG: PhotoLayerOutfitMap = { core:{}, bottom:{}, shoes:{}, bag:{}, accent:{} };
for (const [id, data] of Object.entries(measuredAssets)) {
  const category: Category = id.startsWith('ao-') ? 'core' : id.split('-')[0] as Category;
  const d = data.sourceDimensions, b = data.visibleBounds;
  let p: LayerPhotoItemConfig['svgPlacement'];
  if ('fittingAnchors' in data) {
    p = fit(data.fittingAnchors.neck, data.targetNeck, (data.targetHem-data.targetNeck[1])/(data.fittingAnchors.hem[1]-data.fittingAnchors.neck[1]),d);
  } else if (category === 'bottom') {
    p = fit([b.centerX,b.minY], CANONICAL_MANNEQUIN_LANDMARKS.waist, (538-248)/(b.height-1),d);
  } else if (category === 'shoes') {
    p = fit([b.centerX,b.maxY],[150,562],(id==='shoes-guoc-moc'?64:70)/b.width,d);
  } else if (id === 'bag-gam-vintage') {
    p = fit([b.centerX,b.minY],CANONICAL_MANNEQUIN_LANDMARKS.handLeft,68/b.width,d);
  } else if (id === 'bag-tote-linen') {
    p = fit([b.centerX,b.minY],[198,138],94/b.width,d);
  } else if (id === 'bag-techwear-crossbody') {
    // Source strap actually runs upper-right to lower-left; anchor to right shoulder.
    p = fit([b.minX+b.width*.83,b.minY],CANONICAL_MANNEQUIN_LANDMARKS.shoulderRight,164/b.height,d);
  } else if (id === 'accent-non-la') {
    p = fit([b.centerX,b.minY],[150,10],108/b.width,d);
  } else if (id === 'accent-y2k-shades') {
    p = fit([b.centerX,(b.minY+b.maxY)/2],[150,74],38/b.width,d);
  } else if (id === 'accent-silver-jewelry') {
    p = fit([b.centerX,b.minY],[150,110],38/b.width,d);
  } else {
    p = fit([b.centerX,b.minY],[106,264],40/b.width,d);
  }
  PHOTO_LAYER_CONFIG[category][id] = { ...data, catalogId:id, name:names[id], svgPlacement:p,
    preserveAspectRatio:'xMidYMid meet',renderOrder:{core:4,bottom:2,shoes:3,bag:5,accent:6}[category],
    // Source sleeves occlude the canonical arms; no separate pose is introduced.
    hideArms:category==='core',
    // Aperture of the wide sleeve; the concealed hand carries the handle at this seam.
    bagCarryAnchor:id==='ao-nhat-binh'?[69,264]:id==='ao-tac'?[36,301]:id==='ao-dai'?[29,281]:undefined,validated:true };
}
export function getPhotoLayerConfig(category: Category, itemId?: string | null): LayerPhotoItemConfig | undefined {
  if (!itemId) return undefined;
  // Legacy adapter at the asset boundary only; never emit this ID into the catalog.
  return PHOTO_LAYER_CONFIG[category][itemId==='bottom-cargo-linen'?'bottom-tailored-trousers':itemId];
}
/** Carry fitting and collision alternatives share measured alpha bounds and uniform scale. */
export function getOutfitLayerConfig(coreId: string, category: Category, itemId?: string | null, bagId?: string): LayerPhotoItemConfig | undefined {
  const config = getPhotoLayerConfig(category, itemId);
  if (!config) return undefined;
  const b = config.visibleBounds, d = config.sourceDimensions;
  if (itemId === 'bag-gam-vintage') {
    const carry = getPhotoLayerConfig('core', coreId)?.bagCarryAnchor ?? CANONICAL_MANNEQUIN_LANDMARKS.handLeft;
    const scale = (coreId === 'ao-dai' ? .8 : 1) * 68/b.width;
    return { ...config, svgPlacement: fit([b.centerX,b.minY],carry,scale,d) };
  }
  if (itemId === 'accent-quai-thao-mini') {
    const bag = getOutfitLayerConfig(coreId, 'bag', bagId);
    const p = config.svgPlacement;
    const visible = (c: LayerPhotoItemConfig) => {
      const s = c.svgPlacement.width/c.sourceDimensions.width, bounds=c.visibleBounds;
      return { x:c.svgPlacement.x+bounds.minX*s, y:c.svgPlacement.y+bounds.minY*s, width:bounds.width*s, height:bounds.height*s };
    };
    const other=bag && visible(bag);
    const collides = (candidate: LayerPhotoItemConfig) => {
      const a=visible(candidate);
      return other && a.x < other.x+other.width+6 && a.x+a.width+6 > other.x && a.y < other.y+other.height+6 && a.y+a.height+6 > other.y;
    };
    if (collides(config)) {
      // Opposite hip for the hand bag; lower belt suspension when the crossbody spans both hips.
      for(const target of [[190,264],[106,318],[190,318]]) {
        const candidate={...config,svgPlacement:fit([b.centerX,b.minY],target,p.width/d.width,d)};
        if(!collides(candidate)) return candidate;
      }
    }
  }
  return config;
}
export function isPhotoLayerSupported(coreId: string,bottomId?: string): boolean {
  return Boolean(getPhotoLayerConfig('core',coreId)?.validated && (!bottomId||getPhotoLayerConfig('bottom',bottomId)?.validated));
}
export function isGarmentRecolorable(coreId: string): boolean {
  const config=getPhotoLayerConfig('core',coreId);
  return Boolean(config?.validated&&config.isRecolorable&&config.fabricMaskSrc);
}
/** Only for intro/Discovery; editorial galleries and Lookbook retain their media mapping. */
export function getGarmentLayerPreview(coreId: string) {
  const c=getPhotoLayerConfig('core',coreId);
  return c?.validated?{previewSrc:c.imageSrc,previewAlt:`Ảnh tách nền trang phục ${c.name}`}:undefined;
}
