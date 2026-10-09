/**
 * Layout-coordinate alignment ignores temporary translateY motion transforms.
 */
function documentLayoutTop(el: HTMLElement): number {
  let top = 0;
  let current: HTMLElement | null = el;
  while (current) { top += current.offsetTop; current = current.offsetParent as HTMLElement | null; }
  return top;
}

export function alignElementBelowStickyHeader(el: HTMLElement | null, gap = 10): void {
  if (!el || typeof window === 'undefined') return;
  const header = document.querySelector('header');
  const h = header ? header.offsetHeight : 64;
  window.scrollTo({ top: Math.max(0, Math.round(documentLayoutTop(el) - h - gap)), behavior: 'auto' });
}
export function alignPageToTop(): void {
  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
}
