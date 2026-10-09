/**
 * Centralized fitting and asset resolution configuration for Photo-Layer Mannequin System.
 * Calibrated against canonical relaxed A-pose landmarks inside viewBox="0 0 300 600".
 */

export interface PoseLandmarks {
  headCenter: [number, number];
  neckBase: [number, number];
  shoulderLeft: [number, number];
  shoulderRight: [number, number];
  elbowLeft: [number, number];
  elbowRight: [number, number];
  wristLeft: [number, number];
  wristRight: [number, number];
  handLeft: [number, number];
  handRight: [number, number];
  waist: [number, number];
  hip: [number, number];
  ankleLeft: [number, number];
  ankleRight: [number, number];
}

export const CANONICAL_MANNEQUIN_LANDMARKS: PoseLandmarks = {
  headCenter: [150, 65],
  neckBase: [150, 116],
  shoulderLeft: [108, 134],
  shoulderRight: [192, 134],
  elbowLeft: [74, 195],
  elbowRight: [226, 195],
  wristLeft: [56, 235],
  wristRight: [244, 235],
  handLeft: [47, 248],
  handRight: [253, 248],
  waist: [150, 248],
  hip: [150, 280],
  ankleLeft: [135, 535],
  ankleRight: [165, 535],
};

export interface LayerPhotoItemConfig {
  catalogId: string;
  name: string;
  imageSrc: string;
  fabricMaskSrc?: string;
  isRecolorable?: boolean;
  sourceDimensions: { width: number; height: number };
  visibleBounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
    centerX: number;
  };
  svgPlacement: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  preserveAspectRatio: string;
  renderOrder?: number;
}

// Backward compatibility type alias
export type GarmentPhotoLayerConfig = LayerPhotoItemConfig;

export interface PhotoLayerOutfitMap {
  core: Record<string, LayerPhotoItemConfig>;
  bottom: Record<string, LayerPhotoItemConfig>;
  shoes: Record<string, LayerPhotoItemConfig>;
  bag: Record<string, LayerPhotoItemConfig>;
  accent: Record<string, LayerPhotoItemConfig>;
}

