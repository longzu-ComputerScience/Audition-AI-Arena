import {
  CoreItem,
  SupportOption,
  CoreVietPhucId,
  SupportCategoryId,
  SetupData,
  ConceptData,
} from '../types';

export const CORE_ITEMS: Record<CoreVietPhucId, CoreItem> = {
  'ao-nhat-binh': {
    id: 'ao-nhat-binh',
    name: 'Áo Nhật Bình',
    vietnameseTitle: 'Áo Nhật Bình Cung Đình',
    subTitle: 'Lễ phục quý tộc thời Nguyễn',
    archiveCode: 'VPR-NB-1802',
    era: 'Triều Nguyễn (1802–1945)',
    silhouette: 'Cổ áo hình chữ nhật viền bản lớn, dải ngũ sắc trước ngực, hai vạt xẻ buông thẳng',
    material: 'Gấm Thượng Uyển dệt hoa mẫu đơn, dải ngũ sắc sa lụa',
    baseModernity: 15,
    palette: [
      { name: 'Đỏ Thắm Hoàng Gia', hex: '#8C2D19' },
      { name: 'Vàng Hoàng Yến', hex: '#D4AF37' },
      { name: 'Xanh Khổng Tước', hex: '#1C494A' },
    ],
    heritageDna: [
      'Viền cổ hình chữ nhật (Nhật Bình) đính hoa văn chỉ vàng',
      'Dải ngũ sắc tượng trưng ngũ hành trước ngực áo',
      'Phom dáng thụ rộng tôn phong thái đoan trang lễ nghi',
    ],
    editorialDescription:
      'Lễ phục trang trọng của hoàng tộc triều Nguyễn, nhận diện qua cổ áo hình chữ nhật đặc trưng và các dải viền ngũ sắc tượng trưng cho năm cung bậc ngũ hành.',
    patternType: 'phoenix-court',
  },
  'ao-tac': {
    id: 'ao-tac',
    name: 'Áo Tấc',
    vietnameseTitle: 'Áo Tấc Ngũ Thân Tay Thụ',
    subTitle: 'Lễ phục truyền thống tôn nghiêm',
    archiveCode: 'VPR-AT-1828',
    era: 'Triều Nguyễn · Nghi lễ & Tế tự',
    silhouette: 'Tay áo thụ rộng quá tấc buông thõng, thân áo dài qua gối phủ rộng cân xứng',
    material: 'Lụa Vạn Phúc mộc dệt vân mây chìm hoặc gấm hoa cúc',
    baseModernity: 15,
    palette: [
      { name: 'Nâu Hổ Phách', hex: '#633B26' },
      { name: 'Bạch Ngọc Trắng', hex: '#EDE8DF' },
      { name: 'Than Chì', hex: '#2B2623' },
    ],
    heritageDna: [
      'Tay áo rộng một tấc buông rủ mang khí chất tôn nghiêm',
      'Đường may can giữa sống lưng giữ trục ngay thẳng',
      'Năm hạt khuy cài ngũ thường (Nhân - Lễ - Nghĩa - Trí - Tín)',
    ],
    editorialDescription:
      'Lễ phục ngũ thân tay thụ rộng rãi, mang vẻ đẹp mực thước và điềm đạm, thường diện trong những dịp đại lễ và không gian trang trọng.',
    patternType: 'wave-mandarin',
  },
  'ao-dai': {
    id: 'ao-dai',
    name: 'Áo Dài',
    vietnameseTitle: 'Áo Dài Phom Suông Tân Thời',
    subTitle: 'Biểu tượng giao thoa thế kỷ 20',
    archiveCode: 'VPR-AD-1930',
    era: 'Thế kỷ 20 · Giao thời hiện đại',
    silhouette: 'Thân dài chấm mắt cá chân, hai vạt xẻ cao đến thắt lưng, vai liền raglan thả mềm',
    material: 'Lụa tơ tằm Hà Đông trơn dệt thoi mềm mại',
    baseModernity: 35,
    palette: [
      { name: 'Ngà Kem', hex: '#F4ECE1' },
      { name: 'Hoàng Cúc', hex: '#D4A359' },
      { name: 'Nâu Trầm', hex: '#4A3728' },
    ],
    heritageDna: [
      'Đường xẻ tà hai bên eo thanh thoát khi sải bước',
      'Cổ áo đứng tròn ôm nhẹ, hàng khuy bọc vải thủ công',
      'Độ buông rủ tự nhiên của chất liệu tơ tằm nguyên bản',
    ],
    editorialDescription:
      'Dáng áo thân quen của thẩm mỹ Việt Nam với hai vạt buông bay bổng. Phiên bản phom suông tối giản mang lại sự thoải mái trong sinh hoạt hiện đại.',
    patternType: 'lotus-imperial',
  },
  'ao-tu-than': {
    id: 'ao-tu-than',
    name: 'Áo Tứ Thân',
    vietnameseTitle: 'Áo Tứ Thân Truyền Thống',
    subTitle: 'Nét duyên dáng đồng bằng Bắc Bộ',
    archiveCode: 'VPR-TT-1750',
    era: 'Thế kỷ 18–19 · Bắc Bộ dân dã',
    silhouette: 'Bốn vạt áo buông mở, hai vạt trước buộc thắt duyên dáng, khoác ngoài yếm lụa',
    material: 'Vải đũi tơ tằm dệt tay nhuộm củ nâu, sồi thô mộc',
    baseModernity: 25,
    palette: [
      { name: 'Nâu Củ Nâu', hex: '#4E3629' },
      { name: 'Sen Hồng Nhạt', hex: '#C27D78' },
      { name: 'Cát Sa Thạch', hex: '#DDD2C1' },
    ],
    heritageDna: [
      'Bốn vạt tượng trưng tứ thân phụ mẫu ôm bọc con cái',
      'Dải thắt lưng lụa mềm buông rủ trước bụng tạo điểm nhấn nhịp điệu',
      'Cổ áo buông mở để lộ vạt yếm duyên dáng',
    ],
    editorialDescription:
      'Y phục truyền thống gắn liền với đời sống văn hóa Bắc Bộ. Cấu trúc bốn vạt và dải thắt eo đem đến sự mềm mại, mộc mạc và linh hoạt cho người mặc.',
    patternType: 'silk-ribbon',
  },
  'ao-ngu-than': {
    id: 'ao-ngu-than',
    name: 'Áo Ngũ Thân',
    vietnameseTitle: 'Áo Ngũ Thân Tay Chẽn',
    subTitle: 'Chuẩn mực y phục lịch lãm thời Nguyễn',
    archiveCode: 'VPR-NT-1802',
    era: 'Triều Nguyễn (1802–1945)',
    silhouette: 'Năm thân áo kín đáo, tay áo ôm gọn vừa vặn cổ tay, cổ lập lĩnh đứng thẳng',
    material: 'Sa dệt hoa cúc Huế hoặc Gấm Thượng Uyển dệt vân mây',
    baseModernity: 20,
    palette: [
      { name: 'Đỏ Sa Thạch', hex: '#8C3B24' },
      { name: 'Chàm Cổ', hex: '#26384C' },
      { name: 'Mộc Hương', hex: '#D1BEA8' },
    ],
    heritageDna: [
      'Cổ lập lĩnh cứng cáp cao 3.5cm giữ phong thái đĩnh đạc',
      'Hàng năm khuy cài ngũ thường biểu trưng đạo đức tiền nhân',
      'Kết cấu năm thân ghép mí tượng trưng tình thân gia đình',
    ],
    editorialDescription:
      'Nền tảng của y phục thời Nguyễn với tay áo chẽn gọn gàng, cổ đứng lập lĩnh và kết cấu năm thân chỉn chu, mang nét trang nhã trường tồn.',
    patternType: 'clouds-phoenix',
  },
};

