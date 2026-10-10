import {
  CoreItem,
  ActiveSupportItems,
  GuardrailResult,
  SetupData,
  HeritageCheckItem,
} from '../types';

export function isSolemnOccasion(occasion: string): boolean {
  return ['Sự kiện trang trọng', 'Lễ tốt nghiệp / Bế giảng', 'Đón Tết cổ truyền', 'Đám cưới / Ăn hỏi bạn bè'].includes(occasion);
}

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
 * Deep, transparent Cultural Guardrail engine.
 * Evaluates core garment heritage integrity, refinement text requests,
 * contemporary styling synergy, and occasion appropriateness.
 */
export function evaluateGuardrail(
  refinementText: string,
  core: CoreItem,
  items?: ActiveSupportItems,
  setupData?: SetupData,
  actualRemix?: number
): GuardrailResult {
  // Accept the legacy spelling in user input while keeping displayed terms consistent.
  const text = (refinementText || '').toLowerCase().trim().replace(/\bphom\b/g, 'form');
  const occasion = setupData?.occasion || 'Dạo phố cuối tuần';

  // Specific garment heritage details
  const garmentRules: Record<
    string,
    { collarName: string; silhouetteName: string; etiquetteNote: string }
  > = {
    'ao-nhat-binh': {
      collarName: 'Cổ áo chữ nhật to bản viền thêu ngũ hoa',
      silhouetteName: 'Form áo thụng buông dài qua gối, không chiết eo',
      etiquetteNote:
        'Áo Nhật Bình vốn là lễ phục quý tộc thời Nguyễn; khi mặc cần giữ cổ áo ngay ngắn và không cắt ngắn vạt áo.',
    },
    'ao-tac': {
      collarName: 'Cổ lập lĩnh cao 3.5cm cài 5 khuy hữu nhậm',
      silhouetteName: 'Tay thụng rộng che kín ngón tay, form năm thân trang trọng',
      etiquetteNote:
        'Áo Tấc là quốc phục đại lễ truyền thống; tay thụng rộng thể hiện sự khiêm nhường, đoan chính của người mặc.',
    },
    'ao-ngu-than': {
      collarName: 'Cổ lập lĩnh đứng cứng cáp cài 5 khuy ngũ thường',
      silhouetteName: 'Form năm thân ghép mí khép kín, tà áo thẳng tắp',
      etiquetteNote:
        'Áo Ngũ Thân tượng trưng cho đạo làm người (nhân, lễ, nghĩa, trí, tín); trang phục cần phẳng phiu, kín đáo.',
    },
    'ao-tu-than': {
      collarName: 'Cổ áo mở tự nhiên kết hợp yếm cổ nhạn',
      silhouetteName: 'Bốn vạt mở tự do hoặc buộc vạt trước, thắt dải lưng điều',
      etiquetteNote:
        'Áo Tứ Thân gắn liền với văn hóa Kinh Bắc; kết cấu 4 vạt tượng trưng cho tứ thân phụ mẫu, cần giữ độ rủ tự nhiên.',
    },
    'ao-dai': {
      collarName: 'Cổ đứng hoặc cổ thuyền truyền thống',
      silhouetteName: 'Hai tà trước sau buông thướt tha, xẻ tà ngang eo kín đáo',
      etiquetteNote:
        'Áo Dài tôn nét thanh lịch nhã nhặn; đường xẻ tà cần giữ mức chuẩn mực, không xẻ quá cao làm mất vẻ đoan trang.',
    },
  };

  const rule = garmentRules[core.id] || {
    collarName: 'Cổ áo truyền thống nguyên bản',
    silhouetteName: 'Form dáng di sản chuẩn mực',
    etiquetteNote: 'Giữ trọn vẹn kết cấu nguyên bản của y phục cổ phong.',
  };

  // 1. Direct structural conflicts (Orange status)
  const fatalConflicts = [
    { kw: 'xóa bỏ cổ', reason: `Xóa bỏ ${rule.collarName} sẽ làm mất hoàn toàn nhận diện di sản của ${core.name}.` },
    { kw: 'bỏ cổ lập lĩnh', reason: 'Cổ lập lĩnh là linh hồn của y phục thời Nguyễn; không thể lược bỏ.' },
    { kw: 'cắt bỏ tà', reason: 'Tà áo là kết cấu nhận diện cốt lõi; việc cắt bỏ làm biến dạng hoàn toàn di sản.' },
    { kw: 'cắt bỏ vạt', reason: 'Vạt áo biểu trưng cho kết cấu truyền thống; không thể cắt bỏ.' },
    { kw: 'khoét ngực', reason: 'Khoét ngực hở sâu xung đột với tính kín đáo, đoan trang của y phục truyền thống.' },
    { kw: 'hở bạo', reason: 'Trang phục cổ phong chú trọng vẻ thanh tao đoan chính; phong cách hở bạo phá vỡ chuẩn mực.' },
    { kw: 'xuyên thấu hoàn toàn', reason: 'Chất liệu xuyên thấu toàn bộ không phù hợp với chuẩn mực cổ phục Việt.' },
    { kw: 'biến dạng form', reason: 'Biến dạng form dáng cơ bản làm mất đi tính nguyên bản của di sản y phục.' },
    { kw: 'bỏ ngũ thân', reason: 'Kết cấu 5 thân tượng trưng cho đạo lý gia đình; không thể lược bỏ ngũ thân.' },
    { kw: 'may bó sát ngực', reason: 'Cổ phục truyền thống có form đứng thẳng đĩnh đạc, không may bó sát cơ thể.' },
  ];

  for (const c of fatalConflicts) {
    if (text.includes(c.kw)) {
      const heritageChecks: HeritageCheckItem[] = [
        {
          id: 'collar',
          label: 'Cổ áo & Hàng khuy di sản',
          status: 'violation',
          description: `Yêu cầu tinh chỉnh xung đột với ${rule.collarName}.`,
        },
        {
          id: 'silhouette',
          label: 'Form dáng & Tà áo cốt lõi',
          status: 'violation',
          description: c.reason,
        },
        {
          id: 'etiquette',
          label: `Tính tôn nghiêm bối cảnh (${occasion})`,
          status: 'warning',
          description: 'Cần giữ nguyên tắc chuẩn mực văn hóa khi xuất hiện tại sự kiện.',
        },
        {
          id: 'balance',
          label: 'Hài hòa tủ đồ đương đại',
          status: 'warning',
          description: 'Nên dùng phụ kiện hiện đại để tạo điểm nhấn thay vì can thiệp vào áo chính.',
        },
      ];

      return {
        status: 'orange',
        message: `Xung đột cốt lõi: Yêu cầu can thiệp sâu làm tổn hại kết cấu di sản của ${core.name}.`,
        detailedAnalysis: `${c.reason} Trong triết lý Sắc Việt, trang phục cốt lõi luôn được bảo toàn nguyên vẹn 100% về form dáng, cổ áo và kỹ thuật may đo di sản; mọi sự cách tân chỉ diễn ra ở các lớp bổ trợ hiện đại.`,
        heritageChecks,
        etiquetteTip: rule.etiquetteNote,
        recommendations: [
          `Giữ trọn vẹn ${rule.collarName} và form dáng nguyên bản của ${core.name}.`,
          'Thay vì can thiệp vào thân áo, hãy tinh chỉnh phụ kiện túi, giày hoặc trang sức đương đại.',
          'Chọn màu sắc tương phản tinh tế để tạo nét hiện đại mà không làm biến dạng y phục.',
        ],
      };
    }
  }

  // 2. Sensitive modifications requiring caution (Yellow status)
  const cautionAlterations = [
    { kw: 'cắt ngắn', reason: `Cắt ngắn tà áo có thể làm thay đổi tỷ lệ thị giác truyền thống của ${core.name}.` },
    { kw: 'xẻ cao hơn', reason: 'Đường xẻ tà cần giữ độ kín đáo vừa vặn theo quy chuẩn truyền thống.' },
    { kw: 'bỏ khuy', reason: 'Hàng khuy cài biểu trưng cho ngũ thường; việc lược bớt cần được cân nhắc cẩn trọng.' },
    { kw: 'bỏ cúc', reason: 'Hàng khuy cổ phục giữ nếp áo đứng thẳng; hạn chế lược bỏ.' },
    { kw: 'xẻ ngực', reason: 'Cổ phục cổ kính cần giữ đường cổ thanh thoát, hạn chế xẻ sâu.' },
    { kw: 'khoét sâu', reason: 'Độ khoét sâu có thể làm mất đi khí chất tôn nghiêm cổ điển.' },
    { kw: 'xuyên thấu', reason: 'Nếu sử dụng vải sa hay voan mỏng, bắt buộc phải có lớp áo lót bên trong chuẩn mực.' },
    { kw: 'ôm sát', reason: 'Cổ phục tôn nét đẹp thanh thoát qua độ buông tự nhiên, không nên may ôm sát bó chẽn.' },
  ];

  for (const c of cautionAlterations) {
    if (text.includes(c.kw)) {
      const heritageChecks: HeritageCheckItem[] = [
        {
          id: 'collar',
          label: 'Cổ áo & Hàng khuy di sản',
          status: 'warning',
          description: c.reason,
        },
        {
          id: 'silhouette',
          label: 'Form dáng & Tà áo cốt lõi',
          status: 'warning',
          description: `Cần đảm bảo ${rule.silhouetteName} không bị phá vỡ tỷ lệ.`,
        },
        {
          id: 'etiquette',
          label: `Tính tôn nghiêm bối cảnh (${occasion})`,
          status: 'passed',
          description: 'Bối cảnh cho phép biến tấu nhẹ nhưng cần giữ nét đoan trang.',
        },
        {
          id: 'balance',
          label: 'Hài hòa tủ đồ đương đại',
          status: 'passed',
          description: 'Tổ hợp phụ kiện hiện đại tạo đối trọng thú vị với thân áo cổ.',
        },
      ];

      return {
        status: 'yellow',
        message: `Cần lưu ý: Tinh chỉnh có thể ảnh hưởng đến tỷ lệ thị giác và chi tiết nhận diện của ${core.name}.`,
        detailedAnalysis: `${c.reason} Hãy cân nhắc giữ nguyên kết cấu chuẩn mực và truyền tải cá tính hiện đại thông qua cách mix-match giày, túi hoặc quần ống rộng đương đại.`,
        heritageChecks,
        etiquetteTip: rule.etiquetteNote,
        recommendations: [
          'Giữ lớp áo lót truyền thống khi ứng dụng chất liệu mỏng hoặc cách điệu tà áo.',
          'Kết hợp cùng giày loafer hoặc sneaker tối giản để tạo độ tương phản thẩm mỹ sạch sẽ.',
        ],
      };
    }
  }

  // 3. Context & High Remix Solemnity Check (Yellow status for high remix in solemn events)
  const currentModernity = actualRemix ?? 50;
  const isSolemn = isSolemnOccasion(occasion);

  if (isSolemn && currentModernity >= 80) {
    const heritageChecks: HeritageCheckItem[] = [
      {
        id: 'collar',
        label: 'Cổ áo & Hàng khuy di sản',
        status: 'passed',
        description: `Bảo toàn 100% ${rule.collarName}.`,
      },
      {
        id: 'silhouette',
        label: 'Form dáng & Tà áo cốt lõi',
        status: 'passed',
        description: `Giữ vững ${rule.silhouetteName}.`,
      },
      {
        id: 'etiquette',
        label: `Tính tôn nghiêm bối cảnh (${occasion})`,
        status: 'warning',
        description: `Mức độ Remix cao (${currentModernity}%) với phụ kiện techwear/streetwear có thể hơi nổi bật so với không khí trang trọng.`,
      },
      {
        id: 'balance',
        label: 'Hài hòa tủ đồ đương đại',
        status: 'passed',
        description: 'Tổ hợp phá cách táo bạo, giàu cá tính thời trang.',
      },
    ];

    return {
      status: 'yellow',
      message: `Cần cân nhắc bối cảnh: Mức Remix ${currentModernity}% hơi phá cách cho ${occasion}.`,
      detailedAnalysis: `Thân áo ${core.name} được bảo toàn nguyên vẹn, tuy nhiên sự kết hợp cùng các món phụ kiện hiện đại mang điểm modernity cao có thể tạo độ tương phản rất mạnh trong không khí trang trọng. Cân nhắc đổi sang guốc mộc hoặc túi gấm nếu muốn tăng tính tôn nghiêm.`,
      heritageChecks,
      etiquetteTip: rule.etiquetteNote,
      recommendations: [
        `Đối với ${occasion}, ưu tiên phối cùng giày guốc mộc hoặc chunky loafer da tối màu thanh lịch.`,
        'Giữ phụ kiện điểm nhấn ở mức tối giản, trang nhã.',
      ],
    };
  }

  // 4. Fully compliant, green heritage preservation
  const heritageChecks: HeritageCheckItem[] = [
    {
      id: 'collar',
      label: 'Cổ áo & Hàng khuy di sản',
      status: 'passed',
      description: `Bảo toàn trọn vẹn ${rule.collarName}.`,
    },
    {
      id: 'silhouette',
      label: 'Form dáng & Tà áo cốt lõi',
      status: 'passed',
      description: `Giữ vững ${rule.silhouetteName}.`,
    },
    {
      id: 'etiquette',
      label: `Tính tôn nghiêm bối cảnh (${occasion})`,
      status: 'passed',
      description: `Trang phục đạt độ trang nhã và phù hợp chuẩn mực với ${occasion}.`,
    },
    {
      id: 'balance',
      label: 'Hài hòa tủ đồ đương đại',
      status: 'passed',
      description: `Bản phối đạt độ hòa sắc và đối trọng thẩm mỹ tuyệt vời (${currentModernity}% Remix).`,
    },
  ];

  return {
    status: 'green',
    message: `Bảo tồn chuẩn mực: Cấu trúc di sản của ${core.name} được giữ gìn trọn vẹn, phối đồ đương đại văn minh.`,
    detailedAnalysis: `Bản phối tôn vinh kết cấu di sản của ${core.name} thông qua ${rule.collarName} và ${rule.silhouetteName}. Các món đồ hỗ trợ hiện đại như phần dưới, giày và túi xách hòa nhịp ăn ý, tạo nên diện mạo thời trang đương đại mà không làm lu mờ giá trị truyền thống.`,
    heritageChecks,
    etiquetteTip: rule.etiquetteNote,
    recommendations: [
      'Đảm bảo tà áo được là phẳng phiu và buông thả tự nhiên khi đứng cũng như khi di chuyển.',
      'Tự tin thể hiện phong thái đĩnh đạc, thanh tao khi diện trang phục trong bối cảnh thực tế.',
    ],
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
    core.heritageDna[0] || `Cấu trúc form dáng ${core.name} nguyên bản`,
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
