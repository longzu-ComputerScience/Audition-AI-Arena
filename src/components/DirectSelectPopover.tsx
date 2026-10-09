import React, { useRef, useEffect, useState } from 'react';
import { SupportOption } from '../types';
import { getSupportItemDemoImage } from '../data/demoImageMap';
import { Check, X } from 'lucide-react';

interface DirectSelectPopoverProps {
  title: string;
  options: SupportOption[];
  selectedId: string;
  onSelect: (option: SupportOption) => void;
  onClose: () => void;
}

export const DirectSelectPopover: React.FC<DirectSelectPopoverProps> = ({
  title,
  options,
  selectedId,
  onSelect,
  onClose,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      role="listbox"
      aria-label={`Danh sách tùy chọn cho ${title}`}
      className="absolute right-0 left-0 sm:left-auto sm:w-80 top-full mt-2 z-30 bg-[#FFFDF9] border border-[#DDD0C0] rounded-xl p-3 shadow-lg animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-2 mb-2">
        <span className="text-xs font-mono font-semibold uppercase text-[#B3261E]">
          {title} ({options.length} lựa chọn)
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-[#7A6E63] hover:text-[#241E1A] rounded-md cursor-pointer"
          aria-label="Đóng bảng chọn"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
        {options.map((opt) => {
          const isSelected = opt.id === selectedId;
          const demoImg = getSupportItemDemoImage(opt.id);
          const showPhoto = Boolean(demoImg && !failedImages[opt.id]);

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onSelect(opt);
                onClose();
              }}
              className={`w-full text-left p-2.5 rounded-lg border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                isSelected
                  ? 'bg-[#FAF3EB] border-[#B3261E] text-[#241E1A] shadow-2xs font-medium'
                  : 'bg-[#FAF7EE] hover:bg-[#F3ECE1] border-[#E8DEC9] text-[#4E433C]'
              }`}
              role="option"
              aria-selected={isSelected}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {showPhoto ? (
                  <img
                    src={demoImg}
                    alt={opt.name}
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [opt.id]: true }))
                    }
                    className="w-8 h-8 rounded-md border border-[#E2D8C8] object-cover shrink-0 bg-[#FFFDF9]"
                  />
                ) : (
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: opt.accentHex }}
                  />
                )}
                <div className="truncate">
                  <div className="text-xs font-semibold truncate text-[#241E1A]">
                    {opt.name}
                  </div>
                  <div className="text-[11px] text-[#7A6E63] truncate font-serif">
                    {opt.material.split('&')[0]}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono tabular-nums font-semibold text-[#B3261E]">
                  {opt.modernityScore}% Hiện đại
                </span>
                {isSelected && <Check className="w-4 h-4 text-[#B3261E]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