// 7 Occasions as requested
export const OCCASIONS: string[] = [
  'Chụp ảnh kỷ niệm / Lookbook',
  'Sự kiện trang trọng',
  'Lễ hội ở trường',
  'Đi chơi cuối tuần',
  'Đón Tết cổ truyền',
  'Lễ tốt nghiệp / Bế giảng',
  'Đám cưới / Ăn hỏi bạn bè',
];

// 11 Locations as requested
export const LOCATIONS: string[] = [
  'Đại Nội Huế',
  'Phố cổ Hội An',
  'Văn Miếu – Quốc Tử Giám',
  'Hồ Hoàn Kiếm',
  'Hà Nội',
  'Huế',
  'Đà Nẵng',
  'TP. Hồ Chí Minh',
  'Ninh Bình',
  'Tràng An',
  'Đường sách / Bảo tàng Mỹ thuật',
];

// 5 Styles as requested
export const STYLES: string[] = [
  'Thanh lịch',
  'Năng động',
  'Tối giản',
  'Hoài cổ (Vintage)',
  'Đường phố (Streetwear)',
];

export const SUPPORT_ITEMS: Record<SupportCategoryId, SupportOption[]> = {
  bottom: [
    {
      id: 'bottom-silk-wide',
      name: 'Quần Lụa Ống Rộng Xẻ Tà',
      category: 'bottom',
      categoryLabel: 'Phần Dưới · Bottom',
      material: 'Lụa tơ Vạn Phúc ngà kem dệt trơn',
      modernityScore: 15,
      colorName: 'Bạch Ngọc Trắng',
      colorHex: '#F2EDE4',
      accentHex: '#C5B59E',
      badgeLabel: 'Truyền Thống',
      editorialNote: 'Phom quần suông xẻ tà kinh điển, giữ độ bồng bềnh nguyên bản khi chuyển động.',
      patternType: 'stripes',
    },
    {
      id: 'bottom-cargo-linen',
      name: 'Quần Tây Xếp Ly Cargo Linen',
      category: 'bottom',
      categoryLabel: 'Phần Dưới · Bottom',
      material: 'Linen pha sợi dứa mộc màu cát sa mạc',
      modernityScore: 62,
      colorName: 'Cát Sa Thạch',
      colorHex: '#DDD3C4',
      accentHex: '#9E886D',
      badgeLabel: 'Cân Bằng',
      editorialNote: 'Đường ly thẳng kết hợp túi hộp chìm tối giản, dung hòa giữa trang trọng và hiện đại.',
      patternType: 'geometric',
    },
    {
      id: 'bottom-raw-denim',
      name: 'Raw Denim Baggy Cạp Cao',
      category: 'bottom',
      categoryLabel: 'Phần Dưới · Bottom',
      material: 'Denim thô dệt thoi 14oz nhuộm Indigo',
      modernityScore: 88,
      colorName: 'Indigo Xanh Đêm',
      colorHex: '#1F2A38',
      accentHex: '#7C93AC',
      badgeLabel: 'Hiện Đại',
      editorialNote: 'Độ cứng cáp của vải denim đối lập với độ rủ của tà áo, tạo dáng vẻ năng động.',
      patternType: 'grid',
    },
  ],
  shoes: [
    {
      id: 'shoes-guoc-moc',
      name: 'Guốc Mộc Sơn Mài Quai Nhung',
      category: 'shoes',
      categoryLabel: 'Giày Guốc · Footwear',
      material: 'Gỗ xoan tự nhiên mài thủ công & Nhung đỏ gạch',
      modernityScore: 10,
      colorName: 'Gỗ Nâu & Nhung Đỏ',
      colorHex: '#523428',
      accentHex: '#A34836',
      badgeLabel: 'Truyền Thống',
      editorialNote: 'Âm thanh mộc mạc của guốc gỗ gợi nhắc nhịp sống thanh bình xưa.',
      patternType: 'lotus',
    },
    {
      id: 'shoes-chunky-loafer',
      name: 'Chunky Loafer Da Bóng Đế Gồ',
      category: 'shoes',
      categoryLabel: 'Giày Guốc · Footwear',
      material: 'Da bò đánh bóng thủ công & Đế cao su Commando',
      modernityScore: 78,
      colorName: 'Hắc Yến Bóng',
      colorHex: '#181615',
      accentHex: '#57524C',
      badgeLabel: 'Hiện Đại',
      editorialNote: 'Đế gồ dày đem lại tư thế đứng vững chãi, tạo điểm nhấn dứt khoát cho trang phục.',
      patternType: 'geometric',
    },
    {
      id: 'shoes-retro-sneaker',
      name: 'Retro Sneaker Cổ Thấp 70s',
      category: 'shoes',
      categoryLabel: 'Giày Guốc · Footwear',
      material: 'Vải canvas thô phối da lộn đất nung',
      modernityScore: 92,
      colorName: 'Kem & Đất Nung',
      colorHex: '#E8DED1',
      accentHex: '#B25D42',
      badgeLabel: 'Đường Phố',
      editorialNote: 'Sneaker tối giản mang tính ứng dụng cao, thoải mái khi di chuyển trong ngày dài.',
      patternType: 'waves',
    },
  ],
  bag: [
    {
      id: 'bag-gam-vintage',
      name: 'Túi Gấm Quai Gỗ Cổ Điển',
      category: 'bag',
      categoryLabel: 'Túi Xách · Bag',
      material: 'Gấm Thượng Uyển dệt hoa sen & Quai gỗ mun khắc',
      modernityScore: 20,
      colorName: 'Hoàng Kim & Gấm',
      colorHex: '#8C6C38',
      accentHex: '#D4AF37',
      badgeLabel: 'Truyền Thống',
      editorialNote: 'Vân gấm dệt chỉ vàng lấp lánh nhẹ nhàng, tôn vinh kỹ nghệ dệt thoi thủ công.',
      patternType: 'lotus',
    },
    {
      id: 'bag-tote-linen',
      name: 'Túi Tote Vải Lanh Thô Tối Giản',
      category: 'bag',
      categoryLabel: 'Túi Xách · Bag',
      material: 'Vải lanh dệt sợi tự nhiên màu be nhạt',
      modernityScore: 55,
      colorName: 'Be Mộc',
      colorHex: '#D6C8B4',
      accentHex: '#9E886D',
      badgeLabel: 'Tối Giản',
      editorialNote: 'Túi tote phom chữ nhật mộc mạc, tiện dụng cho các buổi dạo phố và cà phê.',
      patternType: 'stripes',
    },
    {
      id: 'bag-techwear-crossbody',
      name: 'Túi Đeo Chéo Techwear Fidlock',
      category: 'bag',
      categoryLabel: 'Túi Xách · Bag',
      material: 'Vải dù Cordura kháng nước & Khóa nam châm kim loại',
      modernityScore: 95,
      colorName: 'Than Chì Nhám',
      colorHex: '#252528',
      accentHex: '#64748B',
      badgeLabel: 'Đương Đại',
      editorialNote: 'Quai đeo vắt chéo thân áo tạo nhịp cắt bất đối xứng cá tính cho tổng thể.',
      patternType: 'grid',
    },
  ],
  accent: [
    {
      id: 'accent-silver-jewelry',
      name: 'Chuỗi Bạc Thái Chạm Hoa Sen',
      category: 'accent',
      categoryLabel: 'Điểm Nhấn · Accent',
      material: 'Bạc 925 đánh mờ khắc hoa văn sen',
      modernityScore: 30,
      colorName: 'Bạc Mờ',
      colorHex: '#B8B3AC',
      accentHex: '#7C756B',
      badgeLabel: 'Thanh Nhã',
      editorialNote: 'Điểm sáng kim loại thanh mảnh tôn vinh cổ áo và thềm ngực cổ phục.',
      patternType: 'lotus',
    },
    {
      id: 'accent-quai-thao-mini',
      name: 'Nón Quai Thao Mini Đính Bạc',
      category: 'accent',
      categoryLabel: 'Điểm Nhấn · Accent',
      material: 'Lá gồi đan tay, viền lụa tơ, chuỗi bạc hoa mai',
      modernityScore: 65,
      colorName: 'Lá Khô & Ánh Bạc',
      colorHex: '#C9BC9F',
      accentHex: '#848C90',
      badgeLabel: 'Điểm Nhấn',
      editorialNote: 'Thu nhỏ kích thước nón quai thao thành phụ kiện cài hông hoặc cầm tay độc đáo.',
      patternType: 'stripes',
    },
    {
      id: 'accent-y2k-shades',
      name: 'Kính Mát Gọng Bạc Slim Y2K',
      category: 'accent',
      categoryLabel: 'Điểm Nhấn · Accent',
      material: 'Hợp kim titan mạ bạc bóng & Tròng kính trà',
      modernityScore: 95,
      colorName: 'Titan Bạc & Trà',
      colorHex: '#3E3835',
      accentHex: '#A69F99',
      badgeLabel: 'Tương Lai',
      editorialNote: 'Gọng kính slim mắt hẹp sắc sảo tạo độ tương phản thị giác thú vị với nét cổ phong.',
      patternType: 'geometric',
    },
  ],
};

