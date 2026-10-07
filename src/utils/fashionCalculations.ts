import { CoreItem, SupportOption, ContextId, StyleId } from '../types';
import { CONTEXT_OPTIONS, STYLE_OPTIONS } from '../data/mockFashionData';

export interface CalculatedDna {
  actualRemix: number;
  preservedItems: string[];
  modernizedItems: string[];
  curatorVerdict: string;
  synergyLevel: 'Hài Hòa Di Sản' | 'Giao Thoa Cân Bằng' | 'Đột Phá Đương Đại';
  deviationText: string;
}

export function computeCulturalDna(
  core: CoreItem,
  bottom: SupportOption,
  shoes: SupportOption,
  accessory: SupportOption,
  contextId: ContextId,
  styleId: StyleId,
  targetRemix: number
): CalculatedDna {
  // Support modernity weighted average
  const supportAvg = (bottom.modernityScore + shoes.modernityScore + accessory.modernityScore) / 3;
  // Core weight 30%, Support items weight 70%
  const actualRemix = Math.round(core.baseModernity * 0.3 + supportAvg * 0.7);

  const contextMeta = CONTEXT_OPTIONS.find((c) => c.id === contextId) || CONTEXT_OPTIONS[0];
  const styleMeta = STYLE_OPTIONS.find((s) => s.id === styleId) || STYLE_OPTIONS[0];

  // Preserved Points
  const preservedItems: string[] = [
    `${core.heritageDna[0]} (${core.silhouette.split(',')[0].toLowerCase()})`,
    `${core.heritageDna[1]} - đặc trưng nhận diện của ${core.name}`,
    bottom.modernityScore < 40
      ? bottom.dnaPreserved
      : shoes.modernityScore < 40
      ? shoes.dnaPreserved
      : accessory.modernityScore < 40
      ? accessory.dnaPreserved
      : `Tinh thần phóng khoáng của vạt ${core.name} được giữ trọn vẹn, không biến dạng kết cấu gốc`,
  ];

  // Modernized Points
  const modernizedItems: string[] = [
    `Phần dưới diện "${bottom.name}": ${bottom.dnaModernized}`,
    `Điểm chạm bước chân cùng "${shoes.name}": ${shoes.dnaModernized}`,
    `Phụ kiện "${accessory.name}": ${accessory.dnaModernized}`,
  ];

  // Editorial Curatorial Verdict
  let curatorVerdict = '';
  if (actualRemix < 35) {
    curatorVerdict = `Bản phối thiên về chiều sâu nguyên bản của ${core.name}. Sự điềm đạm của phom dáng cổ xưa được đặt êm ái vào bối cảnh ${contextMeta.label}, như một nốt trầm lắng đọng giữa nhịp sống vội vã.`;
  } else if (actualRemix <= 70) {
    curatorVerdict = `Điểm rơi giao thoa lý tưởng giữa khí chất cung đình và hơi thở đương đại. Cấu trúc ${core.name} làm mỏ neo di sản vững chãi để các món phụ kiện ${styleMeta.label} tự do cất lên tiếng nói phá cách.`;
  } else {
    curatorVerdict = `Một tuyên ngôn thị giác bùng nổ cho ${contextMeta.label}. Cú va chạm tương phản dữ dội giữa cổ phục Việt và tinh thần đường phố cấp tiến tạo nên một diện mạo độc bản, bất quy tắc mà đầy thuyết phục.`;
  }

  let synergyLevel: 'Hài Hòa Di Sản' | 'Giao Thoa Cân Bằng' | 'Đột Phá Đương Đại' = 'Giao Thoa Cân Bằng';
  if (actualRemix < 40) synergyLevel = 'Hài Hòa Di Sản';
  else if (actualRemix > 75) synergyLevel = 'Đột Phá Đương Đại';

  const diff = actualRemix - targetRemix;
  let deviationText = '';
  if (Math.abs(diff) <= 8) {
    deviationText = `Tuyệt đối ăn khớp với mục tiêu (${targetRemix}%)`;
  } else if (diff > 0) {
    deviationText = `Cao hơn mục tiêu +${diff}% (Đậm tính đương đại hơn)`;
  } else {
    deviationText = `Thấp hơn mục tiêu ${diff}% (Thiên về nét cổ phong hơn)`;
  }

  return {
    actualRemix,
    preservedItems,
    modernizedItems,
    curatorVerdict,
    synergyLevel,
    deviationText,
  };
}
