import { CoreVietPhucId } from '../types';

export interface CoreGarmentGalleryPhoto {
  id: string;
  label: string;
  src: string;
  alt: string;
}

export interface CoreGarmentDemoMedia {
  previewSrc: string;
  previewAlt: string;
  gallery: CoreGarmentGalleryPhoto[];
}

export const CORE_GARMENT_DEMO_IMAGES: Partial<Record<CoreVietPhucId, CoreGarmentDemoMedia>> = {
  'ao-nhat-binh': {
    previewSrc: '/images/demo/nhatbinh_toanthan.jpg',
    previewAlt: 'Ảnh chụp toàn thân Áo Nhật Bình Cung Đình',
    gallery: [
      {
        id: 'toan-than',
        label: 'Toàn thân',
        src: '/images/demo/nhatbinh_toanthan.jpg',
        alt: 'Áo Nhật Bình Cung Đình — Toàn thân',
      },
      {
        id: 'can-canh',
        label: 'Cận cảnh',
        src: '/images/demo/nhatbinh_can.jpg',
        alt: 'Áo Nhật Bình Cung Đình — Cận cảnh cổ áo và hoa văn thêu',
      },
      {
        id: 'goc-nghieng',
        label: 'Góc nghiêng',
        src: '/images/demo/nhatbinh_nghieng.jpg',
        alt: 'Áo Nhật Bình Cung Đình — Góc nghiêng và tà sau',
      },
    ],
  },
};

export const SUPPORT_ITEM_DEMO_IMAGES: Record<string, string> = {
  'bottom-silk-wide': '/images/demo/QuanLua.jpg',
  'accent-silver-jewelry': '/images/demo/ChuoiBac.jpg',
};

export function getCoreGarmentDemoMedia(id: CoreVietPhucId): CoreGarmentDemoMedia | undefined {
  return CORE_GARMENT_DEMO_IMAGES[id];
}

export function getSupportItemDemoImage(id: string): string | undefined {
  return SUPPORT_ITEM_DEMO_IMAGES[id];
}
