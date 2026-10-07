import React from 'react';
import { CoreVietPhucId, ContextId, StyleId, CoreItem } from '../types';
import { CORE_ITEMS, CONTEXT_OPTIONS, STYLE_OPTIONS, PRESET_LOOKS } from '../data/mockFashionData';
import { CalculatedDna } from '../utils/fashionCalculations';
import { Sliders, Lock, Sparkles, BookOpen, Layers, CheckCircle2, History } from 'lucide-react';

interface StylingControlsProps {
  selectedCore: CoreVietPhucId;
  selectedContext: ContextId;
  selectedStyle: StyleId;
  targetRemix: number;
  preferences: string;
  culturalDna: CalculatedDna;
  onCoreChange: (coreId: CoreVietPhucId) => void;
  onContextChange: (contextId: ContextId) => void;
  onStyleChange: (styleId: StyleId) => void;
  onTargetRemixChange: (value: number) => void;
  onPreferencesChange: (value: string) => void;
  onApplyPreset: (presetIndex: number) => void;
}

export const StylingControls: React.FC<StylingControlsProps> = ({
  selectedCore,
  selectedContext,
  selectedStyle,
  targetRemix,
  preferences,
  culturalDna,
  onCoreChange,
  onContextChange,
  onStyleChange,
  onTargetRemixChange,
  onPreferencesChange,
  onApplyPreset,
}) => {
  const currentCoreObj = CORE_ITEMS[selectedCore];

  return (
    <div className="space-y-7">
      {/* Editorial Section Header */}
      <div className="border-b border-[#E3D9CC] pb-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-mono text-[#8C3B24]">
          <span>Phần 01 // Giám Tuyển Bản Sắc</span>
          <span aria-hidden="true" className="text-[#C8BCAC]">·</span>
          <span className="text-[#655A52]">Điều Phối Phong Cách</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-[#241E1A] mt-1 tracking-tight">
          Tham Số Tạo Mẫu
        </h1>
        <p className="text-xs sm:text-sm text-[#6B5E52] mt-1 font-serif">
          Điều chỉnh trụ cột cổ phục, ngữ cảnh ứng dụng và tỷ lệ dung hợp đương đại.
        </p>

        {/* Quick presets buttons */}
        <div className="mt-3.5 pt-3 border-t border-[#EFE8DC]/80">
          <span className="text-[10px] uppercase tracking-wider font-mono text-[#8C7E72] block mb-2">
            Gợi ý bản phối nhanh:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_LOOKS.map((preset, idx) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => onApplyPreset(idx)}
                className="text-xs px-2.5 py-1 bg-[#F5EFE6] hover:bg-[#EBE2D5] text-[#4E433C] hover:text-[#241E1A] border border-[#DDD0C0] rounded-xs transition-colors cursor-pointer"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control Inputs Form */}
      <div className="space-y-5 bg-[#FFFDF9] border border-[#E3D9CC] p-5 sm:p-6 rounded-sm shadow-2xs">
        {/* Dropdown 1: Core Viet Phuc */}
        <div className="space-y-1.5">
          <label
            htmlFor="core-select"
            className="block text-xs font-semibold uppercase tracking-wider text-[#241E1A] font-mono"
          >
            01. Trụ Cột Việt Phục (Core Heritage)
          </label>
          <div className="relative">
            <select
              id="core-select"
              value={selectedCore}
              onChange={(e) => onCoreChange(e.target.value as CoreVietPhucId)}
              className="w-full bg-[#FAF7F2] border border-[#D5C7B4] hover:border-[#8C3B24] focus:border-[#8C3B24] focus:ring-1 focus:ring-[#8C3B24] rounded-xs px-3.5 py-2.5 text-sm text-[#241E1A] font-medium transition-colors cursor-pointer appearance-none outline-none"
            >
              {Object.values(CORE_ITEMS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.vietnameseTitle} ({item.era.split('·')[0].trim()})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#7A6A5C]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-[#7A6A5C] italic font-serif">
            Mẫu y phục trung tâm trên bảng moodboard sẽ cố định theo lựa chọn này.
          </p>
        </div>

        {/* Dropdown 2: Context */}
        <div className="space-y-1.5">
          <label
            htmlFor="context-select"
            className="block text-xs font-semibold uppercase tracking-wider text-[#241E1A] font-mono"
          >
            02. Ngữ Cảnh Ứng Dụng (Context)
          </label>
          <div className="relative">
            <select
              id="context-select"
              value={selectedContext}
              onChange={(e) => onContextChange(e.target.value as ContextId)}
              className="w-full bg-[#FAF7F2] border border-[#D5C7B4] hover:border-[#8C3B24] focus:border-[#8C3B24] focus:ring-1 focus:ring-[#8C3B24] rounded-xs px-3.5 py-2.5 text-sm text-[#241E1A] font-medium transition-colors cursor-pointer appearance-none outline-none"
            >
              {CONTEXT_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#7A6A5C]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-[#7A6A5C] font-serif">
            {CONTEXT_OPTIONS.find((c) => c.id === selectedContext)?.vibe}
          </p>
        </div>

        {/* Dropdown 3: Style */}
        <div className="space-y-1.5">
          <label
            htmlFor="style-select"
            className="block text-xs font-semibold uppercase tracking-wider text-[#241E1A] font-mono"
          >
            03. Định Hướng Phong Cách (Style)
          </label>
          <div className="relative">
            <select
              id="style-select"
              value={selectedStyle}
              onChange={(e) => onStyleChange(e.target.value as StyleId)}
              className="w-full bg-[#FAF7F2] border border-[#D5C7B4] hover:border-[#8C3B24] focus:border-[#8C3B24] focus:ring-1 focus:ring-[#8C3B24] rounded-xs px-3.5 py-2.5 text-sm text-[#241E1A] font-medium transition-colors cursor-pointer appearance-none outline-none"
            >
              {STYLE_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#7A6A5C]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-[#7A6A5C] font-serif">
            {STYLE_OPTIONS.find((s) => s.id === selectedStyle)?.description}
          </p>
        </div>

        {/* Textarea for additional preferences */}
        <div className="space-y-1.5">
          <label
            htmlFor="preferences-input"
            className="block text-xs font-semibold uppercase tracking-wider text-[#241E1A] font-mono"
          >
            04. Ghi Chú & Tinh Chỉnh Riêng
          </label>
          <textarea
            id="preferences-input"
            rows={3}
            value={preferences}
            onChange={(e) => onPreferencesChange(e.target.value)}
            placeholder="Ví dụ: Ưu tiên chất liệu linen thoáng khí, phụ kiện ánh bạc vintage, nhấn nhá họa tiết hoa sen chìm..."
            className="w-full bg-[#FAF7F2] border border-[#D5C7B4] hover:border-[#8C3B24] focus:border-[#8C3B24] focus:ring-1 focus:ring-[#8C3B24] rounded-xs p-3 text-xs sm:text-sm text-[#241E1A] transition-colors outline-none resize-none placeholder:text-[#A89C8F]"
          />
          <div className="flex items-center justify-between text-[11px] text-[#8C7E72] font-mono">
            <span>Gợi ý cho bản mô tả giám tuyển</span>
            <span className="tabular-nums">{preferences.length}/200 ký tự</span>
          </div>
        </div>

        {/* Remix Dial: Slider from 0% to 100% */}
        <div className="space-y-3 pt-3 border-t border-[#EFE8DC]">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="remix-dial"
              className="text-xs font-semibold uppercase tracking-wider text-[#241E1A] font-mono flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-[#8C3B24]" />
              <span>Remix Dial · Mục Tiêu Thiết Kế</span>
            </label>
            <div className="flex items-baseline gap-1">
              <span className="font-editorial text-2xl font-bold text-[#8C3B24] tabular-nums">
                {targetRemix}%
              </span>
              <span className="text-[10px] font-mono text-[#8C7E72] uppercase">
                Mục Tiêu
              </span>
            </div>
          </div>

          <div className="relative pt-1">
            <input
              id="remix-dial"
              type="range"
              min="0"
              max="100"
              step="1"
              value={targetRemix}
              onChange={(e) => onTargetRemixChange(Number(e.target.value))}
              className="w-full h-2 bg-[#E7DDD0] rounded-lg appearance-none cursor-pointer accent-[#8C3B24]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#8C7E72] mt-2">
              <span>0% Thuần Cổ Điển</span>
              <span>50% Giao Thoa</span>
              <span>100% Siêu Đương Đại</span>
            </div>
          </div>

          <div className="p-2.5 bg-[#F9F5EC] border border-[#E7DECE] rounded-xs text-[11px] text-[#6B5E52] flex items-center justify-between">
            <span>Trạng thái: <strong>{culturalDna.deviationText}</strong></span>
            <span className="font-mono text-[#8C3B24] font-semibold tabular-nums">
              Thực tế: {culturalDna.actualRemix}%
            </span>
          </div>
        </div>
      </div>

      {/* Cultural DNA: Magazine-style text block */}
      <section
        id="cultural-dna"
        className="bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-5 sm:p-6 shadow-2xs space-y-4"
      >
        <div className="border-b border-[#EFE8DC] pb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#8C3B24]">
              MÃ GEN VĂN HÓA // CULTURAL DNA
            </span>
            <h2 className="text-xl font-editorial font-bold text-[#241E1A] mt-0.5">
              Bản Đối Thoại Tiếp Biến
            </h2>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 bg-[#F5EFE6] border border-[#DDD0C0] text-[#7A4B3A] rounded-xs">
            {culturalDna.synergyLevel}
          </span>
        </div>

        {/* Preserved Column */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#241E1A] font-mono">
            <History className="w-3.5 h-3.5 text-[#7A4B3A]" />
            <span>Gìn Giữ Di Sản (Heritage Preserved)</span>
          </div>
          <ul className="space-y-1.5 pl-4 border-l-2 border-[#D5C7B4]">
            {culturalDna.preservedItems.map((point, index) => (
              <li key={index} className="text-xs text-[#52463E] leading-relaxed">
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Modernized Column */}
        <div className="space-y-2 pt-2 border-t border-[#EFE8DC]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8C3B24] font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#8C3B24]" />
            <span>Tái Cấu Trúc Đương Đại (Modernized Accents)</span>
          </div>
          <ul className="space-y-1.5 pl-4 border-l-2 border-[#8C3B24]">
            {culturalDna.modernizedItems.map((point, index) => (
              <li key={index} className="text-xs text-[#52463E] leading-relaxed">
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Curator Verdict Pull Quote */}
        <div className="mt-4 pt-3 border-t border-[#EFE8DC] bg-[#FAF7F2] p-3.5 rounded-xs border border-[#E7DECE]">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#8C7E72] mb-1">
            Nhận Định Giám Tuyển Thời Trang:
          </div>
          <blockquote className="text-xs font-serif italic text-[#3A3029] leading-relaxed">
            "{culturalDna.curatorVerdict}"
          </blockquote>
        </div>
      </section>

      {/* Disabled CTA Button: "Xem bản minh họa AI" */}
      <div className="space-y-2">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="w-full py-3.5 px-4 rounded-xs bg-[#E6DDD0] text-[#8F8375] font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 cursor-not-allowed border border-[#D5C7B4] select-none opacity-80"
          title="Tính năng tạo ảnh visual AI sẽ được mở sau khi hoàn thiện tập huấn luyện phom dáng di sản."
        >
          <Lock className="w-4 h-4 text-[#8F8375]" />
          <span>Xem Bản Minh Họa AI</span>
        </button>

        <p className="text-[11px] text-center text-[#8C7E72] font-serif italic">
          Bản thử nghiệm giao diện: Tính năng tổng hợp hình ảnh AI đang trong tiến trình huấn luyện nếp gấp y phục.
        </p>
      </div>
    </div>
  );
};
