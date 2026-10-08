import React from 'react';
import { motion } from 'motion/react';
import { SetupData, ConceptData, CoreItem } from '../types';
import { CORE_ITEMS, STYLES, PREFERRED_COLOR_OPTIONS } from '../data/mockFashionData';
import { PatternMotif } from './PatternMotif';
import { ArrowRight, ArrowLeft, ChevronDown, SlidersHorizontal, Info } from 'lucide-react';

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

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8"
    >
      {/* Editorial Header */}
      <div className="space-y-3 border-b border-[#EAE3D6] pb-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs sm:text-sm font-medium tracking-wide text-[#B3261E]">
            Ý Niệm Phối Đồ · Bước 02
          </span>
          <span className="text-xs text-[#7A6E63] font-medium">
            {setupData.occasion} · {core.name}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2B231D] tracking-tight leading-snug">
          {concept.title}
        </h1>

        <p className="text-sm sm:text-base text-[#5A4F46] leading-relaxed">
          {concept.rationale}
        </p>
      </div>

      {/* Selected Việt Phục Summary Card */}
      <div className="bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-13 h-13 rounded-full bg-[#FAF7EE] border border-[#DDD0C0] p-2.5 shrink-0 flex items-center justify-center">
            <PatternMotif
              type={core.patternType}
              color="#B3261E"
              className="w-full h-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-[#B3261E] tracking-wide">
              {core.archiveCode} · {core.era}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#2B231D] mt-0.5">
              {core.vietnameseTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6E63] mt-0.5">
              {core.subTitle}
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5A4F46] leading-relaxed border-t border-[#EAE3D6] pt-4">
          {core.editorialDescription}
        </p>

        {/* 3-Color Palette */}
        <div className="border-t border-[#EAE3D6] pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#2B231D] tracking-wide">
              Bảng màu chủ đạo (3 sắc độ phối hợp)
            </span>
            <span className="text-[11px] text-[#7A6E63]">
              Hòa hợp tự nhiên
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {concept.palette.map((color, idx) => (
              <div
                key={`${color.hex}-${idx}`}
                className="bg-[#FAF7EE] border border-[#E3D9CC] p-3 rounded-xs flex items-center gap-3"
              >
                <span
                  className="w-6 h-6 rounded-full border border-black/10 shrink-0 shadow-2xs"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#2B231D] truncate">
                    {color.name}
                  </div>
                  <div className="text-[11px] text-[#7A6E63] font-mono">
                    {color.hex}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-1.5 pt-1 text-[11px] text-[#7A6E63]">
            <Info className="w-3.5 h-3.5 shrink-0 text-[#B3261E] mt-0.5" />
            <span>
              Bảng màu dùng để định hướng phong cách và ý niệm mỹ cảm thị giác.
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Concept Refinement Box (Single source of truth in App.tsx) */}
      <div className="bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#EAE3D6] pb-3">
          <SlidersHorizontal className="w-4 h-4 text-[#B3261E]" />
          <h3 className="text-sm sm:text-base font-semibold text-[#2B231D]">
            Tinh chỉnh ý niệm trực tiếp
          </h3>
          <span className="text-xs text-[#7A6E63] ml-auto">
            Cập nhật tức thì
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Style dropdown */}
          <div className="space-y-1.5">
            <label
              htmlFor="concept-style-select"
              className="text-xs sm:text-sm font-medium text-[#2B231D]"
            >
              Phong cách
            </label>
            <div className="relative">
              <select
                id="concept-style-select"
                value={setupData.style}
                onChange={(e) => onChangeSetup({ style: e.target.value })}
                className="w-full appearance-none bg-[#FAF7EE] text-[#2B231D] text-xs sm:text-sm font-medium px-3.5 py-2.5 rounded-xs border border-[#DDD0C0] hover:border-[#B3261E]/50 focus:outline-none focus:border-[#B3261E] focus:ring-1 focus:ring-[#B3261E]/30 transition-colors cursor-pointer pr-9"
              >
                {STYLES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#5A4F46]">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Preferred Color dropdown */}
          <div className="space-y-1.5">
            <label
              htmlFor="concept-color-select"
              className="text-xs sm:text-sm font-medium text-[#2B231D]"
            >
              Tông màu ưu tiên
            </label>
            <div className="relative">
              <select
                id="concept-color-select"
                value={setupData.preferredColor}
                onChange={(e) => onChangeSetup({ preferredColor: e.target.value })}
                className="w-full appearance-none bg-[#FAF7EE] text-[#2B231D] text-xs sm:text-sm font-medium px-3.5 py-2.5 rounded-xs border border-[#DDD0C0] hover:border-[#B3261E]/50 focus:outline-none focus:border-[#B3261E] focus:ring-1 focus:ring-[#B3261E]/30 transition-colors cursor-pointer pr-9"
              >
                {PREFERRED_COLOR_OPTIONS.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#5A4F46]">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#5A4F46] hover:text-[#2B231D] border border-[#DDD0C0] hover:border-[#B3261E]/50 bg-[#FFFDF9] rounded-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Khám phá</span>
        </button>

        <button
          type="button"
          onClick={onProceed}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#B3261E] hover:bg-[#9A1F18] text-white text-xs sm:text-sm font-semibold rounded-xs shadow-xs transition-all duration-200 cursor-pointer active:scale-98"
        >
          <span>Vào Remix Studio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.section>
  );
};