export const PREFERRED_COLOR_OPTIONS = [
  'Để hệ thống gợi ý',
  'Đỏ thắm / Crimson',
  'Vàng hoàng yến / Ochre Gold',
  'Xanh chàm / Indigo Blue',
  'Xanh khổng tước / Emerald Peacock',
  'Bạch ngọc / Trắng ngà Ivory',
  'Nâu hổ phách / Amber Brown',
  'Than chì / Charcoal Black',
] as const;

export const COLOR_MAP: Record<string, { name: string; hex: string }> = {
  'Đỏ thắm / Crimson': { name: 'Đỏ Thắm', hex: '#8C2D19' },
  'Vàng hoàng yến / Ochre Gold': { name: 'Vàng Hoàng Yến', hex: '#D4AF37' },
  'Xanh chàm / Indigo Blue': { name: 'Xanh Chàm Cổ', hex: '#1C3144' },
  'Xanh khổng tước / Emerald Peacock': { name: 'Xanh Khổng Tước', hex: '#1C494A' },
  'Bạch ngọc / Trắng ngà Ivory': { name: 'Bạch Ngọc Trắng', hex: '#EDE8DF' },
  'Nâu hổ phách / Amber Brown': { name: 'Nâu Hổ Phách', hex: '#633B26' },
  'Than chì / Charcoal Black': { name: 'Than Chì', hex: '#2B2623' },
};

