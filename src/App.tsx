import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  SetupData,
  ActiveSupportItems,
  SupportOption,
  SupportCategoryId,
  GuardrailResult,
  AIStatusInfo,
  CoreVietPhucId,
} from './types';
import {
  CORE_ITEMS,
  SUPPORT_ITEMS,
  generateConcept,
  findBestSupportCombination,
} from './data/mockFashionData';
import {
  computeActualRemix,
  evaluateGuardrail,
} from './utils/fashionCalculations';
import { fetchAIStatus } from './services/aiStylistApi';
import { Header } from './components/Header';
import { DiscoveryScreen } from './components/DiscoveryScreen';
import {
  InteractiveOnboarding,
  ConfirmedIntroFields,
} from './components/InteractiveOnboarding';
import { ConceptReveal } from './components/ConceptReveal';
import { RemixStudio } from './components/RemixStudio';
import { LookbookModal } from './components/LookbookModal';
import { AboutModal } from './components/AboutModal';

export default function App() {
  // Global Step State: 1 | 2 | 3
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<1 | 2 | 3>(1);

  // Separate Interactive Onboarding State (Iteration 3B) — distinct from DiscoveryScreen's text animation hasSeenIntro
  const [onboardingState, setOnboardingState] = useState<'active' | 'skipped' | 'completed'>('active');
  const [confirmedIntroFields, setConfirmedIntroFields] = useState<ConfirmedIntroFields>({
    coreGarment: false,
    occasion: false,
    location: false,
  });
  const [pendingSkipFocus, setPendingSkipFocus] = useState<boolean>(false);

  // Navigate to step and remember the highest unlocked step
  const goToStep = (targetStep: 1 | 2 | 3) => {
    setStep(targetStep);
    setMaxUnlockedStep((prev) => (targetStep > prev ? targetStep : prev));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  // Intro text word-by-word animation play-only-once state for DiscoveryScreen
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(false);

  // Global Setup Data (Step 1 inputs)
  const [setupData, setSetupData] = useState<SetupData>({
    coreGarment: 'ao-ngu-than',
    occasion: 'Chụp ảnh kỷ niệm / Lookbook',
    location: 'Đại Nội Huế',
    style: 'Thanh lịch',
    preferredColor: 'Để hệ thống gợi ý',
  });

  // Global Support Items (Step 3 active slots)
  const [activeSupportItems, setActiveSupportItems] = useState<ActiveSupportItems>({
    bottom: SUPPORT_ITEMS.bottom[0], // Quần Lụa Ống Rộng (15)
    shoes: SUPPORT_ITEMS.shoes[0], // Guốc Mộc Sơn Mài (10)
    bag: SUPPORT_ITEMS.bag[0], // Túi Gấm Cổ Điển (20)
    accent: null, // Optional slot null by default
  });

  // Derived: Actual Remix MUST be a derived value, not stored in state!
  const actualRemix = useMemo(() => {
    return computeActualRemix(activeSupportItems);
  }, [activeSupportItems]);

  // Single unified Remix Dial slider value (0–100)
  const [remixDialValue, setRemixDialValue] = useState<number>(() =>
    computeActualRemix({
      bottom: SUPPORT_ITEMS.bottom[0],
      shoes: SUPPORT_ITEMS.shoes[0],
      bag: SUPPORT_ITEMS.bag[0],
      accent: null,
    })
  );

  // Shared AI Availability status across Stylist and Image Generator
  const [aiStatus, setAiStatus] = useState<AIStatusInfo>({
    isAvailable: false,
    hasApiKey: false,
    loading: true,
  });

  // Fetch AI status on mount
  useEffect(() => {
    fetchAIStatus().then((status) => {
      setAiStatus(status);
    });
  }, []);

  // Refinement text & Cultural Guardrail
  const [refinementText, setRefinementText] = useState<string>('');
  const [guardrailResult, setGuardrailResult] = useState<GuardrailResult>({
    status: 'green',
    message: 'Cấu trúc di sản cốt lõi được bảo toàn nguyên vẹn.',
  });

  // Modals state
  const [isLookbookOpen, setIsLookbookOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Derived: Current Core Item
  const currentCore = useMemo(() => {
    return CORE_ITEMS[setupData.coreGarment] || CORE_ITEMS['ao-ngu-than'];
  }, [setupData.coreGarment]);

  // Derived: Concept Data for Step 2
  const concept = useMemo(() => {
    return generateConcept(setupData);
  }, [setupData]);

  // Keep Cultural Guardrail synchronized with current styling snapshot
  useEffect(() => {
    const result = evaluateGuardrail(
      refinementText,
      currentCore,
      activeSupportItems,
      setupData,
      actualRemix
    );
    setGuardrailResult(result);
  }, [refinementText, currentCore, activeSupportItems, setupData, actualRemix]);

  // Handle changing setup fields in Step 1 and Step 2
  const handleChangeSetup = (data: Partial<SetupData>) => {
    // Only when user actually changes coreGarment to a DIFFERENT garment:
    if (data.coreGarment && data.coreGarment !== setupData.coreGarment) {
      const nextCoreId = data.coreGarment;
      const nextCore = CORE_ITEMS[nextCoreId] || CORE_ITEMS['ao-ngu-than'];

      // Reset activeSupportItems to a deterministic local baseline using findBestSupportCombination() and current remixDialValue
      // Preserve whether the optional Accent slot is active
      const hasAccent = activeSupportItems.accent !== null;
      const baselineCombination = findBestSupportCombination(remixDialValue, hasAccent);
      setActiveSupportItems(baselineCombination);
      setRemixDialValue(computeActualRemix(baselineCombination));

      // Reevaluate existing refinement/Guardrail status against the new core if needed
      if (refinementText) {
        const result = evaluateGuardrail(refinementText, nextCore);
        setGuardrailResult(result);
      }
    }

    setSetupData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  // When user drags Remix Dial slider (0–100):
  // 1. Freely moves slider position according to user drag
  // 2. Searches catalog for best support combination
  // 3. Only updates outfit if a strictly better/different combination is found
  // 4. Never snaps back; outfit stays until a better combination is reached
  const handleRemixDialChange = (newDialValue: number) => {
    setRemixDialValue(newDialValue);
    const hasAccent = activeSupportItems.accent !== null;
    const bestCombination = findBestSupportCombination(newDialValue, hasAccent, activeSupportItems);

    const isDifferent =
      bestCombination.bottom.id !== activeSupportItems.bottom.id ||
      bestCombination.shoes.id !== activeSupportItems.shoes.id ||
      bestCombination.bag.id !== activeSupportItems.bag.id ||
      bestCombination.accent?.id !== activeSupportItems.accent?.id;

    if (isDifferent) {
      setActiveSupportItems(bestCombination);
    }
  };

  // Manual selection:
  // Updates only target support slot, recalculates derived actualRemix, and synchronizes slider to new actualRemix!
  const handleSelectSupportItem = (category: SupportCategoryId, item: SupportOption) => {
    const nextItems: ActiveSupportItems = {
      ...activeSupportItems,
      [category]: item,
    };
    setActiveSupportItems(nextItems);
    setRemixDialValue(computeActualRemix(nextItems));
  };

  // Add optional accent -> recalculates actualRemix & synchronizes slider
  const handleAddAccent = () => {
    const nextItems: ActiveSupportItems = {
      ...activeSupportItems,
      accent: SUPPORT_ITEMS.accent[0],
    };
    setActiveSupportItems(nextItems);
    setRemixDialValue(computeActualRemix(nextItems));
  };

  // Remove optional accent -> recalculates actualRemix & synchronizes slider
  const handleRemoveAccent = () => {
    const nextItems: ActiveSupportItems = {
      ...activeSupportItems,
      accent: null,
    };
    setActiveSupportItems(nextItems);
    setRemixDialValue(computeActualRemix(nextItems));
  };

  // Apply refinement text -> evaluates Cultural Guardrail locally
  const handleApplyRefinement = (text: string) => {
    setRefinementText(text);
    const result = evaluateGuardrail(text, currentCore);
    setGuardrailResult(result);
  };

  // Shared routing logic when user finishes or skips Interactive Onboarding
  const resolvePostOnboardingNavigation = (
    status: 'skipped' | 'completed',
    confirmed: ConfirmedIntroFields
  ) => {
    setOnboardingState(status);
    const hasCompletedAllThree =
      confirmed.coreGarment && confirmed.occasion && confirmed.location;

    if (!hasCompletedAllThree) {
      // Partial or zero selection -> go to classic Page 1 form while preserving chosen fields
      setPendingSkipFocus(true);
      goToStep(1);
      return;
    }

    // All 3 fields explicitly confirmed:
    // Only allow jumping directly to Page 3 if the user has already unlocked Remix (completed Page 2 before)
    if (maxUnlockedStep === 3) {
      goToStep(3);
    } else {
      goToStep(2);
    }
  };

  const handleOnboardingSelectCore = (garmentId: CoreVietPhucId) => {
    handleChangeSetup({ coreGarment: garmentId });
    setConfirmedIntroFields((prev) => ({ ...prev, coreGarment: true }));
  };

  const handleOnboardingSelectOccasion = (occasion: string) => {
    handleChangeSetup({ occasion });
    setConfirmedIntroFields((prev) => ({ ...prev, occasion: true }));
  };

  const handleOnboardingSelectLocation = (location: string) => {
    handleChangeSetup({ location });
    const nextConfirmed: ConfirmedIntroFields = {
      ...confirmedIntroFields,
      location: true,
    };
    setConfirmedIntroFields(nextConfirmed);
    resolvePostOnboardingNavigation('completed', nextConfirmed);
  };

  const handleSkipOnboarding = () => {
    resolvePostOnboardingNavigation('skipped', confirmedIntroFields);
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#2B231D] flex flex-col font-sans selection:bg-[#B3261E]/20 selection:text-[#B3261E]">
      {/* Header with unlocked visited steps navigation */}
      <Header
        currentStep={step}
        maxUnlockedStep={maxUnlockedStep}
        onStepClick={(targetStep) => {
          if (onboardingState === 'active' && targetStep === 1) {
            return;
          }
          goToStep(targetStep);
        }}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Multi-step Content (Preserving state across back/forward navigation) */}
      <main className="flex-1 w-full">
        <AnimatePresence mode="wait">
          {step === 1 && onboardingState === 'active' && (
            <InteractiveOnboarding
              key="step-1-onboarding"
              setupData={setupData}
              confirmedFields={confirmedIntroFields}
              onSelectCoreGarment={handleOnboardingSelectCore}
              onSelectOccasion={handleOnboardingSelectOccasion}
              onSelectLocation={handleOnboardingSelectLocation}
              onSkip={handleSkipOnboarding}
            />
          )}

          {step === 1 && onboardingState !== 'active' && (
            <DiscoveryScreen
              key="step-1-discovery"
              setupData={setupData}
              onChangeSetup={handleChangeSetup}
              onSubmit={() => goToStep(2)}
              hasSeenIntro={hasSeenIntro}
              onIntroComplete={() => setHasSeenIntro(true)}
              confirmedIntroFields={confirmedIntroFields}
              shouldFocusFirstUnconfirmed={pendingSkipFocus}
              onConsumedInitialFocus={() => setPendingSkipFocus(false)}
            />
          )}

          {step === 2 && (
            <ConceptReveal
              key="step-2"
              setupData={setupData}
              concept={concept}
              onChangeSetup={handleChangeSetup}
              onBack={() => goToStep(1)}
              onProceed={() => goToStep(3)}
            />
          )}

          {step === 3 && (
            <RemixStudio
              key="step-3"
              core={currentCore}
              supportItems={activeSupportItems}
              setupData={setupData}
              remixDialValue={remixDialValue}
              actualRemix={actualRemix}
              refinementText={refinementText}
              guardrailResult={guardrailResult}
              aiStatus={aiStatus}
              onRemixDialChange={handleRemixDialChange}
              onSelectSupportItem={handleSelectSupportItem}
              onAddAccent={handleAddAccent}
              onRemoveAccent={handleRemoveAccent}
              onApplyRefinement={handleApplyRefinement}
              onBackToConcept={() => goToStep(2)}
              onOpenCoreDetail={() => setIsLookbookOpen(true)}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAE3D6] py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-[#7A6E63] font-serif">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Việt Phục Remix © 2026 · Fashion Editorial Styling Studio
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-[#B3261E]">
            <button
              type="button"
              onClick={() => setIsAboutOpen(true)}
              className="hover:underline cursor-pointer"
            >
              Triết lý thiết kế
            </button>
            <span aria-hidden="true" className="text-[#C8BCAC]">·</span>
            <button
              type="button"
              onClick={() => setIsLookbookOpen(true)}
              className="hover:underline cursor-pointer"
            >
              Hồ sơ cổ phục
            </button>
          </div>
        </div>
      </footer>

      {/* Detail Modals */}
      <LookbookModal
        core={currentCore}
        isOpen={isLookbookOpen}
        onClose={() => setIsLookbookOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
