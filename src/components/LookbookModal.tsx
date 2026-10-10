import React, { useState, useEffect, useRef, useId } from 'react';
import { CoreItem } from '../types';
import { PatternMotif } from './PatternMotif';
import { getCoreGarmentDemoMedia, getCoreGarmentLookbook } from '../data/demoImageMap';
import { X, BookOpen, Feather, Camera, Sparkles } from 'lucide-react';

interface LookbookModalProps {
  core: CoreItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LookbookModal: React.FC<LookbookModalProps> = ({ core, isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [failedSrcs, setFailedSrcs] = useState<Record<string, boolean>>({});
  const [lookbookError, setLookbookError] = useState<boolean>(false);

  useEffect(() => {
    setActivePhotoIndex(0);
    setLookbookError(false);
  }, [core?.id, isOpen]);

  useEffect(() => {
    if (!isOpen || !core) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const buttons = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [])
        .filter(button => button.getClientRects().length > 0);
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (!first || !last) return;
      if (!dialogRef.current?.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [isOpen, core?.id, onClose]);

  if (!isOpen || !core) return null;

  const demoMedia = getCoreGarmentDemoMedia(core.id);
  const lookbookMedia = getCoreGarmentLookbook(core.id);
  const validGallery =
    demoMedia?.gallery.filter((photo) => !failedSrcs[photo.src]) || [];
  const currentPhoto = validGallery[activePhotoIndex] || validGallery[0];

  const handleImageError = (src: string) => {
    setFailedSrcs((prev) => ({ ...prev, [src]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-[#181412]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        ref={dialogRef}
        className="heritage-profile-modal bg-[#FFFDF9] border border-[#D5C7B4] rounded-sm w-full max-w-[1100px] max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          type="button"
          className="absolute top-3 right-3 z-10 w-11 h-11 inline-flex items-center justify-center text-[#7A6A5C] hover:text-[#241E1A] hover:bg-[#F2EBE0] rounded-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E]"
          aria-label="Đóng bảng chi tiết"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="shrink-0 border-b border-[#EFE8DC] p-4 pr-16 sm:p-6 sm:pr-16">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#B7410E]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>HỒ SƠ CỔ PHỤC</span>
          </div>
          <h2 id={titleId} className="text-2xl sm:text-3xl font-editorial font-bold text-[#241E1A] mt-1">
            {core.vietnameseTitle}
          </h2>
          <p className="text-sm font-serif italic text-[#7D7065] mt-0.5">
            {core.era}
          </p>
        </div>

        <div className="heritage-profile-content min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
        <div className={validGallery.length > 0 ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start' : undefined}>
        {/* Editorial Heritage Photo Gallery (when real photographs are available for this garment) */}
        {validGallery.length > 0 && currentPhoto && (
          <div className="heritage-profile-gallery min-w-0 bg-[#FAF7F2] border border-[#E7DECE] rounded-xs p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#B7410E] inline-flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>Tư Liệu Hình Ảnh Thực Tế</span>
              </span>
              <span className="text-xs font-medium text-[#655A52]">
                Góc nhìn: <strong className="text-[#241E1A]">{currentPhoto.label}</strong>
              </span>
            </div>

            {/* Main Selected Photograph */}
            <div className="w-full h-[300px] sm:h-[360px] lg:h-[420px] bg-[#FFFDF9] border border-[#E2D8C8] rounded-xs overflow-hidden flex items-center justify-center p-2">
              <img
                src={currentPhoto.src}
                alt={currentPhoto.alt}
                onError={() => handleImageError(currentPhoto.src)}
                className="w-full h-full object-contain rounded-xs select-none"
              />
            </div>

            {/* Selectable Thumbnails */}
            <div className="grid grid-cols-3 gap-2.5">
              {validGallery.map((photo, idx) => {
                const isSelected = idx === activePhotoIndex;
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    aria-pressed={isSelected}
                    className={`flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 p-1.5 rounded-xs border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFFDF9] border-[#B7410E] ring-1 ring-[#B7410E]/30 shadow-2xs'
                        : 'bg-[#FFFDF9]/70 hover:bg-[#FFFDF9] border-[#DED3C2] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="w-11 h-13 rounded-xs overflow-hidden bg-[#FAF7EE] border border-[#E5DEC9] shrink-0">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        onError={() => handleImageError(photo.src)}
                        className="w-full h-full object-contain select-none"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-[#8C7E72] block">
                        Ảnh 0{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-[#241E1A] truncate block">
                        {photo.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="heritage-profile-details min-w-0">
        {/* Graphic & Provenance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center bg-[#FAF7F2] p-5 rounded-xs border border-[#E7DECE] mb-6">
          <div className="w-28 h-28 mx-auto rounded-full bg-[#FFFDF9] border border-[#D5C7B4] flex items-center justify-center p-4 shadow-inner">
            <PatternMotif type={core.patternType} color="#B7410E" className="w-full h-full" />
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
            <Feather className="w-4 h-4 text-[#B7410E]" />
            <span>3 Đặc Điểm Nhận Diện Không Thể Thay Thế</span>
          </h3>
          <div className="space-y-2.5">
            {core.heritageDna.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-[#FAF7F2] border-l-2 border-[#B7410E] rounded-r-xs text-xs sm:text-sm text-[#52463E] leading-relaxed"
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
              Quy Chuẩn Form Cắt
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

        </div>
        </div>

        {/* Editorial Styling Reference / Lookbook Section */}
        {lookbookMedia && !lookbookError && (
          <div className="mt-6 bg-[#FAF7F2] border border-[#E7DECE] rounded-xs p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#EAE1D3] pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#B7410E]" />
                <h3 className="text-xs sm:text-sm font-bold font-editorial uppercase tracking-wider text-[#241E1A]">
                  Gợi ý phối đồ · Lookbook
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#8C7E72]">
                Bộ phối tham khảo · Cảm hứng thị giác
              </span>
            </div>

            <div className="heritage-lookbook-layout grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="heritage-lookbook-photo sm:col-span-5 aspect-[3/4] max-h-[300px] bg-[#FFFDF9] border border-[#E2D8C8] rounded-xs overflow-hidden flex items-center justify-center p-1.5 shadow-2xs">
                <img
                  src={lookbookMedia.src}
                  alt={lookbookMedia.alt}
                  onError={() => setLookbookError(true)}
                  loading="lazy"
                  className="w-full h-full object-contain rounded-xs select-none"
                />
              </div>

              <div className="heritage-lookbook-caption sm:col-span-7 space-y-2.5 text-xs sm:text-sm text-[#4E433C]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#B7410E] block mb-0.5">
                    Lookbook Phong Cách
                  </span>
                  <h4 className="font-editorial font-bold text-[#241E1A] text-sm sm:text-base">
                    {lookbookMedia.title}
                  </h4>
                </div>
                <p className="font-serif italic text-[#6E6155] leading-relaxed">
                  {lookbookMedia.caption}
                </p>
                <div className="text-[11px] text-[#7A6E63] font-serif bg-[#FFFDF9]/90 border border-[#E8DEC9] p-2.5 rounded-xs leading-relaxed">
                  <strong className="text-[#B7410E] font-sans font-semibold not-italic">Lưu ý cảm hứng:</strong> Đây là ảnh tư liệu phối đồ nghệ thuật thực tế để bạn tham khảo dáng vẻ tổng thể, tách biệt với bản phối mannequin 2D tương tác đang hiển thị tại Trang 3.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#EFE8DC] flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 bg-[#241E1A] hover:bg-[#B7410E] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
          >
            Đóng Hồ Sơ
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
