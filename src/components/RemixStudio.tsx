import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CoreItem,
  ActiveSupportItems,
  SupportOption,
  SupportCategoryId,
  GuardrailResult,
} from '../types';
import { SUPPORT_ITEMS } from '../data/mockFashionData';
import { MannequinCanvas } from './MannequinCanvas';
import { WardrobeSlot } from './WardrobeSlot';
import { computeCompactDna } from '../utils/fashionCalculations';
import {
  Sliders,
  History,
  Sparkles,
  Percent,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowLeft,
  Send,
} from 'lucide-react';

interface RemixStudioProps {
  core: CoreItem;
  supportItems: ActiveSupportItems;
  targetRemix: number;
  actualRemix: number;
  refinementText: string;
  guardrailResult: GuardrailResult;
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
  targetRemix,
  actualRemix,
  refinementText,
  guardrailResult,
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

  // Local state for refinement text input until user clicks "Áp dụng"
  const [draftRefinement, setDraftRefinement] = useState<string>(refinementText);

  const compactDna = computeCompactDna(core, supportItems, actualRemix);

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onApplyRefinement(draftRefinement);
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
        {/* Left Side: Visual 2D Mannequin Pane (~60% -> lg:col-span-7) */}
        <div className="lg:col-span-7 xl:col-span-7 w-full order-1 lg:order-1">
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

          {/* 2. Target Remix Dial & Refinement Textbox */}
          <section className="bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-4 sm:p-5 shadow-2xs space-y-4">
            {/* Target Remix Slider */}
            <div className="space-y-2">
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
            </div>

            {/* Refinement Textbox - Runs only when user clicks "Áp dụng" */}
            <div className="pt-3 border-t border-[#EFE8DC] space-y-2">
              <label
                htmlFor="refinement-input"
                className="block text-xs font-semibold text-[#241E1A]"
              >
                Ghi chú tinh chỉnh phong cách
              </label>

              <form onSubmit={handleApply} className="flex gap-2">
                <input
                  id="refinement-input"
                  type="text"
                  value={draftRefinement}
                  onChange={(e) => setDraftRefinement(e.target.value)}
                  placeholder="Ví dụ: Phối phụ kiện ánh bạc, giữ nguyên cổ áo..."
                  className="flex-1 bg-[#FAF7F2] border border-[#D5C7B4] focus:border-[#B7410E] focus:ring-1 focus:ring-[#B7410E] rounded-xs px-3 py-2 text-xs text-[#241E1A] outline-none"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-[#241E1A] hover:bg-[#B7410E] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer shrink-0"
                >
                  Áp dụng
                </button>
              </form>
            </div>
          </section>

          {/* 3. Cultural Guardrail Status */}
          <section className="bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-4 shadow-2xs">
            <div className="flex items-start gap-3">
              {guardrailResult.status === 'green' && (
                <ShieldCheck className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
              )}
              {guardrailResult.status === 'yellow' && (
                <AlertTriangle className="w-5 h-5 text-[#E65100] shrink-0 mt-0.5" />
              )}
              {guardrailResult.status === 'orange' && (
                <AlertTriangle className="w-5 h-5 text-[#D84315] shrink-0 mt-0.5" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#241E1A]">
                    Cultural Guardrail
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-xs font-medium uppercase ${
                      guardrailResult.status === 'green'
                        ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                        : guardrailResult.status === 'yellow'
                        ? 'bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]'
                        : 'bg-[#FBE9E7] text-[#D84315] border border-[#FFCCBC]'
                    }`}
                  >
                    {guardrailResult.status === 'green'
                      ? 'Bảo Tồn Chuẩn'
                      : guardrailResult.status === 'yellow'
                      ? 'Cần Kiểm Chứng'
                      : 'Xung Đột Cốt Lõi'}
                  </span>
                </div>
                <p className="text-xs text-[#5A4F46] mt-1 leading-relaxed">
                  {guardrailResult.message}
                </p>
              </div>
            </div>
          </section>

          {/* 4. Compact Cultural DNA */}
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

          {/* 5. Final AI Action (Disabled) */}
          <div className="pt-1 space-y-2">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="w-full py-3.5 px-4 rounded-xs bg-[#E8E1D5] text-[#8C7E72] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 cursor-not-allowed border border-[#D5C7B4] select-none opacity-85"
            >
              <Lock className="w-3.5 h-3.5 text-[#8C7E72]" />
              <span>Tạo bản minh họa AI</span>
            </button>

            <p className="text-[11px] text-center text-[#8C7E72] font-serif italic">
              Tính năng minh họa AI sẽ được kết nối ở bước tiếp theo.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
