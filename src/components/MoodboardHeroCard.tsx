import React from 'react';
import { CoreItem } from '../types';
import { PatternMotif } from './PatternMotif';
import { ShieldCheck, Sparkles, Eye, Info } from 'lucide-react';

interface MoodboardHeroCardProps {
  core: CoreItem;
  onOpenDetail?: () => void;
}

export const MoodboardHeroCard: React.FC<MoodboardHeroCardProps> = ({ core, onOpenDetail }) => {
  return (
    <article className="relative bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-6 sm:p-7 shadow-xs flex flex-col justify-between overflow-hidden transition-all duration-300 group">
      {/* Editorial Catalog Index & Status Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EFE8DC] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase font-semibold text-[#8C3B24]">
            <span>{core.archiveCode}</span>
            <span aria-hidden="true" className="text-[#C8BCAC]">·</span>
            <span className="text-[#655A52]">{core.era}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-editorial font-bold text-[#241E1A] mt-1 leading-tight tracking-tight">
            {core.vietnameseTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#7D7065] mt-1 font-serif italic">
            {core.subTitle}
          </p>
        </div>

        {/* Fixed Core Badge - clearly indicating Hero Card is fixed */}
        <div className="shrink-0 text-right">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5EFE6] border border-[#DDD0C0] text-[#7A4B3A] text-[10px] uppercase tracking-wider font-semibold rounded-xs">
            <ShieldCheck className="w-3 h-3 text-[#8C3B24]" />
            <span>Trụ Cột Cố Định</span>
          </div>
        </div>
      </div>

      {/* Main Visual Placeholder with Artistic Textile Motif */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] bg-gradient-to-b from-[#F5EFE6] via-[#EFE7DA] to-[#E5DBCB] rounded-xs border border-[#DFD5C5] overflow-hidden flex flex-col justify-between p-6 group-hover:border-[#C25E3B]/40 transition-colors">
        {/* Subtle decorative background watermark pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center p-8">
          <PatternMotif type={core.patternType} color="#4A3728" className="w-full h-full max-w-[280px]" />
        </div>

        {/* Top Tag & Palette dots */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[10px] tracking-widest uppercase font-mono text-[#5C4F44] bg-[#FFFDF9]/85 px-2 py-0.5 rounded-xs border border-[#DDD1C1] backdrop-blur-xs">
            Bản Mẫu Thêu Dệt #01
          </span>
          <div className="flex items-center gap-1.5 bg-[#FFFDF9]/85 px-2 py-1 rounded-xs border border-[#DDD1C1]">
            {core.palette.map((color, idx) => (
              <span
                key={idx}
                className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                style={{ backgroundColor: color.hex }}
                title={`${color.name} (${color.hex})`}
              />
            ))}
          </div>
        </div>

        {/* Center Stylized Silhouette Graphic */}
        <div className="relative z-10 my-auto text-center py-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-[#FFFDF9]/60 border border-[#D5C7B4] flex items-center justify-center p-3 shadow-inner backdrop-blur-xs">
            <PatternMotif type={core.patternType} color="#8C3B24" className="w-full h-full" />
          </div>
          <p className="mt-3 text-xs tracking-widest uppercase font-mono text-[#7A6A5C]">
            Visual Khối Dáng Đương Đại
          </p>
          <div className="mt-1 text-sm font-editorial italic font-medium text-[#241E1A]">
            {core.name}
          </div>
        </div>

        {/* Bottom Swatch Metadata */}
        <div className="relative z-10 bg-[#241E1A]/85 text-[#F8F5EE] p-3 rounded-xs backdrop-blur-sm border border-white/10 flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="text-[10px] tracking-widest uppercase text-[#D6CEBE] font-mono">
              Chất Liệu Tuyển Chọn
            </div>
            <div className="text-xs font-medium truncate text-[#FFFDF9]">
              {core.material}
            </div>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-[#D4AF37] shrink-0 font-semibold">
            {core.baseModernity}% Đương Đại
          </span>
        </div>
      </div>

      {/* Editorial Descriptive Notes */}
      <div className="mt-5 space-y-3">
        <p className="text-xs sm:text-sm text-[#4E433C] leading-relaxed line-clamp-3">
          {core.editorialDescription}
        </p>

        {/* Blueprint Specs */}
        <div className="pt-3 border-t border-[#EFE8DC] grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#8C7E72] block font-mono">
              Phom Dáng Cắt
            </span>
            <span className="font-medium text-[#241E1A] line-clamp-1" title={core.silhouette}>
              {core.silhouette}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#8C7E72] block font-mono">
              Hệ Màu Bản Sắc
            </span>
            <span className="font-medium text-[#241E1A]">
              {core.palette.map((p) => p.name).join(' · ')}
            </span>
          </div>
        </div>

        {onOpenDetail && (
          <button
            type="button"
            onClick={onOpenDetail}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#7A4B3A] hover:text-[#241E1A] bg-[#F7F2E8] hover:bg-[#EFE8DC] rounded-xs border border-[#DDD1C1] transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Xem Hồ Sơ Cổ Vật & Kỹ Nghệ</span>
          </button>
        )}
      </div>
    </article>
  );
};
