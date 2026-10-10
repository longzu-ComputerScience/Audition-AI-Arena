import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CoreVietPhucId, SetupData } from '../types';
import { CORE_ITEMS, OCCASIONS, LOCATIONS } from '../data/mockFashionData';
import { getGarmentLayerPreview } from '../data/layeredOutfitMap';
import { GarmentSilhouetteSvg } from './GarmentPreview';
import { alignElementBelowStickyHeader } from '../utils/scrollAlignment';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  MapPin,
  Calendar,
} from 'lucide-react';

export interface ConfirmedIntroFields {
  coreGarment: boolean;
  occasion: boolean;
  location: boolean;
}

interface InteractiveOnboardingProps {
  setupData: SetupData;
  confirmedFields: ConfirmedIntroFields;
  welcomeReady: boolean;
  restartFromGarmentSelection: boolean;
  onSelectCoreGarment: (id: CoreVietPhucId) => void;
  onSelectOccasion: (occasion: string) => void;
  onSelectLocation: (location: string) => void;
  onSkip: () => void;
}

// Align only when the incoming motion.section mounts; never scroll the outgoing screen.
const StepMountAligner: React.FC<{ sectionRef: React.RefObject<HTMLElement | null> }> = ({ sectionRef }) => {
  React.useLayoutEffect(() => {
    alignElementBelowStickyHeader(sectionRef.current, 10);
  }, [sectionRef]);
  return null;
};

const ORDERED_CORE_GARMENT_IDS: CoreVietPhucId[] = [
  'ao-nhat-binh',
  'ao-tac',
  'ao-dai',
  'ao-tu-than',
  'ao-ngu-than',
];

const OCCASION_SUBTITLES: Record<string, string> = {
  'Chụp ảnh kỷ niệm / Lookbook': 'Tôn vinh thần thái và phom dáng cổ phục qua từng khung hình nghệ thuật',
  'Sự kiện trang trọng': 'Phong thái đĩnh đạc, chỉn chu cho những buổi lễ và gặp gỡ trang nghiêm',
  'Lễ hội ở trường': 'Trẻ trung, nổi bật và giàu bản sắc văn hóa trong không gian học đường',
  'Đi chơi cuối tuần': 'Phóng khoáng, thoải mái dạo phố, thưởng trà hoặc cà phê cùng bạn bè',
  'Đón Tết cổ truyền': 'Rạng rỡ sắc xuân di sản trong những ngày đầu năm sum vầy',
  'Lễ tốt nghiệp / Bế giảng': 'Dấu ấn trưởng thành đáng nhớ giao thoa giữa truyền thống và hiện đại',
  'Đám cưới / Ăn hỏi bạn bè': 'Thanh lịch, tinh tế và trang nhã trong ngày vui trọng đại',
};

