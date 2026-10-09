import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  CoreItem,
  ActiveSupportItems,
  SupportCategoryId,
  SupportOption,
} from '../types';
import { SUPPORT_ITEMS } from '../data/mockFashionData';
import {
  Layers,
  Pin,
  Sparkles,
  ShoppingBag,
  Scissors,
  Footprints,
  Check,
  X,
  Trash2,
  Sliders,
} from 'lucide-react';

interface MannequinCanvasProps {
  core: CoreItem;
  items: ActiveSupportItems;
  fabricColor?: string;
  palette?: { name: string; hex: string }[];
  remixDialValue?: number;
  onSelectSupportItem?: (category: SupportCategoryId, item: SupportOption) => void;
  onRemoveAccent?: () => void;
  onOpenCoreDetail?: () => void;
}

function parseHexRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return [140, 59, 36];
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return [140, 59, 36];
  }
  return [r, g, b];
}

function getRelativeLuminance(hex: string): number {
  const [r, g, b] = parseHexRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function shiftHexBrightness(hex: string, delta: number): string {
  const [r, g, b] = parseHexRgb(hex);
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r + delta)}${toHex(g + delta)}${toHex(b + delta)}`;
}

export const MannequinCanvas: React.FC<MannequinCanvasProps> = ({
  core,
  items,
  fabricColor,
  palette,
  remixDialValue,
  onSelectSupportItem,
  onRemoveAccent,
  onOpenCoreDetail,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Active mobile quick-select category ('accent' | 'bag' | 'bottom' | 'shoes' | null)
  const [activeQuickCategory, setActiveQuickCategory] = useState<SupportCategoryId | null>(null);
  const lastOpenedCategoryRef = useRef<SupportCategoryId | null>(null);
  const hotspotButtonRefs = useRef<Record<SupportCategoryId, HTMLButtonElement | null>>({
    accent: null,
    bag: null,
    bottom: null,
    shoes: null,
  });
  const stageRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const trayRef = useRef<HTMLDivElement | null>(null);

  interface LeaderLineGeometry {
    category: SupportCategoryId;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    side: 'left' | 'right';
    isOptionalEmpty?: boolean;
  }

  const [leaderLines, setLeaderLines] = useState<LeaderLineGeometry[]>([]);
  const [stageDimensions, setStageDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Returns exact viewBox (0 0 300 600) anchor point on the mannequin for each category's active item
  const getMannequinAnchorPoint = useCallback(
    (category: SupportCategoryId): { vx: number; vy: number; isOptionalEmpty?: boolean } => {
      if (category === 'accent') {
        if (!items.accent) {
          return { vx: 132, vy: 70, isOptionalEmpty: true };
        }
        switch (items.accent.id) {
          case 'accent-non-la':
            return { vx: 102, vy: 50 }; // Left brim of Nón Lá on head
          case 'accent-y2k-shades':
            return { vx: 135, vy: 65 }; // Left frame of Y2K sunglasses on face
          case 'accent-quai-thao-mini':
            return { vx: 92, vy: 264 }; // Left rim of Nón Quai Thao Mini at hip
          case 'accent-silver-jewelry':
          default:
            return { vx: 141, vy: 128 }; // Silver lotus pendant at neckline/chest
        }
      }

      if (category === 'bag') {
        switch (items.bag.id) {
          case 'bag-tote-linen':
            return { vx: 224, vy: 292 }; // Linen tote bag on right side
          case 'bag-techwear-crossbody':
            return { vx: 188, vy: 262 }; // Techwear crossbody pouch on right torso
          case 'bag-gam-vintage':
          default:
            return { vx: 111, vy: 338 }; // Vintage brocade handbag
        }
      }

      if (category === 'bottom') {
        switch (items.bottom.id) {
          case 'bottom-cargo-linen':
            return { vx: 112, vy: 432 }; // Left cargo trouser leg
          case 'bottom-raw-denim':
            return { vx: 111, vy: 438 }; // Left raw denim leg
          case 'bottom-silk-wide':
          default:
            return { vx: 102, vy: 442 }; // Left wide silk trouser leg
        }
      }

      // shoes
      switch (items.shoes.id) {
        case 'shoes-chunky-loafer':
        case 'shoes-retro-sneaker':
          return { vx: 178, vy: 544 }; // Right shoe outer edge
        case 'shoes-guoc-moc':
        default:
          return { vx: 176, vy: 544 }; // Right wooden clog outer edge
      }
    },
    [items]
  );

  // Recalculate exact pixel coordinates linking SVG viewBox points to HTML buttons
  const updateLeaderLines = useCallback(() => {
    const stageEl = stageRef.current;
    const svgEl = svgRef.current;
    if (!stageEl || !svgEl) return;

    const stageRect = stageEl.getBoundingClientRect();
    const svgRect = svgEl.getBoundingClientRect();
    if (stageRect.width <= 0 || stageRect.height <= 0 || svgRect.width <= 0 || svgRect.height <= 0) {
      return;
    }

    // preserveAspectRatio="xMidYMid meet" mapping from viewBox 0 0 300 600
    const scale = Math.min(svgRect.width / 300, svgRect.height / 600);
    const drawnWidth = 300 * scale;
    const drawnHeight = 600 * scale;
    const svgOriginX = svgRect.left - stageRect.left + (svgRect.width - drawnWidth) / 2;
    const svgOriginY = svgRect.top - stageRect.top + (svgRect.height - drawnHeight) / 2;

    const categories: { category: SupportCategoryId; side: 'left' | 'right' }[] = [
      { category: 'accent', side: 'left' },
      { category: 'bag', side: 'right' },
      { category: 'bottom', side: 'left' },
      { category: 'shoes', side: 'right' },
    ];

    const computed: LeaderLineGeometry[] = [];
    for (const { category, side } of categories) {
      const btnEl = hotspotButtonRefs.current[category];
      if (!btnEl) continue;
      const btnRect = btnEl.getBoundingClientRect();
      if (btnRect.width <= 0 || btnRect.height <= 0) continue;

      const anchor = getMannequinAnchorPoint(category);
      const startX = svgOriginX + anchor.vx * scale;
      const startY = svgOriginY + anchor.vy * scale;

      const endX =
        side === 'left'
          ? btnRect.right - stageRect.left + 4
          : btnRect.left - stageRect.left - 4;
      const endY = btnRect.top - stageRect.top + btnRect.height / 2;

      computed.push({
        category,
        startX,
        startY,
        endX,
        endY,
        side,
        isOptionalEmpty: anchor.isOptionalEmpty,
      });
    }

    setStageDimensions({ width: stageRect.width, height: stageRect.height });
    setLeaderLines(computed);
  }, [getMannequinAnchorPoint]);

  useLayoutEffect(() => {
    updateLeaderLines();
  }, [updateLeaderLines, activeQuickCategory, core.id]);

  useEffect(() => {
    const stageEl = stageRef.current;
    const svgEl = svgRef.current;
    if (!stageEl || !svgEl) return;

    const observer = new ResizeObserver(() => {
      updateLeaderLines();
    });
    observer.observe(stageEl);
    observer.observe(svgEl);
    window.addEventListener('resize', updateLeaderLines);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateLeaderLines);
    };
  }, [updateLeaderLines]);

  const closeQuickTray = useCallback((restoreFocus = true) => {
    const categoryToFocus = lastOpenedCategoryRef.current;
    setActiveQuickCategory(null);
    if (restoreFocus && categoryToFocus) {
      requestAnimationFrame(() => {
        hotspotButtonRefs.current[categoryToFocus]?.focus({ preventScroll: true });
      });
    }
  }, []);

  const handleToggleQuickCategory = (category: SupportCategoryId) => {
    if (activeQuickCategory === category) {
      closeQuickTray(true);
      return;
    }
    lastOpenedCategoryRef.current = category;
    setActiveQuickCategory(category);
  };

  // Ensure mannequin target zone (especially shoes/bottom or head/accent) is visible above the quick tray
  useEffect(() => {
    if (!activeQuickCategory) return;

    const rafId = requestAnimationFrame(() => {
      if (!svgRef.current) return;
      const svgRect = svgRef.current.getBoundingClientRect();
      const trayHeight = trayRef.current?.getBoundingClientRect().height || 168;
      const visibleBottomLimit = window.innerHeight - trayHeight - 12;

      if (
        (activeQuickCategory === 'shoes' || activeQuickCategory === 'bottom') &&
        svgRect.bottom > visibleBottomLimit
      ) {
        const delta = svgRect.bottom - visibleBottomLimit;
        // Only nudge scroll if it won't push the top of the mannequin off-screen
        if (svgRect.top - delta >= 8) {
          window.scrollBy({
            top: delta,
            behavior: shouldReduceMotion ? 'auto' : 'smooth',
          });
        }
      } else if (activeQuickCategory === 'accent' && svgRect.top < 64) {
        window.scrollBy({
          top: svgRect.top - 72,
          behavior: shouldReduceMotion ? 'auto' : 'smooth',
        });
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [activeQuickCategory, shouldReduceMotion]);

  // Close tray on Escape key or when resizing to desktop (>= 1024px)
  useEffect(() => {
    if (!activeQuickCategory) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeQuickTray(true);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setActiveQuickCategory(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeQuickCategory, closeQuickTray]);

  const layerTransition = {
    duration: shouldReduceMotion ? 0 : 0.2,
    ease: 'easeInOut' as const,
  };

  const primaryFabricColor = fabricColor || core.palette[0]?.hex || '#8C3B24';
  const displayPalette = palette && palette.length > 0 ? palette : core.palette;
  const fabricLuminance = getRelativeLuminance(primaryFabricColor);

  // Adaptive contrast strokes for internal garment pleats/seams on very dark or very light fabrics
  const isVeryDarkFabric = fabricLuminance < 0.035;
  const isLightFabric = fabricLuminance > 0.55;

  const garmentContourStroke = isVeryDarkFabric ? '#4A423B' : '#2B231D';
  const garmentDetailStroke = isVeryDarkFabric
    ? '#6E6259'
    : isLightFabric
      ? '#9A8B7A'
      : shiftHexBrightness(primaryFabricColor, -42);
  const garmentSubtleSeamStroke = isVeryDarkFabric
    ? '#5C5149'
    : isLightFabric
      ? '#B0A190'
      : shiftHexBrightness(primaryFabricColor, -28);
  // Subtle secondary shade for Áo Tứ Thân lower/back panels to preserve multi-layer depth
  const secondaryFabricShade = isVeryDarkFabric
    ? shiftHexBrightness(primaryFabricColor, 16)
    : shiftHexBrightness(primaryFabricColor, -14);

  const fabricTransitionStyle: React.CSSProperties = {
    transition: shouldReduceMotion ? 'none' : 'fill 200ms ease-in-out, stroke 200ms ease-in-out',
  };

  /* -------------------------------------------------------------
     LAYER 1: Neutral Mannequin Body
     viewBox: 0 0 300 600 (Center X = 150)
  ------------------------------------------------------------- */
  const renderMannequinBody = () => (
    <g id="layer-mannequin-base">
      {/* Subtle Studio Pedestal Shadow */}
      <ellipse cx="150" cy="565" rx="72" ry="10" fill="#E8DEC8" opacity="0.6" />
      <ellipse cx="150" cy="565" rx="48" ry="6" fill="#DDD0B8" opacity="0.8" />

      {/* Head Silhouette & Elegant Topknot / Hairline */}
      <path
        d="M142 42 C142 34 146 28 150 28 C154 28 158 34 158 42 Z"
        fill="#3D342C"
        stroke="#2E2620"
        strokeWidth="1.2"
      />
      {/* Hair bun pin / comb hint */}
      <line x1="145" y1="38" x2="155" y2="34" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />

      {/* Head oval */}
      <ellipse cx="150" cy="66" rx="20" ry="26" fill="#EFE5D5" stroke="#4A3F35" strokeWidth="1.5" />
      {/* Stylized serene facial guidelines / nose bridge hint */}
      <path d="M150 63 L149 71 L153 71" stroke="#A89A88" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <line x1="147" y1="77" x2="153" y2="77" stroke="#9A8977" strokeWidth="1.2" strokeLinecap="round" />

      {/* Neck */}
      <path
        d="M142 90 L141 116 L159 116 L158 90 Z"
        fill="#E8DCB8"
        stroke="#4A3F35"
        strokeWidth="1.5"
      />

      {/* Shoulders & Torso */}
      <path
        d="M141 116 L108 132 C104 134 102 138 103 143 L110 220 C111 236 120 248 126 256 L124 280 L176 280 L174 256 C180 248 189 236 190 220 L197 143 C198 138 196 134 192 132 L159 116 Z"
        fill="#EDE1CF"
        stroke="#4A3F35"
        strokeWidth="1.5"
      />

      {/* Left Arm & Hand */}
      <path
        d="M103 143 L94 220 L96 295 C96 305 92 322 93 328 C94 332 99 332 101 326 L106 290 L108 220 Z"
        fill="#EDE1CF"
        stroke="#4A3F35"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Right Arm & Hand */}
      <path
        d="M197 143 L206 220 L204 295 C204 305 208 322 207 328 C206 332 201 332 199 326 L194 290 L192 220 Z"
        fill="#EDE1CF"
        stroke="#4A3F35"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Left Leg Base Silhouette */}
      <path
        d="M125 280 L123 380 L126 480 L129 535 L140 535 L143 480 L146 380 L147 280 Z"
        fill="#E5D9C7"
        stroke="#5A4F44"
        strokeWidth="1.4"
      />

      {/* Right Leg Base Silhouette */}
      <path
        d="M153 280 L154 380 L157 480 L160 535 L171 535 L174 480 L177 380 L175 280 Z"
        fill="#E5D9C7"
        stroke="#5A4F44"
        strokeWidth="1.4"
      />
    </g>
  );

  /* -------------------------------------------------------------
     LAYER 2: Bottom Garment
     Supports: bottom-silk-wide | bottom-cargo-linen | bottom-raw-denim
  ------------------------------------------------------------- */
  const renderBottomGarment = () => {
    switch (items.bottom.id) {
      case 'bottom-cargo-linen':
        return (
          <g id="bottom-cargo-linen" stroke="#2B231D" strokeWidth="1.5" strokeLinejoin="round">
            {/* Linen waistband & pleats */}
            <path d="M122 246 L178 246 L180 262 L120 262 Z" fill="#DDD3C4" />
            <line x1="138" y1="248" x2="136" y2="278" stroke="#9E886D" strokeWidth="1.2" />
            <line x1="162" y1="248" x2="164" y2="278" stroke="#9E886D" strokeWidth="1.2" />

            {/* Left trouser leg: straight tailored with side cargo pocket */}
            <path
              d="M120 260 L114 360 L115 470 L116 515 L145 515 L147 470 L148 360 L149 270 Z"
              fill="#E5DCCE"
            />
            {/* Left trouser sharp pressed crease */}
            <line x1="130" y1="262" x2="131" y2="512" stroke="#B8A790" strokeWidth="1.3" />
            {/* Left Cargo 3D pocket */}
            <rect x="107" y="325" width="14" height="26" rx="2" fill="#D3C7B2" stroke="#2B231D" strokeWidth="1.3" />
            <path d="M107 325 L121 325 L119 331 L109 331 Z" fill="#B4A590" />
            <circle cx="114" cy="334" r="1.2" fill="#2B231D" />

            {/* Right trouser leg: straight tailored with side cargo pocket */}
            <path
              d="M151 270 L152 360 L153 470 L155 515 L184 515 L185 470 L186 360 L180 260 Z"
              fill="#E5DCCE"
            />
            {/* Right trouser pressed crease */}
            <line x1="169" y1="262" x2="170" y2="512" stroke="#B8A790" strokeWidth="1.3" />
            {/* Right Cargo 3D pocket */}
            <rect x="179" y="325" width="14" height="26" rx="2" fill="#D3C7B2" stroke="#2B231D" strokeWidth="1.3" />
            <path d="M179 325 L193 325 L191 331 L181 331 Z" fill="#B4A590" />
            <circle cx="186" cy="334" r="1.2" fill="#2B231D" />

            {/* Trouser bottom hems */}
            <line x1="116" y1="510" x2="145" y2="510" stroke="#9E886D" strokeWidth="1.2" />
            <line x1="155" y1="510" x2="184" y2="510" stroke="#9E886D" strokeWidth="1.2" />
          </g>
        );

      case 'bottom-raw-denim':
        return (
          <g id="bottom-raw-denim" stroke="#121822" strokeWidth="1.6" strokeLinejoin="round">
            {/* High-waist Raw Denim Band with Brass Button */}
            <path d="M121 240 L179 240 L182 258 L118 258 Z" fill="#1F2A38" />
            <line x1="122" y1="243" x2="178" y2="243" stroke="#D4A359" strokeWidth="1.2" strokeDasharray="3 1" />
            <line x1="120" y1="255" x2="180" y2="255" stroke="#D4A359" strokeWidth="1.2" strokeDasharray="3 1" />
            <circle cx="150" cy="249" r="2.2" fill="#D4AF37" stroke="#8C6C38" strokeWidth="0.8" />
            {/* Front fly stitch */}
            <path d="M150 252 L150 274 C150 278 147 282 143 282" fill="none" stroke="#D4A359" strokeWidth="1.2" />

            {/* Left curved baggy leg */}
            <path
              d="M118 258 C106 310 102 380 110 440 L115 506 L144 506 L147 440 C149 380 148 310 148 274 Z"
              fill="#223042"
            />
            {/* Left Denim Outer Selvedge Stitch */}
            <path
              d="M117 260 C106 312 103 380 111 440 L116 505"
              fill="none"
              stroke="#D4A359"
              strokeWidth="1.3"
              strokeDasharray="4 2"
            />
            {/* Left Folded Cuff (Turned up raw denim hem showing selvedge lining) */}
            <rect x="114" y="500" width="31" height="12" rx="1.5" fill="#7C93AC" stroke="#121822" strokeWidth="1.4" />
            <line x1="117" y1="500" x2="117" y2="512" stroke="#B3261E" strokeWidth="1.5" />

            {/* Right curved baggy leg */}
            <path
              d="M152 274 C152 310 151 380 153 440 L156 506 L185 506 L190 440 C198 380 194 310 182 258 Z"
              fill="#223042"
            />
            {/* Right Denim Outer Selvedge Stitch */}
            <path
              d="M183 260 C194 312 197 380 189 440 L184 505"
              fill="none"
              stroke="#D4A359"
              strokeWidth="1.3"
              strokeDasharray="4 2"
            />
            {/* Right Folded Cuff */}
            <rect x="155" y="500" width="31" height="12" rx="1.5" fill="#7C93AC" stroke="#121822" strokeWidth="1.4" />
            <line x1="183" y1="500" x2="183" y2="512" stroke="#B3261E" strokeWidth="1.5" />
          </g>
        );

      case 'bottom-silk-wide':
      default:
        return (
          <g id="bottom-silk-wide" stroke="#4A3F35" strokeWidth="1.4" strokeLinejoin="round">
            {/* Traditional Silk Wide Flowing Trousers (Quần lụa ống rộng) */}
            {/* Waistband */}
            <path d="M123 248 L177 248 L180 264 L120 264 Z" fill="#F4EFE6" />

            {/* Left wide leg billow */}
            <path
              d="M120 262 C108 320 98 410 96 528 L145 528 C145 420 147 330 148 274 Z"
              fill="#FFFDF9"
            />
            {/* Left silk drape shadow & slit detail */}
            <path d="M104 360 C102 430 100 480 101 528" fill="none" stroke="#DDD3C4" strokeWidth="1.5" />
            <path d="M126 310 C124 400 125 470 126 528" fill="none" stroke="#E5DCCE" strokeWidth="1.3" />

            {/* Right wide leg billow */}
            <path
              d="M152 274 C153 330 155 420 155 528 L204 528 C202 410 192 320 180 262 Z"
              fill="#FFFDF9"
            />
            {/* Right silk drape shadow & slit detail */}
            <path d="M196 360 C198 430 200 480 199 528" fill="none" stroke="#DDD3C4" strokeWidth="1.5" />
            <path d="M174 310 C176 400 175 470 174 528" fill="none" stroke="#E5DCCE" strokeWidth="1.3" />

            {/* Bottom billowing flowing hems */}
            <path d="M96 528 C108 532 133 532 145 528" fill="none" stroke="#4A3F35" strokeWidth="1.4" />
            <path d="M155 528 C167 532 192 532 204 528" fill="none" stroke="#4A3F35" strokeWidth="1.4" />
          </g>
        );
    }
  };

  /* -------------------------------------------------------------
     LAYER 3: Footwear
     Supports: shoes-guoc-moc | shoes-chunky-loafer | shoes-retro-sneaker
  ------------------------------------------------------------- */
  const renderShoes = () => {
    switch (items.shoes.id) {
      case 'shoes-chunky-loafer':
        return (
          <g id="shoes-chunky-loafer" stroke="#12100F" strokeWidth="1.4" strokeLinejoin="round">
            {/* Left Chunky Loafer */}
            {/* Commando lugged thick sole */}
            <path
              d="M122 546 L122 558 L126 558 L126 555 L130 558 L134 558 L134 555 L138 558 L144 558 L144 546 Z"
              fill="#181615"
            />
            {/* Glossy Upper with boxy toe */}
            <path
              d="M123 546 C122 536 127 528 132 528 C138 528 143 536 143 546 Z"
              fill="#262423"
            />
            {/* Penny strap & horsebit buckle accent */}
            <rect x="126" y="534" width="14" height="4" rx="1" fill="#181615" />
            <line x1="129" y1="536" x2="137" y2="536" stroke="#8C7E72" strokeWidth="1.2" />

            {/* Right Chunky Loafer */}
            <path
              d="M156 546 L156 558 L162 558 L162 555 L166 558 L170 558 L170 555 L174 558 L178 558 L178 546 Z"
              fill="#181615"
            />
            <path
              d="M157 546 C156 536 161 528 166 528 C172 528 177 536 177 546 Z"
              fill="#262423"
            />
            <rect x="160" y="534" width="14" height="4" rx="1" fill="#181615" />
            <line x1="163" y1="536" x2="171" y2="536" stroke="#8C7E72" strokeWidth="1.2" />
          </g>
        );

      case 'shoes-retro-sneaker':
        return (
          <g id="shoes-retro-sneaker" stroke="#3A2E26" strokeWidth="1.3" strokeLinejoin="round">
            {/* Left Retro Sneaker */}
            {/* White rubber cupsole with vintage red foxing stripe */}
            <rect x="122" y="546" width="22" height="9" rx="3" fill="#FFFDF9" />
            <line x1="123" y1="550" x2="143" y2="550" stroke="#B3261E" strokeWidth="1" />
            {/* Canvas body */}
            <path d="M123 546 C124 535 129 528 134 528 C139 528 142 535 143 546 Z" fill="#E8DED1" />
            {/* Terracotta suede T-toe panel */}
            <path d="M125 546 C126 540 131 536 137 536 C140 536 142 541 142 546 Z" fill="#B25D42" />
            {/* Sneaker laces */}
            <line x1="131" y1="532" x2="137" y2="532" stroke="#FFFDF9" strokeWidth="1.2" />
            <line x1="132" y1="535" x2="136" y2="535" stroke="#FFFDF9" strokeWidth="1.2" />

            {/* Right Retro Sneaker */}
            <rect x="156" y="546" width="22" height="9" rx="3" fill="#FFFDF9" />
            <line x1="157" y1="550" x2="177" y2="550" stroke="#B3261E" strokeWidth="1" />
            <path d="M157 546 C158 535 163 528 168 528 C173 528 176 535 177 546 Z" fill="#E8DED1" />
            <path d="M158 546 C159 540 164 536 170 536 C173 536 175 541 176 546 Z" fill="#B25D42" />
            <line x1="164" y1="532" x2="170" y2="532" stroke="#FFFDF9" strokeWidth="1.2" />
            <line x1="165" y1="535" x2="169" y2="535" stroke="#FFFDF9" strokeWidth="1.2" />
          </g>
        );

      case 'shoes-guoc-moc':
      default:
        return (
          <g id="shoes-guoc-moc" stroke="#3A281E" strokeWidth="1.3" strokeLinejoin="round">
            {/* Traditional Wooden Clogs (Guốc mộc sơn mài) */}
            {/* Left Clog Wooden Sole Base & Heel Block */}
            <path d="M124 544 L142 544 L142 554 L138 554 L138 550 L128 550 L128 554 L124 554 Z" fill="#523428" />
            <line x1="125" y1="547" x2="141" y2="547" stroke="#7A523E" strokeWidth="1.2" />
            {/* Red Velvet Curved Strap across instep */}
            <path d="M123 543 C124 532 141 532 143 543" fill="#A34836" stroke="#8C2D19" strokeWidth="1.8" />
            <circle cx="133" cy="537" r="1.3" fill="#D4AF37" />

            {/* Right Clog Wooden Sole Base & Heel Block */}
            <path d="M158 544 L176 544 L176 554 L172 554 L172 550 L162 550 L162 554 L158 554 Z" fill="#523428" />
            <line x1="159" y1="547" x2="175" y2="547" stroke="#7A523E" strokeWidth="1.2" />
            {/* Red Velvet Curved Strap */}
            <path d="M157 543 C158 532 175 532 177 543" fill="#A34836" stroke="#8C2D19" strokeWidth="1.8" />
            <circle cx="167" cy="537" r="1.3" fill="#D4AF37" />
          </g>
        );
    }
  };

  /* -------------------------------------------------------------
     LAYER 4: Selected Core Việt Phục
     Supports: ao-nhat-binh | ao-tac | ao-dai | ao-tu-than | ao-ngu-than
  ------------------------------------------------------------- */
  const renderCoreGarment = () => {
    switch (core.id) {
      case 'ao-nhat-binh':
        return (
          <g id="core-ao-nhat-binh" stroke={garmentContourStroke} strokeWidth="1.6" strokeLinejoin="round">
            {/* Robe Main Body & Moderate Sleeves */}
            <path
              d="M136 116 L92 140 L70 205 L90 216 L106 170 L108 395 L192 395 L194 170 L210 216 L230 205 L208 140 L164 116 Z"
              fill={primaryFabricColor}
              style={fabricTransitionStyle}
            />

            {/* Traditional Sleeve Cuffs with Gold Border */}
            <path d="M70 205 L90 216 L86 226 L66 215 Z" fill="#FAF7EE" stroke="#D4AF37" strokeWidth="1.5" />
            <path d="M210 216 L230 205 L234 215 L214 226 Z" fill="#FAF7EE" stroke="#D4AF37" strokeWidth="1.5" />

            {/* Signature Rectangular Collar (Cổ Nhật Bình đặc trưng) */}
            <path
              d="M132 114 L168 114 L174 240 L150 252 L126 240 Z"
              fill="#FAF7EE"
              stroke="#D4AF37"
              strokeWidth="2.5"
            />

            {/* Multi-color Ngũ Sắc Bands inside rectangular collar */}
            <line x1="135" y1="126" x2="165" y2="126" stroke="#D4AF37" strokeWidth="2.5" />
            <line x1="136" y1="135" x2="164" y2="135" stroke="#1C494A" strokeWidth="2.5" />
            <line x1="137" y1="144" x2="163" y2="144" stroke="#8C2D19" strokeWidth="2.5" />
            <line x1="138" y1="153" x2="162" y2="153" stroke="#1D4E89" strokeWidth="2.5" />
            <line x1="139" y1="162" x2="161" y2="162" stroke="#D4AF37" strokeWidth="2.5" />

            {/* Vertical Collar Borders & Center Opening */}
            <line x1="137" y1="126" x2="132" y2="238" stroke="#D4AF37" strokeWidth="1.5" />
            <line x1="163" y1="126" x2="168" y2="238" stroke="#D4AF37" strokeWidth="1.5" />
            <line x1="150" y1="165" x2="150" y2="395" stroke="#D4AF37" strokeWidth="2" strokeDasharray="6 3" />

            {/* Gold Embroidered Hem Trim */}
            <path d="M108 392 L192 392 L192 396 L108 396 Z" fill="#D4AF37" stroke="#2B231D" strokeWidth="1.2" />
          </g>
        );

      case 'ao-tac':
        return (
          <g id="core-ao-tac" stroke={garmentContourStroke} strokeWidth="1.6" strokeLinejoin="round">
            {/* Grand Ceremonial Robe with DRAMATIC EXTRA-WIDE FLOWING SLEEVES (Tay thụng) */}
            <path
              d="M139 116 L102 136 L60 220 C54 290 62 340 76 348 C92 348 106 280 110 210 L110 430 L190 430 L190 210 C194 280 208 348 224 348 C238 340 246 290 240 220 L198 136 L161 116 Z"
              fill={primaryFabricColor}
              style={fabricTransitionStyle}
            />

            {/* Standing Collar (Cổ Lập Lĩnh) */}
            <path d="M140 102 L160 102 L160 116 L140 116 Z" fill="#EDE8DF" stroke="#2B231D" strokeWidth="1.5" />

            {/* Wide Sleeve Flow Pleats / Drapes */}
            <path d="M78 240 C76 290 82 335 88 345" fill="none" stroke={garmentDetailStroke} strokeWidth="1.5" style={fabricTransitionStyle} />
            <path d="M222 240 C224 290 218 335 212 345" fill="none" stroke={garmentDetailStroke} strokeWidth="1.5" style={fabricTransitionStyle} />

            {/* Center spine seam (Đường can sống lưng / vạt trước đĩnh đạc) */}
            <line x1="150" y1="116" x2="150" y2="430" stroke={garmentDetailStroke} strokeWidth="1.5" style={fabricTransitionStyle} />

            {/* 5 Button Closures (Khuy Ngũ Thường) curving gently down right overlap */}
            <circle cx="150" cy="118" r="2" fill="#D4AF37" stroke="#2B231D" strokeWidth="1" />
            <circle cx="156" cy="128" r="2" fill="#D4AF37" stroke="#2B231D" strokeWidth="1" />
            <circle cx="163" cy="139" r="2" fill="#D4AF37" stroke="#2B231D" strokeWidth="1" />
            <circle cx="167" cy="152" r="2" fill="#D4AF37" stroke="#2B231D" strokeWidth="1" />
            <circle cx="168" cy="168" r="2" fill="#D4AF37" stroke="#2B231D" strokeWidth="1" />

            {/* Hem border */}
            <line x1="110" y1="426" x2="190" y2="426" stroke={garmentDetailStroke} strokeWidth="1.5" style={fabricTransitionStyle} />
          </g>
        );

      case 'ao-dai':
        return (
          <g id="core-ao-dai" stroke={garmentContourStroke} strokeWidth="1.5" strokeLinejoin="round">
            {/* Standing Mandarin Collar */}
            <path d="M142 98 L158 98 L158 114 L142 114 Z" fill="#F4ECE1" stroke="#2B231D" strokeWidth="1.5" />

            {/* Slender Raglan Sleeves hugging arms */}
            <path
              d="M140 114 L102 138 L93 220 L99 295 L106 295 L107 220 L118 170 Z"
              fill={primaryFabricColor}
              style={fabricTransitionStyle}
            />
            <path
              d="M160 114 L198 138 L207 220 L201 295 L194 295 L193 220 L182 170 Z"
              fill={primaryFabricColor}
              style={fabricTransitionStyle}
            />

            {/* Slender Torso with High Side Slits at natural waist (Y=245) */}
            {/* Front Panel: Drapes down to shins (Y=490) while leaving sides open to show trousers */}
            <path
              d="M136 114 L118 170 L123 245 C121 310 118 400 120 490 L180 490 C182 400 179 310 177 245 L182 170 L164 114 Z"
              fill={primaryFabricColor}
              style={fabricTransitionStyle}
            />

            {/* High Side Slits Indicators (showing bottom layer underneath) */}
            <line x1="123" y1="245" x2="120" y2="490" stroke="#B3261E" strokeWidth="1.3" />
            <line x1="177" y1="245" x2="180" y2="490" stroke="#B3261E" strokeWidth="1.3" />

            {/* Diagonal button placket under arm (Khuy bọc vải thủ công) */}
            <path d="M150 114 C153 124 163 135 174 138" fill="none" stroke="#D4AF37" strokeWidth="1.4" />
            <circle cx="152" cy="116" r="1.5" fill="#B3261E" />
            <circle cx="158" cy="124" r="1.5" fill="#B3261E" />
            <circle cx="166" cy="132" r="1.5" fill="#B3261E" />
            <circle cx="174" cy="138" r="1.5" fill="#B3261E" />

            {/* Delicate hem curve */}
            <path d="M120 490 C135 495 165 495 180 490" fill="none" stroke={garmentContourStroke} strokeWidth="1.4" />
          </g>
        );

      case 'ao-tu-than':
        return (
          <g id="core-ao-tu-than" stroke={garmentContourStroke} strokeWidth="1.6" strokeLinejoin="round">
            {/* Inner Silk Yếm Bodice (revealed through open front) */}
            <path
              d="M142 110 C146 114 154 114 158 110 L168 180 L132 180 Z"
              fill="#C27D78"
              stroke="#A85B55"
              strokeWidth="1.4"
            />
            {/* Yếm halter cord around neck */}
            <path d="M142 110 C146 104 154 104 158 110" fill="none" stroke="#8C2D19" strokeWidth="1.5" />

            {/* Outer Robe Body (Four Panels, open chest) */}
            {/* Left and Right Open Shoulders & Relaxed Sleeves */}
            <path
              d="M136 114 L98 138 L84 210 L94 220 L108 170 L114 250 L134 250 L130 180 Z"
              fill={primaryFabricColor}
              style={fabricTransitionStyle}
            />
            <path
              d="M164 114 L202 138 L216 210 L206 220 L192 170 L186 250 L166 250 L170 180 Z"
              fill={primaryFabricColor}
              style={fabricTransitionStyle}
            />

            {/* Back panels flowing down to knee level (Y=405) */}
            <path
              d="M116 250 L112 405 L144 405 L142 250 Z"
              fill={secondaryFabricShade}
              style={fabricTransitionStyle}
            />
            <path
              d="M158 250 L156 405 L188 405 L184 250 Z"
              fill={secondaryFabricShade}
              style={fabricTransitionStyle}
            />

            {/* Distinctive Front Tied Sash & Flowing Knot (Buộc vạt trước duyên dáng) */}
            {/* Tied knot at waist center */}
            <ellipse cx="150" cy="252" rx="7" ry="5" fill="#C27D78" stroke="#8C2D19" strokeWidth="1.5" />
            {/* Draped front ribbon tails cascading down */}
            <path
              d="M146 255 C142 290 138 335 142 375 L149 375 C146 335 148 290 149 256 Z"
              fill="#C27D78"
              stroke="#8C2D19"
              strokeWidth="1.3"
            />
            <path
              d="M154 255 C158 290 162 335 158 375 L151 375 C154 335 152 290 151 256 Z"
              fill="#DDD2C1"
              stroke="#A89A88"
              strokeWidth="1.3"
            />

            {/* Open front drape lapel lines */}
            <line x1="134" y1="120" x2="144" y2="250" stroke={garmentDetailStroke} strokeWidth="1.6" style={fabricTransitionStyle} />
            <line x1="166" y1="120" x2="156" y2="250" stroke={garmentDetailStroke} strokeWidth="1.6" style={fabricTransitionStyle} />
          </g>
        );

      case 'ao-ngu-than':
      default:
        return (
          <g id="core-ao-ngu-than" stroke={garmentContourStroke} strokeWidth="1.6" strokeLinejoin="round">
            {/* Standing Collar (Cổ Lập Lĩnh đĩnh đạc) */}
            <path d="M140 102 L160 102 L160 118 L140 118 Z" fill="#FAF7EE" stroke="#2B231D" strokeWidth="1.6" />

            {/* Main Robe & Fitted Sleeves (Tay Chẽn gọn gàng) */}
            <path
              d="M138 118 L104 140 L88 220 L96 295 L104 295 L110 220 L112 410 L188 410 L190 220 L196 295 L204 295 L212 220 L196 140 L162 118 Z"
              fill={primaryFabricColor}
              style={fabricTransitionStyle}
            />

            {/* Distinct Asymmetric Overlap (Vạt hữu / năm thân ghép kín đáo) */}
            {/* Diagonal overlap line sweeping from left neck to right side seam */}
            <path
              d="M150 118 C153 130 165 144 176 150 L176 250 L174 410"
              fill="none"
              stroke={garmentDetailStroke}
              strokeWidth="1.8"
              style={fabricTransitionStyle}
            />

            {/* 5 Traditional Buttons (Khuy Ngũ Thường) */}
            <circle cx="150" cy="120" r="2.2" fill="#D4AF37" stroke="#2B231D" strokeWidth="1" />
            <circle cx="157" cy="128" r="2.2" fill="#D4AF37" stroke="#2B231D" strokeWidth="1" />
            <circle cx="165" cy="138" r="2.2" fill="#D4AF37" stroke="#2B231D" strokeWidth="1" />
            <circle cx="174" cy="148" r="2.2" fill="#D4AF37" stroke="#2B231D" strokeWidth="1" />
            <circle cx="176" cy="165" r="2.2" fill="#D4AF37" stroke="#2B231D" strokeWidth="1" />

            {/* Longitudinal seams (Năm thân ghép mí) */}
            <line x1="130" y1="160" x2="130" y2="410" stroke={garmentSubtleSeamStroke} strokeWidth="1.2" strokeDasharray="5 3" style={fabricTransitionStyle} />
            <line x1="165" y1="180" x2="165" y2="410" stroke={garmentSubtleSeamStroke} strokeWidth="1.2" strokeDasharray="5 3" style={fabricTransitionStyle} />
          </g>
        );
    }
  };

  /* -------------------------------------------------------------
     LAYER 5: Selected Bag
     Supports: bag-gam-vintage | bag-tote-linen | bag-techwear-crossbody
  ------------------------------------------------------------- */
  const renderBag = () => {
    switch (items.bag.id) {
      case 'bag-techwear-crossbody':
        return (
          <g id="bag-techwear-crossbody" stroke="#101012" strokeWidth="1.5" strokeLinejoin="round">
            {/* Diagonal Techwear Webbing Strap running from left shoulder across chest to right hip */}
            <path
              d="M112 135 L178 265 L186 262 L120 132 Z"
              fill="#252528"
            />
            {/* Strap metallic adjusters */}
            <rect x="138" y="180" width="8" height="4" rx="1" fill="#64748B" stroke="#101012" strokeWidth="1" />

            {/* Tactical Crossbody Pouch resting on torso/waist */}
            <rect
              x="146"
              y="245"
              width="44"
              height="36"
              rx="4"
              fill="#252528"
            />
            {/* Fidlock Magnetic Buckle on front */}
            <rect x="162" y="254" width="12" height="9" rx="1.5" fill="#64748B" stroke="#101012" strokeWidth="1.2" />
            <line x1="162" y1="258" x2="174" y2="258" stroke="#101012" strokeWidth="1.2" />
            {/* Waterproof zipper taped pocket line */}
            <line x1="152" y1="270" x2="184" y2="270" stroke="#475569" strokeWidth="1.5" />
            {/* Reflective neon/cyan tag */}
            <rect x="182" y="274" width="4" height="2" fill="#38BDF8" stroke="none" />
          </g>
        );

      case 'bag-tote-linen':
        return (
          <g id="bag-tote-linen" stroke="#3D342A" strokeWidth="1.4" strokeLinejoin="round">
            {/* Shoulder Strap draped over right shoulder down to side */}
            <path
              d="M192 136 C202 170 208 215 204 260 L198 260 C202 215 196 170 188 136 Z"
              fill="#D6C8B4"
            />

            {/* Minimalist Canvas/Linen Tote Pouch at right side hip */}
            <path
              d="M192 260 L234 262 L230 355 L188 350 Z"
              fill="#D6C8B4"
            />
            {/* Reinforced tote stitching */}
            <line x1="192" y1="268" x2="234" y2="270" stroke="#9E886D" strokeWidth="1.3" />
            <line x1="210" y1="268" x2="210" y2="352" stroke="#B8A790" strokeWidth="1.2" strokeDasharray="4 2" />
            {/* Fabric texture fold */}
            <path d="M218 280 C219 305 218 330 217 348" fill="none" stroke="#9E886D" strokeWidth="1" />
          </g>
        );

      case 'bag-gam-vintage':
      default:
        return (
          <g id="bag-gam-vintage" stroke="#3A281E" strokeWidth="1.4" strokeLinejoin="round">
            {/* Hand-held Vintage Brocade Handbag at left hand */}
            {/* Wooden Arched Handle */}
            <path
              d="M90 320 C90 306 106 306 106 320"
              fill="none"
              stroke="#523428"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Brocade Trapezoid Pouch */}
            <path
              d="M86 320 L110 320 L114 362 L82 362 Z"
              fill="#8C6C38"
            />
            {/* Gold woven pattern lines & brass clasp */}
            <path d="M86 320 L110 320 L108 327 L88 327 Z" fill="#523428" />
            <circle cx="98" cy="324" r="2" fill="#D4AF37" stroke="#3A281E" strokeWidth="0.8" />
            {/* Lotus brocade geometric hints */}
            <path d="M98 335 L103 343 L98 351 L93 343 Z" fill="#D4AF37" opacity="0.85" />
            {/* Hanging silk tassel */}
            <line x1="98" y1="362" x2="98" y2="378" stroke="#A34836" strokeWidth="2" strokeLinecap="round" />
            <circle cx="98" cy="363" r="1.5" fill="#D4AF37" />
          </g>
        );
    }
  };

  /* -------------------------------------------------------------
     LAYER 6: Optional Accent
     Supports: accent-non-la | accent-silver-jewelry | accent-quai-thao-mini | accent-y2k-shades | null
  ------------------------------------------------------------- */
  const renderAccent = () => {
    if (!items.accent) return null;

    switch (items.accent.id) {
      case 'accent-non-la':
        return (
          <g id="accent-non-la" stroke="#5C4934" strokeWidth="1.3" strokeLinejoin="round">
            {/* Traditional Vietnamese Conical Leaf Hat (Nón Lá) worn naturally on head */}
            {/* Back/inner brim side wings framing upper temples without covering face */}
            <path
              d="M94 54 Q112 59 131 56 L131 50 Q112 51 94 54 Z"
              fill="#C4B083"
              stroke="#7A6242"
              strokeWidth="1.1"
            />
            <path
              d="M206 54 Q188 59 169 56 L169 50 Q188 51 206 54 Z"
              fill="#C4B083"
              stroke="#7A6242"
              strokeWidth="1.1"
            />

            {/* Delicate silk chin strap hint along jawline sides */}
            <path
              d="M132 55 C132 72 138 84 144 90"
              fill="none"
              stroke="#B3261E"
              strokeWidth="0.9"
              opacity="0.65"
              strokeLinecap="round"
            />
            <path
              d="M168 55 C168 72 162 84 156 90"
              fill="none"
              stroke="#B3261E"
              strokeWidth="0.9"
              opacity="0.65"
              strokeLinecap="round"
            />

            {/* Main Conical Leaf Body with pointed apex and curved wide brim */}
            <path
              d="M150 14 L94 54 Q150 48 206 54 Z"
              fill="#D8C79B"
              stroke="#5C4934"
              strokeWidth="1.4"
            />

            {/* Subtle warm highlight on left slope of cone */}
            <path
              d="M150 14 L94 54 Q122 50.5 150 51 Z"
              fill="#EAE0C0"
              stroke="none"
              opacity="0.55"
            />

            {/* Concentric bamboo rib rings (khung nan tre) */}
            <path d="M136 24 Q150 22 164 24" fill="none" stroke="#927853" strokeWidth="0.9" />
            <path d="M122 34 Q150 31 178 34" fill="none" stroke="#927853" strokeWidth="0.95" />
            <path d="M108 44 Q150 40 192 44" fill="none" stroke="#927853" strokeWidth="1" />

            {/* Radiating palm leaf ribs from pointed apex to wide brim */}
            <line x1="150" y1="14" x2="112" y2="52.5" stroke="#927853" strokeWidth="0.85" opacity="0.75" />
            <line x1="150" y1="14" x2="131" y2="51.5" stroke="#927853" strokeWidth="0.85" opacity="0.75" />
            <line x1="150" y1="14" x2="150" y2="51" stroke="#927853" strokeWidth="0.85" opacity="0.75" />
            <line x1="150" y1="14" x2="169" y2="51.5" stroke="#927853" strokeWidth="0.85" opacity="0.75" />
            <line x1="150" y1="14" x2="188" y2="52.5" stroke="#927853" strokeWidth="0.85" opacity="0.75" />

            {/* Outer bamboo brim binding (vành cái) & pointed crown tip (chóp nón) */}
            <path
              d="M94 54 Q150 48 206 54"
              fill="none"
              stroke="#7A6242"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="150" cy="14" r="1.4" fill="#5C4934" stroke="none" />
          </g>
        );

      case 'accent-y2k-shades':
        return (
          <g id="accent-y2k-shades" stroke="#181615" strokeWidth="1.2" strokeLinejoin="round">
            {/* Futuristic Slim Y2K Sunglasses on face */}
            {/* Left lens */}
            <path d="M136 64 C136 62 147 62 148 65 C148 68 138 70 136 68 Z" fill="#3E3835" />
            {/* Right lens */}
            <path d="M152 65 C153 62 164 62 164 64 C164 68 162 70 152 68 Z" fill="#3E3835" />
            {/* Slim silver titanium bridge & temples */}
            <line x1="148" y1="65" x2="152" y2="65" stroke="#D4AF37" strokeWidth="1.5" />
            <line x1="136" y1="65" x2="131" y2="64" stroke="#B8B3AC" strokeWidth="1.3" />
            <line x1="164" y1="65" x2="169" y2="64" stroke="#B8B3AC" strokeWidth="1.3" />
          </g>
        );

      case 'accent-quai-thao-mini':
        return (
          <g id="accent-quai-thao-mini" stroke="#3A2F24" strokeWidth="1.3" strokeLinejoin="round">
            {/* Miniature Round Flat Quai Thao Hat pinned at waist / side */}
            {/* Round Woven Hat Disc */}
            <circle cx="106" cy="272" r="18" fill="#C9BC9F" />
            {/* Concentric woven rings */}
            <circle cx="106" cy="272" r="13" fill="none" stroke="#9E886D" strokeWidth="1" />
            <circle cx="106" cy="272" r="7" fill="none" stroke="#9E886D" strokeWidth="1" />
            {/* Silver flower rosette center */}
            <circle cx="106" cy="272" r="3" fill="#B8B3AC" stroke="#5A524A" strokeWidth="0.8" />
            {/* Hanging decorative silk cords & silver tassels */}
            <path d="M96 284 C94 305 92 320 95 335" fill="none" stroke="#B3261E" strokeWidth="1.5" />
            <path d="M116 284 C118 305 120 320 117 335" fill="none" stroke="#B3261E" strokeWidth="1.5" />
          </g>
        );

      case 'accent-silver-jewelry':
      default:
        return (
          <g id="accent-silver-jewelry" stroke="#7C756B" strokeWidth="1.2" strokeLinejoin="round">
            {/* Silver Thai Lotus Pendant Necklace resting on chest */}
            {/* Chain draped around neck */}
            <path
              d="M142 112 C142 136 158 136 158 112"
              fill="none"
              stroke="#B8B3AC"
              strokeWidth="1.4"
            />
            {/* Dangling pendant link */}
            <line x1="150" y1="130" x2="150" y2="136" stroke="#B8B3AC" strokeWidth="1.5" />
            {/* Silver embossed lotus pendant */}
            <path
              d="M150 136 C154 139 156 144 150 148 C144 144 146 139 150 136 Z"
              fill="#E5E0D8"
              stroke="#5A524A"
              strokeWidth="1.2"
            />
            <circle cx="150" cy="142" r="1.3" fill="#D4AF37" />
          </g>
        );
    }
  };

  const getShortItemName = (category: SupportCategoryId): string => {
    if (category === 'accent') {
      if (!items.accent) return 'Chưa chọn';
      if (items.accent.id === 'accent-non-la') return 'Nón Lá';
      if (items.accent.id === 'accent-quai-thao-mini') return 'Quai Thao';
      if (items.accent.id === 'accent-y2k-shades') return 'Kính Y2K';
      return 'Chuỗi Bạc';
    }
    if (category === 'bag') {
      if (items.bag.id === 'bag-gam-vintage') return 'Túi Gấm';
      if (items.bag.id === 'bag-tote-linen') return 'Túi Tote';
      return 'Techwear';
    }
    if (category === 'bottom') {
      if (items.bottom.id === 'bottom-silk-wide') return 'Quần Lụa';
      if (items.bottom.id === 'bottom-cargo-linen') return 'Cargo Linen';
      return 'Raw Denim';
    }
    if (items.shoes.id === 'shoes-guoc-moc') return 'Guốc Mộc';
    if (items.shoes.id === 'shoes-chunky-loafer') return 'Loafer';
    return 'Sneaker';
  };

  const quickHotspots: {
    category: SupportCategoryId;
    label: string;
    fullTitle: string;
    positionClass: string;
    icon: React.ReactNode;
    activeItem: SupportOption | null;
  }[] = [
    {
      category: 'accent',
      label: 'Phụ kiện',
      fullTitle: 'Phụ kiện (Tùy chọn)',
      positionClass: 'top-3 left-1.5 sm:top-4 sm:left-3',
      icon: <Sparkles className="w-3.5 h-3.5 shrink-0" />,
      activeItem: items.accent,
    },
    {
      category: 'bag',
      label: 'Túi',
      fullTitle: 'Túi xách',
      positionClass: 'top-[46%] -translate-y-1/2 right-1.5 sm:right-3',
      icon: <ShoppingBag className="w-3.5 h-3.5 shrink-0" />,
      activeItem: items.bag,
    },
    {
      category: 'bottom',
      label: 'Quần',
      fullTitle: 'Phần dưới',
      positionClass: 'bottom-[21%] left-1.5 sm:left-3',
      icon: <Scissors className="w-3.5 h-3.5 shrink-0" />,
      activeItem: items.bottom,
    },
    {
      category: 'shoes',
      label: 'Giày',
      fullTitle: 'Giày guốc',
      positionClass: 'bottom-3 right-1.5 sm:bottom-4 sm:right-3',
      icon: <Footprints className="w-3.5 h-3.5 shrink-0" />,
      activeItem: items.shoes,
    },
  ];

  const activeCategoryConfig = quickHotspots.find((h) => h.category === activeQuickCategory);
  const activeCategoryOptions = activeQuickCategory ? SUPPORT_ITEMS[activeQuickCategory] : [];

  return (
    <div className="relative bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header with Title and Palette Swatches */}
      <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Pin className="w-3.5 h-3.5 rotate-45 text-[#B3261E]" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2B231D]">
            Bản phối 2D trực tiếp
          </h2>
          <span className="text-[#C8BCAC]">·</span>
          <span className="text-xs font-medium text-[#7A6E63]">{core.name}</span>
        </div>

        {/* Core garment / active concept palette indicators */}
        <div className="flex items-center gap-1.5">
          {displayPalette.map((c, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full border border-black/15 shadow-2xs"
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* Main 2D Mannequin Canvas - Responsive to available viewport */}
      <div
        ref={stageRef}
        className="relative w-full flex-1 flex items-center justify-center py-1.5 sm:py-2.5 px-14 sm:px-20 lg:px-0 bg-[#FAF7EE]/60 rounded-xs border border-[#EAE3D6]/70 min-h-0"
      >
        {/* Editorial Callout Leader Lines Overlay (Mobile/Tablet lg:hidden) */}
        {onSelectSupportItem && stageDimensions.width > 0 && leaderLines.length > 0 && (
          <svg
            className="lg:hidden pointer-events-none absolute inset-0 w-full h-full z-[6]"
            viewBox={`0 0 ${stageDimensions.width} ${stageDimensions.height}`}
            fill="none"
            aria-hidden="true"
          >
            {leaderLines.map((line) => {
              const isSelected = activeQuickCategory === line.category;
              const strokeColor = isSelected ? '#B3261E' : '#9A7E67';
              const strokeOpacity = isSelected
                ? 0.95
                : line.isOptionalEmpty
                  ? 0.45
                  : line.category === 'bag' && items.bag.id === 'bag-gam-vintage'
                    ? 0.52
                    : 0.72;

              // Build smooth cubic Bezier path from garment anchor (startX, startY) to button edge (endX, endY)
              let dPath = '';
              if (line.side === 'left') {
                const spanX = Math.max(14, line.startX - line.endX);
                const c1x =
                  line.category === 'accent' && items.accent?.id === 'accent-quai-thao-mini'
                    ? Math.min(line.startX - 10, line.endX + spanX * 0.35)
                    : line.startX - spanX * 0.42;
                const c2x = line.endX + Math.min(22, spanX * 0.48);
                dPath = `M ${line.startX} ${line.startY} C ${c1x} ${line.startY}, ${c2x} ${line.endY}, ${line.endX} ${line.endY}`;
              } else {
                const spanX = Math.max(14, line.endX - line.startX);
                const c1x = line.startX + spanX * 0.42;
                const c2x = line.endX - Math.min(22, spanX * 0.48);
                dPath = `M ${line.startX} ${line.startY} C ${c1x} ${line.startY}, ${c2x} ${line.endY}, ${line.endX} ${line.endY}`;
              }

              // Arrowhead pointing horizontally into the button edge
              const arrowDir = line.side === 'left' ? 1 : -1;
              const arrowPath = `M ${line.endX + arrowDir * 5} ${line.endY - 3} L ${line.endX} ${line.endY} L ${line.endX + arrowDir * 5} ${line.endY + 3}`;

              return (
                <g key={`leader-${line.category}`} opacity={strokeOpacity}>
                  {/* Subtle halo behind origin dot */}
                  <circle
                    cx={line.startX}
                    cy={line.startY}
                    r={isSelected ? 3.2 : 2.5}
                    fill="#FFFDF9"
                    stroke={strokeColor}
                    strokeWidth="1.1"
                  />
                  <circle
                    cx={line.startX}
                    cy={line.startY}
                    r={isSelected ? 1.5 : 1.1}
                    fill={strokeColor}
                  />

                  {/* Editorial Callout Curve */}
                  <path
                    d={dPath}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 1.35 : 1.05}
                    strokeDasharray={line.isOptionalEmpty ? '3 2.5' : undefined}
                    strokeLinecap="round"
                  />

                  {/* Delicate Arrowhead pointing to the control button */}
                  <path
                    d={arrowPath}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 1.4 : 1.15}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* 4 Mobile/Tablet Quick-Select Hotspot Buttons around outer margins (Hidden on Desktop lg+) */}
        {onSelectSupportItem && (
          <div className="lg:hidden pointer-events-none absolute inset-0 z-10">
            {quickHotspots.map((spot) => {
              const isSelected = activeQuickCategory === spot.category;
              const shortName = getShortItemName(spot.category);
              return (
                <button
                  key={spot.category}
                  ref={(el) => {
                    hotspotButtonRefs.current[spot.category] = el;
                  }}
                  type="button"
                  onClick={() => handleToggleQuickCategory(spot.category)}
                  aria-label={`Chọn nhanh ${spot.label}: hiện tại ${spot.activeItem ? spot.activeItem.name : 'Chưa chọn'}`}
                  aria-expanded={isSelected}
                  className={`pointer-events-auto absolute ${spot.positionClass} min-h-[36px] sm:min-h-[40px] px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border text-left transition-all duration-150 cursor-pointer flex items-center gap-1.5 shadow-2xs backdrop-blur-[2px] ${
                    isSelected
                      ? 'bg-[#B3261E] border-[#B3261E] text-[#FFFDF9] ring-2 ring-[#B3261E]/25'
                      : 'bg-[#FFFDF9]/95 hover:bg-[#FAF3EB] border-[#DDD0C0] hover:border-[#B3261E]/60 text-[#2B231D]'
                  }`}
                >
                  <span className={isSelected ? 'text-[#FFFDF9]' : 'text-[#B3261E]'}>
                    {spot.icon}
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[11px] font-semibold tracking-tight">
                      {spot.label}
                    </span>
                    <span
                      className={`hidden sm:block text-[9px] font-mono truncate max-w-[78px] ${
                        isSelected ? 'text-[#FAF7EE]/90' : 'text-[#7A6E63]'
                      }`}
                    >
                      {shortName}
                    </span>
                  </span>
                  {spot.activeItem ? (
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 border ${
                        isSelected ? 'border-white/70' : 'border-black/20'
                      }`}
                      style={{ backgroundColor: spot.activeItem.accentHex }}
                    />
                  ) : (
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 border border-dashed ${
                        isSelected ? 'border-white/80' : 'border-[#8C7E72]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox="0 0 300 600"
          className="w-full max-w-[340px] h-auto max-h-[min(410px,55dvh)] sm:max-h-[min(480px,60dvh)] lg:max-h-[calc(100vh-230px)] xl:max-h-[min(560px,calc(100vh-230px))] mx-auto select-none drop-shadow-xs"
          preserveAspectRatio="xMidYMid meet"
          aria-label={`Mannequin 2D phối đồ Việt phục ${core.name}`}
        >
          {/* 1. Neutral Mannequin Body (Fixed, no re-mount animation) */}
          {renderMannequinBody()}

          {/* 2. Selected Bottom Garment (Crossfade on bottom change) */}
          <motion.g
            key={`bottom-${items.bottom.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={layerTransition}
          >
            {renderBottomGarment()}
          </motion.g>

          {/* 3. Selected Footwear (Crossfade on shoes change) */}
          <motion.g
            key={`shoes-${items.shoes.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={layerTransition}
          >
            {renderShoes()}
          </motion.g>

          {/* 4. Selected Core Việt Phục (Dominant piece, crossfade on core change) */}
          <motion.g
            key={`core-${core.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={layerTransition}
          >
            {renderCoreGarment()}
          </motion.g>

          {/* 5. Selected Bag (Crossfade on bag change) */}
          <motion.g
            key={`bag-${items.bag.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={layerTransition}
          >
            {renderBag()}
          </motion.g>

          {/* 6. Optional Accent (Crossfade on accent change) */}
          <motion.g
            key={`accent-${items.accent ? items.accent.id : 'none'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={layerTransition}
          >
            {renderAccent()}
          </motion.g>
        </svg>
      </div>

      {/* Footer Info Strip with Outfit Composition & Detail Action */}
      <div className="mt-4 pt-3 border-t border-[#EAE3D6] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap text-[#5A4F46]">
          <span className="font-semibold text-[#2B231D] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#B3261E]" />
            Bộ phối:
          </span>
          <span className="text-[#B3261E] font-medium">{core.name}</span>
          <span className="text-[#C8BCAC]">·</span>
          <span>{items.bottom.name.split(' ')[0]}</span>
          <span className="text-[#C8BCAC]">·</span>
          <span>{items.shoes.name.split(' ')[0]}</span>
          <span className="text-[#C8BCAC]">·</span>
          <span>{items.bag.name.split(' ')[0]}</span>
          {items.accent && (
            <>
              <span className="text-[#C8BCAC]">·</span>
              <span className="text-[#7A6E63]">
                {items.accent.id === 'accent-non-la'
                  ? 'Nón Lá'
                  : items.accent.id === 'accent-quai-thao-mini'
                    ? 'Nón Quai Thao'
                    : items.accent.name.split(' ')[0]}
              </span>
            </>
          )}
        </div>

        {onOpenCoreDetail && (
          <button
            type="button"
            onClick={onOpenCoreDetail}
            className="text-xs font-semibold text-[#B3261E] hover:underline cursor-pointer shrink-0 self-start sm:self-auto"
          >
            Hồ sơ chi tiết →
          </button>
        )}
      </div>

      {/* Mobile/Tablet Compact Bottom Quick-Select Tray (Portal to body so never clipped) */}
      {typeof document !== 'undefined' &&
        onSelectSupportItem &&
        createPortal(
          <AnimatePresence>
            {activeQuickCategory && activeCategoryConfig && (
              <div className="fixed inset-0 z-50 lg:hidden pointer-events-none flex flex-col justify-end">
                {/* Subtle click-outside backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
                  onClick={() => closeQuickTray(true)}
                  className="fixed inset-0 bg-black/15 pointer-events-auto"
                  aria-hidden="true"
                />

                {/* Compact Bottom Sheet Tray (30-35% max height, single-row horizontal scroll on short/narrow screens) */}
                <motion.div
                  ref={trayRef}
                  role="dialog"
                  aria-modal="false"
                  aria-label={`Khay chọn nhanh ${activeCategoryConfig.fullTitle}`}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeOut' }}
                  className="relative z-10 pointer-events-auto w-full bg-[#FFFDF9] border-t-2 border-[#B3261E]/80 shadow-[0_-8px_24px_rgba(43,35,29,0.14)] rounded-t-2xl px-3.5 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] max-h-[min(35dvh,220px)] flex flex-col gap-2"
                >
                  {/* Tray Header: Category Switcher Pills + Remix Score + Close */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#EFE8DC] pb-2 shrink-0">
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                      {quickHotspots.map((tab) => {
                        const isTabActive = tab.category === activeQuickCategory;
                        return (
                          <button
                            key={tab.category}
                            type="button"
                            onClick={() => {
                              lastOpenedCategoryRef.current = tab.category;
                              setActiveQuickCategory(tab.category);
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                              isTabActive
                                ? 'bg-[#B3261E] text-white'
                                : 'bg-[#FAF7EE] text-[#5A4F46] hover:bg-[#F2EAE0] border border-[#E5DEC9]'
                            }`}
                          >
                            {tab.icon}
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {typeof remixDialValue === 'number' && (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#B3261E] bg-[#FAF3EB] border border-[#E8D5C4] px-2 py-0.5 rounded-md"
                          title="Mức độ Remix hiện tại"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>{remixDialValue}%</span>
                        </span>
                      )}

                      {activeQuickCategory === 'accent' && items.accent && onRemoveAccent && (
                        <button
                          type="button"
                          onClick={onRemoveAccent}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#B3261E] bg-[#FDF2F0] hover:bg-[#FBE4E0] border border-[#F5C2BA] rounded-md cursor-pointer transition-colors"
                          title="Gỡ bỏ phụ kiện đang chọn"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden min-[380px]:inline">Gỡ</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => closeQuickTray(true)}
                        className="p-1.5 text-[#5A4F46] hover:text-[#241E1A] bg-[#FAF7EE] hover:bg-[#EFE8DC] rounded-lg cursor-pointer transition-colors"
                        aria-label="Đóng khay chọn đồ"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Touch-Scroll Strip on Mobile / Grid on Tablet */}
                  <div
                    role="listbox"
                    aria-label={`Danh sách ${activeCategoryConfig.fullTitle}`}
                    className="flex items-stretch gap-2 overflow-x-auto pb-1 pt-0.5 snap-x snap-mandatory"
                  >
                    {/* Optional 'None' card for Accent category */}
                    {activeQuickCategory === 'accent' && onRemoveAccent && (
                      <button
                        type="button"
                        role="option"
                        aria-selected={items.accent === null}
                        onClick={onRemoveAccent}
                        className={`snap-start shrink-0 w-[132px] sm:w-[148px] p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                          items.accent === null
                            ? 'bg-[#FAF3EB] border-[#B3261E] ring-1 ring-[#B3261E]/30 text-[#241E1A]'
                            : 'bg-[#FAF7EE] hover:bg-[#F3ECE1] border-[#E5DEC9] text-[#5A4F46]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="w-3.5 h-3.5 rounded-full border border-dashed border-[#8C7E72] shrink-0" />
                          <span className="text-[10px] font-mono text-[#7A6E63]">Tùy chọn</span>
                          {items.accent === null && (
                            <Check className="w-3.5 h-3.5 text-[#B3261E] shrink-0 ml-auto" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#241E1A] leading-snug">
                            Không dùng phụ kiện
                          </div>
                          <div className="text-[10px] text-[#7A6E63] font-serif truncate mt-0.5">
                            Giữ nguyên bản tối giản
                          </div>
                        </div>
                      </button>
                    )}

                    {activeCategoryOptions.map((opt) => {
                      const currentSelectedId =
                        activeQuickCategory === 'accent'
                          ? items.accent?.id || ''
                          : items[activeQuickCategory].id;
                      const isOptionSelected = opt.id === currentSelectedId;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="option"
                          aria-selected={isOptionSelected}
                          onClick={() => onSelectSupportItem(activeQuickCategory, opt)}
                          className={`snap-start shrink-0 w-[158px] sm:w-[176px] p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            isOptionSelected
                              ? 'bg-[#FAF3EB] border-[#B3261E] ring-1 ring-[#B3261E]/30 text-[#241E1A] shadow-2xs'
                              : 'bg-[#FAF7EE] hover:bg-[#F3ECE1] border-[#E5DEC9] text-[#4E433C]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: opt.accentHex }}
                              />
                              <span className="text-[10px] font-mono text-[#8C7E72] truncate">
                                {opt.badgeLabel}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] font-mono font-semibold text-[#B3261E]">
                                {opt.modernityScore}%
                              </span>
                              {isOptionSelected && (
                                <Check className="w-3.5 h-3.5 text-[#B3261E]" />
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-semibold text-[#241E1A] leading-snug line-clamp-1">
                              {opt.name}
                            </div>
                            <div className="text-[10px] text-[#7A6E63] font-serif truncate mt-0.5">
                              {opt.material.split('&')[0]}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
