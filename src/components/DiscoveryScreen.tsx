import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CoreVietPhucId, SetupData } from '../types';
import { CORE_ITEMS, OCCASIONS, STYLES } from '../data/mockFashionData';
import { PatternMotif } from './PatternMotif';
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';

interface DiscoveryScreenProps {
  setupData: SetupData;
  onChangeSetup: (data: Partial<SetupData>) => void;
  onSubmit: () => void;
  hasSeenIntro: boolean;
  onIntroComplete: () => void;
}

const STORY_WORDS = [
  "Mỗi", "nếp", "vải", "mang", "một", "ký", "ức.",
  "Bạn", "sẽ", "kể", "tiếp", "câu", "chuyện", "Việt", "phục", "theo", "cách", "riêng,",
  "giữa", "nhịp", "sống", "hôm", "nay."
];

export const DiscoveryScreen: React.FC<DiscoveryScreenProps> = ({
  setupData,
  onChangeSetup,
  onSubmit,
  hasSeenIntro,
  onIntroComplete,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const selectedCore = CORE_ITEMS[setupData.coreGarment] || CORE_ITEMS['ao-ngu-than'];

  // If user prefers reduced motion, skip intro animation and mark as complete
  useEffect(() => {
    if (shouldReduceMotion && !hasSeenIntro) {
      onIntroComplete();
    }
  }, [shouldReduceMotion, hasSeenIntro, onIntroComplete]);

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-10">
      {/* Editorial Header & Storytelling Introduction */}
      <div className="text-center space-y-3">
        <span className="text-xs sm:text-sm font-medium tracking-wide text-[#B3261E]">
          Studio Khám phá · Bước 01
        </span>

        <h1 className="text-[28px] sm:text-[34px] lg:text-[40px] font-bold text-[#2B231D] tracking-tight leading-tight">
          Chọn Điểm Chạm Di Sản
        </h1>

        {/* Storytelling Word-by-Word Reveal with Zero Layout Shift */}
        <div className="pt-1">
          <p className="text-sm sm:text-base leading-relaxed text-[#5A4F46] max-w-xl mx-auto text-center font-normal">
            <span className="sr-only">
              Mỗi nếp vải mang một ký ức. Bạn sẽ kể tiếp câu chuyện Việt phục theo cách riêng, giữa nhịp sống hôm nay.
            </span>
            <span aria-hidden="true" className="inline">
              {STORY_WORDS.map((word, idx) => {
                // If intro has already been seen or user prefers reduced motion, render static text with full opacity immediately
                if (hasSeenIntro || shouldReduceMotion) {
                  return (
                    <span key={idx} className="inline-block">
                      {word}&nbsp;
                    </span>
                  );
                }

                // First visit: animate opacity word by word
                return (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.25,
                      delay: idx * 0.07,
                      ease: 'easeOut',
                    }}
                    onAnimationComplete={
                      idx === STORY_WORDS.length - 1 ? onIntroComplete : undefined
                    }
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                );
              })}
            </span>
          </p>
        </div>
      </div>

      {/* Exactly THREE Dropdown Fields Form */}
      <div className="bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-6 sm:p-8 shadow-xs space-y-7">
        {/* Dropdown 1: Việt phục */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="select-core-garment"
              className="text-sm sm:text-base font-semibold text-[#2B231D]"
            >
              1. Việt phục
            </label>
            <span className="text-xs text-[#7A6E63]">
              5 dáng áo tiêu biểu
            </span>
          </div>

          <div className="relative">
            <select
              id="select-core-garment"
              value={setupData.coreGarment}
              onChange={(e) =>
                onChangeSetup({ coreGarment: e.target.value as CoreVietPhucId })
              }
              className="w-full appearance-none bg-[#FAF7EE] text-[#2B231D] text-sm sm:text-base font-medium px-4 py-3 rounded-xs border border-[#DDD0C0] hover:border-[#B3261E]/50 focus:outline-none focus:border-[#B3261E] focus:ring-1 focus:ring-[#B3261E]/30 transition-colors cursor-pointer pr-10"
            >
              {Object.values(CORE_ITEMS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {item.subTitle}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#5A4F46]">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Dynamic preview badge for the chosen core garment */}
          <div className="mt-2.5 flex items-center gap-3 p-3 rounded-xs bg-[#FAF7EE]/70 border border-[#EAE3D6]">
            <div className="w-8 h-8 rounded-full bg-[#FFFDF9] border border-[#DDD0C0] p-1.5 shrink-0 flex items-center justify-center">
              <PatternMotif
                type={selectedCore.patternType}
                color="#B3261E"
                className="w-full h-full"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#2B231D] truncate">
                {selectedCore.vietnameseTitle}
              </div>
              <div className="text-[11px] text-[#7A6E63] truncate">
                {selectedCore.era} · {selectedCore.material.split(',')[0]}
              </div>
            </div>
          </div>
        </div>

        {/* Dropdown 2: Dịp */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="select-occasion"
              className="text-sm sm:text-base font-semibold text-[#2B231D]"
            >
              2. Dịp
            </label>
            <span className="text-xs text-[#7A6E63]">
              Bối cảnh sử dụng
            </span>
          </div>

          <div className="relative">
            <select
              id="select-occasion"
              value={setupData.occasion}
              onChange={(e) => onChangeSetup({ occasion: e.target.value })}
              className="w-full appearance-none bg-[#FAF7EE] text-[#2B231D] text-sm sm:text-base font-medium px-4 py-3 rounded-xs border border-[#DDD0C0] hover:border-[#B3261E]/50 focus:outline-none focus:border-[#B3261E] focus:ring-1 focus:ring-[#B3261E]/30 transition-colors cursor-pointer pr-10"
            >
              {OCCASIONS.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#5A4F46]">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Dropdown 3: Phong cách */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="select-style"
              className="text-sm sm:text-base font-semibold text-[#2B231D]"
            >
              3. Định hướng phong cách
            </label>
            <span className="text-xs text-[#7A6E63]">
              Tinh thần phối đồ
            </span>
          </div>

          <div className="relative">
            <select
              id="select-style"
              value={setupData.style}
              onChange={(e) => onChangeSetup({ style: e.target.value })}
              className="w-full appearance-none bg-[#FAF7EE] text-[#2B231D] text-sm sm:text-base font-medium px-4 py-3 rounded-xs border border-[#DDD0C0] hover:border-[#B3261E]/50 focus:outline-none focus:border-[#B3261E] focus:ring-1 focus:ring-[#B3261E]/30 transition-colors cursor-pointer pr-10"
            >
              {STYLES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#5A4F46]">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={onSubmit}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#B3261E] hover:bg-[#9A1F18] text-white text-sm sm:text-base font-semibold rounded-xs shadow-xs transition-all duration-200 cursor-pointer active:scale-98"
          >
            <span>Tạo gợi ý</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-xs text-[#7A6E63] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#B3261E]" />
            Chuyển tiếp đến bản phác thảo ý niệm & bảng màu phối hợp
          </span>
        </div>
      </div>
    </div>
  );
};
