import React from 'react';
import { CoreItem, SupportOption } from '../types';
import { MoodboardHeroCard } from './MoodboardHeroCard';
import { MoodboardSupportCard } from './MoodboardSupportCard';
import { Dices, Sparkles, Layers, SlidersHorizontal, Share2 } from 'lucide-react';

interface FashionBoardProps {
  core: CoreItem;
  bottomItem: SupportOption;
  bottomIndex: number;
  totalBottoms: number;
  onCycleBottom: () => void;

  shoesItem: SupportOption;
  shoesIndex: number;
  totalShoes: number;
  onCycleShoes: () => void;

  accessoryItem: SupportOption;
  accessoryIndex: number;
  totalAccessories: number;
  onCycleAccessory: () => void;

  actualRemix: number;
  targetRemix: number;
  onShuffleAll: () => void;
  onOpenCoreDetail: () => void;
}

export const FashionBoard: React.FC<FashionBoardProps> = ({
  core,
  bottomItem,
  bottomIndex,
  totalBottoms,
  onCycleBottom,
  shoesItem,
  shoesIndex,
  totalShoes,
  onCycleShoes,
  accessoryItem,
  accessoryIndex,
  totalAccessories,
  onCycleAccessory,
  actualRemix,
  targetRemix,
  onShuffleAll,
  onOpenCoreDetail,
}) => {
  // Combined outfit palette
  const outfitPalette = [
    ...core.palette,
    { name: bottomItem.colorName, hex: bottomItem.accentHex },
    { name: shoesItem.colorName, hex: shoesItem.accentHex },
    { name: accessoryItem.colorName, hex: accessoryItem.accentHex },
  ];

  return (
    <section id="moodboard" className="space-y-6">
      {/* Moodboard Meta Header & Actual Remix Metric */}
      <div className="bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-mono text-[#8C3B24]">
            <span>Bảng Phối Thời Trang Số // Fashion Board</span>
            <span aria-hidden="true" className="text-[#C8BCAC]">·</span>
            <span className="text-[#655A52]">Tương Tác Trực Quan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[#241E1A] mt-0.5">
            Phối Cảnh Asymmetric Moodboard
          </h2>
          <p className="text-xs text-[#7A6A5C] font-serif">
            Nhấn trực tiếp vào từng ô phụ kiện bên dưới để luân chuyển các biến thể.
          </p>
        </div>

        {/* Displayed "Actual Remix" vs "Target Remix" Metric */}
        <div className="flex items-center gap-4 bg-[#FAF7F2] p-3 rounded-xs border border-[#E7DECE] shrink-0">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#8C7E72]">
              Remix Thực Tế
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-editorial font-bold text-[#241E1A] tabular-nums">
                {actualRemix}%
              </span>
              <span className="text-[11px] font-mono text-[#8C3B24] font-semibold">
                Đương Đại
              </span>
            </div>
          </div>

          <div className="h-9 w-px bg-[#E3D9CC]" aria-hidden="true" />

          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#8C7E72]">
              Mục Tiêu Dial
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-editorial font-bold text-[#7A6A5C] tabular-nums">
                {targetRemix}%
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onShuffleAll}
            className="p-2 bg-[#FFFDF9] hover:bg-[#EFE8DC] border border-[#DDD0C0] text-[#4E433C] hover:text-[#8C3B24] rounded-xs transition-colors cursor-pointer shadow-2xs"
            title="Ngẫu nhiên đổi các món phụ kiện"
            aria-label="Đổi ngẫu nhiên phụ kiện"
          >
            <Dices className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Asymmetric Editorial Moodboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column of Moodboard (lg:col-span-6 or 7): One Large Hero Card (Fixed Core Viet Phuc) */}
        <div className="lg:col-span-7 xl:col-span-7 sticky top-22">
          <MoodboardHeroCard core={core} onOpenDetail={onOpenCoreDetail} />
        </div>

        {/* Right Column of Moodboard (lg:col-span-5): Smaller Support Cards (Bottom, Shoes, Bag/Accessory) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between text-xs font-mono text-[#8C7E72] px-1">
            <span className="uppercase tracking-wider">Món Phối Trợ Lực (3 Hạng Mục)</span>
            <span className="italic font-serif">Chạm để đổi</span>
          </div>

          {/* Support Card 1: Bottom */}
          <MoodboardSupportCard
            item={bottomItem}
            categoryIndex="01"
            currentIndex={bottomIndex}
            totalOptions={totalBottoms}
            onCycleNext={onCycleBottom}
          />

          {/* Support Card 2: Shoes */}
          <MoodboardSupportCard
            item={shoesItem}
            categoryIndex="02"
            currentIndex={shoesIndex}
            totalOptions={totalShoes}
            onCycleNext={onCycleShoes}
          />

          {/* Support Card 3: Bag / Accessory */}
          <MoodboardSupportCard
            item={accessoryItem}
            categoryIndex="03"
            currentIndex={accessoryIndex}
            totalOptions={totalAccessories}
            onCycleNext={onCycleAccessory}
          />
        </div>
      </div>

      {/* Moodboard Editorial Palette & Fabric Strip Footer */}
      <div className="bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE8DC] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8C3B24]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#241E1A] font-semibold">
              Hệ Màu Tổng Hòa Bản Phối (Integrated Palette)
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#8C7E72]">
            6 Sắc độ từ Di sản & Đương đại
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
          {outfitPalette.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="bg-[#FAF7F2] border border-[#E7DECE] p-2 rounded-xs flex items-center gap-2.5"
            >
              <span
                className="w-5 h-5 rounded-xs border border-black/15 shrink-0 shadow-2xs"
                style={{ backgroundColor: p.hex }}
              />
              <div className="truncate">
                <span className="text-[11px] font-medium text-[#241E1A] block truncate">
                  {p.name}
                </span>
                <span className="text-[10px] font-mono text-[#8C7E72] block uppercase">
                  {p.hex}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