// Local Concept Generator based on setup inputs
export function generateConcept(setup: SetupData): ConceptData {
  const core = CORE_ITEMS[setup.coreGarment] || CORE_ITEMS['ao-ngu-than'];

  // Formulate a distinct, evocative concept title reacting to style and core garment
  let title = '';
  switch (setup.style) {
    case 'Đường phố (Streetwear)':
    case 'Streetwear':
      title = `Bản Hòa Âm Đường Phố · ${core.name}`;
      break;
    case 'Tối giản':
      title = `Nét Tĩnh Lặng Tối Giản · ${core.name}`;
      break;
    case 'Hoài cổ (Vintage)':
      title = `Ký Ức Thời Gian Hoài Cổ · ${core.name}`;
      break;
    case 'Năng động':
      title = `Nhịp Thở Năng Động · ${core.name}`;
      break;
    case 'Thanh lịch':
    default:
      title = `Thanh Lịch Di Sản · ${core.name}`;
      break;
  }

  // Short rationale reacting to occasion, style, and preferredColor
  const colorNote =
    setup.preferredColor && setup.preferredColor !== 'Để hệ thống gợi ý'
      ? `, nhấn nhá với sắc ${setup.preferredColor.split('/')[0].trim()}`
      : '';

  const rationale = `Ý tưởng kết hợp ${core.name} cho dịp ${setup.occasion.toLowerCase()}, mang định hướng ${setup.style.toLowerCase()}${colorNote}. Bản phối tôn vinh cấu trúc nguyên bản của di sản, đồng thời tạo nét phóng khoáng hài hòa cho nhịp sống hiện đại.`;

  // 3-Color Palette: coherent & no duplicate swatches
  const palette: { name: string; hex: string }[] = [];
  const usedHexes = new Set<string>();

  // If a preferred color is chosen (not "Để hệ thống gợi ý"), make it the first swatch
  if (
    setup.preferredColor &&
    setup.preferredColor !== 'Để hệ thống gợi ý' &&
    COLOR_MAP[setup.preferredColor]
  ) {
    const pref = COLOR_MAP[setup.preferredColor];
    palette.push(pref);
    usedHexes.add(pref.hex.toLowerCase());
  }

  // Next, pick swatches from core garment's curated palette without duplicating hexes
  for (const c of core.palette) {
    if (palette.length >= 3) break;
    if (!usedHexes.has(c.hex.toLowerCase())) {
      palette.push(c);
      usedHexes.add(c.hex.toLowerCase());
    }
  }

  // Fallback palette entries if needed to guarantee exactly 3 distinct swatches
  const fallbackSwatches = [
    { name: 'Bạch Ngọc Trắng', hex: '#EDE8DF' },
    { name: 'Mộc Hương', hex: '#D1BEA8' },
    { name: 'Đỏ Thắm', hex: '#8C2D19' },
    { name: 'Than Chì', hex: '#2B2623' },
    { name: 'Xanh Chàm Cổ', hex: '#1C3144' },
  ];

  for (const fb of fallbackSwatches) {
    if (palette.length >= 3) break;
    if (!usedHexes.has(fb.hex.toLowerCase())) {
      palette.push(fb);
      usedHexes.add(fb.hex.toLowerCase());
    }
  }

  return {
    title,
    rationale,
    palette,
    description: core.editorialDescription,
  };
}