export const InteractiveOnboarding: React.FC<InteractiveOnboardingProps> = ({
  setupData,
  confirmedFields,
  welcomeReady,
  restartFromGarmentSelection,
  onSelectCoreGarment,
  onSelectOccasion,
  onSelectLocation,
  onSkip,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Internal onboarding sub-step: 1 (Việt phục) | 2 (Dịp) | 3 (Bối cảnh)
  const [introStep, setIntroStep] = useState<1 | 2 | 3>(() => {
    if (restartFromGarmentSelection) return 1;
    if (confirmedFields.coreGarment && confirmedFields.occasion) return 3;
    if (confirmedFields.coreGarment) return 2;
    return 1;
  });

  const step1SectionRef = useRef<HTMLElement | null>(null);
  const step2SectionRef = useRef<HTMLElement | null>(null);
  const step3SectionRef = useRef<HTMLElement | null>(null);
  const welcomeWasShownRef = useRef(false);
  // Keep the background visible under the opening modal; play the welcome reveal
  // when the visitor dismisses it, instead of completing the animation behind the overlay.
  const playWelcomeEntrance = introStep === 1 && welcomeReady && !welcomeWasShownRef.current && !shouldReduceMotion;
  React.useEffect(() => {
    if (introStep === 1 && welcomeReady) welcomeWasShownRef.current = true;
  }, [introStep, welcomeReady]);

  // Re-align the garment collection once after dismissing the opening introduction.
  // The separate section mount aligner still handles normal 1/2/3 onboarding navigation.
  React.useLayoutEffect(() => {
    if (welcomeReady && introStep === 1) {
      alignElementBelowStickyHeader(step1SectionRef.current, 0);
    }
  }, [welcomeReady]);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);
  const [failedGarmentImages, setFailedGarmentImages] = useState<Record<string, boolean>>({});

  // Track user-initiated step transitions so keyboard focus moves cleanly to the new step heading
  const shouldFocusStepHeadingRef = useRef<boolean>(false);

  const navigateToIntroStep = (nextStep: 1 | 2 | 3) => {
    shouldFocusStepHeadingRef.current = true;
    setIntroStep(nextStep);
    // The incoming step aligns itself when mounted after the outgoing fade.
  };

  const handleStepHeadingMount = React.useCallback((headingEl: HTMLHeadingElement | null) => {
    if (headingEl && shouldFocusStepHeadingRef.current) {
      shouldFocusStepHeadingRef.current = false;
      requestAnimationFrame(() => {
        headingEl.focus({ preventScroll: true });
      });
    }
  }, []);

  const updateCarouselScrollState = React.useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(maxScrollLeft - el.scrollLeft > 6);
  }, []);

  React.useEffect(() => {
    if (introStep !== 1) return;
    const el = carouselRef.current;
    if (!el) return;

    updateCarouselScrollState();
    const observer = new ResizeObserver(updateCarouselScrollState);
    observer.observe(el);
    window.addEventListener('resize', updateCarouselScrollState);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateCarouselScrollState);
    };
  }, [introStep, updateCarouselScrollState]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;

    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-garment-card="true"]'));
    let stepWidth = 264;
    if (cards.length >= 2) {
      const measuredDelta = cards[1].offsetLeft - cards[0].offsetLeft;
      if (measuredDelta > 0) {
        stepWidth = measuredDelta;
      }
    } else if (cards.length === 1) {
      stepWidth = cards[0].getBoundingClientRect().width + 16;
    }

    el.scrollBy({
      left: direction === 'left' ? -stepWidth : stepWidth,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  };

  const selectedCoreItem = CORE_ITEMS[setupData.coreGarment] || CORE_ITEMS['ao-ngu-than'];

  const handlePickGarment = (id: CoreVietPhucId) => {
    onSelectCoreGarment(id);
    navigateToIntroStep(2);
  };

  const handlePickOccasion = (occ: string) => {
    onSelectOccasion(occ);
    navigateToIntroStep(3);
  };

  const handlePickLocation = (loc: string) => {
    onSelectLocation(loc);
  };

  const stepTransition = {
    duration: shouldReduceMotion ? 0 : 0.22,
    ease: 'easeOut' as const,
  };

  return (
    <motion.div
      data-page="onboarding"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
      className="max-w-[1440px] mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6 overflow-x-hidden"
    >
      {/* Top Bar: Step Progress Breadcrumb & Prominent "Bỏ qua giới thiệu" Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE3D6] pb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {introStep > 1 && (
            <button
              type="button"
              onClick={() => navigateToIntroStep((introStep > 1 ? introStep - 1 : 1) as 1 | 2 | 3)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#5A4F46] hover:text-[#2B231D] bg-[#FFFDF9] border border-[#DDD0C0] hover:border-[#B3261E]/60 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>
          )}

          <nav aria-label="Các bước khám phá mở đầu" className="flex items-center gap-1.5 sm:gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => introStep !== 1 && navigateToIntroStep(1)}
              aria-current={introStep === 1 ? 'step' : undefined}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] ${
                introStep === 1
                  ? 'bg-[#B3261E] text-white font-semibold'
                  : confirmedFields.coreGarment
                    ? 'bg-[#FFFDF9] text-[#2B231D] border border-[#DDD0C0] hover:border-[#B3261E]/60 font-medium'
                    : 'text-[#7A6E63]'
              }`}
            >
              <span className="font-mono tabular-nums">01.</span>
              <span>Việt phục</span>
              {confirmedFields.coreGarment && introStep !== 1 && (
                <Check className="w-3 h-3 text-[#B3261E]" />
              )}
            </button>

            <span className="text-[#C8BCAC]" aria-hidden="true">/</span>

            <button
              type="button"
              disabled={!confirmedFields.coreGarment && introStep < 2}
              onClick={() => confirmedFields.coreGarment && introStep !== 2 && navigateToIntroStep(2)}
              aria-current={introStep === 2 ? 'step' : undefined}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] ${
                introStep === 2
                  ? 'bg-[#B3261E] text-white font-semibold cursor-default'
                  : confirmedFields.coreGarment
                    ? 'bg-[#FFFDF9] text-[#2B231D] border border-[#DDD0C0] hover:border-[#B3261E]/60 font-medium cursor-pointer'
                    : 'text-[#B0A495] cursor-not-allowed'
              }`}
            >
              <span className="font-mono tabular-nums">02.</span>
              <span>Dịp diện đồ</span>
              {confirmedFields.occasion && introStep !== 2 && (
                <Check className="w-3 h-3 text-[#B3261E]" />
              )}
            </button>

            <span className="text-[#C8BCAC]" aria-hidden="true">/</span>

            <button
              type="button"
              disabled={(!confirmedFields.coreGarment || !confirmedFields.occasion) && introStep < 3}
              onClick={() =>
                confirmedFields.coreGarment &&
                confirmedFields.occasion &&
                introStep !== 3 &&
                navigateToIntroStep(3)
              }
              aria-current={introStep === 3 ? 'step' : undefined}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] ${
                introStep === 3
                  ? 'bg-[#B3261E] text-white font-semibold cursor-default'
                  : confirmedFields.coreGarment && confirmedFields.occasion
                    ? 'bg-[#FFFDF9] text-[#2B231D] border border-[#DDD0C0] hover:border-[#B3261E]/60 font-medium cursor-pointer'
                    : 'text-[#B0A495] cursor-not-allowed'
              }`}
            >
              <span className="font-mono tabular-nums">03.</span>
              <span>Bối cảnh</span>
            </button>
          </nav>
        </div>

        {/* Always-accessible Skip Intro Button */}
        <button
          type="button"
          onClick={onSkip}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#5A4F46] hover:text-[#B3261E] bg-[#FFFDF9] hover:bg-[#FAF3EB] border border-[#DDD0C0] hover:border-[#B3261E] rounded-lg transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E]"
        >
          <span>Bỏ qua giới thiệu</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Step Content */}
      <AnimatePresence mode="wait">
        {introStep === 1 && (
          <motion.section
            key="intro-step-1-garments"
            ref={step1SectionRef}
            initial={shouldReduceMotion || playWelcomeEntrance ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={stepTransition}
            className="space-y-4 sm:space-y-5 min-h-[calc(100dvh-4.75rem)] pt-1"
          >
            <StepMountAligner sectionRef={step1SectionRef} />
            {/* Editorial Welcome Hero */}
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <motion.span
                key={welcomeReady ? 'intro-label-ready' : 'intro-label-modal'}
                initial={playWelcomeEntrance ? { opacity: 0, y: 5 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.27, delay: playWelcomeEntrance ? 0.02 : 0, ease: 'easeOut' }}
                className="text-xs font-mono uppercase tracking-widest text-[#B3261E] block"
              >
                Triển lãm Khởi đầu · Năm Dáng Áo Di Sản
              </motion.span>
              <motion.h1
                key={welcomeReady ? 'intro-heading-ready' : 'intro-heading-modal'}
                ref={handleStepHeadingMount}
                tabIndex={-1}
                initial={playWelcomeEntrance ? { opacity: 0, y: 9 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: playWelcomeEntrance ? 0.09 : 0, ease: 'easeOut' }}
                className="text-2xl sm:text-4xl lg:text-[42px] font-editorial font-bold text-[#2B231D] tracking-tight leading-tight text-balance focus:outline-none"
              >
                Mỗi nếp vải mang một ký ức.
              </motion.h1>
              <motion.p
                key={welcomeReady ? 'intro-description-ready' : 'intro-description-modal'}
                initial={playWelcomeEntrance ? { opacity: 0, y: 6 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: playWelcomeEntrance ? 0.16 : 0, ease: 'easeOut' }}
                className="text-sm sm:text-base text-[#5A4F46] leading-relaxed max-w-2xl mx-auto font-serif"
              >
                Bạn sẽ kể tiếp câu chuyện Việt phục theo cách riêng, giữa nhịp sống hôm nay.
                Hãy chạm vào một dáng áo nguyên bản bên dưới để mở đầu bản phối của bạn.
              </motion.p>
            </div>

            {/* Mobile/Tablet Carousel Controls & Hint (< lg) */}
            <div className="flex lg:hidden items-center justify-between gap-2 px-1">
              <span className="text-xs text-[#7A6E63] font-serif italic">
                Vuốt ngang để xem cả 5 bộ Việt phục →
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={!canScrollLeft}
                  onClick={() => scrollCarousel('left')}
                  aria-label="Xem áo trước"
                  className="w-8 h-8 rounded-lg bg-[#FFFDF9] border border-[#DDD0C0] hover:border-[#B3261E] disabled:opacity-40 disabled:hover:border-[#DDD0C0] disabled:cursor-not-allowed text-[#4E433C] flex items-center justify-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={!canScrollRight}
                  onClick={() => scrollCarousel('right')}
                  aria-label="Xem áo tiếp theo"
                  className="w-8 h-8 rounded-lg bg-[#FFFDF9] border border-[#DDD0C0] hover:border-[#B3261E] disabled:opacity-40 disabled:hover:border-[#DDD0C0] disabled:cursor-not-allowed text-[#4E433C] flex items-center justify-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 5 Core Việt Phục Collection Showcase:
                - Desktop (lg+): 5-column side-by-side collection gallery
                - Mobile/Tablet (< lg): Horizontal touch-scroll snap carousel */}
            <div
              ref={carouselRef}
              onScroll={updateCarouselScrollState}
              className="flex lg:grid lg:grid-cols-5 gap-3.5 sm:gap-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory pb-3 lg:pb-0 no-scrollbar -mx-1 px-1 scroll-px-1"
            >
              {ORDERED_CORE_GARMENT_IDS.map((garmentId, index) => {
                const item = CORE_ITEMS[garmentId];
                const isExplicitlySelected =
                  confirmedFields.coreGarment && setupData.coreGarment === item.id;

                return (
                  <motion.button
                    key={`${item.id}-${welcomeReady ? 'ready' : 'modal'}`}
                    type="button"
                    initial={playWelcomeEntrance ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: playWelcomeEntrance ? 0.19 + index * 0.055 : 0, ease: 'easeOut' }}
                    data-garment-card="true"
                    onClick={() => handlePickGarment(item.id)}
                    className={`group snap-start shrink-0 w-[236px] min-[375px]:w-[252px] sm:w-[264px] lg:w-auto text-left rounded-xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] ${
                      isExplicitlySelected
                        ? 'bg-[#FFFDF9] border-2 border-[#B3261E] shadow-md'
                        : 'bg-[#FFFDF9] border border-[#E3D9CC] hover:border-[#B3261E] hover:shadow-sm'
                    }`}
                  >
                    {/* Card Top Metadata: Index + Era + Palette Dots */}
                    <div className="w-full flex items-center justify-between gap-2 border-b border-[#EFE8DC] pb-2.5 mb-3">
                      <span className="text-[11px] font-mono text-[#8C7E72] truncate">
                        0{index + 1} · {item.archiveCode}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.palette.map((swatch, idx) => (
                          <span
                            key={idx}
                            className="w-2.5 h-2.5 rounded-full border border-black/15"
                            style={{ backgroundColor: swatch.hex }}
                            title={swatch.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Isolated garment photograph with fallback to the existing silhouette SVG */}
                    {(() => {
                      const demoMedia = getGarmentLayerPreview(item.id);
                      const photoSrc = demoMedia?.previewSrc;
                      const hasValidPhoto = Boolean(photoSrc && !failedGarmentImages[item.id]);

                      return (
                        <div className="relative w-full h-[205px] sm:h-[220px] bg-[#FAF7EE]/75 group-hover:bg-[#FAF3EB]/80 rounded-lg border border-[#EAE3D6]/80 flex items-center justify-center p-2.5 my-1 transition-colors overflow-hidden">
                          {hasValidPhoto ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <img
                                src={photoSrc}
                                alt={`Ảnh tách nền trang phục ${item.name}`}
                                onError={() =>
                                  setFailedGarmentImages((prev) => ({ ...prev, [item.id]: true }))
                                }
                                loading="lazy"
                                className="w-full h-full object-contain object-center transition-transform duration-200 group-hover:scale-[1.03]"
                              />
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[9px] font-mono tracking-tight text-[#7A6E63] bg-[#FFFDF9]/90 backdrop-blur-[2px] rounded-xs border border-[#E5DEC9]">
                                Trang phục
                              </span>
                            </div>
                          ) : (
                            <GarmentSilhouetteSvg
                              coreGarment={item.id}
                              className="w-full h-full max-h-[195px] mx-auto select-none transition-transform duration-200 group-hover:scale-[1.03]"
                            />
                          )}
                        </div>
                      );
                    })()}

                    {/* Garment Title & Short Description */}
                    <div className="mt-3.5 space-y-1.5 w-full">
                      <div className="flex items-baseline justify-between gap-2">
                        <h2 className="text-base sm:text-lg font-editorial font-bold text-[#2B231D] group-hover:text-[#B3261E] transition-colors">
                          {item.name}
                        </h2>
                        {isExplicitlySelected && (
                          <span className="text-[10px] font-mono font-semibold text-[#B3261E]">
                            Đã chọn
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-[#8C3B24]">
                        {item.subTitle}
                      </p>

                      <p className="text-xs text-[#6E6257] leading-relaxed line-clamp-2 font-serif pt-0.5">
                        {item.editorialDescription}
                      </p>
                    </div>

                    {/* Action Prompt Footer */}
                    <div className="mt-4 pt-2.5 border-t border-[#EFE8DC] w-full flex items-center justify-between text-xs font-semibold text-[#B3261E]">
                      <span>{isExplicitlySelected ? 'Tiếp tục với áo này' : 'Chọn dáng áo này'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.section>
        )}

        {introStep === 2 && (
          <motion.section
            key="intro-step-2-occasions"
            ref={step2SectionRef}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={stepTransition}
            className="max-w-5xl mx-auto space-y-5 min-h-[calc(100dvh-4.75rem)] pt-1"
          >
            <StepMountAligner sectionRef={step2SectionRef} />
            {/* Selected Garment Context Strip */}
            <div className="bg-[#FFFDF9] border border-[#E3D9CC] rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-14 rounded-lg bg-[#FAF7EE] border border-[#EAE3D6] p-1 shrink-0 flex items-center justify-center">
                  <GarmentSilhouetteSvg
                    coreGarment={selectedCoreItem.id}
                    className="w-full h-full select-none"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#B3261E] block">
                    01. Việt phục đã chọn
                  </span>
                  <h3 className="text-sm sm:text-base font-editorial font-bold text-[#2B231D] truncate">
                    {selectedCoreItem.name} — {selectedCoreItem.subTitle}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateToIntroStep(1)}
                className="text-xs font-semibold text-[#B3261E] hover:underline cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] rounded px-2 py-1"
              >
                ← Đổi Việt phục
              </button>
            </div>

            {/* Step 2 Heading */}
            <div className="text-center space-y-2 max-w-2xl mx-auto pt-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#B3261E] inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Bước 02 / 03 · Chọn Dịp Diện Đồ</span>
              </span>
              <h1
                ref={handleStepHeadingMount}
                tabIndex={-1}
                className="text-2xl sm:text-3xl font-editorial font-bold text-[#2B231D] text-balance focus:outline-none"
              >
                Bạn dự định diện {selectedCoreItem.name} vào dịp nào?
              </h1>
              <p className="text-xs sm:text-sm text-[#5A4F46] font-serif">
                Chọn một mục đích diện đồ để hệ thống tự động chuyển sang gợi ý không gian tương ứng.
              </p>
            </div>

            {/* Occasion Cards Grid (Using exact OCCASIONS from mockFashionData) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {OCCASIONS.map((occ, idx) => {
                const isExplicitlySelected =
                  confirmedFields.occasion && setupData.occasion === occ;

                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => handlePickOccasion(occ)}
                    className={`group text-left rounded-xl p-4 sm:p-5 transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] ${
                      isExplicitlySelected
                        ? 'bg-[#FAF3EB] border-2 border-[#B3261E] shadow-xs'
                        : 'bg-[#FFFDF9] hover:bg-[#FAF7EE] border border-[#E3D9CC] hover:border-[#B3261E]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-[#8C7E72]">
                          Dịp 0{idx + 1}
                        </span>
                        {isExplicitlySelected && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#B3261E]">
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã chọn</span>
                          </span>
                        )}
                      </div>

                      <h2 className="text-base font-editorial font-bold text-[#2B231D] group-hover:text-[#B3261E] transition-colors">
                        {occ}
                      </h2>

                      <p className="text-xs text-[#6E6257] font-serif leading-relaxed">
                        {OCCASION_SUBTITLES[occ] ||
                          'Định hình phong thái và phụ kiện hài hòa với không khí buổi xuất hiện.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#EFE8DC] flex items-center justify-between text-xs font-semibold text-[#B3261E]">
                      <span>{isExplicitlySelected ? 'Tiếp tục với dịp này' : 'Chọn dịp này'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.section>
        )}

        {introStep === 3 && (
          <motion.section
            key="intro-step-3-locations"
            ref={step3SectionRef}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={stepTransition}
            className="max-w-5xl mx-auto space-y-5 min-h-[calc(100dvh-4.75rem)] pt-1"
          >
            <StepMountAligner sectionRef={step3SectionRef} />
            {/* Selected Garment & Occasion Summary Strip */}
            <div className="bg-[#FFFDF9] border border-[#E3D9CC] rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-14 rounded-lg bg-[#FAF7EE] border border-[#EAE3D6] p-1 shrink-0 flex items-center justify-center">
                  <GarmentSilhouetteSvg
                    coreGarment={selectedCoreItem.id}
                    className="w-full h-full select-none"
                  />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 text-xs text-[#7A6E63] flex-wrap">
                    <span className="font-semibold text-[#2B231D]">{selectedCoreItem.name}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#B3261E] font-medium">{setupData.occasion}</span>
                  </div>
                  <p className="text-[11px] text-[#7A6E63] font-serif">
                    Đã lưu 2/3 lựa chọn khởi đầu
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => navigateToIntroStep(1)}
                  className="text-[#5A4F46] hover:text-[#B3261E] hover:underline cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] rounded px-1.5 py-0.5"
                >
                  Đổi Việt phục
                </button>
                <span className="text-[#C8BCAC]" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => navigateToIntroStep(2)}
                  className="text-[#B3261E] hover:underline cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] rounded px-1.5 py-0.5"
                >
                  ← Đổi Dịp
                </button>
              </div>
            </div>

            {/* Step 3 Heading */}
            <div className="text-center space-y-2 max-w-2xl mx-auto pt-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#B3261E] inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Bước 03 / 03 · Chọn Bối Cảnh & Không Gian</span>
              </span>
              <h1
                ref={handleStepHeadingMount}
                tabIndex={-1}
                className="text-2xl sm:text-3xl font-editorial font-bold text-[#2B231D] text-balance focus:outline-none"
              >
                Không gian nào sẽ đồng hành cùng bản phối của bạn?
              </h1>
              <p className="text-xs sm:text-sm text-[#5A4F46] font-serif">
                Chạm vào địa điểm để hoàn tất khám phá mở đầu và bước sang định hướng phong cách & bảng màu.
              </p>
            </div>

            {/* Locations Grid (Using exact LOCATIONS from mockFashionData) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {LOCATIONS.map((loc, idx) => {
                const isExplicitlySelected =
                  confirmedFields.location && setupData.location === loc;

                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handlePickLocation(loc)}
                    className={`group text-left rounded-xl p-4 transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 min-h-[64px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] ${
                      isExplicitlySelected
                        ? 'bg-[#FAF3EB] border-2 border-[#B3261E] shadow-xs'
                        : 'bg-[#FFFDF9] hover:bg-[#FAF7EE] border border-[#E3D9CC] hover:border-[#B3261E]'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-[#8C7E72] block">
                        Bối cảnh {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm sm:text-base font-editorial font-bold text-[#2B231D] group-hover:text-[#B3261E] transition-colors block truncate">
                        {loc}
                      </span>
                    </div>

                    <span className="w-7 h-7 rounded-full bg-[#FAF7EE] group-hover:bg-[#B3261E] text-[#B3261E] group-hover:text-white border border-[#EAE3D6] group-hover:border-[#B3261E] flex items-center justify-center shrink-0 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
