import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X } from 'lucide-react';
import { AIStylistPanel, AIStylistPanelProps } from './AIStylistPanel';

interface FloatingAIStylistProps extends Omit<AIStylistPanelProps, 'embedded'> {
  obscured?: boolean;
}

const hintSessionKey = 'sac-viet:ai-launcher-hint-seen';
// Fallback for tabs where browser storage is unavailable; survives route remounts.
let hintClaimedInTab = false;

function claimFirstRemixHint(): boolean {
  if (hintClaimedInTab) return false;
  hintClaimedInTab = true;
  try {
    if (sessionStorage.getItem(hintSessionKey) === '1') return false;
    sessionStorage.setItem(hintSessionKey, '1');
  } catch {
    // The in-memory flag still prevents repeated prompts in this tab.
  }
  return true;
}

export const FloatingAIStylist: React.FC<FloatingAIStylistProps> = ({ obscured = false, ...stylistProps }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(() => document.visibilityState === 'visible');
  const [hintVisible, setHintVisible] = useState(false);
  const hintPendingRef = useRef(false);
  const panelId = useId();
  const titleId = useId();
  const tooltipId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hintPendingRef.current = claimFirstRemixHint();
    const updateVisibility = () => setIsTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    if (isOpen) hintPendingRef.current = false;
    if (isOpen || obscured || !isTabVisible) {
      setHintVisible(false);
      return;
    }
    if (!hintPendingRef.current) return;
    let hideTimer: number | undefined;
    const showTimer = window.setTimeout(() => {
      hintPendingRef.current = false;
      setHintVisible(true);
      hideTimer = window.setTimeout(() => setHintVisible(false), 5000);
    }, 1500);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isOpen, obscured, isTabVisible]);

  const close = () => {
    setIsOpen(false);
    launcherRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (isOpen) closeRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || obscured) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      // Another non-modal selector may be using Escape independently.
      const owner = event.target instanceof Element ? event.target.closest('[role="dialog"]') : null;
      if (owner && owner.id !== panelId) return;
      event.preventDefault();
      event.stopPropagation();
      close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, obscured, panelId]);

  useLayoutEffect(() => {
    const viewport = window.visualViewport;
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = viewport?.height ?? window.innerHeight;
      const width = viewport?.width ?? window.innerWidth;
      const bottom = Math.max(0, window.innerHeight - height - (viewport?.offsetTop ?? 0));
      const right = Math.max(0, window.innerWidth - width - (viewport?.offsetLeft ?? 0));
      const style = rootRef.current?.style;
      style?.setProperty('--ai-viewport-height', `${height}px`);
      style?.setProperty('--ai-viewport-width', `${width}px`);
      style?.setProperty('--ai-viewport-bottom', `${bottom}px`);
      style?.setProperty('--ai-viewport-right', `${right}px`);
      // Only scroll the input into view when the keyboard actually obscures it.
      const active = document.activeElement;
      const bounds = scrollRef.current?.getBoundingClientRect();
      if (active instanceof HTMLElement && bounds && scrollRef.current?.contains(active)) {
        const input = active.getBoundingClientRect();
        if (input.bottom > bounds.bottom || input.top < bounds.top) {
          active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    viewport?.addEventListener('resize', schedule);
    viewport?.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener('resize', schedule);
      viewport?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  // A portal keeps fixed positioning independent of the Studio's motion transform.
  return createPortal(
    <div ref={rootRef} className="floating-ai-root" data-open={isOpen} data-motion-paused={isOpen || obscured || !isTabVisible} hidden={obscured} inert={obscured}>
      <section
        id={panelId}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        className="floating-ai-panel"
        hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="floating-ai-header">
          <Sparkles aria-hidden="true" className="h-5 w-5 shrink-0 text-[#8F2925]" />
          <h2 id={titleId} className="min-w-0 flex-1 text-sm font-bold text-[#352A23]">Trợ Lý Phối Đồ AI</h2>
          <button ref={closeRef} type="button" onClick={close} aria-label="Đóng trợ lý AI" className="floating-ai-close">
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div ref={scrollRef} className="floating-ai-scroll">
          {/* Always mounted: closing preserves draft, result, loading and applied suggestions. */}
          <AIStylistPanel {...stylistProps} embedded />
        </div>
      </section>
      <button
        ref={launcherRef}
        type="button"
        className="floating-ai-launcher"
        aria-label="Trợ Lý Phối Đồ AI"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-describedby={!isOpen ? tooltipId : undefined}
        onClick={() => isOpen ? close() : setIsOpen(true)}
      >
        <Sparkles aria-hidden="true" className="floating-ai-launcher-icon h-5 w-5" />
        <span>AI</span>
      </button>
      <span id={tooltipId} role="tooltip" className="floating-ai-tooltip">Trợ Lý Phối Đồ AI</span>
      {hintVisible && !isOpen && !obscured && isTabVisible && (
        <span role="status" className="floating-ai-hint">Bạn muốn phối đồ đẹp hơn?</span>
      )}
    </div>,
    document.body,
  );
};
