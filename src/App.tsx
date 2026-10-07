import React, { useState, useMemo } from 'react';
import { CoreVietPhucId, ContextId, StyleId } from './types';
import { CORE_ITEMS, SUPPORT_ITEMS, PRESET_LOOKS } from './data/mockFashionData';
import { computeCulturalDna } from './utils/fashionCalculations';
import { Header } from './components/Header';
import { StylingControls } from './components/StylingControls';
import { FashionBoard } from './components/FashionBoard';
import { LookbookModal } from './components/LookbookModal';
import { AboutModal } from './components/AboutModal';
import { Toast } from './components/Toast';

export default function App() {
  // State for styling controls
  const [selectedCore, setSelectedCore] = useState<CoreVietPhucId>('ao-ngu-than');
  const [selectedContext, setSelectedContext] = useState<ContextId>('rap-concert');
  const [selectedStyle, setSelectedStyle] = useState<StyleId>('streetwear');
  const [targetRemixLevel, setTargetRemixLevel] = useState<number>(75);
  const [preferences, setPreferences] = useState<string>(
    'Ưu tiên đối lập chất liệu: raw denim cứng cáp với tà gấm sa ngũ thân buông mềm.'
  );

  // State for support items in the Fashion Board (indexes into SUPPORT_ITEMS)
  const [bottomIndex, setBottomIndex] = useState<number>(1); // Default Raw Denim
  const [shoesIndex, setShoesIndex] = useState<number>(1); // Default Chunky Loafer
  const [accessoryIndex, setAccessoryIndex] = useState<number>(1); // Default Techwear Crossbody

  // Modals & toast state
  const [isLookbookOpen, setIsLookbookOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const [savedCount, setSavedCount] = useState<number>(0);

  // Active items
  const currentCore = CORE_ITEMS[selectedCore] || CORE_ITEMS['ao-ngu-than'];
  const currentBottom = SUPPORT_ITEMS.bottom[bottomIndex] || SUPPORT_ITEMS.bottom[0];
  const currentShoes = SUPPORT_ITEMS.shoes[shoesIndex] || SUPPORT_ITEMS.shoes[0];
  const currentAccessory = SUPPORT_ITEMS.accessory[accessoryIndex] || SUPPORT_ITEMS.accessory[0];

  // Dynamic Cultural DNA & Actual Remix calculation
  // Updates locally whenever core, bottom, shoes, accessory, context, or style change
  // Does NOT mutate targetRemixLevel!
  const culturalDna = useMemo(() => {
    return computeCulturalDna(
      currentCore,
      currentBottom,
      currentShoes,
      currentAccessory,
      selectedContext,
      selectedStyle,
      targetRemixLevel
    );
  }, [
    currentCore,
    currentBottom,
    currentShoes,
    currentAccessory,
    selectedContext,
    selectedStyle,
    targetRemixLevel,
  ]);

  // Support item cycling handlers (cycles 0 -> 1 -> 2 -> 0)
  const handleCycleBottom = () => {
    setBottomIndex((prev) => (prev + 1) % SUPPORT_ITEMS.bottom.length);
  };

  const handleCycleShoes = () => {
    setShoesIndex((prev) => (prev + 1) % SUPPORT_ITEMS.shoes.length);
  };

  const handleCycleAccessory = () => {
    setAccessoryIndex((prev) => (prev + 1) % SUPPORT_ITEMS.accessory.length);
  };

  // Quick Shuffle all support pieces
  const handleShuffleAll = () => {
    setBottomIndex(Math.floor(Math.random() * SUPPORT_ITEMS.bottom.length));
    setShoesIndex(Math.floor(Math.random() * SUPPORT_ITEMS.shoes.length));
    setAccessoryIndex(Math.floor(Math.random() * SUPPORT_ITEMS.accessory.length));
    showToast('Đã ngẫu nhiên đổi các món phối trợ lực!');
  };

  // Apply a preset look
  const handleApplyPreset = (index: number) => {
    const preset = PRESET_LOOKS[index];
    if (!preset) return;
    setSelectedCore(preset.core);
    setSelectedContext(preset.context);
    setSelectedStyle(preset.style);
    setTargetRemixLevel(preset.target);
    setBottomIndex(preset.bottomIdx);
    setShoesIndex(preset.shoesIdx);
    setAccessoryIndex(preset.accIdx);
    setPreferences(preset.pref);
    showToast(`Đã áp dụng bản phối "${preset.title}"`);
  };

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 3200);
  };

  // Save moodboard handler
  const handleSaveMoodboard = () => {
    setSavedCount((prev) => prev + 1);
    showToast(`Đã lưu "${currentCore.name} Remix" vào bộ sưu tập cá nhân!`);
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#241E1A] flex flex-col font-sans selection:bg-[#8C3B24]/15 selection:text-[#8C3B24]">
      {/* Top Navigation Bar adhering strictly to Top Bar Contract */}
      <Header
        onSaveMoodboard={handleSaveMoodboard}
        onOpenAbout={() => setIsAboutOpen(true)}
        savedCount={savedCount}
      />

      {/* Main Content: Two-column desktop layout that stacks vertically on mobile */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* Curatorial Intro Banner */}
        <section className="mb-8 lg:mb-10 border-b border-[#E3D9CC] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-widest font-mono text-[#8C3B24] mb-1">
              Phòng Giám Tuyển Cổ Phục Đương Đại · Quy Chuẩn 2026
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-bold text-[#241E1A] tracking-tight leading-tight">
              Việt Phục Remix // Bảng Cảm Hứng Thời Trang
            </h1>
            <p className="text-sm sm:text-base text-[#6B5E52] mt-2 font-serif leading-relaxed">
              Khám phá sự giao thoa giữa cấu trúc trang phục truyền thống Việt Nam và tư duy thời trang đường phố đương đại. Giữ trọn cốt cách di sản, tự do tiếp biến công năng.
            </p>
          </div>

          <div className="text-left md:text-right shrink-0">
            <span className="text-xs font-mono text-[#8C7E72] block">
              Tỷ Lệ Hòa Nhập Di Sản
            </span>
            <span className="text-xl sm:text-2xl font-editorial font-bold text-[#8C3B24]">
              {culturalDna.synergyLevel}
            </span>
          </div>
        </section>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
          {/* Left Column: Styling Controls (5 columns on large screen) */}
          <aside className="lg:col-span-5 xl:col-span-5 w-full">
            <StylingControls
              selectedCore={selectedCore}
              selectedContext={selectedContext}
              selectedStyle={selectedStyle}
              targetRemix={targetRemixLevel}
              preferences={preferences}
              culturalDna={culturalDna}
              onCoreChange={setSelectedCore}
              onContextChange={setSelectedContext}
              onStyleChange={setSelectedStyle}
              onTargetRemixChange={setTargetRemixLevel}
              onPreferencesChange={setPreferences}
              onApplyPreset={handleApplyPreset}
            />
          </aside>

          {/* Right Column: Interactive Fashion Board (7 columns on large screen) */}
          <section className="lg:col-span-7 xl:col-span-7 w-full">
            <FashionBoard
              core={currentCore}
              bottomItem={currentBottom}
              bottomIndex={bottomIndex}
              totalBottoms={SUPPORT_ITEMS.bottom.length}
              onCycleBottom={handleCycleBottom}
              shoesItem={currentShoes}
              shoesIndex={shoesIndex}
              totalShoes={SUPPORT_ITEMS.shoes.length}
              onCycleShoes={handleCycleShoes}
              accessoryItem={currentAccessory}
              accessoryIndex={accessoryIndex}
              totalAccessories={SUPPORT_ITEMS.accessory.length}
              onCycleAccessory={handleCycleAccessory}
              actualRemix={culturalDna.actualRemix}
              targetRemix={targetRemixLevel}
              onShuffleAll={handleShuffleAll}
              onOpenCoreDetail={() => setIsLookbookOpen(true)}
            />
          </section>
        </div>

        {/* Editorial Footnotes & Cultural Attribution */}
        <footer className="mt-16 sm:mt-20 pt-8 border-t border-[#E3D9CC] text-xs text-[#7A6A5C] flex flex-col sm:flex-row items-center justify-between gap-4 font-serif">
          <div>
            <p>
              Việt Phục Remix © 2026. Khảo cứu dựa trên chuẩn mực y phục triều Nguyễn và giao thời thế kỷ 20.
            </p>
            <p className="text-[11px] text-[#A89C8F] font-sans mt-0.5">
              Dự án nghiên cứu thị giác phi lợi nhuận tôn vinh di sản dệt may thủ công Việt Nam.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-[#8C3B24]">
            <button
              type="button"
              onClick={() => setIsAboutOpen(true)}
              className="hover:underline cursor-pointer"
            >
              Tuyên Ngôn Tiếp Biến
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsLookbookOpen(true)}
              className="hover:underline cursor-pointer"
            >
              Hồ Sơ Cổ Phục
            </button>
          </div>
        </footer>
      </main>

      {/* Detail Modals */}
      <LookbookModal
        core={currentCore}
        isOpen={isLookbookOpen}
        onClose={() => setIsLookbookOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Floating Interactive Toast */}
      <Toast message={toastMessage} isVisible={isToastVisible} />
    </div>
  );
}
