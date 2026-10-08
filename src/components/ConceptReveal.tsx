import React from 'react';
import { motion } from 'motion/react';
import { SetupData, ConceptData, CoreItem } from '../types';
import { CORE_ITEMS } from '../data/mockFashionData';
import { PatternMotif } from './PatternMotif';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface ConceptRevealProps {
  setupData: SetupData;
  concept: ConceptData;
  onBack: () => void;
  onProceed: () => void;
}

export const ConceptReveal: React.FC<ConceptRevealProps> = ({
  setupData,
  concept,
  onBack,
  onProceed,
}) => {
  const core: CoreItem = CORE_ITEMS[setupData.coreGarment] || CORE_ITEMS['ao-ngu-than'];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-3xl mx-auto py-8 sm:py-14 px-4 sm:px-6 space-y-10"
    >
      {/* Editorial Header */}
      <div className="space-y-3 border-b border-[#EAE3D6] pb-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-widest font-mono text-[#B7410E]">
            Ý Niệm Phối Đồ · Bước 02
          </span>
          <span className="text-xs font-mono text-[#8C7E72]">
            {setupData.occasion} · {setupData.location}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-[#241E1A] tracking-tight">
          {concept.title}
        </h1>
        <p className="text-sm sm:text-base text-[#5A4F46] font-serif leading-relaxed">
          {concept.rationale}
        </p>
      </div>

      {/* Selected Việt Phục Summary Card */}
      <div className="bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-6 sm:p-7 shadow-2xs space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#DDD0C0] p-2.5 shrink-0 flex items-center justify-center">
            <PatternMotif
              type={core.patternType}
              color="#B7410E"
              className="w-full h-full"
            />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#B7410E] uppercase tracking-wider">
              {core.archiveCode} · {core.era}
            </div>
            <h2 className="text-2xl font-editorial font-bold text-[#241E1A] mt-0.5">
              {core.vietnameseTitle}
            </h2>
            <p className="text-xs text-[#7A6E63] font-serif italic mt-0.5">
              {core.subTitle}
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#4E433C] leading-relaxed border-t border-[#EFE8DC] pt-4">
          {core.editorialDescription}
        </p>

        {/* 3-Color Palette */}
        <div className="border-t border-[#EFE8DC] pt-4 space-y-2">
          <span className="text-[11px] font-mono text-[#8C7E72] uppercase tracking-wider block">
            Bảng màu chủ đạo (3 sắc độ)
          </span>
          <div className="grid grid-cols-3 gap-3">
            {concept.palette.map((color, idx) => (
              <div
                key={idx}
                className="bg-[#FAF7F2] border border-[#E5DDD0] p-2.5 rounded-xs flex items-center gap-2.5"
              >
                <span
                  className="w-5 h-5 rounded-full border border-black/15 shrink-0 shadow-2xs"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="truncate">
                  <div className="text-xs font-medium text-[#241E1A] truncate">
                    {color.name}
                  </div>
                  <div className="text-[10px] font-mono text-[#8C7E72] uppercase">
                    {color.hex}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#5A4F46] hover:text-[#241E1A] border border-[#D5C7B4] hover:border-[#8C7E72] bg-[#FAF7F2] rounded-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại Khám phá</span>
        </button>

        <button
          type="button"
          onClick={onProceed}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#B7410E] hover:bg-[#96340B] text-white text-xs uppercase tracking-wider font-semibold rounded-xs shadow-sm transition-all duration-200 cursor-pointer active:scale-98"
        >
          <span>Vào Remix Studio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.section>
  );
};
