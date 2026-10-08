import {
  CoreItem,
  ActiveSupportItems,
  GuardrailResult,
} from '../types';

/**
 * Calculates Actual Remix as the average modernityScore of active, non-null support items.
 * Core garment is strictly excluded.
 * Null optional slots (e.g. accent === null) must NOT count as score 0.
 */
export function computeActualRemix(items: ActiveSupportItems): number {
  const activeScores: number[] = [];

  if (items.bottom) activeScores.push(items.bottom.modernityScore);
  if (items.shoes) activeScores.push(items.shoes.modernityScore);
  if (items.bag) activeScores.push(items.bag.modernityScore);
  if (items.accent) activeScores.push(items.accent.modernityScore);

  if (activeScores.length === 0) return 0;

  const total = activeScores.reduce((acc, score) => acc + score, 0);
  return Math.round(total / activeScores.length);
}

/**
 * Local keyword/rule evaluator for Cultural Guardrail.
 * Guardrail does NOT depend on Actual Remix being high.
 * It strictly inspects user refinement requests against protected core structures.
 */
export function evaluateGuardrail(
  refinementText: string,
  core: CoreItem
): GuardrailResult {
  const text = (refinementText || '').toLowerCase().trim();

  if (!text) {
    return {
      status: 'green',
      message: 'Cấu trúc di sản cốt lõi được bảo toàn nguyên vẹn.',
    };
  }

  // Keywords that directly conflict with a protected structural rule
  const orangeKeywords = [
    'xóa bỏ cổ',
    'bỏ cổ lập lĩnh',
    'cắt bỏ tà',
    'cắt bỏ vạt',
    'khoét ngực',
    'hở bạo',
    'xuyên thấu hoàn toàn',
    'biến dạng phom',
    'bỏ ngũ thân',
    'may bó sát ngực',
  ];

  for (const kw of orangeKeywords) {
    if (text.includes(kw)) {
      return {
        status: 'orange',
        message: `Yêu cầu xung đột trực tiếp với quy chuẩn nhận diện cốt lõi của ${core.name}.`,
      };
    }
  }

  // Keywords that may affect identifying structure
  const yellowKeywords = [
    'cắt ngắn',
    'xẻ cao hơn',
    'bỏ khuy',
    'bỏ cúc',
    'xẻ ngực',
    'khoét sâu',
    'xuyên thấu',
    'thay đổi phom',
    'cắt bớt',
    'ôm sát',
  ];

  for (const kw of yellowKeywords) {
    if (text.includes(kw)) {
      return {
        status: 'yellow',
        message: `Yêu cầu này có thể thay đổi cấu trúc core của ${core.name}; cần kiểm chứng trước khi áp dụng.`,
      };
    }
  }

  // Safe styling adjustments (color, accessory, materials, footwear, layers)
  return {
    status: 'green',
    message: 'Cấu trúc di sản cốt lõi được bảo toàn; các tinh chỉnh bổ trợ phù hợp.',
  };
}

export interface CompactDna {
  preservedPoints: string[];
  modernPoints: string[];
  actualRemix: number;
}

export function computeCompactDna(
  core: CoreItem,
  items: ActiveSupportItems,
  actualRemix: number
): CompactDna {
  const preservedPoints = [
    core.heritageDna[0] || `Cấu trúc phom dáng ${core.name} nguyên bản`,
    core.heritageDna[1] || `Chi tiết cổ áo và đường xẻ vạt đặc trưng`,
  ];

  const modernPoints: string[] = [
    `${items.bottom.name} (${items.bottom.material.split('&')[0].trim()})`,
    `${items.shoes.name}`,
    `${items.bag.name}`,
  ];

  if (items.accent) {
    modernPoints.push(`${items.accent.name}`);
  }

  return {
    preservedPoints,
    modernPoints,
    actualRemix,
  };
}
