import React from 'react';
import { CoreItem } from '../types';
import { PatternMotif } from './PatternMotif';
import { X, BookOpen, Compass, Sparkles, Feather } from 'lucide-react';

interface LookbookModalProps {
  core: CoreItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LookbookModal: React.FC<LookbookModalProps> = ({ core, isOpen, onClose }) => {
  if (!isOpen || !core) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#181412]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-[#FFFDF9] border border-[#D5C7B4] rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-1.5 text-[#7A6A5C] hover:text-[#241E1A] hover:bg-[#F2EBE0] rounded-xs transition-colors cursor-pointer"
          aria-label="Đóng bảng chi tiết"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-[#EFE8DC] pb-4 mb-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8C3B24]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Hồ Sơ Di Sản // Cổ Vật Học</span>
            <span aria-hidden="true" className="text-[#C8BCAC]">·</span>
            <span className="text-[#655A52]">{core.archiveCode}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-[#241E1A] mt-1">
            {core.vietnameseTitle}
          </h2>
          <p className="text-sm font-serif italic text-[#7D7065] mt-0.5">
            {core.era}
          </p>
        </div>

        {/* Graphic & Provenance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center bg-[#FAF7F2] p-5 rounded-xs border border-[#E7DECE] mb-6">
          <div className="w-28 h-28 mx-auto rounded-full bg-[#FFFDF9] border border-[#D5C7B4] flex items-center justify-center p-4 shadow-inner">
            <PatternMotif type={core.patternType} color="#8C3B24" className="w-full h-full" />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <span className="text-xs uppercase font-mono text-[#8C7E72] block">
              Triết Lý Cấu Trúc
            </span>
            <p className="text-xs sm:text-sm text-[#4E433C] leading-relaxed">
              {core.editorialDescription}
            </p>
          </div>
        </div>

        {/* Detailed Points */}
        <div className="space-y-4">
          <h3 className="text-base font-editorial font-bold text-[#241E1A] flex items-center gap-2">
            <Feather className="w-4 h-4 text-[#8C3B24]" />
            <span>3 Đặc Điểm Nhận Diện Không Thể Thay Thế</span>
          </h3>
          <div className="space-y-2.5">
            {core.heritageDna.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-[#FAF7F2] border-l-2 border-[#8C3B24] rounded-r-xs text-xs sm:text-sm text-[#52463E] leading-relaxed"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Material & Tailoring Notes */}
        <div className="mt-6 pt-5 border-t border-[#EFE8DC] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#FAF7F2] p-3 rounded-xs border border-[#E7DECE]">
            <span className="font-mono uppercase text-[#8C7E72] block text-[10px] mb-1">
              Quy Chuẩn Phom Cắt
            </span>
            <p className="text-[#3A3029] font-medium leading-relaxed">
              {core.silhouette}
            </p>
          </div>
          <div className="bg-[#FAF7F2] p-3 rounded-xs border border-[#E7DECE]">
            <span className="font-mono uppercase text-[#8C7E72] block text-[10px] mb-1">
              Chất Liệu Dệt Khuyên Dùng
            </span>
            <p className="text-[#3A3029] font-medium leading-relaxed">
              {core.material}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#EFE8DC] flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 bg-[#241E1A] hover:bg-[#8C3B24] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
          >
            Đóng Hồ Sơ
          </button>
        </div>
      </div>
    </div>
  );
};
