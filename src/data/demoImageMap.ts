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

export interface CoreGarmentLookbookMedia {
  src: string;
  alt: string;
  title: string;
  caption: string;
}

export const CORE_GARMENT_LOOKBOOK_IMAGES: Record<CoreVietPhucId, CoreGarmentLookbookMedia> = {
  'ao-nhat-binh': {
    src: '/images/catalog/lookbook/ao-nhat-binh.webp',
    alt: 'Lookbook gợi ý phối đồ Áo Nhật Bình Cung Đình đương đại',
    title: 'Áo Nhật Bình · Phối Cung Đình Hiện Đại',
    caption: 'Bản phối cảm hứng kết hợp nét trang trọng triều đình cùng bảng phối màu đương đại tinh tế.',
  },
  'ao-tac': {
    src: '/images/catalog/lookbook/ao-tac.webp',
    alt: 'Lookbook gợi ý phối đồ Áo Tấc tay thụng thanh lịch',
    title: 'Áo Tấc · Phong Vị Đĩnh Đạc',
    caption: 'Tà áo thụng truyền thống giao thoa cùng nhịp sống văn minh đô thị.',
  },
  'ao-dai': {
    src: '/images/catalog/lookbook/ao-dai.webp',
    alt: 'Lookbook gợi ý phối đồ Áo Dài truyền thống duyên dáng',
    title: 'Áo Dài · Dáng Nét Thanh Xuân',
    caption: 'Hai tà áo bay nhẹ nhàng cùng phom dáng chuẩn mực bất biến qua thời gian.',
  },
  'ao-tu-than': {
    src: '/images/catalog/lookbook/ao-tu-than.webp',
    alt: 'Lookbook gợi ý phối đồ Áo Tứ Thân dân gian cá tính',
    title: 'Áo Tứ Thân · Dân Gian Tự Do',
    caption: 'Vạt trước buộc lơi phóng khoáng mang tinh thần lễ hội Kinh Bắc vào hơi thở hiện đại.',
  },
  'ao-ngu-than': {
    src: '/images/catalog/lookbook/ao-ngu-than.webp',
    alt: 'Lookbook gợi ý phối đồ Áo Ngũ Thân lịch lãm thời thượng',
    title: 'Áo Ngũ Thân · Chuẩn Mực Tri Thức',
    caption: 'Hàng năm khuy cài đoan trang và phom dáng kín đáo toát lên thần thái lịch thiệp.',
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
  'bag-techwear-crossbody': '/images/catalog/bags/bag-techwear-crossbody.webp',
  // Accessories
  'accent-silver-jewelry': '/images/catalog/accessories/accent-silver-jewelry.webp',
  'accent-non-la': '/images/catalog/accessories/accent-non-la.webp',
  'accent-y2k-shades': '/images/catalog/accessories/accent-y2k-shades.webp',
  'accent-quai-thao-mini': '/images/catalog/accessories/accent-quai-thao-mini.webp',
};

export function getCoreGarmentDemoMedia(id: CoreVietPhucId): CoreGarmentDemoMedia | undefined {
  return CORE_GARMENT_DEMO_IMAGES[id];
}

export function getCoreGarmentLookbook(id: CoreVietPhucId): CoreGarmentLookbookMedia | undefined {
  return CORE_GARMENT_LOOKBOOK_IMAGES[id];
}

export function getSupportItemDemoImage(id: string): string | undefined {
  return SUPPORT_ITEM_DEMO_IMAGES[id];
}
