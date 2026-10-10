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
  Check,
  MapPin,
  Calendar,
  BookOpen,
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
  onOpenCoreDetail: (id: CoreVietPhucId) => void;
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


// Pointer feedback is written at most once per animation frame, without React renders.
function useExhibitPointer(enabled: boolean) {
  const active = useRef<{ host: HTMLDivElement; surface: HTMLElement; maxTilt: number } | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);
  const mouseMedia = useRef<MediaQueryList | null>(null);
  const reset = React.useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    if (active.current) {
      for (const name of ['--tilt-x', '--tilt-y', '--highlight-x', '--highlight-y', '--highlight-visible']) {
        active.current.surface.style.removeProperty(name);
      }
    }
    active.current = null;
  }, []);

  React.useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    mouseMedia.current = media;
    const handleChange = () => reset();
    media.addEventListener('change', handleChange);
    if (!enabled) reset();
    return () => {
      media.removeEventListener('change', handleChange);
      mouseMedia.current = null;
      reset();
    };
  }, [enabled, reset]);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || event.pointerType !== 'mouse' || !mouseMedia.current?.matches) return;
    const host = event.currentTarget;
    if (active.current?.host !== host) {
      reset();
      const surface = host.querySelector<HTMLElement>('.heritage-card');
      if (!surface) return;
      const configuredTilt = parseFloat(getComputedStyle(surface).getPropertyValue('--exhibit-tilt-max'));
      active.current = { host, surface, maxTilt: Math.min(3, Math.max(0, configuredTilt || 0)) };
    }
    pointer.current = { x: event.clientX, y: event.clientY };
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const current = active.current;
      if (!current?.host.isConnected) return;
      // Measure the un-tilted host to avoid feedback from the moving surface.
      const bounds = current.host.getBoundingClientRect();
      const photo = current.host.querySelector<HTMLElement>('.heritage-photo-frame')?.getBoundingClientRect();
      if (!bounds.width || !bounds.height || !photo?.width || !photo.height) return;
      const clamp = (value: number) => Math.max(0, Math.min(1, value));
      const x = clamp((pointer.current.x - bounds.left) / bounds.width);
      const y = clamp((pointer.current.y - bounds.top) / bounds.height);
      const highlightX = clamp((pointer.current.x - photo.left) / photo.width);
      const highlightY = clamp((pointer.current.y - photo.top) / photo.height);
      current.surface.style.setProperty('--tilt-x', `${(0.5 - y) * 2 * current.maxTilt}deg`);
      current.surface.style.setProperty('--tilt-y', `${(x - 0.5) * 2 * current.maxTilt}deg`);
      current.surface.style.setProperty('--highlight-x', `${highlightX * 100}%`);
      current.surface.style.setProperty('--highlight-y', `${highlightY * 100}%`);
      current.surface.style.setProperty('--highlight-visible', '1');
    });
  };
  return { onPointerMove, onPointerLeave: reset };
}

const ORDERED_CORE_GARMENT_IDS: CoreVietPhucId[] = [
  'ao-nhat-binh',
  'ao-tac',
  'ao-dai',
  'ao-tu-than',
  'ao-ngu-than',
];

