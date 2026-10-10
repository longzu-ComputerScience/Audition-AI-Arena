import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  CoreItem,
  ActiveSupportItems,
  SupportCategoryId,
  SupportOption,
} from '../types';
import { SUPPORT_ITEMS } from '../data/mockFashionData';
import { getSupportItemDemoImage } from '../data/demoImageMap';
import {
  PHOTO_LAYER_CONFIG,
  isPhotoLayerSupported,
  getPhotoLayerConfig,
} from '../data/layeredOutfitMap';
import { recolorGarmentImage, peekRecoloredGarmentImage, retainRecoloredImage } from '../utils/fabricRecolor';
import { usePhotoImage, retryPhotoImage } from '../utils/photoImageCache';
import { getOutfitLayerConfig } from '../data/photoLayerFitting';
import { AccessoryPositions, AccessoryPoint, AccessoryBounds, MovableCategory } from '../utils/accessoryPlacement';
import { TECHWEAR_VISIBLE_CONTOUR } from '../utils/accessoryHitShape';
import { MovableAccessory } from './MovableAccessory';
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
  ChevronDown,
  RotateCcw,
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
  onSelectFabricColor?: (hex: string) => void;
  displayMode?: 'svg' | 'photo';
  accessoryPositions: AccessoryPositions;
  onMoveAccessory: (category: MovableCategory, point: AccessoryPoint) => void;
  onResetAccessoryPositions: () => void;
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
  onSelectFabricColor,
  displayMode,
  accessoryPositions,
  onMoveAccessory,
  onResetAccessoryPositions,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const necklaceClipId = `necklace-${useId().replace(/:/g, '')}`;

  // Active quick-select category ('accent' | 'bag' | 'bottom' | 'shoes' | null) across all devices
  const [activeQuickCategory, setActiveQuickCategory] = useState<SupportCategoryId | null>(null);
  const [failedThumbIds, setFailedThumbIds] = useState<Record<string, boolean>>({});

  // Photography is standard. The prop remains an internal diagnostic override only.
  const renderMode = displayMode ?? 'photo';

  // Photo fabric recoloring state
  const [, refreshRecolor] = useState(0);
  const [failedRecolorKey, setFailedRecolorKey] = useState<string | null>(null);

  const selectedConfigs = [getPhotoLayerConfig('core', core.id), getPhotoLayerConfig('bottom', items.bottom.id),
    getPhotoLayerConfig('shoes', items.shoes.id), getPhotoLayerConfig('bag', items.bag.id), getPhotoLayerConfig('accent', items.accent?.id)];
  const bottomStatus = usePhotoImage(selectedConfigs[1]?.imageSrc);
  const shoesStatus = usePhotoImage(selectedConfigs[2]?.imageSrc);
  const bagStatus = usePhotoImage(selectedConfigs[3]?.imageSrc);
  const accentStatus = usePhotoImage(selectedConfigs[4]?.imageSrc);

  const corePhotoConfig = getPhotoLayerConfig('core', core.id);

  const isSupportedCombination = isPhotoLayerSupported(core.id, items.bottom?.id);

  // Availability is independent of readiness: a pending accessory never invalidates the core.
  const isPhotoModeActive = renderMode === 'photo' && Boolean(corePhotoConfig?.validated);

  const lastOpenedCategoryRef = useRef<SupportCategoryId | null>(null);
  const hotspotButtonRefs = useRef<Record<SupportCategoryId, HTMLButtonElement | null>>({
    accent: null,
    bag: null,
    bottom: null,
    shoes: null,
  });
  const stageRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const bagNodeRef = useRef<SVGGElement>(null);
  const accentNodeRef = useRef<SVGGElement>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<MovableCategory | null>(null);
  const [accessoryOffsets, setAccessoryOffsets] = useState<Record<MovableCategory, AccessoryPoint & { anchor?: AccessoryPoint }>>({ bag: { x: 0, y: 0 }, accent: { x: 0, y: 0 } });
  const updateAccessoryOffset = useCallback((category: MovableCategory, offset: AccessoryPoint, bounds: AccessoryBounds | null) => {
    const anchor = bounds ? { x: bounds.x + offset.x + (category === 'bag' ? bounds.width + 8 : -8), y: bounds.y + offset.y + bounds.height / 2 } : undefined;
    setAccessoryOffsets(previous => previous[category].x === offset.x && previous[category].y === offset.y
      && previous[category].anchor?.x === anchor?.x && previous[category].anchor?.y === anchor?.y
      ? previous : { ...previous, [category]: { ...offset, anchor } });
  }, []);
  useEffect(() => { setSelectedAccessory(null); }, [core.id, items.bag.id, items.accent?.id]);

  useEffect(() => {
    if (!selectedAccessory) return;
    const dismissAccessorySelection = (event: Event) => {
      const nodes = [bagNodeRef.current, accentNodeRef.current];
      const path = event.composedPath();
      const target = event.target instanceof Element ? event.target : null;
      // Keep selecting either item/control possible, and never interrupt a captured drag.
      if (nodes.some(node => node && path.includes(node)) || target?.closest('[data-accessory-select]')) return;
      if (nodes.some(node => node?.dataset.dragging === 'true')) return;
      setSelectedAccessory(null);
      // Clicking a non-focusable background must also end arrow-key movement.
      nodes.forEach(node => { if (node && document.activeElement === node) node.blur(); });
    };
    document.addEventListener('pointerdown', dismissAccessorySelection, true);
    document.addEventListener('focusin', dismissAccessorySelection);
    return () => {
      document.removeEventListener('pointerdown', dismissAccessorySelection, true);
      document.removeEventListener('focusin', dismissAccessorySelection);
    };
  }, [selectedAccessory]);

  const trayRef = useRef<HTMLDivElement | null>(null);
  const desktopPanelRef = useRef<HTMLDivElement | null>(null);

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

  interface DesktopPopoverPosition {
    left: number;
    top?: number;
    bottom?: number;
    width: number;
    maxListHeight: number;
    placement: 'below' | 'above';
  }

  const [desktopPopoverPos, setDesktopPopoverPos] = useState<DesktopPopoverPosition | null>(null);

  const updateDesktopPopoverPosition = useCallback(() => {
    if (!activeQuickCategory || typeof window === 'undefined' || window.innerWidth < 1024) {
      setDesktopPopoverPos(null);
      return;
    }

    const btnEl = hotspotButtonRefs.current[activeQuickCategory];
    if (!btnEl) return;

    const btnRect = btnEl.getBoundingClientRect();
    if (btnRect.width <= 0 || btnRect.height <= 0) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12;
    const topSafeLimit = 72; // Below sticky header
    const bottomSafeLimit = vh - margin;
    const gap = 8;

    const panelWidth = vw >= 1280 ? 316 : 292;
    const isLeftSide = activeQuickCategory === 'accent' || activeQuickCategory === 'bottom';

    // Horizontal alignment: align with left edge for left hotspots, right edge for right hotspots, clamped to viewport
    let left = isLeftSide ? btnRect.left : btnRect.right - panelWidth;
    left = Math.max(margin, Math.min(left, vw - panelWidth - margin));

    // Vertical placement: prefer below for top/mid hotspots when enough room, otherwise open above
    const spaceBelow = bottomSafeLimit - (btnRect.bottom + gap);
    const spaceAbove = btnRect.top - gap - topSafeLimit;
    const desiredPanelHeight = activeQuickCategory === 'accent' ? 286 : 244;
    const headerHeight = 52;

    const preferAbove =
      activeQuickCategory === 'shoes' ||
      (activeQuickCategory === 'bottom' && spaceBelow < desiredPanelHeight) ||
      (spaceBelow < desiredPanelHeight && spaceAbove > spaceBelow);

    if (!preferAbove && spaceBelow >= 170) {
      const top = Math.max(topSafeLimit, Math.min(btnRect.bottom + gap, bottomSafeLimit - 170));
      const availableHeight = Math.max(160, bottomSafeLimit - top);
      setDesktopPopoverPos({
        left,
        top,
        width: panelWidth,
        maxListHeight: Math.max(108, Math.min(240, availableHeight - headerHeight)),
        placement: 'below',
      });
    } else if (spaceAbove >= 170) {
      const bottom = Math.max(margin, vh - (btnRect.top - gap));
      const availableHeight = Math.max(160, vh - bottom - topSafeLimit);
      setDesktopPopoverPos({
        left,
        bottom,
        width: panelWidth,
        maxListHeight: Math.max(108, Math.min(240, availableHeight - headerHeight)),
        placement: 'above',
      });
    } else {
      // Fallback when viewport is very short or button is partially offscreen: clamp inside visible viewport
      const clampedHeight = Math.min(desiredPanelHeight, bottomSafeLimit - topSafeLimit);
      const idealTop = btnRect.top + btnRect.height / 2 - clampedHeight / 2;
      const top = Math.max(topSafeLimit, Math.min(idealTop, bottomSafeLimit - clampedHeight));
      setDesktopPopoverPos({
        left,
        top,
        width: panelWidth,
        maxListHeight: Math.max(108, clampedHeight - headerHeight),
        placement: 'below',
      });
    }
  }, [activeQuickCategory]);

  // Returns viewBox (0 0 300 600) callout origin point positioned in the open air near each item's outer edge
  // so leader lines and origin dots never touch or cross over the garment fabric, face, or Nón Lá.
  const getMannequinAnchorPoint = useCallback(
    (category: SupportCategoryId): { vx: number; vy: number; isOptionalEmpty?: boolean } => {
      const isWideSleeveTac = core.id === 'ao-tac';

      if (category === 'accent') {
        if (!items.accent) {
          // Open space to the left of upper head/neck
          return { vx: 110, vy: 72, isOptionalEmpty: true };
        }
        switch (items.accent.id) {
          case 'accent-non-la':
            // Open space ~16 units left of Nón Lá left brim tip (x=94, y=54)
            return { vx: 78, vy: 52 };
          case 'accent-y2k-shades':
            // Open space ~18 units left of sunglasses temple / head edge (x=130, y=65)
            return { vx: 112, vy: 65 };
          case 'accent-quai-thao-mini':
            // Open space left of Quai Thao Mini at hip (x=88) or outside Áo Tấc wide sleeve (x=57)
            return { vx: isWideSleeveTac ? 44 : 72, vy: 270 };
          case 'accent-silver-jewelry':
          default:
            // Open space left of collar/neckline above shoulder slope so line never crosses chest
            return { vx: 114, vy: 104 };
        }
      }

      if (category === 'bag') {
        switch (items.bag.id) {
          case 'bag-tote-linen':
            // Open space right of Linen Tote outer edge (x=234) and Áo Tấc wide sleeve (x=242)
            return { vx: isWideSleeveTac ? 256 : 250, vy: 300 };
          case 'bag-techwear-crossbody':
            // Open space right of right arm/sleeve at waist pouch level (y=262)
            return { vx: isWideSleeveTac ? 256 : 224, vy: 262 };
          case 'bag-gam-vintage':
          default:
            // Open space on right side at handbag/hand level so line never cuts across the robe
            return { vx: isWideSleeveTac ? 254 : 224, vy: 326 };
        }
      }

      if (category === 'bottom') {
        switch (items.bottom.id) {
          case 'bottom-tailored-trousers':
          case 'bottom-cargo-linen':
            // Open space ~19 units left of tailored trouser leg (x=115)
            return { vx: 96, vy: 452 };
          case 'bottom-raw-denim':
            // Open space ~18 units left of raw denim leg (x=110)
            return { vx: 92, vy: 452 };
          case 'bottom-silk-wide':
          default:
            // Open space ~18 units left of wide silk trouser billow (x=99)
            return { vx: 81, vy: 452 };
        }
      }

      // shoes: Open space to the right of right shoe outer edge (x=178) & wide silk trouser hem (x=204)
      const isWideSilkBottom = items.bottom.id === 'bottom-silk-wide';
      switch (items.shoes.id) {
        case 'shoes-chunky-loafer':
        case 'shoes-retro-sneaker':
          return { vx: isWideSilkBottom ? 208 : 196, vy: 546 };
        case 'shoes-guoc-moc':
        default:
          return { vx: isWideSilkBottom ? 208 : 195, vy: 546 };
      }
    },
    [items.accent?.id, items.bag.id, items.bottom.id, items.shoes.id, core.id]
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
      const geometry = category === 'bag' || (category === 'accent' && items.accent) ? accessoryOffsets[category as MovableCategory] : undefined;
      const rawStartX = svgOriginX + (geometry?.anchor?.x ?? anchor.vx) * scale;
      const startY = svgOriginY + (geometry?.anchor?.y ?? anchor.vy) * scale;

      const endX =
        side === 'left'
          ? btnRect.right - stageRect.left + 6
          : btnRect.left - stageRect.left - 6;
      const endY = btnRect.top - stageRect.top + btnRect.height / 2;

      // Ensure startX always stays on the mannequin side of endX with at least 14px span
      const startX = category === 'bag' || category === 'accent' ? rawStartX :
        side === 'left'
          ? Math.max(endX + 14, rawStartX)
          : Math.min(endX - 14, rawStartX);

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

    setStageDimensions(previous => previous.width === stageRect.width && previous.height === stageRect.height ? previous : { width: stageRect.width, height: stageRect.height });
    setLeaderLines(previous => JSON.stringify(previous) === JSON.stringify(computed) ? previous : computed);
  }, [getMannequinAnchorPoint, accessoryOffsets, items.accent]);

  useLayoutEffect(() => {
    updateLeaderLines();
    updateDesktopPopoverPosition();
  }, [updateLeaderLines, updateDesktopPopoverPosition, activeQuickCategory, core.id]);

  useEffect(() => {
    const stageEl = stageRef.current;
    const svgEl = svgRef.current;
    if (!stageEl || !svgEl) return;

    const handleViewportUpdate = () => {
      updateLeaderLines();
      updateDesktopPopoverPosition();
    };

    const observer = new ResizeObserver(handleViewportUpdate);
    observer.observe(stageEl);
    observer.observe(svgEl);
    window.addEventListener('resize', handleViewportUpdate);
    window.addEventListener('scroll', updateDesktopPopoverPosition, { passive: true, capture: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleViewportUpdate);
      window.removeEventListener('scroll', updateDesktopPopoverPosition, true);
    };
  }, [updateLeaderLines, updateDesktopPopoverPosition]);

  const closeQuickTray = useCallback((restoreFocus = true) => {
    const categoryToFocus = lastOpenedCategoryRef.current;
    setActiveQuickCategory(null);
    if (restoreFocus && categoryToFocus) {
      requestAnimationFrame(() => {
        hotspotButtonRefs.current[categoryToFocus]?.focus({ preventScroll: true });
      });
    }
  }, []);

  const prevQuickCategoryRef = useRef<SupportCategoryId | null>(null);

  const handleToggleQuickCategory = (category: SupportCategoryId) => {
    if (activeQuickCategory === category) {
      closeQuickTray(true);
      return;
    }
    lastOpenedCategoryRef.current = category;
    setActiveQuickCategory(category);
  };

  // When quick-select popover/tray first opens from null, move focus to the selected/first option inside the portal
  useEffect(() => {
    const wasClosed = prevQuickCategoryRef.current === null;
    prevQuickCategoryRef.current = activeQuickCategory;

    if (!activeQuickCategory || !wasClosed || typeof window === 'undefined') return;

    const rafId = requestAnimationFrame(() => {
      const containerEl =
        window.innerWidth >= 1024 ? desktopPanelRef.current : trayRef.current;
      if (!containerEl) return;

      const selectedOpt = containerEl.querySelector<HTMLButtonElement>(
        '[role="option"][aria-selected="true"]'
      );
      const firstOpt = containerEl.querySelector<HTMLButtonElement>('[role="option"]');
      (selectedOpt || firstOpt)?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(rafId);
  }, [activeQuickCategory]);

  // Ensure mannequin target zone on mobile/tablet is visible above the bottom quick tray
  useEffect(() => {
    if (!activeQuickCategory || window.innerWidth >= 1024) return;

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

  // Close quick selector on Escape key or outside click on desktop
  useEffect(() => {
    if (!activeQuickCategory) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeQuickTray(true);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      // Ignore clicks inside desktop panel or mobile tray
      if (desktopPanelRef.current?.contains(target) || trayRef.current?.contains(target)) {
        return;
      }
      // Ignore clicks on the 4 hotspot buttons themselves (their onClick toggles)
      const clickedHotspot = Object.values(hotspotButtonRefs.current).some((btn) =>
        btn?.contains(target)
      );
      if (clickedHotspot) return;

      closeQuickTray(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [activeQuickCategory, closeQuickTray]);

  const layerTransition = {
    duration: shouldReduceMotion ? 0 : 0.2,
    ease: 'easeInOut' as const,
  };

  const colorContext = `${core.id}|${fabricColor}`;
  const [localColor, setLocalColor] = useState<{ context: string; hex: string } | null>(null);
  const primaryFabricColor = localColor?.context === colorContext ? localColor.hex : fabricColor || core.palette[0]?.hex || '#8C3B24';
  const recolorKey = `${core.id}|${primaryFabricColor}`;
  const cachedRecolor = corePhotoConfig?.fabricMaskSrc && peekRecoloredGarmentImage(corePhotoConfig.imageSrc, corePhotoConfig.fabricMaskSrc, primaryFabricColor, corePhotoConfig.baseFabricLuminance);
  // The cache owns URL lifetime; component state must never resurrect an evicted URL.
  const recoloredPhotoSrc = cachedRecolor || null;
  const recolorError = failedRecolorKey === recolorKey;
  const photoCoreReady = isPhotoModeActive && Boolean(recoloredPhotoSrc) && !recolorError;
  const displayPalette = palette && palette.length > 0 ? palette : core.palette;
  const fabricLuminance = getRelativeLuminance(primaryFabricColor);

  // Dynamic in-browser photo fabric recoloring for the selected garment.
  useEffect(() => {
    let isCancelled = false;
    let releaseResult: (() => void) | undefined;
    const config = PHOTO_LAYER_CONFIG.core[core.id];
    if (!config?.isRecolorable || !config.fabricMaskSrc) {
      setFailedRecolorKey(null);
      return;
    }

    setFailedRecolorKey(null);
    if (renderMode !== 'photo') return;
    retryPhotoImage(config.imageSrc);
    retryPhotoImage(config.fabricMaskSrc);

    recolorGarmentImage(
      config.imageSrc,
      config.fabricMaskSrc,
      primaryFabricColor,
      config.baseFabricLuminance
    )
      .then((recoloredUrl) => {
        if (!isCancelled) {
          releaseResult = retainRecoloredImage(recoloredUrl);
          refreshRecolor(revision => revision + 1);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('[MannequinCanvas] Fabric recoloring failed:', err);
          setFailedRecolorKey(recolorKey);
        }
      });

    return () => {
      isCancelled = true;
      releaseResult?.();
    };
  }, [core.id, primaryFabricColor, renderMode]);
  useLayoutEffect(() => recoloredPhotoSrc ? retainRecoloredImage(recoloredPhotoSrc) : undefined, [recoloredPhotoSrc]);

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
      <g transform="translate(0 8)">
      <path
        d="M145 41 C145 37 147 35 150 35 C153 35 155 37 155 41 Z"
        fill="#3D342C"
        stroke="#2E2620"
        strokeWidth="1.2"
      />
      {/* Hair bun pin / comb hint */}
      <line x1="147" y1="38" x2="153" y2="37" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" />

      {/* Refined Serene Head with Natural Jaw & Chin Contour */}
      <path
        d="M131 56 C131 43 139 39 150 39 C161 39 169 43 169 56 C169 68 167 76 160 84 C156 89 153 91.5 150 91.5 C147 91.5 144 89 140 84 C133 76 131 68 131 56 Z"
        fill="#EFE5D5"
        stroke="#4A3F35"
        strokeWidth="1.5"
      />
      {/* Stylized serene facial guidelines / nose bridge hint */}
      <path d="M150 63 L149 71 L153 71" stroke="#A89A88" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <line x1="147" y1="78" x2="153" y2="78" stroke="#9A8977" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* Smooth Neck transition from jawline into clavicle / collar base */}
      <path
        d="M142 99 C142 104 140 110 139 116 L161 116 C160 110 158 104 158 99 Z"
        fill="#E8DCB8"
        stroke="#4A3F35"
        strokeWidth="1.4"
      />

      {/* Refined Shoulders & Torso Contour */}
      <path
        d="M139 116 C131 120 118 126 108 134 C104 137 101 142 102 147 L109 220 C110 236 119 248 126 256 L124 280 L176 280 L174 256 C181 248 190 236 191 220 L198 147 C199 142 196 137 192 134 C182 126 169 120 161 116 Z"
        fill="#EDE1CF"
        stroke="#4A3F35"
        strokeWidth="1.5"
      />

      {/* Left Arm & Hand — Canonical Relaxed A-Pose (Angled outward to support sleeves) */}
      <path
        d="M108 134 C99 145 79 181 66 208 C56 232 47 260 40 280 C37 284 32 291 32 295 C33 299 37 299 39 295 L45 283 C53 263 63 235 74 212 C87 185 101 160 110 147 Z"
        visibility={isPhotoModeActive && !recolorError && corePhotoConfig?.hideArms ? 'hidden' : undefined}
        fill="#EDE1CF"
        stroke="#4A3F35"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Right Arm & Hand — Canonical Relaxed A-Pose (Angled outward to support sleeves) */}
      <path
        d="M192 134 C201 145 221 181 234 208 C244 232 253 260 260 280 C263 284 268 291 268 295 C267 299 263 299 261 295 L255 283 C247 263 237 235 226 212 C213 185 199 160 190 147 Z"
        visibility={isPhotoModeActive && !recolorError && corePhotoConfig?.hideArms ? 'hidden' : undefined}
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
     Supports: bottom-silk-wide | bottom-tailored-trousers | bottom-raw-denim
  ------------------------------------------------------------- */
  const renderBottomGarment = () => {
    // Photographic Layer rendering for Bottoms
    const bottomPhotoConfig = getPhotoLayerConfig('bottom', items.bottom?.id);
    if (isPhotoModeActive && bottomPhotoConfig && bottomStatus === 'loading') return <g data-pending-layer="bottom" />;
    if (isPhotoModeActive && bottomPhotoConfig && bottomStatus === 'ready') {
      return (
        <g id="photo-layer-bottom" className="select-none pointer-events-none">
          {items.bottom.id === 'bottom-raw-denim' && (
            <defs>
              {/* Raw denim photo has a detached white cast shadow past source x=310.
                  Clip only that spill; the fabric itself reaches x≈291 at most. */}
              <clipPath id={`${necklaceClipId}-denim-cloth`} clipPathUnits="userSpaceOnUse">
                <rect x={bottomPhotoConfig.svgPlacement.x} y={bottomPhotoConfig.svgPlacement.y}
                  width={310 * bottomPhotoConfig.svgPlacement.width / bottomPhotoConfig.sourceDimensions.width}
                  height={bottomPhotoConfig.svgPlacement.height} />
              </clipPath>
            </defs>
          )}
          <image
            href={bottomPhotoConfig.imageSrc}
            x={bottomPhotoConfig.svgPlacement.x}
            y={bottomPhotoConfig.svgPlacement.y}
            width={bottomPhotoConfig.svgPlacement.width}
            height={bottomPhotoConfig.svgPlacement.height}
            preserveAspectRatio={bottomPhotoConfig.preserveAspectRatio}
            clipPath={items.bottom.id === 'bottom-raw-denim' ? `url(#${necklaceClipId}-denim-cloth)` : undefined}
          />
        </g>
      );
    }

    switch (items.bottom.id) {
      case 'bottom-tailored-trousers':
      case 'bottom-cargo-linen':
        return (
          <g id="bottom-tailored-trousers" stroke="#2B231D" strokeWidth="1.5" strokeLinejoin="round">
            {/* Tailored waistband & front pleats */}
            <path d="M122 246 L178 246 L180 262 L120 262 Z" fill="#DDD3C4" />
            <line x1="138" y1="248" x2="136" y2="278" stroke="#9E886D" strokeWidth="1.2" />
            <line x1="162" y1="248" x2="164" y2="278" stroke="#9E886D" strokeWidth="1.2" />

            {/* Left trouser leg: formal straight-leg silhouette with pressed crease */}
            <path
              d="M120 260 L114 360 L115 470 L116 515 L145 515 L147 470 L148 360 L149 270 Z"
              fill="#E5DCCE"
            />
            {/* Left trouser sharp pressed crease */}
            <line x1="130" y1="262" x2="131" y2="512" stroke="#B8A790" strokeWidth="1.3" />

            {/* Right trouser leg: formal straight-leg silhouette with pressed crease */}
            <path
              d="M151 270 L152 360 L153 470 L155 515 L184 515 L185 470 L186 360 L180 260 Z"
              fill="#E5DCCE"
            />
            {/* Right trouser pressed crease */}
            <line x1="169" y1="262" x2="170" y2="512" stroke="#B8A790" strokeWidth="1.3" />

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
    // Photographic Layer rendering for Footwear
    const shoesPhotoConfig = getPhotoLayerConfig('shoes', items.shoes?.id);
    if (isPhotoModeActive && shoesPhotoConfig && shoesStatus === 'loading') return <g data-pending-layer="shoes" />;
    if (isPhotoModeActive && shoesPhotoConfig && shoesStatus === 'ready') {
      return (
        <g id="photo-layer-shoes" className="select-none pointer-events-none">
          <image
            href={shoesPhotoConfig.imageSrc}
            x={shoesPhotoConfig.svgPlacement.x}
            y={shoesPhotoConfig.svgPlacement.y}
            width={shoesPhotoConfig.svgPlacement.width}
            height={shoesPhotoConfig.svgPlacement.height}
            preserveAspectRatio={shoesPhotoConfig.preserveAspectRatio}
          />
        </g>
      );
    }

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
    // Render only the recolor belonging to the current garment and fabric color.
    if (photoCoreReady && PHOTO_LAYER_CONFIG.core[core.id]) {
      const config = PHOTO_LAYER_CONFIG.core[core.id];
      const photoSrc = recoloredPhotoSrc!;
      if (!recolorError) {
        return (
          <g id="photo-layer-core" className="select-none pointer-events-none">
            <image
              href={photoSrc}
              data-garment-id={core.id}
              data-fabric-color={primaryFabricColor}
              onError={() => setFailedRecolorKey(recolorKey)}
              x={config.svgPlacement.x}
              y={config.svgPlacement.y}
              width={config.svgPlacement.width}
              height={config.svgPlacement.height}
              preserveAspectRatio={config.preserveAspectRatio}
            />
          </g>
        );
      }
    }

    if (isPhotoModeActive && !recolorError) return <g data-pending-layer="core"><path d="M142 109 L107 134 L84 258 L110 265 L121 422 L179 422 L190 265 L216 258 L193 134 L158 109 Z" fill="#EAE3D6" opacity=".35" /></g>;
    switch (core.id) {
      case 'ao-nhat-binh':
        return (
          <g id="core-ao-nhat-binh" stroke={garmentContourStroke} strokeWidth="1.6" strokeLinejoin="round">
            {/* Robe Main Body & Moderate Sleeves */}
            <path
              d="M136 116 L96 138 L54 220 L76 232 L98 170 L108 395 L192 395 L194 170 L224 232 L246 220 L204 138 L164 116 Z"
              fill={primaryFabricColor}
              style={fabricTransitionStyle}
            />

            {/* Traditional Sleeve Cuffs with Gold Border */}
            <path d="M54 220 L76 232 L72 242 L50 230 Z" fill="#FAF7EE" stroke="#D4AF37" strokeWidth="1.5" />
            <path d="M246 220 L224 232 L228 242 L250 230 Z" fill="#FAF7EE" stroke="#D4AF37" strokeWidth="1.5" />

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

            {/* Slender Raglan Sleeves hugging arms in natural relaxed A-pose */}
            <path
              d="M140 114 L102 136 L68 194 L50 232 L60 236 L78 200 L118 170 Z"
              fill={primaryFabricColor}
              style={fabricTransitionStyle}
            />
            <path
              d="M160 114 L198 136 L232 194 L250 232 L240 236 L222 200 L182 170 Z"
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
              d="M136 114 L98 138 L68 196 L76 206 L108 170 L114 250 L134 250 L130 180 Z"
              fill={primaryFabricColor}
              style={fabricTransitionStyle}
            />
            <path
              d="M164 114 L202 138 L232 196 L224 206 L192 170 L186 250 L166 250 L170 180 Z"
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

            {/* Main Robe & Fitted Sleeves (Tay Chẽn gọn gàng ôm cánh tay A-pose tự nhiên) */}
            <path
              d="M138 118 L102 138 L68 194 L50 232 L60 236 L78 200 L112 410 L188 410 L190 220 L222 200 L240 236 L250 232 L232 194 L198 138 L162 118 Z"
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
    // Photographic Layer rendering for Bag
    const bagPhotoConfig = getOutfitLayerConfig(core.id, 'bag', items.bag?.id);
    if (isPhotoModeActive && bagPhotoConfig && bagStatus === 'loading') return <g data-pending-layer="bag" />;
    if (isPhotoModeActive && bagPhotoConfig && bagStatus === 'ready') {
      return (
        <g id="photo-layer-bag" className="select-none pointer-events-none">
          {items.bag.id === 'bag-techwear-crossbody' && (
            <defs>
              {/* Source-pixel mask: preserve the RIGHT buckle strap and the pouch.
                  Exclude only the LEFT diagonal loop (which is NOT the worn strap).
                  This contour tracks the opening between the two strap branches. */}
              <mask id={`${necklaceClipId}-strap-mask`} maskUnits="userSpaceOnUse"
                maskContentUnits="userSpaceOnUse" x="0" y="0" width="300" height="600">
                <g transform={`translate(${bagPhotoConfig.svgPlacement.x} ${bagPhotoConfig.svgPlacement.y}) scale(${bagPhotoConfig.svgPlacement.width / bagPhotoConfig.sourceDimensions.width})`}>
                  <path d={TECHWEAR_VISIBLE_CONTOUR} fill="white" />
                </g>
              </mask>
            </defs>
          )}
          <image
            href={bagPhotoConfig.imageSrc}
            x={bagPhotoConfig.svgPlacement.x}
            y={bagPhotoConfig.svgPlacement.y}
            width={bagPhotoConfig.svgPlacement.width}
            height={bagPhotoConfig.svgPlacement.height}
            preserveAspectRatio={bagPhotoConfig.preserveAspectRatio}
            mask={items.bag.id === 'bag-techwear-crossbody' ? `url(#${necklaceClipId}-strap-mask)` : undefined}
          />

        </g>
      );
    }

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
            {/* Hanging silk cords attaching handbag gracefully from left hand */}
            <path
              d="M48 248 C49 268 76 290 88 312"
              fill="none"
              stroke="#A34836"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M51 247 C54 268 84 290 96 312"
              fill="none"
              stroke="#A34836"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Wooden Arched Handle */}
            <path
              d="M84 314 C84 300 100 300 100 314"
              fill="none"
              stroke="#523428"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Brocade Trapezoid Pouch */}
            <path
              d="M80 314 L104 314 L108 356 L76 356 Z"
              fill="#8C6C38"
            />
            {/* Gold woven pattern lines & brass clasp */}
            <path d="M80 314 L104 314 L102 321 L82 321 Z" fill="#523428" />
            <circle cx="92" cy="318" r="2" fill="#D4AF37" stroke="#3A281E" strokeWidth="0.8" />
            {/* Lotus brocade geometric hints */}
            <path d="M92 329 L97 337 L92 345 L87 337 Z" fill="#D4AF37" opacity="0.85" />
            {/* Hanging silk tassel */}
            <line x1="92" y1="356" x2="92" y2="372" stroke="#A34836" strokeWidth="2" strokeLinecap="round" />
            <circle cx="92" cy="357" r="1.5" fill="#D4AF37" />
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

    // Photographic Layer rendering for Accent
    const accentPhotoConfig = getOutfitLayerConfig(core.id, 'accent', items.accent.id, items.bag.id);
    if (isPhotoModeActive && accentPhotoConfig && accentStatus === 'loading') return <g data-pending-layer="accent" />;
    if (isPhotoModeActive && accentPhotoConfig && accentStatus === 'ready') {
      return (
        <g id="photo-layer-accent" className="select-none pointer-events-none">
          {accentPhotoConfig.frontClipTop !== undefined && (
            <defs>
              {/* Local to the movable group: no fixed collar cut when the user drags away. */}
              <clipPath id={`${necklaceClipId}-front`} clipPathUnits="userSpaceOnUse">
                <rect x="0" y={accentPhotoConfig.frontClipTop} width="300" height={600-accentPhotoConfig.frontClipTop} />
              </clipPath>
            </defs>
          )}
          {items.accent.id === 'accent-quai-thao-mini' && (() => {
            const p=accentPhotoConfig.svgPlacement, b=accentPhotoConfig.visibleBounds;
            const x=p.x+b.centerX*p.width/accentPhotoConfig.sourceDimensions.width;
            const y=p.y+b.minY*p.height/accentPhotoConfig.sourceDimensions.height;
            return <path d={`M${x > 150 ? 175 : 125} 248 Q${x} ${(248+y)/2} ${x} ${y}`} fill="none" stroke="#7A3E32" strokeWidth="1" />;
          })()}
          <image
            href={accentPhotoConfig.imageSrc}
            clipPath={accentPhotoConfig.frontClipTop !== undefined ? `url(#${necklaceClipId}-front)` : undefined}
            x={accentPhotoConfig.svgPlacement.x}
            y={accentPhotoConfig.svgPlacement.y}
            width={accentPhotoConfig.svgPlacement.width}
            height={accentPhotoConfig.svgPlacement.height}
            preserveAspectRatio={accentPhotoConfig.preserveAspectRatio}
          />
        </g>
      );
    }

    switch (items.accent.id) {
      case 'accent-non-la':
        return (
          <g id="accent-non-la" transform="translate(0 8)" stroke="#5C4934" strokeWidth="1.3" strokeLinejoin="round">
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
          <g id="accent-y2k-shades" transform="translate(0 8)" stroke="#181615" strokeWidth="1.2" strokeLinejoin="round">
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
          <g id="accent-silver-jewelry" transform={`translate(0 ${(accentPhotoConfig?.frontClipTop ?? 119)-112})`} stroke="#7C756B" strokeWidth="1.2" strokeLinejoin="round">
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
      if (items.bottom.id === 'bottom-tailored-trousers' || items.bottom.id === 'bottom-cargo-linen') return 'Quần Tây';
      return 'Raw Denim';
    }
    if (items.shoes.id === 'shoes-guoc-moc') return 'Guốc Mộc';
    if (items.shoes.id === 'shoes-chunky-loafer') return 'Loafer';
    return 'Sneaker';
  };

  const quickHotspots: {
    category: SupportCategoryId;
    label: string;
    desktopLabel: string;
    fullTitle: string;
    positionClass: string;
    side: 'left' | 'right';
    icon: React.ReactNode;
    activeItem: SupportOption | null;
  }[] = [
    {
      category: 'accent',
      label: 'Phụ kiện',
      desktopLabel: 'Phụ kiện',
      fullTitle: 'Phụ kiện (Tùy chọn)',
      positionClass: 'top-3 left-1.5 sm:top-4 sm:left-3 lg:top-5 lg:left-3',
      side: 'left',
      icon: <Sparkles className="w-3.5 h-3.5 shrink-0" />,
      activeItem: items.accent,
    },
    {
      category: 'bag',
      label: 'Túi',
      desktopLabel: 'Túi xách',
      fullTitle: 'Túi xách',
      positionClass: 'top-[46%] -translate-y-1/2 right-1.5 sm:right-3 lg:right-3',
      side: 'right',
      icon: <ShoppingBag className="w-3.5 h-3.5 shrink-0" />,
      activeItem: items.bag,
    },
    {
      category: 'bottom',
      label: 'Quần',
      desktopLabel: 'Phần dưới',
      fullTitle: 'Phần dưới',
      positionClass: 'bottom-[21%] left-1.5 sm:left-3 lg:left-3',
      side: 'left',
      icon: <Scissors className="w-3.5 h-3.5 shrink-0" />,
      activeItem: items.bottom,
    },
    {
      category: 'shoes',
      label: 'Giày',
      desktopLabel: 'Giày guốc',
      fullTitle: 'Giày guốc',
      positionClass: 'bottom-3 right-1.5 sm:bottom-4 sm:right-3 lg:bottom-5 lg:right-3',
      side: 'right',
      icon: <Footprints className="w-3.5 h-3.5 shrink-0" />,
      activeItem: items.shoes,
    },
  ];

  const activeCategoryConfig = quickHotspots.find((h) => h.category === activeQuickCategory);
  const activeCategoryOptions = activeQuickCategory ? SUPPORT_ITEMS[activeQuickCategory] : [];

  const renderQuickSelectorHeader = (isDesktopLayout = false) => {
    if (!activeQuickCategory || !activeCategoryConfig) return null;
    return (
      <div className="flex items-center justify-between gap-1.5 border-b border-[#EFE8DC] pb-2 shrink-0">
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
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
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

        <div className="flex items-center gap-1.5 shrink-0">
          {typeof remixDialValue === 'number' && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-mono tabular-nums font-semibold text-[#B3261E] bg-[#FAF3EB] border border-[#E8D5C4] px-1.5 py-0.5 rounded-md whitespace-nowrap"
              title="Mức độ Remix hiện tại"
            >
              <Sliders className="w-2.5 h-2.5" />
              <span>{remixDialValue}%</span>
            </span>
          )}

          {activeQuickCategory === 'accent' && items.accent && onRemoveAccent && !isDesktopLayout && (
            <button
              type="button"
              onClick={onRemoveAccent}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#B3261E] bg-[#FDF2F0] hover:bg-[#FBE4E0] border border-[#F5C2BA] rounded-md cursor-pointer transition-colors whitespace-nowrap"
              title="Gỡ bỏ phụ kiện đang chọn"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden min-[380px]:inline">Gỡ</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => closeQuickTray(true)}
            className="p-1 text-[#5A4F46] hover:text-[#241E1A] bg-[#FAF7EE] hover:bg-[#EFE8DC] rounded-lg cursor-pointer transition-colors"
            aria-label="Đóng bảng chọn đồ"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  const renderQuickSelectorOptions = (isDesktopLayout: boolean) => {
    if (!activeQuickCategory || !activeCategoryConfig || !onSelectSupportItem) return null;
    return (
      <div
        role="listbox"
        aria-label={`Danh sách ${activeCategoryConfig.fullTitle}`}
        style={
          isDesktopLayout && desktopPopoverPos
            ? { maxHeight: `${desktopPopoverPos.maxListHeight}px` }
            : undefined
        }
        className={
          isDesktopLayout
            ? 'flex flex-col gap-1.5 pt-0.5 overflow-y-auto pr-0.5'
            : 'flex items-stretch gap-2 overflow-x-auto pb-1 pt-0.5 snap-x snap-mandatory'
        }
      >
        {/* Optional 'None' card for Accent category */}
        {activeQuickCategory === 'accent' && onRemoveAccent && (
          <button
            type="button"
            role="option"
            aria-selected={items.accent === null}
            onClick={onRemoveAccent}
            className={`${
              isDesktopLayout
                ? 'w-full p-2 rounded-lg flex items-center justify-between gap-2'
                : 'snap-start shrink-0 w-[132px] sm:w-[148px] p-2.5 rounded-xl flex flex-col justify-between gap-1.5'
            } border text-left transition-all cursor-pointer ${
              items.accent === null
                ? 'bg-[#FAF3EB] border-[#B3261E] ring-1 ring-[#B3261E]/30 text-[#241E1A]'
                : 'bg-[#FAF7EE] hover:bg-[#F3ECE1] border-[#E5DEC9] text-[#5A4F46]'
            }`}
          >
            {isDesktopLayout ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-3.5 h-3.5 rounded-full border border-dashed border-[#8C7E72] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#241E1A] truncate">
                      Không dùng phụ kiện
                    </div>
                    <div className="text-[10px] text-[#7A6E63] font-serif truncate">
                      Giữ nguyên bản tối giản
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono text-[#7A6E63]">Tùy chọn</span>
                  {items.accent === null && <Check className="w-3.5 h-3.5 text-[#B3261E]" />}
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </button>
        )}

        {activeCategoryOptions.map((opt) => {
          const currentSelectedId =
            activeQuickCategory === 'accent'
              ? items.accent?.id || ''
              : items[activeQuickCategory].id;
          const isOptionSelected = opt.id === currentSelectedId;
          const demoImg = getSupportItemDemoImage(opt.id);
          const showThumb = Boolean(demoImg && !failedThumbIds[opt.id]);

          return (
            <button
              key={opt.id}
              type="button"
              role="option"
              aria-selected={isOptionSelected}
              onClick={() => onSelectSupportItem(activeQuickCategory, opt)}
              className={`${
                isDesktopLayout
                  ? 'w-full p-2 rounded-lg flex items-center justify-between gap-2'
                  : 'snap-start shrink-0 w-[158px] sm:w-[176px] p-2.5 rounded-xl flex flex-col justify-between gap-1.5'
              } border text-left transition-all cursor-pointer ${
                isOptionSelected
                  ? 'bg-[#FAF3EB] border-[#B3261E] ring-1 ring-[#B3261E]/30 text-[#241E1A] shadow-2xs'
                  : 'bg-[#FAF7EE] hover:bg-[#F3ECE1] border-[#E5DEC9] text-[#4E433C]'
              }`}
            >
              {isDesktopLayout ? (
                <>
                  <div className="flex items-center gap-2 min-w-0">
                    {showThumb ? (
                      <img
                        src={demoImg}
                        alt={opt.name}
                        onError={() =>
                          setFailedThumbIds((prev) => ({ ...prev, [opt.id]: true }))
                        }
                        className="w-7 h-7 rounded-md border border-[#E2D8C8] object-cover shrink-0 bg-[#FFFDF9]"
                      />
                    ) : (
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: opt.accentHex }}
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#241E1A] truncate">
                        {opt.name}
                      </div>
                      <div className="text-[10px] text-[#7A6E63] font-serif truncate">
                        {opt.material.split('&')[0]} · {opt.badgeLabel}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono tabular-nums font-semibold text-[#B3261E]">
                      {opt.modernityScore}%
                    </span>
                    {isOptionSelected && <Check className="w-3.5 h-3.5 text-[#B3261E]" />}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {showThumb ? (
                        <img
                          src={demoImg}
                          alt={opt.name}
                          onError={() =>
                            setFailedThumbIds((prev) => ({ ...prev, [opt.id]: true }))
                          }
                          className="w-6 h-6 rounded border border-[#E2D8C8] object-cover shrink-0 bg-[#FFFDF9]"
                        />
                      ) : (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: opt.accentHex }}
                        />
                      )}
                      <span className="text-[10px] font-mono text-[#8C7E72] truncate">
                        {opt.badgeLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-mono tabular-nums font-semibold text-[#B3261E]">
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
                </>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative bg-[#FFFDF9] border border-[#E3D9CC] rounded-sm p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Title and active garment palette */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE3D6] pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <Pin className="w-3.5 h-3.5 rotate-45 text-[#B3261E]" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2B231D]">
            Bản phối 2D trực tiếp
          </h2>
          <span className="text-[#C8BCAC]">·</span>
          <span className="text-xs font-medium text-[#7A6E63]">{core.name}</span>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Core garment / active concept palette indicators */}
          <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Bảng màu trang phục">
            {displayPalette.map((c, i) => {
              const isSelected = primaryFabricColor.toLowerCase() === c.hex.toLowerCase();
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelectFabricColor ? onSelectFabricColor(c.hex) : setLocalColor({ context: colorContext, hex: c.hex })}
                  className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer relative flex items-center justify-center ${
                    isSelected
                      ? 'ring-2 ring-[#B3261E] ring-offset-1 border-white shadow-xs scale-110'
                      : 'border-black/20 hover:scale-110 opacity-90 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={`${c.name} (${c.hex}) - Bấm để đổi màu vải`}
                  aria-label={`Chọn màu ${c.name}`}
                >
                  {isSelected && (
                    <span className="w-1 h-1 rounded-full bg-white shadow-2xs" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reserve one line throughout loading, success and failure, including on mobile. */}
      <div data-photo-status className="h-8 flex items-center text-[11px] leading-tight text-[#7A6E63] bg-[#FAF3EB] border border-[#ECDCCB] px-2.5 rounded-sm mb-2 font-serif" role="status" aria-live="polite">
        <span>{renderMode !== 'photo' ? 'Bản vẽ trang phục' : recolorError
          ? 'Chưa thể tải ảnh màu thực tế, đang hiển thị bản vẽ tương ứng.'
          : !isSupportedCombination ? 'Ảnh trang phục chưa có dữ liệu phù hợp.'
          : !photoCoreReady ? 'Đang xử lý nhuộm màu ảnh thực tế…'
          : [bottomStatus,shoesStatus,bagStatus,accentStatus].includes('error') ? 'Một món chưa tải được ảnh; các lớp còn lại giữ nguyên.'
          : [bottomStatus,shoesStatus,bagStatus,accentStatus].includes('loading') ? 'Đang tải ảnh món vừa chọn…'
          : `Màu vải ảnh thực tế: ${displayPalette.find(p => p.hex.toLowerCase() === primaryFabricColor.toLowerCase())?.name || primaryFabricColor}`}</span>
      </div>

      {/* Main 2D Mannequin Canvas - Responsive horizontal breathing room on all devices so hotspots never overlap mannequin */}
      <div
        ref={stageRef}
        className="relative w-full flex-1 flex items-center justify-center py-1.5 sm:py-2.5 px-16 min-[375px]:px-18 sm:px-24 lg:px-36 xl:px-42 bg-[#FAF7EE]/60 rounded-xs border border-[#EAE3D6]/70 min-h-0"
      >
        {/* Editorial Callout Leader Lines Overlay (Active across Mobile, Tablet, Laptop & Desktop) */}
        {onSelectSupportItem && stageDimensions.width > 0 && leaderLines.length > 0 && (
          <svg
            className="pointer-events-none absolute inset-0 w-full h-full z-[6]"
            viewBox={`0 0 ${stageDimensions.width} ${stageDimensions.height}`}
            fill="none"
            aria-hidden="true"
          >
            {leaderLines.map((line) => {
              const isSelected = activeQuickCategory === line.category;
              const strokeColor = isSelected ? '#B3261E' : '#A68B73';
              const strokeOpacity = isSelected
                ? 0.92
                : line.isOptionalEmpty
                  ? 0.42
                  : 0.65;

              // Smooth editorial cubic Bezier curve from open space near garment (startX, startY) to button edge (endX, endY)
              let dPath = '';
              if (line.side === 'left') {
                const spanX = Math.max(14, line.startX - line.endX);
                const c1x = line.startX - spanX * 0.42;
                const c2x = line.endX + Math.min(24, spanX * 0.48);
                dPath = `M ${line.startX} ${line.startY} C ${c1x} ${line.startY}, ${c2x} ${line.endY}, ${line.endX} ${line.endY}`;
              } else {
                const spanX = Math.max(14, line.endX - line.startX);
                const c1x = line.startX + spanX * 0.42;
                const c2x = line.endX - Math.min(24, spanX * 0.48);
                dPath = `M ${line.startX} ${line.startY} C ${c1x} ${line.startY}, ${c2x} ${line.endY}, ${line.endX} ${line.endY}`;
              }

              // Arrowhead pointing horizontally into the hotspot button edge
              const arrowDir = line.side === 'left' ? 1 : -1;
              const arrowPath = `M ${line.endX + arrowDir * 5} ${line.endY - 3} L ${line.endX} ${line.endY} L ${line.endX + arrowDir * 5} ${line.endY + 3}`;

              return (
                <g key={`leader-${line.category}`} data-leader-category={line.category} opacity={strokeOpacity}>
                  {/* Delicate editorial origin dot in the open air near the garment */}
                  <circle
                    cx={line.startX}
                    cy={line.startY}
                    r={isSelected ? 2.4 : 1.75}
                    fill={isSelected ? '#B3261E' : '#FFFDF9'}
                    stroke={strokeColor}
                    strokeWidth="1.1"
                  />

                  {/* Editorial Callout Curve */}
                  <path
                    d={dPath}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 1.3 : 1}
                    strokeDasharray={line.isOptionalEmpty ? '3 2.5' : undefined}
                    strokeLinecap="round"
                  />

                  {/* Delicate Arrowhead pointing to the control button */}
                  <path
                    d={arrowPath}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 1.35 : 1.1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* 4 Direct-Select Hotspot Buttons around outer margins (Responsive across Mobile, Tablet, Laptop & Desktop) */}
        {onSelectSupportItem && (
          <div className="pointer-events-none absolute inset-0 z-10">
            {quickHotspots.map((spot) => {
              const isSelected = activeQuickCategory === spot.category;
              const shortName = getShortItemName(spot.category);
              const fullItemName = spot.activeItem ? spot.activeItem.name : 'Chưa chọn phụ kiện';

              return (
                <button
                  key={spot.category}
                  ref={(el) => {
                    hotspotButtonRefs.current[spot.category] = el;
                  }}
                  type="button"
                  onClick={() => handleToggleQuickCategory(spot.category)}
                  aria-label={`Chọn nhanh ${spot.desktopLabel}: hiện tại ${fullItemName}`}
                  aria-expanded={isSelected}
                  className={`pointer-events-auto absolute ${spot.positionClass} min-h-[38px] sm:min-h-[42px] lg:min-h-[52px] lg:w-[130px] xl:w-[152px] px-2 sm:px-2.5 lg:px-3 py-1 sm:py-1.5 lg:py-2 rounded-lg lg:rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-center lg:items-start justify-between gap-1.5 shadow-2xs backdrop-blur-[2px] ${
                    isSelected
                      ? 'bg-[#B3261E] border-[#B3261E] text-[#FFFDF9] ring-2 ring-[#B3261E]/25'
                      : 'bg-[#FFFDF9]/95 hover:bg-[#FAF3EB] border-[#DDD0C0] hover:border-[#B3261E]/60 text-[#2B231D]'
                  }`}
                >
                  {/* Mobile & Tablet Compact Layout (< lg) */}
                  <div className="flex lg:hidden items-center gap-1.5 min-w-0">
                    <span className={isSelected ? 'text-[#FFFDF9]' : 'text-[#B3261E]'}>
                      {spot.icon}
                    </span>
                    <span className="leading-tight min-w-0">
                      <span className="block text-[11px] font-semibold tracking-tight whitespace-nowrap">
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
                  </div>

                  {/* Laptop & Desktop Informative Editorial Layout (lg+) */}
                  <div className="hidden lg:flex flex-col w-full gap-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <span className="inline-flex items-center gap-1 min-w-0">
                        <span className={isSelected ? 'text-[#FFFDF9]' : 'text-[#B3261E]'}>
                          {spot.icon}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase tracking-wider font-semibold truncate ${
                            isSelected ? 'text-[#FAF7EE]/90' : 'text-[#7A6E63]'
                          }`}
                        >
                          {spot.desktopLabel}
                        </span>
                      </span>

                      <span className="inline-flex items-center gap-1 shrink-0">
                        {spot.activeItem ? (
                          <span
                            className={`w-2.5 h-2.5 rounded-full border ${
                              isSelected ? 'border-white/70' : 'border-black/20'
                            }`}
                            style={{ backgroundColor: spot.activeItem.accentHex }}
                          />
                        ) : (
                          <span
                            className={`w-2.5 h-2.5 rounded-full border border-dashed ${
                              isSelected ? 'border-white/80' : 'border-[#8C7E72]'
                            }`}
                          />
                        )}
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-150 ${
                            isSelected ? 'rotate-180 text-white' : 'text-[#8C7E72]'
                          }`}
                        />
                      </span>
                    </div>

                    <div
                      className={`text-xs font-semibold truncate leading-snug ${
                        isSelected
                          ? 'text-white'
                          : spot.activeItem
                            ? 'text-[#241E1A]'
                            : 'text-[#8C7E72] italic font-normal'
                      }`}
                      title={fullItemName}
                    >
                      {spot.activeItem ? spot.activeItem.name : 'Chưa chọn'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <svg
          ref={svgRef}
          role="group"
          viewBox="0 0 300 600"
          className="w-full max-w-[340px] h-auto max-h-[min(410px,55dvh)] sm:max-h-[min(480px,60dvh)] lg:max-h-[min(470px,calc(100vh-270px))] xl:max-h-[min(520px,calc(100vh-260px))] mx-auto select-none drop-shadow-xs"
          preserveAspectRatio="xMidYMid meet"
          aria-label={`Mannequin 2D phối đồ Việt phục ${core.name}`}
        >
          {/* 1. Neutral Mannequin Body (Fixed, no re-mount animation) */}
          {renderMannequinBody()}

          {/* 2. Footwear sits behind trouser hems, including wide denim cuffs. */}
          <motion.g
            key={`shoes-${items.shoes.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={layerTransition}
          >
            {renderShoes()}
          </motion.g>

          {/* 3. Bottom garment naturally covers the upper part of the shoes. */}
          <motion.g
            key={`bottom-${items.bottom.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={layerTransition}
          >
            {renderBottomGarment()}
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

          {/* Only the necklace's front strands and lotus remain above the garment.
              The rear loop is concealed; its clip and hit contour move with the artwork.
              All other layers retain their order; the selected layer is painted last. */}
          {(['bag', 'accent'] as MovableCategory[]).sort((a, b) => Number(a === selectedAccessory) - Number(b === selectedAccessory)).map(category => {
            const item = items[category];
            if (!item) return null;
            const status = category === 'bag' ? bagStatus : accentStatus;
            const config = getOutfitLayerConfig(core.id, category, item.id, items.bag.id);
            return <MovableAccessory key={category} category={category} itemId={item.id} name={item.name} coreId={core.id}
              photoConfig={config} photoReady={isPhotoModeActive && status === 'ready'} pending={isPhotoModeActive && status === 'loading'}
              position={accessoryPositions[category]} selected={selectedAccessory === category}
              nodeRef={category === 'bag' ? bagNodeRef : accentNodeRef} clipTop={config?.frontClipTop}
              onSelect={setSelectedAccessory} onMove={onMoveAccessory} onOffset={updateAccessoryOffset}>
              <motion.g key={`${category}-${item.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={layerTransition}>
                {category === 'bag' ? renderBag() : renderAccent()}
              </motion.g>
            </MovableAccessory>;
          })}
          {/* This hand detail belongs to the mannequin, not the draggable bag. */}
          {isPhotoModeActive && bagStatus === 'ready' && items.bag.id === 'bag-gam-vintage' && (() => {
            const carry = corePhotoConfig?.bagCarryAnchor ?? [36, 294];
            return <path data-fixed-hand-detail transform={`translate(${carry[0]-36} ${carry[1]-294})`}
              d="M32 291 Q36 289 40 291 L39 296 Q36 298 33 295" fill="#EDE1CF" stroke="#4A3F35" strokeWidth=".8" pointerEvents="none" />;
          })()}

        </svg>
      </div>

      {/* Explicit selection also reaches either accessory when their images overlap. */}
      <div className="mt-3 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {(['bag', 'accent'] as MovableCategory[]).map(category => (
            <button key={category} type="button" disabled={!items[category] || (isPhotoModeActive && (category === 'bag' ? bagStatus : accentStatus) === 'loading')}
              data-accessory-select={category}
              aria-label={`Chọn để di chuyển ${category === 'bag' ? 'túi' : 'phụ kiện'}`} aria-pressed={selectedAccessory === category}
              onClick={() => { setSelectedAccessory(category); (category === 'bag' ? bagNodeRef : accentNodeRef).current?.focus({ preventScroll: true }); }}
              className="accessory-position-action inline-flex items-center gap-1.5">
              {category === 'bag' ? <ShoppingBag aria-hidden="true" className="w-3.5 h-3.5" /> : <Sparkles aria-hidden="true" className="w-3.5 h-3.5" />}
              {category === 'bag' ? 'Di chuyển túi' : 'Di chuyển phụ kiện'}
            </button>
          ))}
          <button type="button" onClick={onResetAccessoryPositions} className="accessory-position-action inline-flex items-center gap-1.5">
            <RotateCcw aria-hidden="true" className="w-3.5 h-3.5" /> Đặt lại vị trí phụ kiện
          </button>
        </div>
        <p id="accessory-move-help" className="text-[11px] leading-relaxed text-[#7A6E63]">
          Kéo túi/phụ kiện để di chuyển, hoặc chọn món và dùng phím mũi tên. Giữ Shift để dịch nhanh hơn.
        </p>
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

      {/* Portal Quick-Select Overlays:
          - Desktop/Laptop (lg+): Compact floating popover anchored directly near the clicked hotspot button
          - Mobile/Tablet (< lg): Compact bottom sheet tray */}
      {typeof document !== 'undefined' &&
        onSelectSupportItem &&
        createPortal(
          <>
            {/* Desktop/Laptop Anchored Popover (lg+) */}
            <AnimatePresence>
              {activeQuickCategory && activeCategoryConfig && desktopPopoverPos && (
                <motion.div
                  ref={desktopPanelRef}
                  role="dialog"
                  aria-modal="false"
                  aria-label={`Bảng chọn nhanh ${activeCategoryConfig.fullTitle}`}
                  initial={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: desktopPopoverPos.placement === 'above' ? 6 : -6,
                          scale: 0.98,
                        }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: desktopPopoverPos.placement === 'above' ? 6 : -6,
                          scale: 0.98,
                        }
                  }
                  transition={{ duration: shouldReduceMotion ? 0 : 0.14, ease: 'easeOut' }}
                  style={{
                    left: `${desktopPopoverPos.left}px`,
                    width: `${desktopPopoverPos.width}px`,
                    ...(desktopPopoverPos.top !== undefined
                      ? { top: `${desktopPopoverPos.top}px` }
                      : {}),
                    ...(desktopPopoverPos.bottom !== undefined
                      ? { bottom: `${desktopPopoverPos.bottom}px` }
                      : {}),
                  }}
                  className="hidden lg:flex flex-col gap-2 fixed z-50 bg-[#FFFDF9] border border-[#B3261E]/75 rounded-xl p-3 shadow-[0_12px_32px_rgba(43,35,29,0.18)]"
                >
                  {renderQuickSelectorHeader(true)}
                  {renderQuickSelectorOptions(true)}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile/Tablet Compact Bottom Quick-Select Tray (< lg) */}
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

                  {/* Compact Bottom Sheet Tray */}
                  <motion.div
                    ref={trayRef}
                    data-quick-tray
                    role="dialog"
                    aria-modal="false"
                    aria-label={`Khay chọn nhanh ${activeCategoryConfig.fullTitle}`}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeOut' }}
                    className="relative z-10 pointer-events-auto w-full bg-[#FFFDF9] border-t-2 border-[#B3261E]/80 shadow-[0_-8px_24px_rgba(43,35,29,0.14)] rounded-t-2xl px-3.5 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] max-h-[min(35dvh,220px)] flex flex-col gap-2"
                  >
                    {renderQuickSelectorHeader(false)}
                    {renderQuickSelectorOptions(false)}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>,
          document.body
        )}
    </div>
  );
};
