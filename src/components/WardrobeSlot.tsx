import React, { useState, useEffect } from 'react';
import { SupportOption, SupportCategoryId } from '../types';
import { PatternMotif } from './PatternMotif';
import { DirectSelectPopover } from './DirectSelectPopover';
import { getSupportItemDemoImage } from '../data/demoImageMap';
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
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    setImgError(false);
  }, [item?.id]);

  // If slot is empty (for optional Accent)
  if (!item) {
    return (
      <div className="relative border border-dashed border-[#DDD0C0] hover:border-[#B3261E]/60 bg-[#FAF7EE]/50 hover:bg-[#FFFDF9] rounded-xl p-3 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A6E63] block">
              {label} (Tùy chọn)
            </span>
            <span className="text-xs text-[#5A4F46] font-medium mt-0.5 block">
              Chưa chọn phụ kiện
            </span>
          </div>

          <button
            type="button"
            onClick={onAddSlot}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDF9] hover:bg-[#B3261E] text-[#5A4F46] hover:text-white border border-[#DDD0C0] hover:border-[#B3261E] rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Thêm phụ kiện</span>
          </button>
        </div>
      </div>
    );
  }

  const demoImageSrc = getSupportItemDemoImage(item.id);
  const showRealThumbnail = Boolean(demoImageSrc && !imgError);

  return (
    <div className="relative bg-[#FAF7EE]/50 hover:bg-[#FAF7EE]/80 border border-[#EAE3D6] rounded-xl p-3 transition-colors duration-150">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5A4F46]">
            {label}
          </span>
          <span className="text-[10px] font-mono text-[#8C7E72] bg-[#FFFDF9] px-1.5 py-0.5 rounded border border-[#E5DDD0]">
            {item.badgeLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onRemoveSlot && (
            <button
              type="button"
              onClick={onRemoveSlot}
              className="p-1 text-[#8C7E72] hover:text-[#B3261E] rounded-md cursor-pointer transition-colors"
              title="Gỡ bỏ phụ kiện này"
              aria-label="Gỡ bỏ phụ kiện"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleOpen}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#4E433C] hover:text-[#241E1A] bg-[#FFFDF9] hover:bg-[#F2EAE0] border border-[#DDD0C0] rounded-lg transition-colors cursor-pointer"
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
        className="flex items-center gap-3 cursor-pointer group"
      >
        {/* Visual Thumbnail (Real photograph when available, otherwise colored motif placeholder) */}
        <div
          className={`w-13 h-13 rounded-lg border border-[#E2D8C8] overflow-hidden shrink-0 flex items-center justify-center relative transition-all group-hover:border-[#B3261E]/50 ${
            showRealThumbnail ? 'bg-[#FFFDF9]' : 'p-2'
          }`}
          style={
            showRealThumbnail
              ? undefined
              : {
                  background: `linear-gradient(135deg, ${item.colorHex}22 0%, ${item.colorHex}55 60%, ${item.accentHex}50 100%)`,
                }
          }
        >
          {showRealThumbnail && demoImageSrc ? (
            <img
              src={demoImageSrc}
              alt={item.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover select-none"
            />
          ) : (
            <PatternMotif
              type={item.patternType}
              color="#241E1A"
              className="w-full h-full opacity-70"
            />
          )}
          <span
            className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-black/20 shadow-2xs"
            style={{ backgroundColor: item.accentHex }}
          />
        </div>

        {/* Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="text-sm font-editorial font-bold text-[#241E1A] truncate group-hover:text-[#B3261E] transition-colors">
              {item.name}
            </h4>
            <span className="text-[11px] font-mono tabular-nums text-[#B3261E] font-semibold shrink-0">
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
