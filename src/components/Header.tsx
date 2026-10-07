import React from 'react';
import { Bookmark, Sparkles } from 'lucide-react';

interface HeaderProps {
  onSaveMoodboard: () => void;
  onOpenAbout: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onSaveMoodboard, onOpenAbout, savedCount }) => {
  return (
    <header className="border-b border-[#E5DDD0] bg-[#FAF7F2]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Single text element in editorial serif) */}
        <a
          href="#"
          className="text-2xl sm:text-3xl font-editorial font-semibold tracking-tight text-[#241E1A] hover:text-[#8C3B24] transition-colors flex items-baseline gap-2 group"
        >
          <span>Việt Phục Remix</span>
          <span className="text-xs font-sans tracking-widest text-[#8C7E72] font-normal uppercase hidden sm:inline">
            · Studio Giám Tuyển
          </span>
        </a>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs lg:text-sm font-medium tracking-wide text-[#655A52]">
          <a
            href="#moodboard"
            className="hover:text-[#8C3B24] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#8C3B24] hover:after:w-full after:transition-all"
          >
            Bảng Cảm Hứng
          </a>
          <a
            href="#cultural-dna"
            className="hover:text-[#8C3B24] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#8C3B24] hover:after:w-full after:transition-all"
          >
            Mã Gen Di Sản
          </a>
          <button
            type="button"
            onClick={onOpenAbout}
            className="hover:text-[#8C3B24] transition-colors relative py-1 text-left cursor-pointer after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#8C3B24] hover:after:w-full after:transition-all"
          >
            Triết Lý Tiếp Biến
          </button>
          <a
            href="#presets"
            className="hover:text-[#8C3B24] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#8C3B24] hover:after:w-full after:transition-all"
          >
            Bộ Phối Sẵn
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSaveMoodboard}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[#FAF7F2] bg-[#241E1A] hover:bg-[#8C3B24] rounded-sm transition-all duration-200 cursor-pointer shadow-xs active:scale-98 whitespace-nowrap"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Lưu Moodboard {savedCount > 0 ? `(${savedCount})` : ''}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
