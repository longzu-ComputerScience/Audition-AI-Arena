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

export interface GarmentPhotoLayerConfig {
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
}

export interface PhotoLayerOutfitMap {
  core: Record<string, GarmentPhotoLayerConfig>;
  bottom: Record<string, GarmentPhotoLayerConfig>;
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
    },
  },
};

/**
 * Checks if the current outfit combination is eligible for Photo Layers mode.
 * Supported for Áo Nhật Bình + Quần Lụa.
 */
export function isPhotoLayerSupported(coreId: string, bottomId: string): boolean {
  return coreId === 'ao-nhat-binh' && bottomId === 'bottom-silk-wide';
}

/**
 * Resolves whether the garment has fabric recoloring capability.
 */
export function isGarmentRecolorable(coreId: string): boolean {
  return Boolean(PHOTO_LAYER_CONFIG.core[coreId]?.isRecolorable && PHOTO_LAYER_CONFIG.core[coreId]?.fabricMaskSrc);
}
