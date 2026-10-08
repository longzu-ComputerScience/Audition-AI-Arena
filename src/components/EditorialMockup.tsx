import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CoreItem, ActiveSupportItems } from '../types';
import { PatternMotif } from './PatternMotif';
import { Sparkles, Pin } from 'lucide-react';

interface EditorialMockupProps {
  core: CoreItem;
  items: ActiveSupportItems;
  onOpenCoreDetail?: () => void;
}

export const EditorialMockup: React.FC<EditorialMockupProps> = ({
  core,
  items,
  onOpenCoreDetail,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const itemTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: 'easeOut' as const };

  return (
    <div className="relative bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-5 sm:p-7 shadow-xs overflow-hidden">
      {/* Editorial Watermark / Header */}
      <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-3 mb-6">
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#B7410E] uppercase">
          <Pin className="w-3.5 h-3.5 rotate-45 text-[#B7410E]" />
          <span>Bản Phối Flat-lay 2D</span>
          <span className="text-[#C8BCAC]">·</span>
          <span className="text-[#655A52]">{core.archiveCode}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {core.palette.map((c, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full border border-black/15 shadow-2xs"
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* 2D Asymmetric Flat-lay Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Core Garment - Dominant / Largest Centerpiece (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-b from-[#F5EFE6] via-[#EFE7DA] to-[#E5DBCB] rounded-xs border border-[#DFD5C5] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden min-h-[380px]">
          {/* Subtle background motif */}
          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center p-8">
            <PatternMotif
              type={core.patternType}
              color="#241E1A"
              className="w-full h-full max-w-[260px]"
            />
          </div>

          <div className="relative z-10 flex items-start justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A6E63] bg-[#FFFDF9]/90 px-2 py-0.5 rounded-xs border border-[#DDD0C0]">
              Trụ Cột Cổ Phục (Cố Định)
            </span>
            <span className="text-xs font-mono text-[#B7410E] font-semibold">
              {core.era.split('·')[0].trim()}
            </span>
          </div>

          {/* Center Graphic */}
          <div className="relative z-10 my-auto text-center py-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-[#FFFDF9]/75 border border-[#D5C7B4] flex items-center justify-center p-3.5 shadow-sm">
              <PatternMotif
                type={core.patternType}
                color="#B7410E"
                className="w-full h-full"
              />
            </div>
            <h3 className="mt-4 text-2xl sm:text-3xl font-editorial font-bold text-[#241E1A] tracking-tight">
              {core.vietnameseTitle}
            </h3>
            <p className="text-xs text-[#7A6E63] font-serif italic mt-0.5">
              {core.subTitle}
            </p>
          </div>

          {/* Specs Footer */}
          <div className="relative z-10 bg-[#241E1A]/85 text-[#FAF7F2] p-3 rounded-xs backdrop-blur-xs flex items-center justify-between text-xs">
            <div className="truncate pr-2">
              <span className="text-[10px] font-mono uppercase text-[#D6CEBE] block">
                Chất Liệu Tuyển Chọn
              </span>
              <span className="font-medium text-[#FFFDF9] truncate block">
                {core.material}
              </span>
            </div>
            {onOpenCoreDetail && (
              <button
                type="button"
                onClick={onOpenCoreDetail}
                className="text-[11px] font-mono text-[#D4AF37] hover:underline cursor-pointer shrink-0"
              >
                Hồ sơ chi tiết →
              </button>
            )}
          </div>
        </div>

        {/* Support Items Asymmetric Collage (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
          {/* Bottom Card Visual */}
          <motion.div
            key={items.bottom.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={itemTransition}
            className="p-3.5 rounded-xs border border-[#DFD5C5] relative overflow-hidden flex items-center gap-3"
            style={{
              background: `linear-gradient(135deg, ${items.bottom.colorHex}22 0%, ${items.bottom.colorHex}45 60%, ${items.bottom.accentHex}40 100%)`,
            }}
          >
            <div className="w-12 h-12 rounded-xs border border-[#DDD0C0] bg-[#FFFDF9]/80 p-2 shrink-0 flex items-center justify-center">
              <PatternMotif
                type={items.bottom.patternType}
                color="#241E1A"
                className="w-full h-full opacity-70"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono text-[#8C7E72] uppercase tracking-wider">
                Phần Dưới · {items.bottom.modernityScore}% Hiện đại
              </div>
              <div className="text-sm font-editorial font-bold text-[#241E1A] truncate">
                {items.bottom.name}
              </div>
              <div className="text-[11px] text-[#655A52] truncate font-serif">
                {items.bottom.material.split('&')[0]}
              </div>
            </div>
          </motion.div>

          {/* Shoes Card Visual */}
          <motion.div
            key={items.shoes.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={itemTransition}
            className="p-3.5 rounded-xs border border-[#DFD5C5] relative overflow-hidden flex items-center gap-3"
            style={{
              background: `linear-gradient(135deg, ${items.shoes.colorHex}22 0%, ${items.shoes.colorHex}45 60%, ${items.shoes.accentHex}40 100%)`,
            }}
          >
            <div className="w-12 h-12 rounded-xs border border-[#DDD0C0] bg-[#FFFDF9]/80 p-2 shrink-0 flex items-center justify-center">
              <PatternMotif
                type={items.shoes.patternType}
                color="#241E1A"
                className="w-full h-full opacity-70"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono text-[#8C7E72] uppercase tracking-wider">
                Giày Guốc · {items.shoes.modernityScore}% Hiện đại
              </div>
              <div className="text-sm font-editorial font-bold text-[#241E1A] truncate">
                {items.shoes.name}
              </div>
              <div className="text-[11px] text-[#655A52] truncate font-serif">
                {items.shoes.material.split('&')[0]}
              </div>
            </div>
          </motion.div>

          {/* Bag Card Visual */}
          <motion.div
            key={items.bag.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={itemTransition}
            className="p-3.5 rounded-xs border border-[#DFD5C5] relative overflow-hidden flex items-center gap-3"
            style={{
              background: `linear-gradient(135deg, ${items.bag.colorHex}22 0%, ${items.bag.colorHex}45 60%, ${items.bag.accentHex}40 100%)`,
            }}
          >
            <div className="w-12 h-12 rounded-xs border border-[#DDD0C0] bg-[#FFFDF9]/80 p-2 shrink-0 flex items-center justify-center">
              <PatternMotif
                type={items.bag.patternType}
                color="#241E1A"
                className="w-full h-full opacity-70"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono text-[#8C7E72] uppercase tracking-wider">
                Túi Xách · {items.bag.modernityScore}% Hiện đại
              </div>
              <div className="text-sm font-editorial font-bold text-[#241E1A] truncate">
                {items.bag.name}
              </div>
              <div className="text-[11px] text-[#655A52] truncate font-serif">
                {items.bag.material.split('&')[0]}
              </div>
            </div>
          </motion.div>

          {/* Optional Accent Card Visual */}
          {items.accent && (
            <motion.div
              key={items.accent.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={itemTransition}
              className="p-3.5 rounded-xs border border-[#DFD5C5] relative overflow-hidden flex items-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${items.accent.colorHex}22 0%, ${items.accent.colorHex}45 60%, ${items.accent.accentHex}40 100%)`,
              }}
            >
              <div className="w-12 h-12 rounded-xs border border-[#DDD0C0] bg-[#FFFDF9]/80 p-2 shrink-0 flex items-center justify-center">
                <PatternMotif
                  type={items.accent.patternType}
                  color="#241E1A"
                  className="w-full h-full opacity-70"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono text-[#8C7E72] uppercase tracking-wider">
                  Điểm Nhấn · {items.accent.modernityScore}% Hiện đại
                </div>
                <div className="text-sm font-editorial font-bold text-[#241E1A] truncate">
                  {items.accent.name}
                </div>
                <div className="text-[11px] text-[#655A52] truncate font-serif">
                  {items.accent.material.split('&')[0]}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
