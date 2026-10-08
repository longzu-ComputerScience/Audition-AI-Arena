import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  SetupData,
  ActiveSupportItems,
  SupportOption,
  SupportCategoryId,
  GuardrailResult,
  AIStatusInfo,
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
import { ConceptReveal } from './components/ConceptReveal';
import { RemixStudio } from './components/RemixStudio';
import { LookbookModal } from './components/LookbookModal';
import { AboutModal } from './components/AboutModal';

export default function App() {
  // Global Step State: 1 | 2 | 3
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Intro animation play-only-once state
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

  // Target Remix: slider 0–100
  const [targetRemix, setTargetRemix] = useState<number>(45);

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

  // Derived: Actual Remix MUST be a derived value, not stored in state!
  const actualRemix = useMemo(() => {
    return computeActualRemix(activeSupportItems);
  }, [activeSupportItems]);

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

      // Reset activeSupportItems to a deterministic local baseline using findBestSupportCombination() and current targetRemix
      // Preserve whether the optional Accent slot is active
      const hasAccent = activeSupportItems.accent !== null;
      const baselineCombination = findBestSupportCombination(targetRemix, hasAccent);
      setActiveSupportItems(baselineCombination);

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

  // When Target Remix slider changes:
  // Search local support catalog for a combination whose average modernityScore is closest to Target
  // Updates support selections immediately; actualRemix is derived again.
  const handleTargetRemixChange = (newTarget: number) => {
    setTargetRemix(newTarget);
    const hasAccent = activeSupportItems.accent !== null;
    const bestCombination = findBestSupportCombination(newTarget, hasAccent);
    setActiveSupportItems(bestCombination);
  };

  // Manual selection:
  // Updates only that support slot, recalculates derived actualRemix, does NOT move targetRemix!
  const handleSelectSupportItem = (category: SupportCategoryId, item: SupportOption) => {
    setActiveSupportItems((prev) => ({
      ...prev,
      [category]: item,
    }));
  };

  // Add optional accent
  const handleAddAccent = () => {
    setActiveSupportItems((prev) => ({
      ...prev,
      accent: SUPPORT_ITEMS.accent[0],
    }));
  };

  // Remove optional accent
  const handleRemoveAccent = () => {
    setActiveSupportItems((prev) => ({
      ...prev,
      accent: null,
    }));
  };

  // Apply refinement text -> evaluates Cultural Guardrail locally
  const handleApplyRefinement = (text: string) => {
    setRefinementText(text);
    const result = evaluateGuardrail(text, currentCore);
    setGuardrailResult(result);
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#2B231D] flex flex-col font-sans selection:bg-[#B3261E]/20 selection:text-[#B3261E]">
      {/* Header with subtle step indicator: 01 Khám phá — 02 Concept — 03 Remix */}
      <Header
        currentStep={step}
        onStepClick={(targetStep) => setStep(targetStep)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Multi-step Content (Preserving state across back/forward navigation) */}
      <main className="flex-1 w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <DiscoveryScreen
              key="step-1"
              setupData={setupData}
              onChangeSetup={handleChangeSetup}
              onSubmit={() => setStep(2)}
              hasSeenIntro={hasSeenIntro}
              onIntroComplete={() => setHasSeenIntro(true)}
            />
          )}

          {step === 2 && (
            <ConceptReveal
              key="step-2"
              setupData={setupData}
              concept={concept}
              onChangeSetup={handleChangeSetup}
              onBack={() => setStep(1)}
              onProceed={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <RemixStudio
              key="step-3"
              core={currentCore}
              supportItems={activeSupportItems}
              setupData={setupData}
              targetRemix={targetRemix}
              actualRemix={actualRemix}
              refinementText={refinementText}
              guardrailResult={guardrailResult}
              aiStatus={aiStatus}
              onTargetRemixChange={handleTargetRemixChange}
              onSelectSupportItem={handleSelectSupportItem}
              onAddAccent={handleAddAccent}
              onRemoveAccent={handleRemoveAccent}
              onApplyRefinement={handleApplyRefinement}
              onBackToConcept={() => setStep(2)}
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
