import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  currentStep: 1 | 2 | 3;
  onStepClick: (step: 1 | 2 | 3) => void;
  onOpenAbout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentStep, onStepClick, onOpenAbout }) => {
  const steps: { number: 1 | 2 | 3; code: string; label: string }[] = [
    { number: 1, code: '01', label: 'Khám phá' },
    { number: 2, code: '02', label: 'Concept' },
    { number: 3, code: '03', label: 'Remix' },
  ];

  return (
    <header className="border-b border-[#EAE3D6] bg-[#FAF9F6]/95 backdrop-blur-sm sticky top-0 z-40 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onStepClick(1)}
            className="text-left text-xl sm:text-2xl font-editorial font-bold tracking-tight text-[#241E1A] hover:text-[#B7410E] transition-colors cursor-pointer"
          >
            Việt Phục Remix
          </button>
        </div>

        {/* Subtle Step Indicator: 01 Khám phá — 02 Concept — 03 Remix */}
        <nav
          aria-label="Tiến trình thiết kế"
          className="flex items-center gap-2 sm:gap-4 text-xs font-mono tracking-wide"
        >
          {steps.map((step, idx) => {
            const isActive = currentStep === step.number;
            const isPassed = currentStep > step.number;
            const isClickable = isPassed || isActive;

            return (
              <React.Fragment key={step.number}>
                {idx > 0 && (
                  <span className="text-[#C8BCAC] select-none" aria-hidden="true">
                    —
                  </span>
                )}
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick(step.number)}
                  className={`flex items-center gap-1.5 transition-all transition-colors ${
                    isActive
                      ? 'text-[#B7410E] font-bold border-b border-[#B7410E] pb-0.5'
                      : isPassed
                      ? 'text-[#5A4F46] hover:text-[#241E1A] cursor-pointer'
                      : 'text-[#B0A495] cursor-not-allowed opacity-60'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span className="tabular-nums">{step.code}</span>
                  <span className="hidden sm:inline font-sans">{step.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Action / About helper */}
        <div className="flex items-center gap-2">
          {onOpenAbout && (
            <button
              type="button"
              onClick={onOpenAbout}
              className="px-2.5 py-1 text-xs text-[#7A6E63] hover:text-[#241E1A] font-medium transition-colors cursor-pointer"
            >
              Giới thiệu
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
