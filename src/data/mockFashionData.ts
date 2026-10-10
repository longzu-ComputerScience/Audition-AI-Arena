import { recommendOutfit } from '../utils/outfitRecommendation';
import {
  CoreItem,
  SupportOption,
  CoreVietPhucId,
  SupportCategoryId,
  SetupData,
  ConceptData,
  ActiveSupportItems,
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
      'Form dáng thụ rộng tôn phong thái đoan trang lễ nghi',
    ],
    heritageStory:
      'Áo Nhật Bình vốn là thường phục của bậc hậu phi, công chúa và là lễ phục của hàng mệnh phụ triều Nguyễn. Tên gọi bắt nguồn từ viền cổ áo hình chữ nhật ghép dải ngũ sắc cân xứng trước ngực, tượng trưng cho nét đẹp trang trọng chốn hoàng cung xưa.',
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
    heritageStory:
      'Áo Tấc là dạng áo ngũ thân tay thụng dài quá tấc, từng là lễ phục tôn nghiêm được diện trong tế lễ, hôn sự và việc đại sự thời Nguyễn. Chiều dài tay áo phủ kín bàn tay khi cung kính chắp lễ thể hiện phẩm hạnh đoan chính và cốt cách đĩnh đạc của tiền nhân.',
    editorialDescription:
      'Lễ phục ngũ thân tay thụ rộng rãi, mang vẻ đẹp mực thước và điềm đạm, thường diện trong những dịp đại lễ và không gian trang trọng.',
    patternType: 'wave-mandarin',
  },
  'ao-dai': {
    id: 'ao-dai',
    name: 'Áo Dài',
    vietnameseTitle: 'Áo Dài Form Suông Tân Thời',
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
    heritageStory:
      'Phát triển từ áo ngũ thân truyền thống qua những cải tiến thẩm mỹ đầu thế kỷ 20, tà Áo Dài tinh giản còn hai vạt buông thướt tha. Trang phục trở thành biểu tượng giao thoa văn hóa, kết hợp giữa vẻ kín đáo truyền thống và tinh thần tự do thanh lịch đương thời.',
    editorialDescription:
      'Dáng áo thân quen của thẩm mỹ Việt Nam với hai vạt buông bay bổng. Phiên bản form suông tối giản mang lại sự thoải mái trong sinh hoạt hiện đại.',
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
    heritageStory:
      'Gắn liền với không gian làng quê Bắc Bộ, Áo Tứ Thân gồm bốn vạt mộc mạc khoác ngoài chiếc yếm lụa, vạt trước buông tự nhiên hoặc buộc thắt linh hoạt. Cấu trúc bốn vạt vừa thuận tiện trong sinh hoạt thường nhật, vừa gửi gắm ý niệm trân quý tình thân gia đình tứ thân phụ mẫu.',
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
    heritageStory:
      'Được định hình từ các cuộc cải cách trang phục thời chúa Nguyễn và vua Minh Mạng, Áo Ngũ Thân tay chẽn là chuẩn mực phục sức lịch thiệp của người Việt suốt nhiều thế kỷ. Năm thân áo cùng hàng năm khuy cài tượng trưng cho đạo làm người ngũ thường và sự hiếu nghĩa gia tộc.',
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
      editorialNote: 'Form quần suông xẻ tà kinh điển, giữ độ bồng bềnh nguyên bản khi chuyển động.',
      patternType: 'stripes',
    },
    {
      id: 'bottom-tailored-trousers',
      name: 'Quần Tây',
      category: 'bottom',
      categoryLabel: 'Phần Dưới · Bottom',
      material: 'Vải âu dệt cao cấp màu be cát đứng form',
      modernityScore: 62,
      colorName: 'Be Cát Cổ Điển',
      colorHex: '#DDD3C4',
      accentHex: '#9E886D',
      badgeLabel: 'Cân Bằng',
      editorialNote: 'Đường ly ủi sắc nét cùng form ống suông thanh lịch, tạo điểm tựa đĩnh đạc cân bằng giữa di sản và âu phục đương đại.',
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
      editorialNote: 'Túi tote form chữ nhật mộc mạc, tiện dụng cho các buổi dạo phố và cà phê.',
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
      categoryLabel: 'Phụ Kiện · Accent',
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
      categoryLabel: 'Phụ Kiện · Accent',
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
      categoryLabel: 'Phụ Kiện · Accent',
      material: 'Hợp kim titan mạ bạc bóng & Tròng kính trà',
      modernityScore: 95,
      colorName: 'Titan Bạc & Trà',
      colorHex: '#3E3835',
      accentHex: '#A69F99',
      badgeLabel: 'Tương Lai',
      editorialNote: 'Gọng kính slim mắt hẹp sắc sảo tạo độ tương phản thị giác thú vị với nét cổ phong.',
      patternType: 'geometric',
    },
    {
      id: 'accent-non-la',
      name: 'Nón Lá Truyền Thống',
      category: 'accent',
      categoryLabel: 'Phụ Kiện · Accent',
      material: 'Lá tự nhiên đan trên khung nan tre',
      modernityScore: 20,
      colorName: 'Vàng Rơm Tự Nhiên',
      colorHex: '#D8C79B',
      accentHex: '#927853',
      badgeLabel: 'Di Sản',
      editorialNote: 'Nón lá mộc mạc gợi nhắc vẻ đẹp đời sống Việt Nam, tạo nét duyên truyền thống cho bản phối đương đại.',
      patternType: 'bamboo-scholar',
    },
  ],
};

