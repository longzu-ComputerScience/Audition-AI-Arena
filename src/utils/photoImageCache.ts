import { useCallback, useEffect, useSyncExternalStore } from 'react';

type Status = 'loading' | 'ready' | 'error';
type Entry = { status: Status; promise?: Promise<HTMLImageElement>; listeners: Set<() => void> };
const entries = new Map<string, Entry>();
const MAX_IMAGES = 24;
export function photoCacheSnapshot() { return { images:entries.size, loading:[...entries.values()].filter(e=>e.status==='loading').length }; }
function entry(src: string): Entry {
  let value = entries.get(src);
  if (!value) { value = { status: 'loading', listeners: new Set() }; entries.set(src, value); }
  else { entries.delete(src); entries.set(src, value); }
  return value;
}
function prune() {
  for (const [src, value] of entries) {
    if (entries.size <= MAX_IMAGES) break;
    if (!value.listeners.size && value.status !== 'loading') entries.delete(src);
  }
}
export function forgetPhotoImage(src: string) { if (!entries.get(src)?.listeners.size) entries.delete(src); }
export function loadPhotoImage(src: string): Promise<HTMLImageElement> {
  const value = entry(src);
  if (value.promise) return value.promise;
  value.status = 'loading';
  value.promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (/^https?:/.test(src)) img.crossOrigin = 'anonymous';
    img.onload = () => img.decode().then(() => resolve(img), reject);
    img.onerror = () => reject(new Error(`Photo load failed: ${src}`));
    img.src = src;
  }).then(img => {
    value.status = 'ready'; value.listeners.forEach(fn => fn()); prune(); return img;
  }, error => {
    value.status = 'error'; value.listeners.forEach(fn => fn()); prune(); throw error;
  });
  return value.promise;
}
export function usePhotoImage(src?: string): Status {
  const subscribe = useCallback((notify: () => void) => {
    if (!src) return () => {};
    const value = entry(src); value.listeners.add(notify);
    return () => { value.listeners.delete(notify); prune(); };
  }, [src]);
  const snapshot = useCallback(() => src ? entry(src).status : 'ready', [src]);
  const status = useSyncExternalStore(subscribe, snapshot, snapshot);
  useEffect(() => { if (src) { retryPhotoImage(src); void loadPhotoImage(src).catch(() => {}); } }, [src]);
  return status;
}
/** An explicit selection retry can recover a previously failed network/decode. */
export function retryPhotoImage(src: string) {
  const value = entries.get(src);
  if (value?.status === 'error') { value.promise = undefined; value.status = 'loading'; value.listeners.forEach(fn => fn()); }
}
