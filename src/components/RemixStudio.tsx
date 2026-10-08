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
import {
  Sliders,
  Sparkles,
  AlertTriangle,
  Lock,
  ArrowLeft,
  Info,
  BookOpen,
} from 'lucide-react';

interface RemixStudioProps {
  core: CoreItem;
  supportItems: ActiveSupportItems;
  setupData: SetupData;
  remixDialValue: number;
  actualRemix: number;
  refinementText: string;
  guardrailResult: GuardrailResult;
  aiStatus: AIStatusInfo;
  onRemixDialChange: (value: number) => void;
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
  remixDialValue,
  actualRemix,
  refinementText,
  guardrailResult,
  aiStatus,
  onRemixDialChange,
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#5A4F46] hover:text-[#241E1A] bg-[#FFFDF9] border border-[#DDD0C0] rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Đổi Concept</span>
          </button>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B3261E] block">
              Remix Studio · Bước 03
            </span>
            <h1 className="text-xl sm:text-2xl font-editorial font-bold text-[#241E1A]">
              Phối Đồ Tương Tác
            </h1>
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
        <div className="lg:col-span-5 xl:col-span-5 w-full space-y-5 order-2 lg:order-2">
          {/* 1. Tủ Đồ Phối Kèm (tích hợp Remix Dial ở đáy) */}
          <section className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
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
              label="Phụ kiện"
              item={supportItems.accent}
              options={SUPPORT_ITEMS.accent}
              isOpen={openSlot === 'accent'}
              onToggleOpen={() => setOpenSlot((prev) => (prev === 'accent' ? null : 'accent'))}
              onSelectOption={(opt) => onSelectSupportItem('accent', opt)}
              onClose={() => setOpenSlot(null)}
              onAddSlot={onAddAccent}
              onRemoveSlot={supportItems.accent ? onRemoveAccent : undefined}
            />

            {/* Integrated Remix Dial */}
            <div className="border-t border-[#EFE8DC] pt-3.5 mt-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="remix-dial-slider"
                  className="text-xs font-semibold text-[#241E1A] flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#B3261E]" />
                  <span>Mức độ Remix</span>
                </label>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-editorial text-lg font-bold text-[#B3261E] tabular-nums">
                    {remixDialValue}%
                  </span>
                </div>
              </div>

              <input
                id="remix-dial-slider"
                type="range"
                min="0"
                max="100"
                step="1"
                value={remixDialValue}
                onChange={(e) => onRemixDialChange(Number(e.target.value))}
                className="w-full h-2 bg-[#E7DDD0] rounded-lg appearance-none cursor-pointer accent-[#B3261E]"
              />

              <div className="flex justify-between text-[10px] font-mono text-[#8C7E72]">
                <span>Truyền thống (0%)</span>
                <span>Cân bằng (50%)</span>
                <span>Hiện đại (100%)</span>
              </div>
            </div>
          </section>

          {/* 2. Prominent AI Stylist Consultation Panel */}
          <AIStylistPanel
            core={core}
            supportItems={supportItems}
            setupData={setupData}
            targetRemix={remixDialValue}
            actualRemix={actualRemix}
            aiStatus={aiStatus}
            onSelectSupportItem={onSelectSupportItem}
            onApplyRefinementText={onApplyRefinement}
            currentRefinementText={refinementText}
          />

          {/* 3. Góc Nhìn Di Sản (Storytelling & Cultural Context) */}
          <section className="bg-[#FFFDF9] border border-[#E8DEC9] rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#EFE8DC] pb-2">
              <BookOpen className="w-4 h-4 text-[#B3261E]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#241E1A]">
                Góc Nhìn Di Sản
              </h3>
            </div>

            {/* A. Heritage Origin & Cultural Story */}
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-sm font-bold text-[#241E1A]">
                  {core.vietnameseTitle || core.name}
                </span>
                <span className="text-xs text-[#8C7E72] font-serif">
                  ({core.era})
                </span>
              </div>

              {core.heritageStory && (
                <p className="text-xs text-[#4E433C] leading-relaxed font-serif">
                  {core.heritageStory}
                </p>
              )}

              <p className="text-[11px] text-[#7A6E63] leading-relaxed">
                <span className="font-medium text-[#4E433C]">Đặc trưng phom dáng:</span> {core.silhouette}
              </p>
            </div>

            {/* B. Practical style etiquette - ngắn gọn */}
            {guardrailResult.etiquetteTip && (
              <div className="bg-[#FAF7EE] border border-[#EAE3D6] rounded-lg p-2.5 flex items-start gap-2 text-xs text-[#5A4F46]">
                <Info className="w-3.5 h-3.5 text-[#B3261E] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <span className="font-semibold text-[#241E1A]">Chuẩn mực:</span> {guardrailResult.etiquetteTip}
                </p>
              </div>
            )}

            {/* C. Conflict warning — conditional only (Yellow / Orange alerts) */}
            {(guardrailResult.status === 'yellow' || guardrailResult.status === 'orange') && (
              <div
                className={`rounded-lg p-2.5 flex items-start gap-2 text-xs border ${
                  guardrailResult.status === 'yellow'
                    ? 'bg-[#FFF8E1] border-[#FFE082] text-[#8D6E63]'
                    : 'bg-[#FBE9E7] border-[#FFAB91] text-[#BF360C]'
                }`}
              >
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    guardrailResult.status === 'yellow' ? 'text-[#F57F17]' : 'text-[#D84315]'
                  }`}
                />
                <div className="space-y-0.5 min-w-0">
                  <span className="font-semibold block text-[11px] uppercase tracking-wider">
                    {guardrailResult.status === 'yellow' ? 'Lưu ý điều chỉnh' : 'Xung đột di sản'}
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    {guardrailResult.message}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* 5. Final AI Image Generation Action (Connected to shared AI availability) */}
          <div className="pt-1 space-y-2">
            <button
              type="button"
              disabled={!aiStatus.isAvailable}
              onClick={handleOpenAIModal}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-colors shadow-xs ${
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