export const PHOTO_LAYER_CONFIG: PhotoLayerOutfitMap = {
  core: {
    'ao-nhat-binh': {
      catalogId: 'ao-nhat-binh',
      name: 'Áo Nhật Bình Cung Đình',
      imageSrc: '/images/layers/ao-nhat-binh.png',
      fabricMaskSrc: '/images/layers/masks/ao-nhat-binh-fabric-mask.png',
      isRecolorable: true,
      sourceDimensions: { width: 1792, height: 2400 },
      visibleBounds: {
        minX: 125,
        maxX: 1681,
        minY: 328,
        maxY: 2211,
        width: 1557,
        height: 1884,
        centerX: 903,
      },
      // Aligns collar with neck landmark (y=110), hem at (y=400), centered at x=150
      svgPlacement: {
        x: 10.94,
        y: 59.5,
        width: 275.9,
        height: 369.6,
      },
      preserveAspectRatio: 'xMidYMid meet',
      renderOrder: 4,
    },
  },
  bottom: {
    'bottom-silk-wide': {
      catalogId: 'bottom-silk-wide',
      name: 'Quần Lụa Ống Rộng',
      imageSrc: '/images/layers/quan-lua.png',
      isRecolorable: false,
      sourceDimensions: { width: 2048, height: 2048 },
      visibleBounds: {
        minX: 627,
        maxX: 1421,
        minY: 148,
        maxY: 1915,
        width: 795,
        height: 1768,
        centerX: 1024,
      },
      // Aligns waistband with waist landmark (y=248), hem near ankles (y=530), centered at x=150
      svgPlacement: {
        x: -13.33,
        y: 224.4,
        width: 326.65,
        height: 326.65,
      },
      preserveAspectRatio: 'xMidYMid meet',
      renderOrder: 2,
    },
    'bottom-tailored-trousers': {
      catalogId: 'bottom-tailored-trousers',
      name: 'Quần Tây',
      imageSrc: '/images/layers/bottoms/bottom-tailored-trousers.png',
      isRecolorable: false,
      sourceDimensions: { width: 2048, height: 2048 },
      visibleBounds: {
        minX: 712,
        maxX: 1326,
        minY: 151,
        maxY: 1896,
        width: 615,
        height: 1746,
        centerX: 1019,
      },
      // Structured tailored trousers matching waistband y=248 and ankles y=528
      svgPlacement: {
        x: -13.33,
        y: 224.4,
        width: 326.65,
        height: 326.65,
      },
      preserveAspectRatio: 'xMidYMid meet',
      renderOrder: 2,
    },
    'bottom-raw-denim': {
      catalogId: 'bottom-raw-denim',
      name: 'Raw Denim Baggy Cạp Cao',
      imageSrc: '/images/layers/bottoms/bottom-raw-denim.png',
      isRecolorable: false,
      sourceDimensions: { width: 1024, height: 1024 },
      visibleBounds: {
        minX: 352,
        maxX: 844,
        minY: 76,
        maxY: 945,
        width: 492,
        height: 869,
        centerX: 598,
      },
      // Aligns waistband with waist y=245 and ankles y=525
      svgPlacement: {
        x: -42.4,
        y: 220.5,
        width: 329.5,
        height: 329.5,
      },
      preserveAspectRatio: 'xMidYMid meet',
      renderOrder: 2,
    },
  },
  shoes: {
    'shoes-guoc-moc': {
      catalogId: 'shoes-guoc-moc',
      name: 'Guốc Mộc Sơn Mài',
      imageSrc: '/images/layers/shoes/shoes-guoc-moc.png',
      isRecolorable: false,
      sourceDimensions: { width: 1254, height: 1254 },
      visibleBounds: {
        minX: 145,
        maxX: 1109,
        minY: 213,
        maxY: 1037,
        width: 965,
        height: 825,
        centerX: 627,
      },
      // Ground contact at pedestal (y=562), feet span (x=118..182)
      svgPlacement: {
        x: 108.4,
        y: 493.2,
        width: 83.1,
        height: 83.1,
      },
      preserveAspectRatio: 'xMidYMid meet',
      renderOrder: 3,
    },
    'shoes-chunky-loafer': {
      catalogId: 'shoes-chunky-loafer',
      name: 'Chunky Loafer Da Bóng',
      imageSrc: '/images/layers/shoes/shoes-chunky-loafer.png',
      isRecolorable: false,
      sourceDimensions: { width: 1024, height: 720 },
      visibleBounds: {
        minX: 68,
        maxX: 954,
        minY: 77,
        maxY: 641,
        width: 887,
        height: 565,
        centerX: 511,
      },
      svgPlacement: {
        x: 112.0,
        y: 514.3,
        width: 76.2,
        height: 53.6,
      },
      preserveAspectRatio: 'xMidYMid meet',
      renderOrder: 3,
    },
    'shoes-retro-sneaker': {
      catalogId: 'shoes-retro-sneaker',
      name: 'Retro Sneaker Cổ Thấp',
      imageSrc: '/images/layers/shoes/shoes-retro-sneaker.png',
      isRecolorable: false,
      sourceDimensions: { width: 1024, height: 720 },
      visibleBounds: {
        minX: 68,
        maxX: 955,
        minY: 70,
        maxY: 646,
        width: 888,
        height: 577,
        centerX: 512,
      },
      svgPlacement: {
        x: 112.0,
        y: 514.0,
        width: 76.1,
        height: 53.5,
      },
      preserveAspectRatio: 'xMidYMid meet',
      renderOrder: 3,
    },
  },
  bag: {
    'bag-gam-vintage': {
      catalogId: 'bag-gam-vintage',
      name: 'Túi Gấm Cổ Điển',
      imageSrc: '/images/layers/bags/bag-gam-vintage.png',
      isRecolorable: false,
      sourceDimensions: { width: 1254, height: 1254 },
      visibleBounds: {
        minX: 116,
        maxX: 1167,
        minY: 34,
        maxY: 1240,
        width: 1052,
        height: 1207,
        centerX: 641,
      },
      // Suspended gracefully by left hand (x=47, y=248)
      svgPlacement: {
        x: 12.0,
        y: 245.0,
        width: 109.1,
        height: 109.1,
      },
      preserveAspectRatio: 'xMidYMid meet',
      renderOrder: 5,
    },
    'bag-tote-linen': {
      catalogId: 'bag-tote-linen',
      name: 'Túi Tote Vải Lanh',
      imageSrc: '/images/layers/bags/bag-tote-linen.png',
      isRecolorable: false,
      sourceDimensions: { width: 1024, height: 1024 },
      visibleBounds: {
        minX: 163,
        maxX: 859,
        minY: 83,
        maxY: 940,
        width: 697,
        height: 858,
        centerX: 511,
      },
      // Draped over right shoulder (x=192, y=134) down to right hip
      svgPlacement: {
        x: 79.5,
        y: 113.2,
        width: 256.0,
        height: 256.0,
      },
      preserveAspectRatio: 'xMidYMid meet',
      renderOrder: 5,
    },
    'bag-techwear-crossbody': {
      catalogId: 'bag-techwear-crossbody',
      name: 'Túi Đeo Chéo Techwear',
      imageSrc: '/images/layers/bags/bag-techwear-crossbody.png',
      isRecolorable: false,
      sourceDimensions: { width: 1024, height: 1024 },
      visibleBounds: {
        minX: 173,
        maxX: 851,
        minY: 90,
        maxY: 934,
        width: 679,
        height: 845,
        centerX: 512,
      },
      // Strap from left shoulder across chest to right hip pouch
      svgPlacement: {
        x: 62.0,
        y: 118.0,
        width: 189.4,
        height: 189.4,
      },
      preserveAspectRatio: 'xMidYMid meet',
      renderOrder: 5,
    },
  },
  accent: {
    'accent-non-la': {
      catalogId: 'accent-non-la',
      name: 'Nón Lá',
      imageSrc: '/images/layers/accessories/accent-non-la.png',
      isRecolorable: false,
      sourceDimensions: { width: 1024, height: 720 },
      visibleBounds: {
        minX: 68,
        maxX: 954,
        minY: 120,
        maxY: 591,
        width: 887,
        height: 472,
        centerX: 511,
      },
      // Conical apex at (150, 14), wide brim framing upper temples
      svgPlacement: {
        x: 85.5,
        y: -1.1,
        width: 129.2,
        height: 90.9,
      },
      preserveAspectRatio: 'xMidYMid meet',
      renderOrder: 6,
    },
    'accent-y2k-shades': {
      catalogId: 'accent-y2k-shades',
      name: 'Kính Y2K',
      imageSrc: '/images/layers/accessories/accent-y2k-shades.png',
      isRecolorable: false,
      sourceDimensions: { width: 1024, height: 720 },
      visibleBounds: {
        minX: 68,
        maxX: 955,
        minY: 259,
        maxY: 459,
        width: 888,
        height: 201,
        centerX: 512,
      },
      // Eye level on serene face (y=66, x=150)
      svgPlacement: {
        x: 128.1,
        y: 50.6,
        width: 43.8,
        height: 30.8,
      },
      preserveAspectRatio: 'xMidYMid meet',
      renderOrder: 6,
    },
    'accent-silver-jewelry': {
      catalogId: 'accent-silver-jewelry',
      name: 'Chuỗi Bạc Thái',
      imageSrc: '/images/layers/accessories/accent-silver-jewelry.png',
      isRecolorable: false,
      sourceDimensions: { width: 1024, height: 1024 },
      visibleBounds: {
        minX: 69,
        maxX: 951,
        minY: 115,
        maxY: 908,
        width: 883,
        height: 794,
        centerX: 510,
      },
      // Draped around collar/neckline (y=112..140)
      svgPlacement: {
        x: 129.2,
        y: 107.3,
        width: 41.8,
        height: 41.8,
      },
      preserveAspectRatio: 'xMidYMid meet',
      renderOrder: 6,
    },
    'accent-quai-thao-mini': {
      catalogId: 'accent-quai-thao-mini',
      name: 'Nón Quai Thao Mini',
      imageSrc: '/images/layers/accessories/accent-quai-thao-mini.png',
      isRecolorable: false,
      sourceDimensions: { width: 1024, height: 1024 },
      visibleBounds: {
        minX: 177,
        maxX: 846,
        minY: 82,
        maxY: 931,
        width: 670,
        height: 850,
        centerX: 511,
      },
      // Pinned gracefully at waist (x=106, y=272)
      svgPlacement: {
        x: 78.6,
        y: 244.8,
        width: 55.0,
        height: 55.0,
      },
      preserveAspectRatio: 'xMidYMid meet',
      renderOrder: 6,
    },
  },
};