export const PREFERRED_COLOR_OPTIONS = [
  'Để hệ thống gợi ý',
  'Đỏ son',
  'Xanh lam',
  'Xanh ngọc',
  'Trắng / kem',
  'Hồng dịu',
  'Đen',
  'Vàng hoàng yến',
  'Tím Huế',
  'Xanh rêu cổ kính',
  'Nâu trầm',
] as const;

export const COLOR_MAP: Record<string, { name: string; hex: string }> = {
  'Đỏ son': { name: 'Đỏ Son', hex: '#C23B22' },
  'Xanh lam': { name: 'Xanh Lam', hex: '#1D4E89' },
  'Xanh ngọc': { name: 'Xanh Ngọc', hex: '#267365' },
  'Trắng / kem': { name: 'Trắng / Kem', hex: '#F5EFEB' },
  'Hồng dịu': { name: 'Hồng Dịu', hex: '#D98282' },
  'Đen': { name: 'Đen', hex: '#1A1817' },
  'Vàng hoàng yến': { name: 'Vàng Hoàng Yến', hex: '#D4AF37' },
  'Tím Huế': { name: 'Tím Huế', hex: '#683363' },
  'Xanh rêu cổ kính': { name: 'Xanh Rêu Cổ Kính', hex: '#4B5842' },
  'Nâu trầm': { name: 'Nâu Trầm', hex: '#543D2B' },
  // Existing palette swatches use the same canonical preference system when clicked
  // in the Studio, so the Concept and AI snapshot also receive their exact color.
  ...Object.fromEntries(Object.values(CORE_ITEMS).flatMap(core => core.palette.map(swatch => [swatch.name, swatch]))),
};

export function preferredColorForHex(hex: string): string | undefined {
  return Object.keys(COLOR_MAP).find(name => COLOR_MAP[name].hex.toLowerCase() === hex.toLowerCase());
}

// Curated Garment-Specific Palettes for "Để hệ thống gợi ý" (Rule A)
const DEFAULT_GARMENT_PALETTES: Record<CoreVietPhucId, { name: string; hex: string }[]> = {
  'ao-nhat-binh': [
    { name: 'Đỏ Thắm Hoàng Gia', hex: '#8C2D19' },
    { name: 'Vàng Hoàng Yến', hex: '#D4AF37' },
    { name: 'Xanh Khổng Tước', hex: '#1C494A' },
  ],
  'ao-tac': [
    { name: 'Nâu Hổ Phách', hex: '#633B26' },
    { name: 'Bạch Ngọc Trắng', hex: '#EDE8DF' },
    { name: 'Than Chì', hex: '#2B2623' },
  ],
  'ao-dai': [
    { name: 'Ngà Kem', hex: '#F4ECE1' },
    { name: 'Hoàng Cúc', hex: '#D4A359' },
    { name: 'Nâu Trầm', hex: '#4A3728' },
  ],
  'ao-tu-than': [
    { name: 'Nâu Củ Nâu', hex: '#4E3629' },
    { name: 'Sen Hồng Nhạt', hex: '#C27D78' },
    { name: 'Cát Sa Thạch', hex: '#DDD2C1' },
  ],
  'ao-ngu-than': [
    { name: 'Đỏ Sa Thạch', hex: '#8C3B24' },
    { name: 'Chàm Cổ', hex: '#26384C' },
    { name: 'Mộc Hương', hex: '#D1BEA8' },
  ],
};

