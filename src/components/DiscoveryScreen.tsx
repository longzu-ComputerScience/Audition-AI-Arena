import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CoreVietPhucId, SetupData } from '../types';
import { CORE_ITEMS, OCCASIONS, LOCATIONS, STYLES } from '../data/mockFashionData';
import { PatternMotif } from './PatternMotif';
import { ArrowRight, Check } from 'lucide-react';

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
  const coreList = Object.values(CORE_ITEMS);
  const shouldReduceMotion = useReducedMotion();

  // If user prefers reduced motion, skip intro animation and mark as complete
  useEffect(() => {
    if (shouldReduceMotion && !hasSeenIntro) {
      onIntroComplete();
    }
  }, [shouldReduceMotion, hasSeenIntro, onIntroComplete]);

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-10">
      {/* Editorial Header & Storytelling Introduction */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs sm:text-sm font-medium tracking-wide text-[#B3261E]">
          Studio Khám phá · Bước 01
        </span>

        <h1 className="text-[28px] sm:text-[34px] lg:text-[42px] font-bold text-[#2B231D] tracking-tight leading-tight">
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

      <div className="space-y-9">
        {/* 1. Việt phục - Selectable Cards with Motif Thumbnails */}
        <div className="space-y-3.5">
          <div className="flex items-baseline justify-between border-b border-[#EAE3D6] pb-2">
            <h2 className="text-base sm:text-lg font-semibold text-[#2B231D]">
              1. Việt phục
            </h2>
            <span className="text-xs sm:text-sm text-[#7A6E63]">
              5 dáng áo tiêu biểu
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {coreList.map((item) => {
              const isSelected = setupData.coreGarment === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeSetup({ coreGarment: item.id })}
                  className={`relative p-4 rounded-sm border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-[#FFFDF9] border-[#B3261E] shadow-sm ring-1 ring-[#B3261E]/30'
                      : 'bg-[#FFFDF9]/70 hover:bg-[#FFFDF9] border-[#E3D9CC] hover:border-[#B3261E]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FAF7EE] border border-[#DDD0C0] p-1.5 shrink-0 flex items-center justify-center">
                      <PatternMotif
                        type={item.patternType}
                        color={isSelected ? '#B3261E' : '#5A4F46'}
                        className="w-full h-full"
                      />
                    </div>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-[#B3261E] text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="text-xs text-[#7A6E63]">
                        {item.era.split('·')[0].trim()}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2B231D] group-hover:text-[#B3261E] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A4F46] mt-0.5 line-clamp-1">
                      {item.subTitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Dịp - Selectable Chips */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#EAE3D6] pb-2">
            <h2 className="text-base sm:text-lg font-semibold text-[#2B231D]">
              2. Dịp
            </h2>
            <span className="text-xs sm:text-sm text-[#7A6E63]">
              Mục đích diện trang phục
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {OCCASIONS.map((occ) => {
              const isSelected = setupData.occasion === occ;
              return (
                <button
                  key={occ}
                  type="button"
                  onClick={() => onChangeSetup({ occasion: occ })}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xs border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#2B231D] text-[#FAF7EE] border-[#2B231D] shadow-xs'
                      : 'bg-[#FFFDF9] text-[#2B231D] hover:text-[#B3261E] border-[#DDD3C4] hover:border-[#B3261E]/50'
                  }`}
                >
                  {occ}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Địa điểm / bối cảnh - Selectable Chips */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#EAE3D6] pb-2">
            <h2 className="text-base sm:text-lg font-semibold text-[#2B231D]">
              3. Địa điểm / bối cảnh
            </h2>
            <span className="text-xs sm:text-sm text-[#7A6E63]">
              Không gian trải nghiệm
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {LOCATIONS.map((loc) => {
              const isSelected = setupData.location === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => onChangeSetup({ location: loc })}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xs border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#2B231D] text-[#FAF7EE] border-[#2B231D] shadow-xs'
                      : 'bg-[#FFFDF9] text-[#2B231D] hover:text-[#B3261E] border-[#DDD3C4] hover:border-[#B3261E]/50'
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Phong cách - Selectable Chips */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#EAE3D6] pb-2">
            <h2 className="text-base sm:text-lg font-semibold text-[#2B231D]">
              4. Phong cách
            </h2>
            <span className="text-xs sm:text-sm text-[#7A6E63]">
              Định hướng thẩm mỹ
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {STYLES.map((st) => {
              const isSelected = setupData.style === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => onChangeSetup({ style: st })}
                  className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-xs border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#B3261E] text-white border-[#B3261E] shadow-xs font-semibold'
                      : 'bg-[#FFFDF9] text-[#2B231D] hover:text-[#B3261E] border-[#DDD3C4] hover:border-[#B3261E]/50'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#B3261E] hover:bg-[#9A1F18] text-white text-sm sm:text-base font-semibold rounded-xs shadow-sm transition-all duration-200 cursor-pointer active:scale-98"
          >
            <span>Tạo gợi ý</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
