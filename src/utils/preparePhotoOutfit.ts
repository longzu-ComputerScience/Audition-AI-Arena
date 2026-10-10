import { ActiveSupportItems, CoreVietPhucId } from '../types';
import { getPhotoLayerConfig } from '../data/photoLayerFitting';
import { loadPhotoImage } from './photoImageCache';
import { recolorGarmentImage } from './fabricRecolor';

/** Prepare just the current selection while the user reads Concept. Shared loads deduplicate. */
export function preparePhotoOutfit(core: CoreVietPhucId, items: ActiveSupportItems, hex: string) {
  const config = getPhotoLayerConfig('core', core);
  const promises: Promise<unknown>[] = [];
  for (const slot of ['bottom','shoes','bag','accent'] as const) {
    const layer = getPhotoLayerConfig(slot, items[slot]?.id);
    if (layer) promises.push(loadPhotoImage(layer.imageSrc));
  }
  if (config?.fabricMaskSrc) promises.push(recolorGarmentImage(config.imageSrc, config.fabricMaskSrc, hex, config.baseFabricLuminance));
  return Promise.allSettled(promises);
}
