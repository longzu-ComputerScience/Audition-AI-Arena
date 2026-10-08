import React from 'react';
import { motion } from 'motion/react';
import { CoreVietPhucId, SetupData } from '../types';
import { CORE_ITEMS, OCCASIONS, LOCATIONS, STYLES } from '../data/mockFashionData';
import { PatternMotif } from './PatternMotif';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

interface DiscoveryScreenProps {
  setupData: SetupData;
  onChangeSetup: (data: Partial<SetupData>) => void;
  onSubmit: () => void;
}

export const DiscoveryScreen: React.FC<DiscoveryScreenProps> = ({
  setupData,
  onChangeSetup,
  onSubmit,
}) => {
  const coreList = Object.values(CORE_ITEMS);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-12"
    >
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] uppercase tracking-widest font-mono text-[#B7410E]">
          Studio Khám Phá · Bước 01
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-bold text-[#241E1A] tracking-tight leading-tight">
          Chọn Điểm Chạm Di Sản
        </h1>
        <p className="text-sm sm:text-base text-[#6B5E52] font-serif leading-relaxed">
          Bắt đầu với dáng áo cổ truyền, chọn bối cảnh và định hình tinh thần thời trang bạn hướng tới.
        </p>
      </div>

      <div className="space-y-10">
        {/* 1. Việt phục - Selectable Cards with Motif Thumbnails */}
        <div className="space-y-3.5">
          <div className="flex items-baseline justify-between border-b border-[#EAE3D6] pb-2">
            <h2 className="text-lg font-editorial font-bold text-[#241E1A]">
              1. Việt phục
            </h2>
            <span className="text-xs text-[#8C7E72] font-mono">
              5 dáng áo tiêu biểu
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {coreList.map((item) => {
              const isSelected = setupData.coreGarment === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeSetup({ coreGarment: item.id })}
                  className={`relative p-4 rounded-sm border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-[#FFFDF9] border-[#B7410E] shadow-sm ring-1 ring-[#B7410E]/20'
                      : 'bg-[#FFFDF9]/60 hover:bg-[#FFFDF9] border-[#E3D9CC] hover:border-[#B7410E]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#DDD0C0] p-1.5 shrink-0 flex items-center justify-center">
                      <PatternMotif
                        type={item.patternType}
                        color={isSelected ? '#B7410E' : '#5A4F46'}
                        className="w-full h-full"
                      />
                    </div>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-[#B7410E] text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#8C7E72] uppercase">
                        {item.era.split('·')[0].trim()}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <h3 className="font-editorial text-lg font-bold text-[#241E1A] group-hover:text-[#B7410E] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#7A6E63] mt-0.5 line-clamp-1 font-serif">
                      {item.subTitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Dịp - Selectable Chips */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#EAE3D6] pb-2">
            <h2 className="text-lg font-editorial font-bold text-[#241E1A]">
              2. Dịp
            </h2>
            <span className="text-xs text-[#8C7E72] font-mono">
              Mục đích diện trang phục
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {OCCASIONS.map((occ) => {
              const isSelected = setupData.occasion === occ;
              return (
                <button
                  key={occ}
                  type="button"
                  onClick={() => onChangeSetup({ occasion: occ })}
                  className={`px-3.5 py-2 text-xs font-medium rounded-xs border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#241E1A] text-[#FAF7F2] border-[#241E1A] shadow-xs'
                      : 'bg-[#FFFDF9] text-[#4E433C] hover:text-[#241E1A] border-[#D5C7B4] hover:border-[#8C7E72]'
                  }`}
                >
                  {occ}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Địa điểm / bối cảnh - Selectable Chips */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#EAE3D6] pb-2">
            <h2 className="text-lg font-editorial font-bold text-[#241E1A]">
              3. Địa điểm / bối cảnh
            </h2>
            <span className="text-xs text-[#8C7E72] font-mono">
              Không gian trải nghiệm
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {LOCATIONS.map((loc) => {
              const isSelected = setupData.location === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => onChangeSetup({ location: loc })}
                  className={`px-3.5 py-2 text-xs font-medium rounded-xs border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#241E1A] text-[#FAF7F2] border-[#241E1A] shadow-xs'
                      : 'bg-[#FFFDF9] text-[#4E433C] hover:text-[#241E1A] border-[#D5C7B4] hover:border-[#8C7E72]'
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Phong cách - Selectable Chips */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between border-b border-[#EAE3D6] pb-2">
            <h2 className="text-lg font-editorial font-bold text-[#241E1A]">
              4. Phong cách
            </h2>
            <span className="text-xs text-[#8C7E72] font-mono">
              Định hướng thẩm mỹ
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {STYLES.map((st) => {
              const isSelected = setupData.style === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => onChangeSetup({ style: st })}
                  className={`px-4 py-2 text-xs font-medium rounded-xs border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#B7410E] text-white border-[#B7410E] shadow-xs font-semibold'
                      : 'bg-[#FFFDF9] text-[#4E433C] hover:text-[#241E1A] border-[#D5C7B4] hover:border-[#8C7E72]'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#B7410E] hover:bg-[#96340B] text-white text-sm uppercase tracking-wider font-semibold rounded-xs shadow-sm transition-all duration-200 cursor-pointer active:scale-98"
          >
            <span>Tạo gợi ý</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.section>
  );
};
