import React from 'react';
import { SupportOption, SupportCategoryId } from '../types';
import { PatternMotif } from './PatternMotif';
import { DirectSelectPopover } from './DirectSelectPopover';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

interface WardrobeSlotProps {
  category: SupportCategoryId;
  label: string;
  item: SupportOption | null;
  options: SupportOption[];
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelectOption: (option: SupportOption) => void;
  onClose: () => void;
  onAddSlot?: () => void;
  onRemoveSlot?: () => void;
}

export const WardrobeSlot: React.FC<WardrobeSlotProps> = ({
  category,
  label,
  item,
  options,
  isOpen,
  onToggleOpen,
  onSelectOption,
  onClose,
  onAddSlot,
  onRemoveSlot,
}) => {
  // If slot is empty (for optional Accent)
  if (!item) {
    return (
      <div className="relative border border-dashed border-[#D5C7B4] hover:border-[#B7410E] bg-[#FFFDF9]/60 hover:bg-[#FFFDF9] rounded-sm p-4 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-[#8C7E72] block">
              {label} (Tùy chọn)
            </span>
            <span className="text-xs text-[#5A4F46] font-medium mt-0.5 block">
              Chưa kích hoạt điểm nhấn
            </span>
          </div>

          <button
            type="button"
            onClick={onAddSlot}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#B7410E] text-[#5A4F46] hover:text-white border border-[#D5C7B4] hover:border-[#B7410E] rounded-xs text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Thêm phụ kiện</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-3.5 shadow-2xs transition-all duration-200">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 border-b border-[#EFE8DC] pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5A4F46]">
            {label}
          </span>
          <span className="text-[10px] font-mono text-[#8C7E72] bg-[#FAF7F2] px-1.5 py-0.5 rounded-xs border border-[#E5DDD0]">
            {item.badgeLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onRemoveSlot && (
            <button
              type="button"
              onClick={onRemoveSlot}
              className="p-1 text-[#8C7E72] hover:text-[#B7410E] rounded-xs cursor-pointer transition-colors"
              title="Gỡ bỏ phụ kiện này"
              aria-label="Gỡ bỏ phụ kiện"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleOpen}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#4E433C] hover:text-[#241E1A] bg-[#FAF7F2] hover:bg-[#F2EAE0] border border-[#DDD0C0] rounded-xs transition-colors cursor-pointer"
            aria-expanded={isOpen}
          >
            <span>Thay đổi</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Card Content */}
      <div
        onClick={onToggleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleOpen();
          }
        }}
        className="flex items-center gap-3.5 cursor-pointer group"
      >
        {/* Placeholder Visual Thumbnail */}
        <div
          className="w-14 h-14 rounded-xs border border-[#DFD5C5] overflow-hidden shrink-0 flex items-center justify-center p-2 relative transition-all group-hover:border-[#B7410E]"
          style={{
            background: `linear-gradient(135deg, ${item.colorHex}22 0%, ${item.colorHex}55 60%, ${item.accentHex}50 100%)`,
          }}
        >
          <PatternMotif
            type={item.patternType}
            color="#241E1A"
            className="w-full h-full opacity-70"
          />
          <span
            className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-black/20"
            style={{ backgroundColor: item.accentHex }}
          />
        </div>

        {/* Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="text-sm font-editorial font-bold text-[#241E1A] truncate group-hover:text-[#B7410E] transition-colors">
              {item.name}
            </h4>
            <span className="text-[11px] font-mono tabular-nums text-[#B7410E] font-semibold shrink-0">
              {item.modernityScore}%
            </span>
          </div>
          <p className="text-[11px] text-[#7A6E63] truncate font-serif mt-0.5">
            {item.material}
          </p>
        </div>
      </div>

      {/* Inline Direct Select Popover */}
      {isOpen && (
        <DirectSelectPopover
          title={`Chọn ${label}`}
          options={options}
          selectedId={item.id}
          onSelect={onSelectOption}
          onClose={onClose}
        />
      )}
    </div>
  );
};