// Curated Garment-Aware Companions when user selects a specific preferredColor (Rule B)
// Each [garment][preferredColor] yields 2 curated complementary heritage shades.
const COLOR_HARMONY_MAP: Record<
  CoreVietPhucId,
  Record<string, [{ name: string; hex: string }, { name: string; hex: string }]>
> = {
  'ao-nhat-binh': {
    'Đỏ son': [
      { name: 'Vàng Hoàng Yến', hex: '#D4AF37' },
      { name: 'Xanh Khổng Tước', hex: '#1C494A' },
    ],
    'Xanh lam': [
      { name: 'Đỏ Thắm Hoàng Gia', hex: '#8C2D19' },
      { name: 'Vàng Hoàng Yến', hex: '#D4AF37' },
    ],
    'Xanh ngọc': [
      { name: 'Vàng Hoàng Cúc', hex: '#D4AF37' },
      { name: 'Đỏ Mẫu Đơn', hex: '#8C2D19' },
    ],
    'Trắng / kem': [
      { name: 'Đỏ Thắm Hoàng Gia', hex: '#8C2D19' },
      { name: 'Xanh Khổng Tước', hex: '#1C494A' },
    ],
    'Hồng dịu': [
      { name: 'Xanh Khổng Tước', hex: '#1C494A' },
      { name: 'Vàng Hoàng Yến', hex: '#D4AF37' },
    ],
    'Đen': [
      { name: 'Đỏ Thắm Hoàng Gia', hex: '#8C2D19' },
      { name: 'Vàng Hoàng Yến', hex: '#D4AF37' },
    ],
    'Vàng hoàng yến': [
      { name: 'Đỏ Thắm Hoàng Gia', hex: '#8C2D19' },
      { name: 'Xanh Khổng Tước', hex: '#1C494A' },
    ],
    'Tím Huế': [
      { name: 'Vàng Hoàng Yến', hex: '#D4AF37' },
      { name: 'Xanh Khổng Tước', hex: '#1C494A' },
    ],
    'Xanh rêu cổ kính': [
      { name: 'Đỏ Thắm Hoàng Gia', hex: '#8C2D19' },
      { name: 'Vàng Hoàng Yến', hex: '#D4AF37' },
    ],
    'Nâu trầm': [
      { name: 'Vàng Hoàng Yến', hex: '#D4AF37' },
      { name: 'Xanh Khổng Tước', hex: '#1C494A' },
    ],
  },
  'ao-tac': {
    'Đỏ son': [
      { name: 'Bạch Ngọc Trắng', hex: '#EDE8DF' },
      { name: 'Than Chì', hex: '#2B2623' },
    ],
    'Xanh lam': [
      { name: 'Bạch Ngọc Trắng', hex: '#EDE8DF' },
      { name: 'Nâu Hổ Phách', hex: '#633B26' },
    ],
    'Xanh ngọc': [
      { name: 'Bạch Ngọc Trắng', hex: '#EDE8DF' },
      { name: 'Than Chì', hex: '#2B2623' },
    ],
    'Trắng / kem': [
      { name: 'Nâu Hổ Phách', hex: '#633B26' },
      { name: 'Than Chì', hex: '#2B2623' },
    ],
    'Hồng dịu': [
      { name: 'Bạch Ngọc Trắng', hex: '#EDE8DF' },
      { name: 'Than Chì', hex: '#2B2623' },
    ],
    'Đen': [
      { name: 'Bạch Ngọc Trắng', hex: '#EDE8DF' },
      { name: 'Nâu Hổ Phách', hex: '#633B26' },
    ],
    'Vàng hoàng yến': [
      { name: 'Than Chì', hex: '#2B2623' },
      { name: 'Bạch Ngọc Trắng', hex: '#EDE8DF' },
    ],
    'Tím Huế': [
      { name: 'Bạch Ngọc Trắng', hex: '#EDE8DF' },
      { name: 'Than Chì', hex: '#2B2623' },
    ],
    'Xanh rêu cổ kính': [
      { name: 'Bạch Ngọc Trắng', hex: '#EDE8DF' },
      { name: 'Nâu Hổ Phách', hex: '#633B26' },
    ],
    'Nâu trầm': [
      { name: 'Bạch Ngọc Trắng', hex: '#EDE8DF' },
      { name: 'Than Chì', hex: '#2B2623' },
    ],
  },
  'ao-dai': {
    'Đỏ son': [
      { name: 'Ngà Kem', hex: '#F4ECE1' },
      { name: 'Hoàng Cúc', hex: '#D4A359' },
    ],
    'Xanh lam': [
      { name: 'Ngà Kem', hex: '#F4ECE1' },
      { name: 'Hoàng Cúc', hex: '#D4A359' },
    ],
    'Xanh ngọc': [
      { name: 'Ngà Kem', hex: '#F4ECE1' },
      { name: 'Nâu Trầm', hex: '#4A3728' },
    ],
    'Trắng / kem': [
      { name: 'Hoàng Cúc', hex: '#D4A359' },
      { name: 'Nâu Trầm', hex: '#4A3728' },
    ],
    'Hồng dịu': [
      { name: 'Ngà Kem', hex: '#F4ECE1' },
      { name: 'Nâu Trầm', hex: '#4A3728' },
    ],
    'Đen': [
      { name: 'Ngà Kem', hex: '#F4ECE1' },
      { name: 'Hoàng Cúc', hex: '#D4A359' },
    ],
    'Vàng hoàng yến': [
      { name: 'Ngà Kem', hex: '#F4ECE1' },
      { name: 'Nâu Trầm', hex: '#4A3728' },
    ],
    'Tím Huế': [
      { name: 'Ngà Kem', hex: '#F4ECE1' },
      { name: 'Nâu Trầm', hex: '#4A3728' },
    ],
    'Xanh rêu cổ kính': [
      { name: 'Ngà Kem', hex: '#F4ECE1' },
      { name: 'Hoàng Cúc', hex: '#D4A359' },
    ],
    'Nâu trầm': [
      { name: 'Ngà Kem', hex: '#F4ECE1' },
      { name: 'Hoàng Cúc', hex: '#D4A359' },
    ],
  },
  'ao-tu-than': {
    'Đỏ son': [
      { name: 'Nâu Củ Nâu', hex: '#4E3629' },
      { name: 'Cát Sa Thạch', hex: '#DDD2C1' },
    ],
    'Xanh lam': [
      { name: 'Sen Hồng Nhạt', hex: '#C27D78' },
      { name: 'Cát Sa Thạch', hex: '#DDD2C1' },
    ],
    'Xanh ngọc': [
      { name: 'Nâu Củ Nâu', hex: '#4E3629' },
      { name: 'Cát Sa Thạch', hex: '#DDD2C1' },
    ],
    'Trắng / kem': [
      { name: 'Nâu Củ Nâu', hex: '#4E3629' },
      { name: 'Sen Hồng Nhạt', hex: '#C27D78' },
    ],
    'Hồng dịu': [
      { name: 'Nâu Củ Nâu', hex: '#4E3629' },
      { name: 'Cát Sa Thạch', hex: '#DDD2C1' },
    ],
    'Đen': [
      { name: 'Sen Hồng Nhạt', hex: '#C27D78' },
      { name: 'Cát Sa Thạch', hex: '#DDD2C1' },
    ],
    'Vàng hoàng yến': [
      { name: 'Nâu Củ Nâu', hex: '#4E3629' },
      { name: 'Cát Sa Thạch', hex: '#DDD2C1' },
    ],
    'Tím Huế': [
      { name: 'Cát Sa Thạch', hex: '#DDD2C1' },
      { name: 'Nâu Củ Nâu', hex: '#4E3629' },
    ],
    'Xanh rêu cổ kính': [
      { name: 'Sen Hồng Nhạt', hex: '#C27D78' },
      { name: 'Cát Sa Thạch', hex: '#DDD2C1' },
    ],
    'Nâu trầm': [
      { name: 'Sen Hồng Nhạt', hex: '#C27D78' },
      { name: 'Cát Sa Thạch', hex: '#DDD2C1' },
    ],
  },
  'ao-ngu-than': {
    'Đỏ son': [
      { name: 'Chàm Cổ', hex: '#26384C' },
      { name: 'Mộc Hương', hex: '#D1BEA8' },
    ],
    'Xanh lam': [
      { name: 'Đỏ Sa Thạch', hex: '#8C3B24' },
      { name: 'Mộc Hương', hex: '#D1BEA8' },
    ],
    'Xanh ngọc': [
      { name: 'Đỏ Sa Thạch', hex: '#8C3B24' },
      { name: 'Mộc Hương', hex: '#D1BEA8' },
    ],
    'Trắng / kem': [
      { name: 'Đỏ Sa Thạch', hex: '#8C3B24' },
      { name: 'Chàm Cổ', hex: '#26384C' },
    ],
    'Hồng dịu': [
      { name: 'Chàm Cổ', hex: '#26384C' },
      { name: 'Mộc Hương', hex: '#D1BEA8' },
    ],
    'Đen': [
      { name: 'Đỏ Sa Thạch', hex: '#8C3B24' },
      { name: 'Mộc Hương', hex: '#D1BEA8' },
    ],
    'Vàng hoàng yến': [
      { name: 'Chàm Cổ', hex: '#26384C' },
      { name: 'Đỏ Sa Thạch', hex: '#8C3B24' },
    ],
    'Tím Huế': [
      { name: 'Đỏ Sa Thạch', hex: '#8C3B24' },
      { name: 'Mộc Hương', hex: '#D1BEA8' },
    ],
    'Xanh rêu cổ kính': [
      { name: 'Đỏ Sa Thạch', hex: '#8C3B24' },
      { name: 'Mộc Hương', hex: '#D1BEA8' },
    ],
    'Nâu trầm': [
      { name: 'Chàm Cổ', hex: '#26384C' },
      { name: 'Mộc Hương', hex: '#D1BEA8' },
    ],
  },
};

