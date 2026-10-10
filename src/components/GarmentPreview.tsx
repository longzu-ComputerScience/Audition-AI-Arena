import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CoreVietPhucId, CoreItem } from '../types';
import { CORE_ITEMS } from '../data/mockFashionData';
import { getGarmentLayerPreview } from '../data/layeredOutfitMap';

interface GarmentPreviewProps {
  coreGarment: CoreVietPhucId;
}

interface GarmentSilhouetteSvgProps {
  coreGarment: CoreVietPhucId;
  className?: string;
}

// Shared distinguishable 2D fashion silhouettes for all 5 core Việt phục garments
export const GarmentSilhouetteSvg: React.FC<GarmentSilhouetteSvgProps> = ({
  coreGarment,
  className = 'w-full h-full max-h-[300px] mx-auto select-none',
}) => {
  switch (coreGarment) {
    case 'ao-nhat-binh':
      return (
        <svg
          viewBox="0 0 240 320"
          className={className}
          aria-label="Minh họa Áo Nhật Bình cổ chữ nhật"
        >
            {/* Background silhouette guide */}
            <g stroke="#2B231D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {/* Head & Neck silhouette */}
              <path d="M120 30 C128 30 134 37 134 46 C134 54 128 60 120 60 C112 60 106 54 106 46 C106 37 112 30 120 30 Z" fill="#F4EDE2" stroke="#4A3F35" strokeWidth="1.5" />
              <path d="M115 60 L115 72 M125 60 L125 72" stroke="#4A3F35" strokeWidth="1.5" />

              {/* Inner skirt/trousers */}
              <path d="M96 230 L90 286 L150 286 L144 230 Z" fill="#EAE1D3" stroke="#5A4F46" />
              <path d="M120 234 L120 286" stroke="#5A4F46" strokeDasharray="3 3" />

              {/* Main Robe Body - straight drop */}
              <path
                d="M80 84 L52 140 L70 148 L86 112 L86 240 L154 240 L154 112 L170 148 L188 140 L160 84 Z"
                fill="#FFFDF9"
                stroke="#2B231D"
              />

              {/* Rectangular Collar (Cổ Nhật Bình đặc trưng) */}
              {/* Outer rectangular band */}
              <path
                d="M102 72 L138 72 L142 165 L120 174 L98 165 Z"
                fill="#FAF7EE"
                stroke="#B3261E"
                strokeWidth="2.5"
              />

              {/* Multi-color Ngũ Sắc decorative bands inside rectangular collar */}
              <path d="M106 78 L134 78" stroke="#D4AF37" strokeWidth="2.5" />
              <path d="M108 85 L132 85" stroke="#1C494A" strokeWidth="2" />
              <path d="M110 92 L130 92" stroke="#B3261E" strokeWidth="2" />
              <path d="M110 99 L130 99" stroke="#1D4E89" strokeWidth="2" />
              <path d="M111 106 L129 106" stroke="#D4AF37" strokeWidth="2" />

              {/* Collar vertical borders */}
              <line x1="106" y1="78" x2="104" y2="162" stroke="#B3261E" strokeWidth="1.5" />
              <line x1="134" y1="78" x2="136" y2="162" stroke="#B3261E" strokeWidth="1.5" />

              {/* Center opening and ties */}
              <line x1="120" y1="108" x2="120" y2="240" stroke="#B3261E" strokeWidth="1.75" />
              <path d="M120 174 L114 206 M120 174 L126 206" stroke="#B3261E" strokeWidth="2" strokeLinecap="round" />

              {/* Sleeve borders with subtle cuffs */}
              <path d="M52 140 L70 148" stroke="#B3261E" strokeWidth="2" />
              <path d="M170 148 L188 140" stroke="#B3261E" strokeWidth="2" />
            </g>
          </svg>
        );

      case 'ao-tac':
        return (
          <svg
            viewBox="0 0 240 320"
            className={className}
            aria-label="Minh họa Áo Tấc tay thụ rộng"
          >
            <g stroke="#2B231D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {/* Head & Neck */}
              <path d="M120 30 C128 30 134 37 134 46 C134 54 128 60 120 60 C112 60 106 54 106 46 C106 37 112 30 120 30 Z" fill="#F4EDE2" stroke="#4A3F35" strokeWidth="1.5" />
              <path d="M115 60 L115 72 M125 60 L125 72" stroke="#4A3F35" strokeWidth="1.5" />

              {/* Standing mandarin collar */}
              <path d="M112 70 C112 66 128 66 128 70 L128 76 C128 78 112 78 112 76 Z" fill="#FAF7EE" stroke="#B3261E" strokeWidth="1.75" />

              {/* Inner trousers */}
              <path d="M98 238 L92 286 L148 286 L142 238 Z" fill="#EAE1D3" stroke="#5A4F46" />
              <path d="M120 240 L120 286" stroke="#5A4F46" strokeDasharray="3 3" />

              {/* Vast, visibly wide drooping sleeves (Tay thụ buông thõng rộng đặc trưng) */}
              {/* Left wide sleeve */}
              <path
                d="M94 76 L36 102 C30 150 36 210 50 216 C62 220 84 175 88 126"
                fill="#FFFDF9"
                stroke="#2B231D"
                strokeWidth="2"
              />
              {/* Right wide sleeve */}
              <path
                d="M146 76 L204 102 C210 150 204 210 190 216 C178 220 156 175 152 126"
                fill="#FFFDF9"
                stroke="#2B231D"
                strokeWidth="2"
              />

              {/* Wide sleeve drape folds */}
              <path d="M42 160 C52 188 64 205 76 210" stroke="#DDD0C0" strokeWidth="1.5" />
              <path d="M198 160 C188 188 176 205 164 210" stroke="#DDD0C0" strokeWidth="1.5" />

              {/* Main wide body robe */}
              <path
                d="M94 76 L86 244 L154 244 L146 76 Z"
                fill="#FAF7EE"
                stroke="#2B231D"
                strokeWidth="2"
              />

              {/* Center spine seam (Can giữa sống lưng) */}
              <line x1="120" y1="76" x2="120" y2="244" stroke="#8C7E72" strokeWidth="1.5" strokeDasharray="4 2" />

              {/* 5-button slanted closure (Ngũ khuy) */}
              <path d="M120 76 C124 90 134 98 144 102" stroke="#B3261E" strokeWidth="1.75" />
              <circle cx="121" cy="80" r="1.75" fill="#B3261E" />
              <circle cx="127" cy="87" r="1.75" fill="#B3261E" />
              <circle cx="134" cy="94" r="1.75" fill="#B3261E" />
              <circle cx="140" cy="99" r="1.75" fill="#B3261E" />
              <circle cx="144" cy="105" r="1.75" fill="#B3261E" />
            </g>
          </svg>
        );

      case 'ao-dai':
        return (
          <svg
            viewBox="0 0 240 320"
            className={className}
            aria-label="Minh họa Áo Dài tà dài xẻ eo"
          >
            <g stroke="#2B231D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {/* Head & Neck */}
              <path d="M120 28 C127 28 133 34 133 43 C133 51 127 57 120 57 C113 57 107 51 107 43 C107 34 113 28 120 28 Z" fill="#F4EDE2" stroke="#4A3F35" strokeWidth="1.5" />
              <path d="M116 57 L116 68 M124 57 L124 68" stroke="#4A3F35" strokeWidth="1.5" />

              {/* High mandarin round collar */}
              <path d="M114 66 C114 62 126 62 126 66 L126 73 C126 75 114 75 114 73 Z" fill="#FAF7EE" stroke="#B3261E" strokeWidth="1.75" />

              {/* Wide flowing silk trousers beneath the robe */}
              <path d="M96 170 L82 288 L114 288 L118 178 Z" fill="#EAE1D3" stroke="#5A4F46" />
              <path d="M122 178 L126 288 L158 288 L144 170 Z" fill="#EAE1D3" stroke="#5A4F46" />

              {/* Slender Upper Body & Raglan Shoulders */}
              <path
                d="M114 73 L74 130 L85 136 L104 100 L102 145"
                fill="#FFFDF9"
                stroke="#2B231D"
              />
              <path
                d="M126 73 L166 130 L155 136 L136 100 L138 145"
                fill="#FFFDF9"
                stroke="#2B231D"
              />

              {/* Asymmetric raglan button line */}
              <path d="M120 73 C124 82 133 92 136 102" stroke="#B3261E" strokeWidth="1.5" />
              <circle cx="122" cy="76" r="1.5" fill="#B3261E" />
              <circle cx="126" cy="83" r="1.5" fill="#B3261E" />
              <circle cx="131" cy="91" r="1.5" fill="#B3261E" />
              <circle cx="135" cy="99" r="1.5" fill="#B3261E" />

              {/* Long flowing front panel (Tà trước dài buông xuống) */}
              <path
                d="M102 145 C101 170 98 215 95 272 C110 274 130 274 145 272 C142 215 139 170 138 145 Z"
                fill="#FFFDF9"
                stroke="#2B231D"
                strokeWidth="2"
              />

              {/* Distinct High Side Slits (Xẻ tà cao ngang eo) */}
              <path d="M102 145 L94 158" stroke="#B3261E" strokeWidth="2.5" />
              <path d="M138 145 L146 158" stroke="#B3261E" strokeWidth="2.5" />

              {/* Vertical drape ripple line */}
              <path d="M116 160 C114 200 112 240 110 272" stroke="#DDD0C0" strokeWidth="1.25" />
              <path d="M126 160 C128 200 130 240 132 272" stroke="#DDD0C0" strokeWidth="1.25" />
            </g>
          </svg>
        );

      case 'ao-tu-than':
        return (
          <svg
            viewBox="0 0 240 320"
            className={className}
            aria-label="Minh họa Áo Tứ Thân vạt trước buộc thắt và yếm"
          >
            <g stroke="#2B231D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {/* Head & Neck */}
              <path d="M120 30 C128 30 134 37 134 46 C134 54 128 60 120 60 C112 60 106 54 106 46 C106 37 112 30 120 30 Z" fill="#F4EDE2" stroke="#4A3F35" strokeWidth="1.5" />
              <path d="M115 60 L115 72 M125 60 L125 72" stroke="#4A3F35" strokeWidth="1.5" />

              {/* Traditional Inner Silk Halter (Yếm lụa bên trong) */}
              <path
                d="M106 78 C114 74 126 74 134 78 L138 126 L102 126 Z"
                fill="#C27D78"
                stroke="#A84B45"
                strokeWidth="1.5"
              />
              <path d="M120 74 L120 126" stroke="#FAF7EE" strokeWidth="1" strokeDasharray="3 3" />

              {/* Lower Traditional Gathered Skirt (Váy đụp đen buông rủ) */}
              <path d="M86 160 L78 286 L162 286 L154 160 Z" fill="#362E29" stroke="#2B231D" />

              {/* Open front robe panels & sleeves (Áo khoác mở không cài khuy) */}
              {/* Left open panel & sleeve */}
              <path
                d="M106 76 L66 120 L78 128 L94 98 L94 155"
                fill="#FFFDF9"
                stroke="#2B231D"
              />
              {/* Right open panel & sleeve */}
              <path
                d="M134 76 L174 120 L162 128 L146 98 L146 155"
                fill="#FFFDF9"
                stroke="#2B231D"
              />

              {/* Back panels draping down behind */}
              <path d="M88 155 L82 250 M152 155 L158 250" stroke="#7A6E63" strokeWidth="1.5" />

              {/* Silk Sash / Belt (Dải thắt lưng mềm) */}
              <path d="M92 144 L148 144 L146 154 L94 154 Z" fill="#B3261E" stroke="#8C201A" strokeWidth="1.5" />

              {/* Distinct Knotted Front Panels & Ties (Hai vạt trước buộc thắt rủ xuống) */}
              {/* Center knot */}
              <circle cx="120" cy="152" r="5" fill="#FAF7EE" stroke="#B3261E" strokeWidth="2" />
              {/* Cascading front tied ribbons */}
              <path
                d="M117 156 C114 180 110 205 108 238 L114 238 C117 205 120 180 120 156 Z"
                fill="#FAF7EE"
                stroke="#B3261E"
                strokeWidth="1.75"
              />
              <path
                d="M122 156 C124 182 128 208 132 238 L126 238 C122 208 120 182 120 156 Z"
                fill="#FAF7EE"
                stroke="#B3261E"
                strokeWidth="1.75"
              />
            </g>
          </svg>
        );

      case 'ao-ngu-than':
      default:
        return (
          <svg
            viewBox="0 0 240 320"
            className={className}
            aria-label="Minh họa Áo Ngũ Thân tay chẽn và cổ lập lĩnh"
          >
            <g stroke="#2B231D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {/* Head & Neck */}
              <path d="M120 28 C128 28 134 35 134 44 C134 52 128 58 120 58 C112 58 106 52 106 44 C106 35 112 28 120 28 Z" fill="#F4EDE2" stroke="#4A3F35" strokeWidth="1.5" />
              <path d="M115 58 L115 68 M125 58 L125 68" stroke="#4A3F35" strokeWidth="1.5" />

              {/* Standing Collar (Cổ lập lĩnh cứng cáp cao 3.5cm) */}
              <path
                d="M112 67 L128 67 L128 75 L112 75 Z"
                fill="#FAF7EE"
                stroke="#B3261E"
                strokeWidth="2"
              />
              <line x1="120" y1="67" x2="120" y2="75" stroke="#B3261E" strokeWidth="1.25" />

              {/* Inner trousers */}
              <path d="M96 235 L90 286 L150 286 L144 235 Z" fill="#EAE1D3" stroke="#5A4F46" />
              <path d="M120 238 L120 286" stroke="#5A4F46" strokeDasharray="3 3" />

              {/* Tapered narrow sleeves (Tay chẽn gọn gàng ôm cổ tay) */}
              {/* Left chẽn sleeve */}
              <path
                d="M102 75 L62 126 L72 132 L94 96 L94 238"
                fill="#FFFDF9"
                stroke="#2B231D"
                strokeWidth="1.75"
              />
              {/* Right chẽn sleeve */}
              <path
                d="M138 75 L178 126 L168 132 L146 96 L146 238"
                fill="#FFFDF9"
                stroke="#2B231D"
                strokeWidth="1.75"
              />

              {/* Hem line */}
              <path d="M94 238 L146 238" stroke="#2B231D" strokeWidth="2" />

              {/* 5-button closure curved across right chest (Cài 5 hạt khuy nghiêng nách phải) */}
              <path d="M120 75 C124 90 134 100 146 104" stroke="#B3261E" strokeWidth="2" />
              <line x1="146" y1="104" x2="146" y2="160" stroke="#B3261E" strokeWidth="1.5" />

              {/* 5 buttons (Khuy ngũ thường) */}
              <circle cx="120" cy="78" r="2" fill="#B3261E" />
              <circle cx="126" cy="86" r="2" fill="#B3261E" />
              <circle cx="134" cy="94" r="2" fill="#B3261E" />
              <circle cx="142" cy="101" r="2" fill="#B3261E" />
              <circle cx="146" cy="112" r="2" fill="#B3261E" />

              {/* Five-body seam lines (Năm thân ghép mí kín đáo) */}
              <line x1="108" y1="98" x2="108" y2="238" stroke="#DDD0C0" strokeWidth="1.25" strokeDasharray="3 2" />
              <line x1="132" y1="108" x2="132" y2="238" stroke="#DDD0C0" strokeWidth="1.25" strokeDasharray="3 2" />
            </g>
          </svg>
        );
    }
};

