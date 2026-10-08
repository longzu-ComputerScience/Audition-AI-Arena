import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, RefreshCw, AlertCircle, Download, Layers, Palette } from 'lucide-react';
import { CoreItem, ActiveSupportItems, SetupData } from '../types';
import {
  requestOutfitEditorialImage,
  GenerateOutfitImageResult,
} from '../services/imageGenerationApi';

export interface OutfitSnapshot {
  core: CoreItem;
  supportItems: ActiveSupportItems;
  setupData: SetupData;
  actualRemix: number;
}

interface AIResultModalProps {
  isOpen: boolean;
  snapshot: OutfitSnapshot | null;
  onClose: () => void;
}

export const AIResultModal: React.FC<AIResultModalProps> = ({
  isOpen,
  snapshot,
  onClose,
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<GenerateOutfitImageResult | null>(null);
  const [activeSnapshot, setActiveSnapshot] = useState<OutfitSnapshot | null>(null);

  // Trigger generation exactly once whenever modal opens with a new snapshot
  useEffect(() => {
    if (isOpen && snapshot) {
      setActiveSnapshot(snapshot);
      executeGeneration(snapshot);
    } else if (!isOpen) {
      // Reset state on close
      setStatus('idle');
      setResult(null);
    }
  }, [isOpen, snapshot]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'loading') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, status, onClose]);

  const executeGeneration = async (currentSnap: OutfitSnapshot) => {
    setStatus('loading');
    setResult(null);

    const payload = {
      coreId: currentSnap.core.id,
      bottomId: currentSnap.supportItems.bottom.id,
      shoesId: currentSnap.supportItems.shoes.id,
      bagId: currentSnap.supportItems.bag.id,
      accentId: currentSnap.supportItems.accent ? currentSnap.supportItems.accent.id : null,
      occasion: currentSnap.setupData.occasion,
      location: currentSnap.setupData.location,
      style: currentSnap.setupData.style,
      preferredColor: currentSnap.setupData.preferredColor,
    };

    const res = await requestOutfitEditorialImage(payload);
    setResult(res);

    if (res.success && res.imageUrl) {
      setStatus('success');
    } else {
      setStatus('error');
    }
  };

  const handleRetry = () => {
    if (activeSnapshot && status !== 'loading') {
      executeGeneration(activeSnapshot);
    }
  };

  const handleDownload = () => {
    if (!result?.imageUrl) return;
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = `viet-phuc-remix-${activeSnapshot?.core.id || 'editorial'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !activeSnapshot) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm shadow-xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE3D6] bg-[#FAF7EE]/90 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#B3261E]/10 flex items-center justify-center text-[#B3261E]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2
                  id="ai-modal-title"
                  className="text-base font-bold text-[#2B231D] tracking-tight"
                >
                  Bản Minh Họa Thời Trang AI
                </h2>
                <p className="text-xs text-[#7A6E63]">
                  {activeSnapshot.core.name} · Remix {activeSnapshot.actualRemix}%
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={status === 'loading'}
              className="p-1.5 text-[#7A6E63] hover:text-[#2B231D] hover:bg-[#EFE8DC]/50 rounded-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* 1. LOADING STATE */}
            {status === 'loading' && (
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-3 border-[#EAE3D6] border-t-[#B3261E] animate-spin" />
                  <Sparkles className="w-6 h-6 text-[#B3261E] animate-pulse" />
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-base font-bold text-[#2B231D]">
                    Đang tạo bản minh họa từ bộ phối của bạn...
                  </h3>
                  <p className="text-xs text-[#7A6E63] leading-relaxed">
                    Hệ thống đang dịch phối trang phục ({activeSnapshot.core.name},{' '}
                    {activeSnapshot.supportItems.bottom.name.split(' ')[0]},{' '}
                    {activeSnapshot.supportItems.shoes.name.split(' ')[0]}) thành bức họa
                    editorial đương đại qua mô hình Gemini.
                  </p>
                </div>

                {/* Outfit snapshot preview chips while loading */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 max-w-sm text-[11px] text-[#5A4F46]">
                  <span className="bg-[#FAF7EE] border border-[#E3D9CC] px-2 py-0.5 rounded-2xs">
                    {activeSnapshot.core.name}
                  </span>
                  <span className="bg-[#FAF7EE] border border-[#E3D9CC] px-2 py-0.5 rounded-2xs">
                    {activeSnapshot.setupData.style}
                  </span>
                  <span className="bg-[#FAF7EE] border border-[#E3D9CC] px-2 py-0.5 rounded-2xs">
                    {activeSnapshot.setupData.preferredColor}
                  </span>
                </div>
              </div>
            )}

            {/* 2. SUCCESS STATE */}
            {status === 'success' && result?.imageUrl && (
              <div className="space-y-4">
                {/* Image Container */}
                <div className="relative bg-[#FAF7EE] border border-[#E3D9CC] rounded-xs overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={result.imageUrl}
                    alt={`Bản minh họa thời trang AI cho bộ phối ${activeSnapshot.core.name}`}
                    className="w-full max-h-[460px] object-contain rounded-xs shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-[#FFFDF9]/95 backdrop-blur-xs border border-[#E3D9CC] px-2.5 py-1 rounded-xs shadow-2xs flex items-center gap-1.5 text-[11px] font-semibold text-[#B3261E]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Minh họa tạo bởi AI</span>
                  </div>
                </div>

                {/* Outfit Recap Details */}
                <div className="bg-[#FAF7EE]/70 border border-[#EAE3D6] rounded-xs p-3.5 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#2B231D] uppercase tracking-wider text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-[#B3261E]" />
                    <span>Thông tin bộ phối được minh họa</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#5A4F46] pt-1">
                    <div>
                      <span className="text-[#8C7E72]">Việt phục chính:</span>{' '}
                      <span className="font-semibold text-[#2B231D]">
                        {activeSnapshot.core.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8C7E72]">Phong cách:</span>{' '}
                      <span className="font-semibold text-[#2B231D]">
                        {activeSnapshot.setupData.style}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8C7E72]">Phần dưới:</span>{' '}
                      <span>{activeSnapshot.supportItems.bottom.name}</span>
                    </div>
                    <div>
                      <span className="text-[#8C7E72]">Giày & Túi:</span>{' '}
                      <span>
                        {activeSnapshot.supportItems.shoes.name.split(' ')[0]} +{' '}
                        {activeSnapshot.supportItems.bag.name.split(' ')[0]}
                      </span>
                    </div>
                    {activeSnapshot.supportItems.accent && (
                      <div className="sm:col-span-2">
                        <span className="text-[#8C7E72]">Điểm nhấn:</span>{' '}
                        <span>{activeSnapshot.supportItems.accent.name}</span>
                      </div>
                    )}
                    <div className="sm:col-span-2 flex items-center gap-1.5">
                      <Palette className="w-3 h-3 text-[#B3261E]" />
                      <span className="text-[#8C7E72]">Màu sắc chủ đạo:</span>{' '}
                      <span>{activeSnapshot.setupData.preferredColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ERROR STATE */}
            {status === 'error' && (
              <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#B3261E]/10 flex items-center justify-center text-[#B3261E]">
                  <AlertCircle className="w-6 h-6" />
                </div>

                <div className="space-y-2 max-w-lg">
                  <h3 className="text-base font-bold text-[#2B231D]">
                    Không thể tạo bản minh họa AI
                  </h3>
                  <p className="text-xs text-[#7A6E63] leading-relaxed bg-[#FAF7EE] border border-[#EAE3D6] p-3 rounded-xs text-left">
                    {result?.error ||
                      'Đã xảy ra lỗi không xác định trong quá trình gọi mô hình tạo ảnh. Vui lòng thử lại.'}
                  </p>
                </div>

                {/* Quota / Billing explanation note */}
                {result?.errorCode === 'QUOTA_EXCEEDED' && (
                  <p className="text-[11px] text-[#8C7E72] max-w-md text-left">
                    * Lưu ý: Mô hình tạo ảnh `gemini-3.1-flash-lite-image` yêu cầu dự án
                    sử dụng khóa API có hạn mức hình ảnh (Paid Key). Bạn có thể cấu hình
                    lại API key trong mục <strong>Settings &gt; Secrets</strong> trên AI Studio.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3.5 border-t border-[#EAE3D6] bg-[#FAF7EE]/90 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={status === 'loading'}
              className="px-4 py-2 text-xs font-semibold text-[#5A4F46] hover:text-[#2B231D] bg-[#FFFDF9] border border-[#D5C7B4] rounded-xs transition-colors cursor-pointer disabled:opacity-40"
            >
              Đóng
            </button>

            <div className="flex items-center gap-2">
              {status === 'error' && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#B3261E] hover:bg-[#8F1E18] rounded-xs transition-colors cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Thử lại</span>
                </button>
              )}

              {status === 'success' && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#B3261E] hover:bg-[#8F1E18] rounded-xs transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải ảnh xuống</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
