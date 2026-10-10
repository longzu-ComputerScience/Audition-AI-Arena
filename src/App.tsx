import React, { useState, useMemo, useEffect, useReducer, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  SetupData,
  SupportOption,
  SupportCategoryId,
  AIStatusInfo,
  CoreVietPhucId,
} from './types';
import {
  CORE_ITEMS,
  generateConcept,
  preferredColorForHex,
  resolveCoreGarmentColor,
} from './data/mockFashionData';
import {
  computeActualRemix,
  evaluateGuardrail,
} from './utils/fashionCalculations';
import { fetchAIStatus } from './services/aiStylistApi';
import { createStylingState, stylingReducer } from './utils/stylingState';
import { preparePhotoOutfit } from './utils/preparePhotoOutfit';
import { useAccessoryPlacement } from './utils/accessoryPlacement';
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
  // Explicitly revisiting the interactive discovery should start with the five garments,
  // even when earlier onboarding choices have already been confirmed.
  const [restartIntroFromGarments, setRestartIntroFromGarments] = useState<boolean>(false);

  // A fresh visit also resets the local onboarding sub-step when it is already mounted.
  const [introVisit, setIntroVisit] = useState(0);

  // Navigate to step and remember the highest unlocked step
  const goToStep = (targetStep: 1 | 2 | 3) => {
    if (step === 1 && targetStep !== 1) setHasSeenIntro(true);
    setStep(targetStep);
    setMaxUnlockedStep((prev) => (targetStep > prev ? targetStep : prev));
    // Destination layout effects will align the incoming page after the old exit animation.
  };

  // Intro text word-by-word animation play-only-once state for DiscoveryScreen
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(false);

  // Global Setup Data (Step 1 inputs)
  const [styling, dispatchStyling] = useReducer(stylingReducer, undefined, createStylingState);
  const { setupData, items: activeSupportItems, targetRemix: remixDialValue } = styling;
  const accessoryPlacement = useAccessoryPlacement(setupData.coreGarment, activeSupportItems.bag.id, activeSupportItems.accent?.id ?? null);

  // Derived: Actual Remix MUST be a derived value, not stored in state!
  const actualRemix = useMemo(() => {
    return computeActualRemix(activeSupportItems);
  }, [activeSupportItems]);

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

  // Modals state
  // Viewing a heritage profile must never change the garment selected for styling.
  const [lookbookCoreId, setLookbookCoreId] = useState<CoreVietPhucId | null>(null);
  const handleCloseLookbook = useCallback(() => setLookbookCoreId(null), []);
  // Show the existing project introduction first on every fresh app load.
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(true);
  // Separate from onboarding completion; used only to align/animate the welcome after dismissal.
  const [welcomeIntroReady, setWelcomeIntroReady] = useState<boolean>(false);
  const handleCloseAbout = () => {
    setIsAboutOpen(false);
    setWelcomeIntroReady(true);
  };

  // Derived: Current Core Item
  const currentCore = useMemo(() => {
    return CORE_ITEMS[setupData.coreGarment] || CORE_ITEMS['ao-ngu-than'];
  }, [setupData.coreGarment]);
  useEffect(() => {
    if (step >= 2) void preparePhotoOutfit(currentCore.id, activeSupportItems, resolveCoreGarmentColor(currentCore.id, setupData.preferredColor).hex);
  }, [step, currentCore.id, activeSupportItems, setupData.preferredColor]);

  // Derived: Concept Data for Step 2
  const concept = useMemo(() => {
    return generateConcept(setupData);
  }, [setupData]);

  // Keep Cultural Guardrail synchronized with current styling snapshot
  const guardrailResult = useMemo(() => evaluateGuardrail(
      refinementText,
      currentCore,
      activeSupportItems,
      setupData,
      actualRemix
    ), [refinementText, currentCore, activeSupportItems, setupData, actualRemix]);

  // Handle changing setup fields in Step 1 and Step 2
  const handleChangeSetup = (data: Partial<SetupData>) => {
    dispatchStyling({ type: 'setup', data });
  };

  // When user drags Remix Dial slider (0–100):
  // 1. Freely moves slider position according to user drag
  // 2. Searches catalog for best support combination
  // 3. Only updates outfit if a strictly better/different combination is found
  // 4. Never snaps back; outfit stays until a better combination is reached
  const handleRemixDialChange = (newDialValue: number) => {
    dispatchStyling({ type: 'target', value: newDialValue });
  };

  // Manual selection:
  // Updates only target support slot, recalculates derived actualRemix, and synchronizes slider to new actualRemix!
  const handleSelectSupportItem = (category: SupportCategoryId, item: SupportOption) => {
    dispatchStyling({ type: 'select', category, item });
  };

  // Add optional accent -> recalculates actualRemix & synchronizes slider
  const handleAddAccent = () => {
    dispatchStyling({ type: 'add-accent' });
  };

  // Remove optional accent -> recalculates actualRemix & synchronizes slider
  const handleRemoveAccent = () => {
    dispatchStyling({ type: 'remove-accent' });
  };

  // Apply refinement text -> evaluates Cultural Guardrail locally
  const handleApplyRefinement = (text: string) => {
    setRefinementText(text);
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

  const handleReturnToInteractiveIntro = () => {
    // Return from any screen without reopening the About modal.
    // Keep setupData, confirmed fields, wardrobe selections and unlocked steps.
    setPendingSkipFocus(false);
    setRestartIntroFromGarments(true);
    setOnboardingState('active');
    setIntroVisit((visit) => visit + 1);
    goToStep(1);
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#2B231D] flex flex-col font-sans selection:bg-[#B3261E]/20 selection:text-[#B3261E]">
      {/* Header with unlocked visited steps navigation */}
      <Header
        currentStep={step}
        maxUnlockedStep={maxUnlockedStep}
        onStepClick={(targetStep) => {
          if (step === 1 && onboardingState === 'active' && targetStep === 1) {
            return;
          }
          goToStep(targetStep);
        }}
        onBrandClick={handleReturnToInteractiveIntro}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Multi-step Content (Preserving state across back/forward navigation) */}
      <main className="heritage-page-background flex-1 w-full relative" data-active-step={step}>
        <AnimatePresence mode="wait">
          {step === 1 && onboardingState === 'active' && (
            <InteractiveOnboarding
              key={`step-1-onboarding-${introVisit}`}
              setupData={setupData}
              confirmedFields={confirmedIntroFields}
              welcomeReady={welcomeIntroReady}
              restartFromGarmentSelection={restartIntroFromGarments}
              onSelectCoreGarment={handleOnboardingSelectCore}
              onOpenCoreDetail={setLookbookCoreId}
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
              onReturnToIntro={handleReturnToInteractiveIntro}
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
              isOverlayOpen={isAboutOpen || lookbookCoreId !== null}
              accessoryPositions={accessoryPlacement.positions}
              onMoveAccessory={accessoryPlacement.onMove}
              onResetAccessoryPositions={accessoryPlacement.onReset}
              recommendationTrace={styling.trace}
              onRecommendAgain={() => dispatchStyling({ type:'refresh' })}
              onRemixDialChange={handleRemixDialChange}
              onSelectSupportItem={handleSelectSupportItem}
              onAddAccent={handleAddAccent}
              onRemoveAccent={handleRemoveAccent}
              onApplyRefinement={handleApplyRefinement}
              onBackToConcept={() => goToStep(2)}
              onOpenCoreDetail={() => setLookbookCoreId(currentCore.id)}
              onSelectFabricColor={(hex) => {
                const preferredColor = preferredColorForHex(hex);
                if (preferredColor) handleChangeSetup({ preferredColor });
              }}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAE3D6] py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-[#7A6E63] font-serif">
        <p className="max-w-[1440px] mx-auto">
          Sắc Việt © 2026 · Fashion Editorial Styling Studio
        </p>
      </footer>

      {/* Detail Modals */}
      <LookbookModal
        core={lookbookCoreId ? CORE_ITEMS[lookbookCoreId] : null}
        isOpen={lookbookCoreId !== null}
        onClose={handleCloseLookbook}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={handleCloseAbout}
      />
    </div>
  );
}
