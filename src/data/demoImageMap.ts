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

export const CORE_GARMENT_DEMO_IMAGES: Record<CoreVietPhucId, CoreGarmentDemoMedia> = {
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
  'ao-tac': {
    previewSrc: '/images/catalog/garments/ao-tac/full.webp',
    previewAlt: 'Ảnh chụp toàn thân Áo Tấc (Áo thụng ngũ thân truyền thống)',
    gallery: [
      {
        id: 'toan-than',
        label: 'Toàn thân',
        src: '/images/catalog/garments/ao-tac/full.webp',
        alt: 'Áo Tấc — Toàn thân tay thụng trang trọng',
      },
      {
        id: 'can-canh',
        label: 'Cận cảnh',
        src: '/images/catalog/garments/ao-tac/zoom.webp',
        alt: 'Áo Tấc — Cận cảnh nếp vải gấm và khuy cài',
      },
      {
        id: 'goc-nghieng',
        label: 'Góc nghiêng',
        src: '/images/catalog/garments/ao-tac/nghieng.webp',
        alt: 'Áo Tấc — Góc nghiêng dáng áo đĩnh đạc',
      },
    ],
  },
  'ao-dai': {
    previewSrc: '/images/catalog/garments/ao-dai/full.webp',
    previewAlt: 'Ảnh chụp toàn thân Áo Dài Truyền Thống',
    gallery: [
      {
        id: 'toan-than',
        label: 'Toàn thân',
        src: '/images/catalog/garments/ao-dai/full.webp',
        alt: 'Áo Dài — Dáng đứng thanh thoát hai tà buông rủ',
      },
      {
        id: 'can-canh',
        label: 'Cận cảnh',
        src: '/images/catalog/garments/ao-dai/zoom.webp',
        alt: 'Áo Dài — Cận cảnh đường viền cổ đứng và chất liệu lụa',
      },
      {
        id: 'goc-nghieng',
        label: 'Góc nghiêng',
        src: '/images/catalog/garments/ao-dai/nghieng.webp',
        alt: 'Áo Dài — Góc nghiêng uyển chuyển',
      },
    ],
  },
  'ao-tu-than': {
    previewSrc: '/images/catalog/garments/ao-tu-than/full.webp',
    previewAlt: 'Ảnh chụp toàn thân Áo Tứ Thân Dân Gian',
    gallery: [
      {
        id: 'toan-than',
        label: 'Toàn thân',
        src: '/images/catalog/garments/ao-tu-than/full.webp',
        alt: 'Áo Tứ Thân — Toàn thân vạt buộc duyên dáng',
      },
      {
        id: 'can-canh',
        label: 'Cận cảnh',
        src: '/images/catalog/garments/ao-tu-than/zoom.webp',
        alt: 'Áo Tứ Thân — Cận cảnh vạt trước và yếm đào',
      },
      {
        id: 'goc-nghieng',
        label: 'Góc nghiêng',
        src: '/images/catalog/garments/ao-tu-than/nghieng.webp',
        alt: 'Áo Tứ Thân — Góc nghiêng tà áo thướt tha',
      },
    ],
  },
  'ao-ngu-than': {
    previewSrc: '/images/catalog/garments/ao-ngu-than/full.webp',
    previewAlt: 'Ảnh chụp toàn thân Áo Ngũ Thân Lập Lĩnh',
    gallery: [
      {
        id: 'toan-than',
        label: 'Toàn thân',
        src: '/images/catalog/garments/ao-ngu-than/full.webp',
        alt: 'Áo Ngũ Thân — Toàn thân phong thái nho nhã',
      },
      {
        id: 'can-canh',
        label: 'Cận cảnh',
        src: '/images/catalog/garments/ao-ngu-than/zoom.webp',
        alt: 'Áo Ngũ Thân — Cận cảnh hàng năm khuy cài ngũ thường',
      },
      {
        id: 'goc-nghieng',
        label: 'Góc nghiêng',
        src: '/images/catalog/garments/ao-ngu-than/nghieng.webp',
        alt: 'Áo Ngũ Thân — Góc nghiêng cổ đứng tinh tế',
      },
    ],
  },
};

export const SUPPORT_ITEM_DEMO_IMAGES: Record<string, string> = {
  // Bottoms
  'bottom-silk-wide': '/images/catalog/bottoms/bottom-silk-wide.webp',
  'bottom-raw-denim': '/images/catalog/bottoms/bottom-raw-denim.webp',
  // Footwear
  'shoes-guoc-moc': '/images/catalog/shoes/shoes-guoc-moc.webp',
  'shoes-chunky-loafer': '/images/catalog/shoes/shoes-chunky-loafer.webp',
  'shoes-retro-sneaker': '/images/catalog/shoes/shoes-retro-sneaker.webp',
  // Bags
  'bag-gam-vintage': '/images/catalog/bags/bag-gam-vintage.webp',
  'bag-tote-linen': '/images/catalog/bags/bag-tote-linen.webp',
  // Accessories
  'accent-silver-jewelry': '/images/demo/ChuoiBac.jpg',
};

export function getCoreGarmentDemoMedia(id: CoreVietPhucId): CoreGarmentDemoMedia | undefined {
  return CORE_GARMENT_DEMO_IMAGES[id];
}

export function getSupportItemDemoImage(id: string): string | undefined {
  return SUPPORT_ITEM_DEMO_IMAGES[id];
}