// Global heritage fallback swatches to guarantee exactly 3 distinct swatches
const GLOBAL_FALLBACK_SWATCHES = [
  { name: 'Bạch Ngọc Trắng', hex: '#EDE8DF' },
  { name: 'Mộc Hương', hex: '#D1BEA8' },
  { name: 'Đỏ Thắm Hoàng Gia', hex: '#8C2D19' },
  { name: 'Than Chì', hex: '#2B2623' },
  { name: 'Xanh Chàm Cổ', hex: '#1C3144' },
  { name: 'Hoàng Cúc', hex: '#D4A359' },
];

// English color descriptions keyed by normalized HEX for Gemini prompt accuracy
const HEX_ENGLISH_COLOR_NAMES: Record<string, string> = {
  '#c23b22': 'vermilion crimson red (Đỏ son)',
  '#1d4e89': 'royal cobalt blue (Xanh lam)',
  '#267365': 'emerald jade green (Xanh ngọc)',
  '#f5efeb': 'warm ivory cream white (Trắng kem)',
  '#d98282': 'soft dusty rose pink (Hồng dịu)',
  '#1a1817': 'deep charcoal obsidian black (Đen)',
  '#d4af37': 'imperial golden yellow (Vàng hoàng yến)',
  '#683363': 'imperial Hue plum purple (Tím Huế)',
  '#4b5842': 'antique olive moss green (Xanh rêu cổ kính)',
  '#543d2b': 'deep espresso earth brown (Nâu trầm)',
  '#8c2d19': 'imperial deep crimson red (Đỏ Thắm Hoàng Gia)',
  '#633b26': 'warm amber chestnut brown (Nâu Hổ Phách)',
  '#f4ece1': 'warm silk ivory cream (Ngà Kem)',
  '#4e3629': 'rustic earth tuber brown (Nâu Củ Nâu)',
  '#8c3b24': 'terracotta sandstone red-brown (Đỏ Sa Thạch)',
};

