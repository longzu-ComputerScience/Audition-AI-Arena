import React, { useLayoutEffect } from 'react';
import { motion } from 'motion/react';
import { SetupData, ConceptData, CoreItem } from '../types';
import { CORE_ITEMS, STYLES, PREFERRED_COLOR_OPTIONS, COLOR_MAP } from '../data/mockFashionData';
import { PatternMotif } from './PatternMotif';
import { alignPageToTop } from '../utils/scrollAlignment';
import { ArrowRight, ArrowLeft, Check, Sparkles, Info } from 'lucide-react';

interface ConceptRevealProps {
  setupData: SetupData;
  concept: ConceptData;
  onChangeSetup: (data: Partial<SetupData>) => void;
  onBack: () => void;
  onProceed: () => void;
}

export const ConceptReveal: React.FC<ConceptRevealProps> = ({
  setupData,
  concept,
  onChangeSetup,
  onBack,
  onProceed,
}) => {
  const core: CoreItem = CORE_ITEMS[setupData.coreGarment] || CORE_ITEMS['ao-ngu-than'];

  useLayoutEffect(() => { alignPageToTop(); }, []);

  return (
    <motion.section
      data-page="concept"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6"
    >
      {/* Editorial Header */}
      <div className="space-y-1.5 border-b border-[#EAE3D6] pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-semibold tracking-wide text-[#B3261E]">
            Studio Giám Tuyển · Bước 02
          </span>
          <span className="text-xs text-[#7A6E63] font-medium">
            {setupData.occasion} · {setupData.location}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2B231D] tracking-tight leading-snug">
          Định Hình Phong Cách & Bản Ý Niệm
        </h1>

        <p className="text-xs sm:text-sm text-[#5A4F46] leading-relaxed">
          Tùy biến tinh thần thẩm mỹ và sắc độ chủ đạo để khởi tạo bản phối di sản phù hợp nhất với bạn.
        </p>
      </div>

      {/* 1. ĐỊNH HƯỚNG PHONG CÁCH (Selectable Cards/Chips - No Dropdown) */}
      <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-baseline justify-between border-b border-[#EAE3D6] pb-2">
          <h2 className="text-sm sm:text-base font-bold text-[#2B231D]">
            1. Định hướng phong cách
          </h2>
          <span className="text-xs text-[#7A6E63]">
            Chọn 1 phong cách
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {STYLES.map((st) => {
            const isSelected = setupData.style === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => onChangeSetup({ style: st })}
                className={`p-2.5 rounded-lg border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[52px] ${
                  isSelected
                    ? 'bg-[#FFFDF9] border-[#B3261E] ring-1 ring-[#B3261E]/30 text-[#B3261E] shadow-2xs font-semibold'
                    : 'bg-[#FAF7EE] hover:bg-[#FFFDF9] border-[#E0D5C5] hover:border-[#B3261E]/40 text-[#2B231D] font-medium'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs sm:text-sm leading-tight">
                    {st}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-[#B3261E] text-white flex items-center justify-center shrink-0 ml-1">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MÀU SẮC CHỦ ĐẠO (Selectable Swatches/Chips - No Dropdown) */}
      <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-baseline justify-between border-b border-[#EAE3D6] pb-2">
          <h2 className="text-sm sm:text-base font-bold text-[#2B231D]">
            2. Màu sắc chủ đạo
          </h2>
          <span className="text-xs text-[#7A6E63]">
            11 lựa chọn sắc thái
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {PREFERRED_COLOR_OPTIONS.map((col) => {
            const isSelected = setupData.preferredColor === col;
            const isAuto = col === 'Để hệ thống gợi ý';
            const colorHex = COLOR_MAP[col]?.hex;

            return (
              <button
                key={col}
                type="button"
                onClick={() => onChangeSetup({ preferredColor: col })}
                className={`p-2 rounded-lg border text-left transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#FFFDF9] border-[#B3261E] ring-1 ring-[#B3261E]/30 text-[#B3261E] shadow-2xs font-semibold'
                    : 'bg-[#FAF7EE] hover:bg-[#FFFDF9] border-[#E0D5C5] hover:border-[#B3261E]/40 text-[#2B231D] font-medium'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isAuto ? (
                    <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#B3261E] to-[#1D4E89] shrink-0 border border-black/10 flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-white" />
                    </span>
                  ) : (
                    <span
                      className="w-4 h-4 rounded-full shrink-0 border border-black/15 shadow-2xs"
                      style={{ backgroundColor: colorHex || '#DDD0C0' }}
                    />
                  )}
                  <span className="text-xs truncate">
                    {col}
                  </span>
                </div>

                {isSelected && (
                  <span className="w-3.5 h-3.5 rounded-full bg-[#B3261E] text-white flex items-center justify-center shrink-0">
                    <Check className="w-2 h-2 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-start gap-1.5 pt-0.5 text-[11px] text-[#7A6E63]">
          <Info className="w-3.5 h-3.5 shrink-0 text-[#B3261E] mt-0.5" />
          <span>
            Chọn sắc màu bạn yêu thích để định hình phong cách phối đồ.
          </span>
        </div>
      </div>

      {/* 3. CONCEPT REVEAL (Immediately reflects selected Style and Color) */}
      <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="border-b border-[#EAE3D6] pb-2.5 space-y-1.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B3261E]">
              3. Bản Ý Niệm Phối Đồ · Concept Reveal
            </span>
            <span className="text-xs text-[#7A6E63] font-mono">
              {core.archiveCode}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#2B231D] tracking-tight">
            {concept.title}
          </h2>

          <p className="text-xs sm:text-sm text-[#4E433C] leading-relaxed">
            {concept.rationale}
          </p>
        </div>

        {/* Three-Color Palette */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#2B231D] tracking-wide">
              Bảng màu chủ đạo (3 sắc độ hòa hợp)
            </h3>
            <span className="text-[11px] text-[#7A6E63]">
              Phối hợp tự nhiên
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {concept.palette.map((color, idx) => (
              <motion.div
                key={`${color.hex}-${idx}`}
                initial={{ opacity: 0.85, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: idx * 0.04 }}
                className="group bg-[#FAF7EE] hover:bg-[#FFFDF9] border border-[#E5DEC9] hover:border-[#D5C6B0] p-2.5 rounded-lg flex items-center gap-2.5 transition-colors duration-200"
              >
                <span
                  className="w-5 h-5 rounded-full border border-black/10 shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-[#2B231D] truncate">
                      {color.name}
                    </span>
                    <span className="text-[10px] text-[#8C7D70] font-medium tracking-tight shrink-0">
                      {idx === 0 ? 'Chủ đạo' : idx === 1 ? 'Phối hợp' : 'Điểm xuyết'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#7A6E63] font-mono leading-tight">
                    {color.hex}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cultural Snippet based on the selected Core Garment */}
        <div className="border-t border-[#EAE3D6] pt-3.5 space-y-2.5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF7EE] border border-[#DDD0C0] p-1.5 shrink-0 flex items-center justify-center">
              <PatternMotif
                type={core.patternType}
                color="#B3261E"
                className="w-full h-full"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-[#B3261E]">
                {core.era}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-[#2B231D]">
                {core.vietnameseTitle}
              </h4>
              <p className="text-xs text-[#7A6E63]">
                {core.subTitle}
              </p>
            </div>
          </div>

          <p className="text-xs text-[#5A4F46] leading-relaxed">
            {core.editorialDescription}
          </p>

          <div className="p-2.5 bg-[#FAF7EE] rounded-lg border border-[#EAE3D6] text-xs text-[#5A4F46] space-y-0.5">
            <div className="font-semibold text-[#2B231D]">
              Đặc trưng form dáng di sản:
            </div>
            <p className="leading-relaxed">
              {core.silhouette}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#5A4F46] hover:text-[#2B231D] border border-[#DDD0C0] hover:border-[#B3261E]/50 bg-[#FFFDF9] rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Khám phá</span>
        </button>

        <button
          type="button"
          onClick={onProceed}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B3261E] hover:bg-[#9A1F18] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all duration-200 cursor-pointer active:scale-98"
        >
          <span>Vào Remix Studio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.section>
  );
};
