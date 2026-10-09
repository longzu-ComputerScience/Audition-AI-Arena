import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CoreVietPhucId, SetupData } from '../types';
import { CORE_ITEMS, OCCASIONS, LOCATIONS } from '../data/mockFashionData';
import { GarmentPreview } from './GarmentPreview';
import { ConfirmedIntroFields } from './InteractiveOnboarding';
import { alignPageToTop } from '../utils/scrollAlignment';
import { ChevronDown, Check, ArrowLeft } from 'lucide-react';

interface DiscoveryScreenProps {
  setupData: SetupData;
  onChangeSetup: (data: Partial<SetupData>) => void;
  onSubmit: () => void;
  onReturnToIntro: () => void;
  hasSeenIntro: boolean;
  onIntroComplete: () => void;
  confirmedIntroFields?: ConfirmedIntroFields;
  shouldFocusFirstUnconfirmed?: boolean;
  onConsumedInitialFocus?: () => void;
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
  onReturnToIntro,
  hasSeenIntro,
  onIntroComplete,
  confirmedIntroFields,
  shouldFocusFirstUnconfirmed,
  onConsumedInitialFocus,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const coreGarmentSelectRef = useRef<HTMLSelectElement | null>(null);
  const occasionSelectRef = useRef<HTMLSelectElement | null>(null);
  const locationSelectRef = useRef<HTMLSelectElement | null>(null);

  // If user prefers reduced motion, skip intro animation and mark as complete
  useEffect(() => {
    if (shouldReduceMotion && !hasSeenIntro) {
      onIntroComplete();
    }
  }, [shouldReduceMotion, hasSeenIntro, onIntroComplete]);

  // When user skips onboarding, gently focus the first remaining unconfirmed dropdown once
  useEffect(() => {
    if (!shouldFocusFirstUnconfirmed || !confirmedIntroFields) return;
    if (!confirmedIntroFields.coreGarment && coreGarmentSelectRef.current) {
      coreGarmentSelectRef.current.focus({ preventScroll: true });
    } else if (
      confirmedIntroFields.coreGarment &&
      !confirmedIntroFields.occasion &&
      occasionSelectRef.current
    ) {
      occasionSelectRef.current.focus({ preventScroll: true });
    } else if (
      confirmedIntroFields.coreGarment &&
      confirmedIntroFields.occasion &&
      !confirmedIntroFields.location &&
      locationSelectRef.current
    ) {
      locationSelectRef.current.focus({ preventScroll: true });
    }
    onConsumedInitialFocus?.();
  }, [shouldFocusFirstUnconfirmed, confirmedIntroFields, onConsumedInitialFocus]);

  useLayoutEffect(() => { alignPageToTop(); }, []);
  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.26, ease: 'easeOut' }}
      className="relative max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-10"
    >
      <button
        type="button"
        onClick={onReturnToIntro}
        aria-label="Quay lại phần giới thiệu và chọn năm Việt phục"
        className="absolute top-1.5 left-4 sm:left-6 lg:left-8 inline-flex items-center gap-1.5 rounded-md border border-[#DDD0C0] bg-[#FFFDF9] px-2.5 py-1.5 text-[11px] font-semibold text-[#5A4F46] transition-colors hover:border-[#B3261E]/60 hover:text-[#B3261E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Quay lại giới thiệu
      </button>
      {/* Editorial Header & Storytelling Introduction (above both columns) */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
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

      {/* Two-Column Layout on Desktop: Form (Left) & Garment Preview (Right); Stacked on Mobile (Form first, preview underneath) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form with exactly 3 dropdowns */}
        <div className="lg:col-span-7 bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#EAE3D6] pb-3">
            <h2 className="text-base sm:text-lg font-bold text-[#2B231D]">
              Thông Tin Khởi Đầu
            </h2>
            <p className="text-xs text-[#7A6E63] mt-0.5">
              Chọn trang phục di sản cốt lõi và không gian diện đồ
            </p>
          </div>

          {/* Dropdown 1: Việt phục */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="select-core-garment"
                className="text-sm sm:text-base font-semibold text-[#2B231D]"
              >
                1. Việt phục
              </label>
              <span className="text-xs text-[#7A6E63] inline-flex items-center gap-1">
                {confirmedIntroFields?.coreGarment ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#B3261E]" />
                    <span className="text-[#B3261E] font-medium">Đã chọn từ mở đầu</span>
                  </>
                ) : (
                  '5 dáng áo tiêu biểu'
                )}
              </span>
            </div>

            <div className="relative">
              <select
                ref={coreGarmentSelectRef}
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
          </div>

          {/* Dropdown 2: Dịp */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="select-occasion"
                className="text-sm sm:text-base font-semibold text-[#2B231D]"
              >
                2. Dịp
              </label>
              <span className="text-xs text-[#7A6E63] inline-flex items-center gap-1">
                {confirmedIntroFields?.occasion ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#B3261E]" />
                    <span className="text-[#B3261E] font-medium">Đã chọn từ mở đầu</span>
                  </>
                ) : (
                  'Mục đích diện đồ'
                )}
              </span>
            </div>

            <div className="relative">
              <select
                ref={occasionSelectRef}
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

          {/* Dropdown 3: Địa điểm / bối cảnh */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="select-location"
                className="text-sm sm:text-base font-semibold text-[#2B231D]"
              >
                3. Địa điểm / bối cảnh
              </label>
              <span className="text-xs text-[#7A6E63] inline-flex items-center gap-1">
                {confirmedIntroFields?.location ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#B3261E]" />
                    <span className="text-[#B3261E] font-medium">Đã chọn từ mở đầu</span>
                  </>
                ) : (
                  'Không gian diện đồ'
                )}
              </span>
            </div>

            <div className="relative">
              <select
                ref={locationSelectRef}
                id="select-location"
                value={setupData.location}
                onChange={(e) => onChangeSetup({ location: e.target.value })}
                className="w-full appearance-none bg-[#FAF7EE] text-[#2B231D] text-sm sm:text-base font-medium px-4 py-3 rounded-xs border border-[#DDD0C0] hover:border-[#B3261E]/50 focus:outline-none focus:border-[#B3261E] focus:ring-1 focus:ring-[#B3261E]/30 transition-colors cursor-pointer pr-10"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#5A4F46]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-3">
            <button
              type="button"
              onClick={onSubmit}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#B3261E] hover:bg-[#9A1F18] text-white text-sm sm:text-base font-semibold rounded-xs shadow-xs transition-all duration-200 cursor-pointer active:scale-98"
            >
              <span>Tiếp tục chọn phong cách →</span>
            </button>
            <p className="text-[11px] text-[#7A6E63] text-center mt-2">
              Bước kế tiếp: Định hướng phong cách, màu sắc chủ đạo & xem ý niệm concept
            </p>
          </div>
        </div>

        {/* Right Column: Garment Preview (Desktop: right; Mobile: underneath form) */}
        <div className="lg:col-span-5 w-full">
          <GarmentPreview coreGarment={setupData.coreGarment} />
        </div>
      </div>
    </motion.div>
  );
};