export interface ResolvedGarmentColor {
  hex: string;
  name: string;
  englishName: string;
}

/**
 * Computes the deterministic 3-color concept palette for a given core garment and preferred color.
 * Shared between Page 2 (ConceptReveal), Page 3 (MannequinCanvas), and Gemini prompt builder.
 */
export function resolveCorePalette(
  coreGarment: CoreVietPhucId,
  preferredColor?: string
): { name: string; hex: string }[] {
  const core = CORE_ITEMS[coreGarment] || CORE_ITEMS['ao-ngu-than'];
  const palette: { name: string; hex: string }[] = [];
  const usedHexes = new Set<string>();

  const isAuto =
    !preferredColor ||
    preferredColor === 'Để hệ thống gợi ý' ||
    !COLOR_MAP[preferredColor];

  if (isAuto) {
    // Rule A: Automatic Color -> garment-specific curated default palette
    const garmentDefaults = DEFAULT_GARMENT_PALETTES[core.id] || core.palette;
    for (const swatch of garmentDefaults) {
      if (palette.length >= 3) break;
      const lower = swatch.hex.toLowerCase();
      if (!usedHexes.has(lower)) {
        palette.push({ name: swatch.name, hex: swatch.hex });
        usedHexes.add(lower);
      }
    }
  } else {
    // Rule B: Selected preferredColor
    // Slot 1: Exact selected preferred color from COLOR_MAP
    const prefConfig = COLOR_MAP[preferredColor];
    if (prefConfig) {
      palette.push({ name: prefConfig.name, hex: prefConfig.hex });
      usedHexes.add(prefConfig.hex.toLowerCase());
    }

    // Slots 2 & 3: Selected garment's curated harmony pair for this color
    const garmentHarmony = COLOR_HARMONY_MAP[core.id]?.[preferredColor];
    if (garmentHarmony) {
      for (const comp of garmentHarmony) {
        if (palette.length >= 3) break;
        const lower = comp.hex.toLowerCase();
        if (!usedHexes.has(lower)) {
          palette.push({ name: comp.name, hex: comp.hex });
          usedHexes.add(lower);
        }
      }
    }

    // If still < 3, check core garment palette
    for (const swatch of core.palette) {
      if (palette.length >= 3) break;
      const lower = swatch.hex.toLowerCase();
      if (!usedHexes.has(lower)) {
        palette.push({ name: swatch.name, hex: swatch.hex });
        usedHexes.add(lower);
      }
    }
  }

  // Rule C: Diversity Guarantee — fallback if fewer than 3 unique hexes
  for (const fb of GLOBAL_FALLBACK_SWATCHES) {
    if (palette.length >= 3) break;
    const lower = fb.hex.toLowerCase();
    if (!usedHexes.has(lower)) {
      palette.push({ name: fb.name, hex: fb.hex });
      usedHexes.add(lower);
    }
  }

  return palette;
}

