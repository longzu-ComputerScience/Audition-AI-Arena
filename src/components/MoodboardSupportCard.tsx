import React from 'react';
import { SupportOption } from '../types';
import { PatternMotif } from './PatternMotif';
import { RefreshCw, ArrowRight } from 'lucide-react';

interface MoodboardSupportCardProps {
  item: SupportOption;
  categoryIndex: string; // e.g. "01", "02", "03"
  currentIndex: number;
  totalOptions: number;
  onCycleNext: () => void;
}

export const MoodboardSupportCard: React.FC<MoodboardSupportCardProps> = ({
  item,
  categoryIndex,
  currentIndex,
  totalOptions,
  onCycleNext,
}) => {
  return (
    <div
      onClick={onCycleNext}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCycleNext();
        }
      }}
      className="group relative bg-[#FFFDF9] border border-[#E3D9CC] hover:border-[#8C3B24] rounded-sm p-4 sm:p-5 shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between select-none active:scale-[0.99] hover:shadow-md"
      aria-label={`${item.categoryLabel}: ${item.name}. Nhấn để đổi biến thể.`}
    >
      {/* Top Header Row with Index & Cycle Indicator */}
      <div className="flex items-center justify-between gap-2 border-b border-[#EFE8DC] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-[#8C3B24]">
            {categoryIndex}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#655A52]">
            {item.categoryLabel.split('·')[0].trim()}
          </span>
        </div>

        {/* Clickable Cycle Pill */}
        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#8C7E72] group-hover:text-[#8C3B24] transition-colors">
          <span className="tabular-nums">
            {currentIndex + 1}/{totalOptions}
          </span>
          <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
        </div>
      </div>

      {/* Visual Placeholder: Colored tactile block with item name & textile motif */}
      <div
        className="relative aspect-[16/10] sm:aspect-[16/9] rounded-xs border border-[#DFD5C5] overflow-hidden flex flex-col justify-between p-3.5 transition-all duration-300 group-hover:brightness-[1.02]"
        style={{
          background: `linear-gradient(135deg, ${item.colorHex}22 0%, ${item.colorHex}55 60%, ${item.accentHex}66 100%)`,
        }}
      >
        {/* Decorative background pattern */}
        <div className="absolute right-0 bottom-0 w-28 h-28 opacity-15 pointer-events-none transform translate-x-4 translate-y-4">
          <PatternMotif type={item.patternType} color="#241E1A" />
        </div>

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <span
            className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs font-semibold backdrop-blur-xs border shadow-2xs"
            style={{
              backgroundColor: '#FAF7F2EE',
              color: '#241E1A',
              borderColor: '#DDD0C0',
            }}
          >
            {item.badgeLabel}
          </span>
          <span
            className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs"
            style={{ backgroundColor: item.accentHex }}
            title={`Sắc độ: ${item.colorName}`}
          />
        </div>

        {/* Center Item Graphic / Graphic Name */}
        <div className="relative z-10 text-center py-1">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#FAF7F2]/80 border border-[#DDD0C0] flex items-center justify-center p-2 shadow-2xs">
            <PatternMotif type={item.patternType} color="#8C3B24" className="w-full h-full" />
          </div>
          <p className="mt-1.5 text-[10px] tracking-wider uppercase font-mono text-[#5C4F44]">
            {item.colorName}
          </p>
        </div>

        {/* Bottom Bar inside placeholder */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono bg-[#241E1A]/80 text-[#FAF7F2] px-2.5 py-1 rounded-xs backdrop-blur-xs">
          <span className="truncate max-w-[130px]">{item.material.split('&')[0]}</span>
          <span className="tabular-nums text-[#D4AF37] font-semibold shrink-0">
            {item.modernityScore}% Đương đại
          </span>
        </div>
      </div>

      {/* Item Typography Info */}
      <div className="mt-3.5 space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-base sm:text-lg font-editorial font-bold text-[#241E1A] group-hover:text-[#8C3B24] transition-colors leading-snug">
            {item.name}
          </h3>
        </div>

        <p className="text-xs text-[#6B5E52] line-clamp-2 leading-relaxed font-sans">
          {item.editorialNote}
        </p>

        {/* Interactive Click Tip Button */}
        <div className="pt-2 border-t border-[#EFE8DC] flex items-center justify-between text-[11px] text-[#8C7E72] font-mono group-hover:text-[#8C3B24] transition-colors">
          <span>Nhấn để đổi biến thể</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