/**
 * Checks if the current outfit combination is eligible for Photo Layers mode.
 * Supported for Áo Nhật Bình with any of our calibrated bottoms.
 */
export function isPhotoLayerSupported(coreId: string, bottomId?: string): boolean {
  const resolvedBottomId = bottomId === 'bottom-cargo-linen' ? 'bottom-tailored-trousers' : bottomId;
  const isCoreSupported = Boolean(PHOTO_LAYER_CONFIG.core[coreId]);
  if (!resolvedBottomId) return isCoreSupported;
  const isBottomSupported = Boolean(PHOTO_LAYER_CONFIG.bottom[resolvedBottomId]);
  return isCoreSupported && isBottomSupported;
}

/**
 * Resolves whether the garment has fabric recoloring capability.
 */
export function isGarmentRecolorable(coreId: string): boolean {
  return Boolean(PHOTO_LAYER_CONFIG.core[coreId]?.isRecolorable && PHOTO_LAYER_CONFIG.core[coreId]?.fabricMaskSrc);
}

/**
 * Retrieves the specific photo layer configuration by category and item ID.
 * Transparently migrates legacy item IDs (e.g. bottom-cargo-linen -> bottom-tailored-trousers).
 */
export function getPhotoLayerConfig(
  category: 'core' | 'bottom' | 'shoes' | 'bag' | 'accent',
  itemId?: string | null
): LayerPhotoItemConfig | undefined {
  if (!itemId) return undefined;
  const resolvedId = itemId === 'bottom-cargo-linen' ? 'bottom-tailored-trousers' : itemId;
  return PHOTO_LAYER_CONFIG[category]?.[resolvedId];
}
