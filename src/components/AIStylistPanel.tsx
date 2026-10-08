import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Compass,
  Palette,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import {
  CoreItem,
  ActiveSupportItems,
  SetupData,
  AIStatusInfo,
  StylistAdviceResult,
  StylistRecommendationItem,
  SupportOption,
  SupportCategoryId,
} from '../types';
import { SUPPORT_ITEMS } from '../data/mockFashionData';
import { requestStylistAdvice } from '../services/aiStylistApi';

interface AIStylistPanelProps {
  core: CoreItem;
  supportItems: ActiveSupportItems;
  setupData: SetupData;
  targetRemix: number;
  actualRemix: number;
  aiStatus: AIStatusInfo;
  onSelectSupportItem: (category: SupportCategoryId, item: SupportOption) => void;
  onApplyRefinementText: (text: string) => void;
  currentRefinementText?: string;
}

export const AIStylistPanel: React.FC<AIStylistPanelProps> = ({
  core,
  supportItems,
  setupData,
  targetRemix,
  actualRemix,
  aiStatus,
  onSelectSupportItem,
  onApplyRefinementText,
  currentRefinementText = '',
}) => {
  const [query, setQuery] = useState<string>(currentRefinementText);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [adviceResult, setAdviceResult] = useState<StylistAdviceResult | null>(null);
  const [appliedItemIds, setAppliedItemIds] = useState<Set<string>>(new Set());

  // Preset quick prompt chips
  const quickPrompts = [
    {
      id: 'general',
      label: '✨ Tư vấn toàn diện',
      prompt: 'Hãy đánh giá tổng quan bản phối này và đưa ra lời khuyên để diện mạo ấn tượng nhất.',
      type: 'general' as const,
    },
    {
      id: 'occasion',
      label: `🏛️ Chuẩn mực cho ${setupData.occasion.split('/')[0].trim()}`,
      prompt: `Bản phối này đã hoàn toàn phù hợp và đúng chuẩn mực cho dịp "${setupData.occasion}" tại "${setupData.location}" chưa?`,
      type: 'occasion' as const,
    },
    {
      id: 'color',
      label: '🎨 Hài hòa màu sắc',
      prompt: `Làm sao để màu sắc các phụ kiện tôn trọn tông màu ${core.palette[0]?.name || 'áo'} mà vẫn hiện đại?`,
      type: 'color' as const,
    },
    {
      id: 'remix',
      label: '⚡ Gợi ý phối đồ cân bằng',
      prompt: 'Hãy gợi ý cách cân bằng mức độ đương đại và di sản để bản phối hài hòa nhất.',
      type: 'remix' as const,
    },
  ];

  const handleConsult = async (userPrompt: string, consultType?: string) => {
    if (!aiStatus.isAvailable || isLoading) return;

    setIsLoading(true);
    // Also notify parent so guardrail stays updated with the refinement query
    if (userPrompt.trim()) {
      onApplyRefinementText(userPrompt);
    }

    const payload = {
      coreId: core.id,
      bottomId: supportItems.bottom.id,
      shoesId: supportItems.shoes.id,
      bagId: supportItems.bag.id,
      accentId: supportItems.accent ? supportItems.accent.id : null,
      occasion: setupData.occasion,
      location: setupData.location,
      style: setupData.style,
      preferredColor: setupData.preferredColor,
      targetRemix,
      actualRemix,
      userQuery: userPrompt,
      consultationType: (consultType || 'custom') as any,
    };

    const res = await requestStylistAdvice(payload);
    setAdviceResult(res);
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    handleConsult(query.trim(), 'custom');
  };

  const handleApplySuggestion = (itemSuggestion: StylistRecommendationItem) => {
    const categoryOptions = SUPPORT_ITEMS[itemSuggestion.category];
    const targetOption = categoryOptions?.find((opt) => opt.id === itemSuggestion.itemId);

    if (targetOption) {
      onSelectSupportItem(itemSuggestion.category, targetOption);
      setAppliedItemIds((prev) => new Set([...prev, itemSuggestion.itemId]));
    }
  };

  return (
    <section className="bg-[#FDFBF7] border border-[#E8DCCB] ring-1 ring-[#B3261E]/10 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE8DC] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FAF0EB] border border-[#F2C2B5] flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#B3261E]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#241E1A] flex items-center gap-2">
              <span>Trợ lý phối đồ AI</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md font-normal normal-case bg-[#F5ECE0] text-[#8C3428] border border-[#ECDCCB]">
                Gemini 3.8
              </span>
            </h2>
            <p className="text-[11px] text-[#7A6E63] font-serif">
              Cố vấn tạo mẫu thời trang & Chuẩn mực văn hóa di sản
            </p>
          </div>
        </div>

        {/* AI Status Pill */}
        <div className="flex items-center gap-1.5">
          {aiStatus.isAvailable ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#2E7D32] bg-[#E8F5E9] border border-[#C8E6C9] px-2.5 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
              Sẵn sàng tư vấn
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#8C7E72] bg-[#EFEBE4] border border-[#DDD5C9] px-2.5 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A89F91]" />
              Chưa có API Key
            </span>
          )}
        </div>
      </div>

      {/* When API key is not configured */}
      {!aiStatus.isAvailable && (
        <div className="bg-[#FAF5ED] border border-[#E5DAC6] rounded-lg p-3.5 text-xs text-[#5C4D3E] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#B3261E] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-[#3D2E20]">
              Tính năng AI Stylist đang ở chế độ xem trước tĩnh
            </p>
            <p className="text-[11px] leading-relaxed text-[#736353]">
              Máy chủ chưa nhận diện <code className="font-mono bg-[#EFE8DC] px-1 py-0.5 rounded text-[#241E1A]">GEMINI_API_KEY</code>. Vui lòng cấu hình API Key trong bảng điều khiển Secrets của AI Studio để kích hoạt toàn bộ tính năng trò chuyện và tư vấn của AI Stylist.
            </p>
          </div>
        </div>
      )}

      {/* Quick Consultation Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#8C7E72] block">
          Chủ đề tư vấn nhanh
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((chip) => (
            <button
              key={chip.id}
              type="button"
              disabled={!aiStatus.isAvailable || isLoading}
              onClick={() => {
                setQuery(chip.prompt);
                handleConsult(chip.prompt, chip.type);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-[#FAF7EE] hover:bg-[#F3ECE1] text-[#3D342C] border border-[#E5DEC9] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Consultation Prompt Input */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <label
          htmlFor="ai-stylist-input"
          className="text-xs font-semibold text-[#241E1A] flex items-center justify-between"
        >
          <span>Hỏi Stylist hoặc ghi chú tinh chỉnh</span>
          <span className="text-[10px] font-mono text-[#8C7E72] font-normal">
            Nhấn Enter hoặc Gửi
          </span>
        </label>

        <div className="flex gap-2">
          <input
            id="ai-stylist-input"
            type="text"
            value={query}
            disabled={!aiStatus.isAvailable || isLoading}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              aiStatus.isAvailable
                ? "Ví dụ: 'Nên chọn giày nào để bớt đứng tuổi?', 'Phối thêm phụ kiện ánh bạc'..."
                : "Cần GEMINI_API_KEY để trò chuyện trực tiếp..."
            }
            className="flex-1 bg-white border border-[#DDD0C0] focus:border-[#B3261E] focus:ring-1 focus:ring-[#B3261E]/30 rounded-lg px-3.5 py-2.5 text-xs text-[#241E1A] outline-none disabled:bg-[#F2EDE4] disabled:text-[#8C7E72] disabled:cursor-not-allowed transition-colors"
          />

          <button
            type="submit"
            disabled={!aiStatus.isAvailable || isLoading || !query.trim()}
            className="px-4 py-2.5 bg-[#B3261E] hover:bg-[#962019] disabled:bg-[#C8BCAC] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shrink-0 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-2xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Đang xem xét</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Tư vấn</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="bg-[#FAF7EE] border border-[#E8DFC8] rounded-lg p-3.5 flex items-center gap-3 text-xs text-[#7A4B3A]">
          <Loader2 className="w-4 h-4 text-[#B3261E] animate-spin shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold text-[#241E1A]">AI Stylist đang phân tích bản phối...</p>
            <p className="text-[11px] text-[#7A6E63] font-serif">
              Đối chiếu phom dáng di sản {core.name} với tủ đồ đương đại và không gian {setupData.location}.
            </p>
          </div>
        </div>
      )}

      {/* AI Stylist Response Card */}
      <AnimatePresence>
        {adviceResult && adviceResult.success && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-[#FAF7EE] border border-[#E5DEC9] rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs"
          >
            {/* Review Section */}
            <div className="space-y-1.5 border-b border-[#E8DEC8] pb-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#B3261E]">
                <Sparkles className="w-3.5 h-3.5 text-[#B3261E]" />
                <span>Nhận Định Tạo Mẫu</span>
              </div>
              <p className="text-xs text-[#2E251E] leading-relaxed italic bg-white/80 border-l-2 border-[#B3261E] pl-3 py-2 rounded-r-md font-serif">
                "{adviceResult.review}"
              </p>
            </div>

            {/* Recommendations List */}
            {adviceResult.recommendations && adviceResult.recommendations.length > 0 && (
              <div className="space-y-2 border-b border-[#E8DEC8] pb-3.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#3D342C] block">
                  Lời Khuyên Phối Đồ Thực Tế
                </span>
                <ul className="space-y-2">
                  {adviceResult.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-[#524538] flex items-start gap-2 leading-relaxed">
                      <span className="w-4 h-4 rounded-full bg-[#EFE5D5] text-[#7A4B3A] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actionable Catalog Item Suggestions */}
            {adviceResult.suggestedItems && adviceResult.suggestedItems.length > 0 && (
              <div className="space-y-2.5 border-b border-[#E8DEC8] pb-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#3D342C]">
                    Gợi Ý Đổi Đồ Từ Tủ Đồ
                  </span>
                  <span className="text-[10px] font-mono text-[#8C7E72]">
                    Áp dụng tức thì
                  </span>
                </div>

                <div className="space-y-2">
                  {adviceResult.suggestedItems.map((sug, idx) => {
                    const isAlreadyApplied = appliedItemIds.has(sug.itemId);
                    return (
                      <div
                        key={idx}
                        className="bg-white border border-[#E5DEC9] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-[#F2ECE1] text-[#7A4B3A]">
                              {sug.category}
                            </span>
                            <span className="text-xs font-semibold text-[#241E1A]">
                              {sug.itemName}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#695B4E] leading-relaxed">
                            {sug.reason}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isAlreadyApplied}
                          onClick={() => handleApplySuggestion(sug)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium uppercase tracking-wider shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
                            isAlreadyApplied
                              ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] cursor-default'
                              : 'bg-[#241E1A] hover:bg-[#B3261E] text-white'
                          }`}
                        >
                          {isAlreadyApplied ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Đã chọn</span>
                            </>
                          ) : (
                            <>
                              <span>Áp dụng món này</span>
                              <ArrowRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cultural Heritage Highlight */}
            {adviceResult.culturalHighlight && (
              <div className="bg-[#FAF3E8] border border-[#E5DAC6] rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7A4B3A]">
                  <Compass className="w-3.5 h-3.5 text-[#7A4B3A]" />
                  <span>Điểm Sáng Di Sản</span>
                </div>
                <p className="text-xs text-[#524538] leading-relaxed font-serif">
                  {adviceResult.culturalHighlight}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state if consultation fails */}
      {adviceResult && !adviceResult.success && !isLoading && (
        <div className="bg-[#FDF2F0] border border-[#F5C2BA] rounded-lg p-3.5 text-xs text-[#A82A24] space-y-1">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 text-[#B3261E]" />
            <span>Không thể hoàn thành tư vấn AI</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {adviceResult.error || 'Đã xảy ra sự cố trong quá trình giao tiếp với mô hình Gemini.'}
          </p>
          <button
            type="button"
            onClick={() => handleConsult(query || 'Tư vấn')}
            className="mt-1 text-xs font-semibold underline hover:no-underline cursor-pointer"
          >
            Thử lại lần nữa
          </button>
        </div>
      )}
    </section>
  );
};