/**
 * Resolves the primary fabric color for a core Việt phục garment so that
 * Page 2 concept.palette[0], Page 3 Mannequin SVG, and Gemini Image Generation
 * always share the exact same color source.
 */
export function resolveCoreGarmentColor(
  coreGarment: CoreVietPhucId,
  preferredColor?: string
): ResolvedGarmentColor {
  const palette = resolveCorePalette(coreGarment, preferredColor);
  const primarySwatch = palette[0] || { name: 'Đỏ Sa Thạch', hex: '#8C3B24' };
  const englishName =
    HEX_ENGLISH_COLOR_NAMES[primarySwatch.hex.toLowerCase()] ||
    `${primarySwatch.name} (${primarySwatch.hex})`;

  return {
    hex: primarySwatch.hex,
    name: primarySwatch.name,
    englishName,
  };
}

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

  // Short rationale reacting to occasion, location, style, and preferredColor
  const colorNote =
    setup.preferredColor && setup.preferredColor !== 'Để hệ thống gợi ý'
      ? `, nhấn nhá với sắc ${setup.preferredColor.toLowerCase()}`
      : '';

  const rationale = `Ý tưởng kết hợp ${core.name} cho dịp ${setup.occasion.toLowerCase()} tại ${setup.location}, mang định hướng ${setup.style.toLowerCase()}${colorNote}. Bản phối tôn vinh cấu trúc nguyên bản của di sản, đồng thời tạo nét phóng khoáng hài hòa cho nhịp sống hiện đại.`;

  // Deterministic 3-Color Palette Generation (Rules A, B, C)
  const palette = resolveCorePalette(setup.coreGarment, setup.preferredColor);

  return {
    title,
    rationale,
    palette,
    description: core.editorialDescription,
  };
}

// Backward-compatible public helper; all callers can provide the full current context.
export function findBestSupportCombination(
  targetRemix: number,
  includeAccent: boolean,
  currentItems?: ActiveSupportItems,
  setup: SetupData = { coreGarment: 'ao-ngu-than', occasion: 'Chụp ảnh kỷ niệm / Lookbook', location: 'Đại Nội Huế', style: 'Thanh lịch', preferredColor: 'Để hệ thống gợi ý' }
): ActiveSupportItems {
  return recommendOutfit({ ...setup, targetRemix, includeAccent }, currentItems).items;
}