export const GarmentPreview: React.FC<GarmentPreviewProps> = ({ coreGarment }) => {
  const shouldReduceMotion = useReducedMotion();
  const currentCore: CoreItem = CORE_ITEMS[coreGarment] || CORE_ITEMS['ao-ngu-than'];
  const demoMedia = getGarmentLayerPreview(coreGarment);
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    setImgError(false);
  }, [coreGarment]);

  const showRealPhoto = Boolean(demoMedia && !imgError);

  return (
    <div className="w-full bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header Info */}
      <div className="border-b border-[#EAE3D6] pb-3 flex items-baseline justify-between">
        <div>
          <span className="text-[11px] font-semibold text-[#B3261E] tracking-wider uppercase block">
            Phom Dáng Minh Họa
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[#2B231D] mt-0.5">
            {currentCore.name}
          </h3>
        </div>
        <span className="text-xs text-[#7A6E63] font-medium">
          {currentCore.archiveCode}
        </span>
      </div>

      {/* SVG Canvas / Photograph with AnimatePresence & Stable Container */}
      <div className="relative w-full h-[280px] sm:h-[320px] my-3 flex items-center justify-center overflow-hidden bg-[#FAF7EE]/60 rounded-xs border border-[#EAE3D6]/70">
        <AnimatePresence mode="wait">
          <motion.div
            key={coreGarment}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.25,
              ease: 'easeInOut',
            }}
            className="w-full h-full flex items-center justify-center p-2"
          >
            {showRealPhoto && demoMedia ? (
              <img
                src={demoMedia.previewSrc}
                alt={demoMedia.previewAlt}
                onError={() => setImgError(true)}
                className="w-full h-full max-h-[300px] mx-auto object-contain rounded-xs select-none"
              />
            ) : (
              <GarmentSilhouetteSvg coreGarment={coreGarment} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption & Defining Attributes */}
      <div className="space-y-2 pt-2 border-t border-[#EAE3D6]">
        <p className="text-xs text-[#7A6E63] text-center italic font-normal">
          {showRealPhoto ? 'Ảnh tách nền trang phục' : 'Minh họa phom dáng 2D cơ bản'}
        </p>

        {/* Bullet points of defining silhouette features */}
        <div className="text-[11px] sm:text-xs text-[#5A4F46] leading-relaxed line-clamp-2 bg-[#FAF7EE] p-2.5 rounded-xs border border-[#EAE3D6]">
          <span className="font-semibold text-[#2B231D]">Đặc trưng: </span>
          {currentCore.silhouette}
        </div>
      </div>
    </div>
  );
};
