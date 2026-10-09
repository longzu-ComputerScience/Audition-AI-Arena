/**
 * Centralized fitting configuration for Photo-Layer Mannequin Prototype.
 * Calibrated strictly against visible garment alpha bounds inside viewBox="0 0 300 600".
 */

export interface GarmentPhotoLayerConfig {
  catalogId: string;
  name: string;
  imageSrc: string;
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
      name: 'Áo Nhật Bình Cung Đình (Red Ceremonial Robe)',
      imageSrc: '/images/layers/ao-nhat-binh.png',
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
      // Calibrated to align collar at y=110, hem at y=400, centered on x=150
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
      name: 'Quần Lụa Ống Rộng (Ivory Silk Trousers)',
      imageSrc: '/images/layers/quan-lua.png',
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
      // Calibrated to align waistband at y=248, hem at y=530, centered on x=150
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
 * Supported ONLY for Áo Nhật Bình + Quần Lụa.
 */
export function isPhotoLayerSupported(coreId: string, bottomId: string): boolean {
  return coreId === 'ao-nhat-binh' && bottomId === 'bottom-silk-wide';
}