const OCCASION_SUBTITLES: Record<string, string> = {
  'Chụp ảnh kỷ niệm / Lookbook': 'Tôn vinh thần thái và form dáng cổ phục qua từng khung hình nghệ thuật',
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
  onOpenCoreDetail,
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

  const exhibitPointer = useExhibitPointer(introStep === 1 && !shouldReduceMotion);

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
      className={introStep === 1 ? 'heritage-gallery-shell' : undefined}
    >
      <div className={`max-w-[1440px] mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6 ${introStep === 1 ? 'heritage-gallery-content' : 'overflow-x-hidden'}`}>
      {/* Top Bar: Step Progress Breadcrumb & Prominent "Bỏ qua mở đầu" Action */}
      <div className="heritage-intro-navigation flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE3D6] pb-4">
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
          <span>Bỏ qua mở đầu</span>
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
            className="heritage-garment-step space-y-4 sm:space-y-5 min-h-[calc(100dvh-4.75rem)] pt-1"
          >
            <StepMountAligner sectionRef={step1SectionRef} />
            {/* Editorial Welcome Hero */}
            <div className="heritage-garment-welcome max-w-3xl mx-auto text-center space-y-3">
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

            {/* One card per row on mobile/tablet; the desktop collection stays five columns. */}
            <div className="heritage-collection grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-4">
              {ORDERED_CORE_GARMENT_IDS.map((garmentId, index) => {
                const item = CORE_ITEMS[garmentId];
                const isExplicitlySelected =
                  confirmedFields.coreGarment && setupData.coreGarment === item.id;

                return (
                  <motion.div
                    key={`${item.id}-${welcomeReady ? 'ready' : 'modal'}`}
                    initial={playWelcomeEntrance ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: playWelcomeEntrance ? 0.19 + index * 0.055 : 0, ease: 'easeOut' }}
                    data-garment-card="true"
                    {...exhibitPointer}
                    className="group relative min-w-0 w-full"
                  >
                    <div
                      className="heritage-card relative h-full text-left rounded-xl p-4 flex flex-col justify-between"
                      data-selected={isExplicitlySelected}
                    >
                    {/* A full-card selection button and a separate profile button above it. */}
                    <button
                      type="button"
                      aria-label={`Chọn ${item.name}`}
                      aria-pressed={isExplicitlySelected}
                      onClick={() => handlePickGarment(item.id)}
                      className="absolute inset-0 z-10 rounded-xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EE]"
                    />
                    {/* Isolated garment photograph with fallback to the existing silhouette SVG */}
                    {(() => {
                      const demoMedia = getGarmentLayerPreview(item.id);
                      const photoSrc = demoMedia?.previewSrc;
                      const hasValidPhoto = Boolean(photoSrc && !failedGarmentImages[item.id]);

                      return (
                        <div className="heritage-photo-frame relative w-full h-[205px] sm:h-[220px] rounded-lg flex items-center justify-center p-2.5 my-1 overflow-hidden">
                          {hasValidPhoto ? (
                            <div className="relative z-[1] w-full h-full flex items-center justify-center">
                              <img
                                src={photoSrc}
                                alt={`Ảnh tách nền trang phục ${item.name}`}
                                onError={() =>
                                  setFailedGarmentImages((prev) => ({ ...prev, [item.id]: true }))
                                }
                                loading="lazy"
                                className="w-full h-full object-contain object-center"
                              />
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[9px] font-mono tracking-tight text-[#7A6E63] bg-[#FFFDF9]/90 backdrop-blur-[2px] rounded-xs border border-[#E5DEC9]">
                                Trang phục
                              </span>
                            </div>
                          ) : (
                            <GarmentSilhouetteSvg
                              coreGarment={item.id}
                              className="relative z-[1] w-full h-full max-h-[195px] mx-auto select-none"
                            />
                          )}
                        </div>
                      );
                    })()}

                    {/* Garment Title & Short Description */}
                    <div className="heritage-card-copy mt-3.5 space-y-1.5 w-full">
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

                      <p className="text-xs font-medium text-[#5A4F46]">
                        {item.subTitle}
                      </p>

                      <button
                        type="button"
                        aria-label={`Hồ sơ cổ phục: ${item.name}`}
                        aria-haspopup="dialog"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenCoreDetail(item.id);
                        }}
                        className="relative z-20 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#DDD0C0] bg-[#FAF7EE] px-3 py-2 text-xs font-semibold text-[#B3261E] transition-colors hover:border-[#B3261E] hover:bg-[#FAF3EB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFDF9] cursor-pointer"
                      >
                        <BookOpen aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                        <span>Hồ sơ cổ phục</span>
                      </button>
                    </div>

                    {/* Action Prompt Footer */}
                    <div className="heritage-card-action mt-4 pt-2.5 border-t border-[#EFE8DC] w-full flex items-center justify-between text-xs font-semibold text-[#B3261E]">
                      <span>{isExplicitlySelected ? 'Tiếp tục với áo này' : 'Chọn dáng áo này'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </div>
                    </div>
                  </motion.div>
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
      </div>
    </motion.div>
  );
};
