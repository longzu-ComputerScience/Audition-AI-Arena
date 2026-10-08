import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CoreItem,
  ActiveSupportItems,
  SupportOption,
  SupportCategoryId,
  GuardrailResult,
  SetupData,
  AIStatusInfo,
} from '../types';
import { SUPPORT_ITEMS } from '../data/mockFashionData';
import { MannequinCanvas } from './MannequinCanvas';
import { WardrobeSlot } from './WardrobeSlot';
import { AIResultModal, OutfitSnapshot } from './AIResultModal';
import { AIStylistPanel } from './AIStylistPanel';
import { computeCompactDna } from '../utils/fashionCalculations';
import {
  Sliders,
  History,
  Sparkles,
  Percent,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

interface RemixStudioProps {
  core: CoreItem;
  supportItems: ActiveSupportItems;
  setupData: SetupData;
  targetRemix: number;
  actualRemix: number;
  refinementText: string;
  guardrailResult: GuardrailResult;
  aiStatus: AIStatusInfo;
  onTargetRemixChange: (value: number) => void;
  onSelectSupportItem: (category: SupportCategoryId, item: SupportOption) => void;
  onAddAccent: () => void;
  onRemoveAccent: () => void;
  onApplyRefinement: (text: string) => void;
  onBackToConcept: () => void;
  onOpenCoreDetail?: () => void;
}

export const RemixStudio: React.FC<RemixStudioProps> = ({
  core,
  supportItems,
  setupData,
  targetRemix,
  actualRemix,
  refinementText,
  guardrailResult,
  aiStatus,
  onTargetRemixChange,
  onSelectSupportItem,
  onAddAccent,
  onRemoveAccent,
  onApplyRefinement,
  onBackToConcept,
  onOpenCoreDetail,
}) => {
  // Only one selector open at a time
  const [openSlot, setOpenSlot] = useState<SupportCategoryId | null>(null);

  // State for AI image generation modal snapshot
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [aiSnapshot, setAiSnapshot] = useState<OutfitSnapshot | null>(null);

  // State for expanding/collapsing deep heritage check items in Cultural Guardrail
  const [showFullGuardrailDetails, setShowFullGuardrailDetails] = useState<boolean>(true);

  const handleOpenAIModal = () => {
    if (!aiStatus.isAvailable) return;
    // Capture immutable snapshot of current styling selections
    setAiSnapshot({
      core,
      supportItems,
      setupData,
      actualRemix,
    });
    setIsAIModalOpen(true);
  };

  const compactDna = computeCompactDna(core, supportItems, actualRemix);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-[1440px] mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6"
    >
      {/* Studio Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE3D6] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToConcept}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#5A4F46] hover:text-[#241E1A] bg-[#FFFDF9] border border-[#D5C7B4] rounded-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Đổi Concept</span>
          </button>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B7410E] block">
              Remix Studio · Bước 03
            </span>
            <h1 className="text-xl sm:text-2xl font-editorial font-bold text-[#241E1A]">
              Phối Đồ Tương Tác
            </h1>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FFFDF9] border border-[#E3D9CC] px-3 py-1.5 rounded-xs">
            <span className="text-[11px] font-mono text-[#8C7E72]">Remix thực tế:</span>
            <span className="text-sm font-editorial font-bold text-[#B7410E] tabular-nums">
              {actualRemix}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout (~60% Visual Pane / ~40% Controls Pane) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Side: Visual 2D Mannequin Pane (~60% -> lg:col-span-7, sticky on desktop) */}
        <div className="lg:col-span-7 xl:col-span-7 w-full order-1 lg:order-1 lg:sticky lg:top-20 lg:self-start">
          <MannequinCanvas
            core={core}
            items={supportItems}
            onOpenCoreDetail={onOpenCoreDetail}
          />
        </div>

        {/* Right Side: Wardrobe & Styling Controls (~40% -> lg:col-span-5) */}
        <div className="lg:col-span-5 xl:col-span-5 w-full space-y-6 order-2 lg:order-2">
          {/* 1. Wardrobe Slots */}
          <section className="bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#241E1A]">
                Tủ Đồ Phối Kèm
              </h2>
              <span className="text-[11px] font-mono text-[#8C7E72]">
                Chọn trực tiếp từ danh mục
              </span>
            </div>

            {/* Bottom Slot */}
            <WardrobeSlot
              category="bottom"
              label="Phần dưới"
              item={supportItems.bottom}
              options={SUPPORT_ITEMS.bottom}
              isOpen={openSlot === 'bottom'}
              onToggleOpen={() => setOpenSlot((prev) => (prev === 'bottom' ? null : 'bottom'))}
              onSelectOption={(opt) => onSelectSupportItem('bottom', opt)}
              onClose={() => setOpenSlot(null)}
            />

            {/* Shoes Slot */}
            <WardrobeSlot
              category="shoes"
              label="Giày guốc"
              item={supportItems.shoes}
              options={SUPPORT_ITEMS.shoes}
              isOpen={openSlot === 'shoes'}
              onToggleOpen={() => setOpenSlot((prev) => (prev === 'shoes' ? null : 'shoes'))}
              onSelectOption={(opt) => onSelectSupportItem('shoes', opt)}
              onClose={() => setOpenSlot(null)}
            />

            {/* Bag Slot */}
            <WardrobeSlot
              category="bag"
              label="Túi xách"
              item={supportItems.bag}
              options={SUPPORT_ITEMS.bag}
              isOpen={openSlot === 'bag'}
              onToggleOpen={() => setOpenSlot((prev) => (prev === 'bag' ? null : 'bag'))}
              onSelectOption={(opt) => onSelectSupportItem('bag', opt)}
              onClose={() => setOpenSlot(null)}
            />

            {/* Optional Accent Slot */}
            <WardrobeSlot
              category="accent"
              label="Điểm nhấn"
              item={supportItems.accent}
              options={SUPPORT_ITEMS.accent}
              isOpen={openSlot === 'accent'}
              onToggleOpen={() => setOpenSlot((prev) => (prev === 'accent' ? null : 'accent'))}
              onSelectOption={(opt) => onSelectSupportItem('accent', opt)}
              onClose={() => setOpenSlot(null)}
              onAddSlot={onAddAccent}
              onRemoveSlot={supportItems.accent ? onRemoveAccent : undefined}
            />
          </section>

          {/* 2. Target Remix Dial */}
          <section className="bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="remix-dial-slider"
                className="text-xs font-semibold text-[#241E1A] flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-[#B7410E]" />
                <span>Mục Tiêu Remix Dial</span>
              </label>
              <div className="flex items-baseline gap-1">
                <span className="font-editorial text-2xl font-bold text-[#B7410E] tabular-nums">
                  {targetRemix}%
                </span>
                <span className="text-[10px] font-mono text-[#8C7E72] uppercase">
                  Mục tiêu
                </span>
              </div>
            </div>

            <input
              id="remix-dial-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={targetRemix}
              onChange={(e) => onTargetRemixChange(Number(e.target.value))}
              className="w-full h-2 bg-[#E7DDD0] rounded-lg appearance-none cursor-pointer accent-[#B7410E]"
            />

            <div className="flex justify-between text-[10px] font-mono text-[#8C7E72]">
              <span>0% Thuần Cổ Điển</span>
              <span>50% Cân Bằng</span>
              <span>100% Siêu Hiện Đại</span>
            </div>
          </section>

          {/* 3. Prominent AI Stylist Consultation Panel */}
          <AIStylistPanel
            core={core}
            supportItems={supportItems}
            setupData={setupData}
            targetRemix={targetRemix}
            actualRemix={actualRemix}
            aiStatus={aiStatus}
            onSelectSupportItem={onSelectSupportItem}
            onApplyRefinementText={onApplyRefinement}
            currentRefinementText={refinementText}
          />

          {/* 4. Upgraded Cultural Guardrail — Transparent & Meaningful Feedback */}
          <section className="bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-start justify-between gap-3 border-b border-[#EFE8DC] pb-3">
              <div className="flex items-start gap-2.5">
                {guardrailResult.status === 'green' && (
                  <ShieldCheck className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
                )}
                {guardrailResult.status === 'yellow' && (
                  <AlertTriangle className="w-5 h-5 text-[#E65100] shrink-0 mt-0.5" />
                )}
                {guardrailResult.status === 'orange' && (
                  <AlertTriangle className="w-5 h-5 text-[#D84315] shrink-0 mt-0.5" />
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#241E1A]">
                      Cultural Guardrail
                    </h3>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-xs font-semibold uppercase ${
                        guardrailResult.status === 'green'
                          ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                          : guardrailResult.status === 'yellow'
                          ? 'bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]'
                          : 'bg-[#FBE9E7] text-[#D84315] border border-[#FFCCBC]'
                      }`}
                    >
                      {guardrailResult.status === 'green'
                        ? 'Bảo Tồn Chuẩn Mực'
                        : guardrailResult.status === 'yellow'
                        ? 'Cần Lưu Ý Cân Nhắc'
                        : 'Xung Đột Cốt Lõi Di Sản'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#3D342C] mt-1 leading-snug">
                    {guardrailResult.message}
                  </p>
                </div>
              </div>

              {guardrailResult.heritageChecks && (
                <button
                  type="button"
                  onClick={() => setShowFullGuardrailDetails((prev) => !prev)}
                  className="text-[11px] text-[#7A4B3A] hover:text-[#B3261E] font-medium flex items-center gap-1 cursor-pointer shrink-0 mt-0.5"
                >
                  <span>{showFullGuardrailDetails ? 'Thu gọn' : 'Chi tiết'}</span>
                  {showFullGuardrailDetails ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            {/* Transparent Detailed Rationale */}
            {guardrailResult.detailedAnalysis && (
              <div className="bg-[#FAF7F2] border-l-2 border-[#B7410E] pl-3 py-2 text-xs text-[#524538] leading-relaxed font-serif">
                {guardrailResult.detailedAnalysis}
              </div>
            )}

            {/* Heritage Checklist Breakdown */}
            {showFullGuardrailDetails && guardrailResult.heritageChecks && guardrailResult.heritageChecks.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C7E72] block">
                  Tiêu chí thẩm định di sản
                </span>
                <div className="space-y-1.5">
                  {guardrailResult.heritageChecks.map((check) => (
                    <div
                      key={check.id}
                      className="bg-white border border-[#EBE3D7] rounded-xs p-2.5 flex items-start gap-2.5 text-xs"
                    >
                      {check.status === 'passed' && (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                      )}
                      {check.status === 'warning' && (
                        <AlertTriangle className="w-4 h-4 text-[#E65100] shrink-0 mt-0.5" />
                      )}
                      {check.status === 'violation' && (
                        <XCircle className="w-4 h-4 text-[#D84315] shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#241E1A]">{check.label}</span>
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-2xs ${
                              check.status === 'passed'
                                ? 'text-[#2E7D32] bg-[#E8F5E9]'
                                : check.status === 'warning'
                                ? 'text-[#E65100] bg-[#FFF3E0]'
                                : 'text-[#D84315] bg-[#FBE9E7]'
                            }`}
                          >
                            {check.status === 'passed' ? 'Đạt' : check.status === 'warning' ? 'Lưu ý' : 'Vi phạm'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#635548] mt-0.5 leading-relaxed">
                          {check.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Occasion Etiquette Tip */}
            {guardrailResult.etiquetteTip && (
              <div className="bg-[#FAF3E8] border border-[#EADBCA] rounded-xs p-2.5 flex items-start gap-2 text-xs text-[#634E3C]">
                <Info className="w-3.5 h-3.5 text-[#B7410E] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <span className="font-semibold">Chuẩn mực mặc đẹp:</span> {guardrailResult.etiquetteTip}
                </p>
              </div>
            )}
          </section>

          {/* 5. Compact Cultural DNA */}
          <section
            id="cultural-dna"
            className="bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-4 sm:p-5 shadow-2xs space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-2">
              <h2 className="text-sm font-editorial font-bold text-[#241E1A]">
                Mã Gen Di Sản
              </h2>
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#DDD0C0] px-2.5 py-1 rounded-xs">
                <Percent className="w-3.5 h-3.5 text-[#B7410E]" />
                <span className="text-xs font-semibold text-[#241E1A] tabular-nums">
                  Mức Remix thực tế: <span className="text-[#B7410E]">{actualRemix}%</span>
                </span>
              </div>
            </div>

            {/* Di sản giữ lại */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#241E1A]">
                <History className="w-3.5 h-3.5 text-[#7A4B3A]" />
                <span>Di sản giữ lại</span>
              </div>
              <ul className="space-y-1 pl-4 border-l-2 border-[#D5C7B4]">
                {compactDna.preservedPoints.map((p, i) => (
                  <li key={i} className="text-xs text-[#5A4F46] leading-relaxed">
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Chi tiết hiện đại */}
            <div className="space-y-1 pt-2 border-t border-[#EFE8DC]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B7410E]">
                <Sparkles className="w-3.5 h-3.5 text-[#B7410E]" />
                <span>Chi tiết hiện đại</span>
              </div>
              <ul className="space-y-1 pl-4 border-l-2 border-[#B7410E]">
                {compactDna.modernPoints.map((p, i) => (
                  <li key={i} className="text-xs text-[#5A4F46] leading-relaxed">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 6. Final AI Image Generation Action (Connected to shared AI availability) */}
          <div className="pt-1 space-y-2">
            <button
              type="button"
              disabled={!aiStatus.isAvailable}
              onClick={handleOpenAIModal}
              className={`w-full py-3.5 px-4 rounded-xs font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-colors shadow-xs ${
                aiStatus.isAvailable
                  ? 'bg-[#B3261E] hover:bg-[#8F1E18] text-white cursor-pointer'
                  : 'bg-[#9E9084] text-[#EFEBE4] cursor-not-allowed opacity-80'
              }`}
            >
              {aiStatus.isAvailable ? (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Tạo bản minh họa AI</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#EFEBE4]" />
                  <span>Tạo bản minh họa AI (Cần API Key)</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-[#7A6E63] font-serif italic">
              {aiStatus.isAvailable
                ? 'Minh họa phối đồ chân dung cá nhân hóa dựa trên mô hình Gemini thế hệ mới.'
                : 'Chưa cấu hình GEMINI_API_KEY trong biến môi trường máy chủ. Vui lòng thêm API Key vào Secrets để mở khóa tính năng này.'}
            </p>
          </div>
        </div>
      </div>

      {/* AI Image Generation Result Modal */}
      <AIResultModal
        isOpen={isAIModalOpen}
        snapshot={aiSnapshot}
        onClose={() => setIsAIModalOpen(false)}
      />
    </motion.section>
  );
};