// Combinations search for Target Remix
export function findBestSupportCombination(
  targetRemix: number,
  includeAccent: boolean
): {
  bottom: SupportOption;
  shoes: SupportOption;
  bag: SupportOption;
  accent: SupportOption | null;
} {
  const bottoms = SUPPORT_ITEMS.bottom;
  const shoes = SUPPORT_ITEMS.shoes;
  const bags = SUPPORT_ITEMS.bag;
  const accents = SUPPORT_ITEMS.accent;

  let bestDiff = Infinity;
  let best = {
    bottom: bottoms[0],
    shoes: shoes[0],
    bag: bags[0],
    accent: includeAccent ? accents[0] : null,
  };

  if (includeAccent) {
    for (const b of bottoms) {
      for (const s of shoes) {
        for (const g of bags) {
          for (const a of accents) {
            const avg = (b.modernityScore + s.modernityScore + g.modernityScore + a.modernityScore) / 4;
            const diff = Math.abs(avg - targetRemix);
            if (diff < bestDiff) {
              bestDiff = diff;
              best = { bottom: b, shoes: s, bag: g, accent: a };
            }
          }
        }
      }
    }
  } else {
    for (const b of bottoms) {
      for (const s of shoes) {
        for (const g of bags) {
          const avg = (b.modernityScore + s.modernityScore + g.modernityScore) / 3;
          const diff = Math.abs(avg - targetRemix);
          if (diff < bestDiff) {
            bestDiff = diff;
            best = { bottom: b, shoes: s, bag: g, accent: null };
          }
        }
      }
    }
  }

  return best;
}
