import { LayerPhotoItemConfig } from '../data/photoLayerFitting';
import { loadPhotoImage } from './photoImageCache';
import { AccessoryBounds } from './accessoryPlacement';

// Shared with the existing rendered strap mask: transparent/removed pixels never block another item.
export const TECHWEAR_VISIBLE_CONTOUR = 'M510 0 L540 120 L535 240 L512 340 L442 402 L346 441 L0 465 L0 800 L644 800 L644 0 Z';
interface AlphaRun { x: number; y: number; width: number; height: number }
export interface AccessoryAlphaShape { runs: AlphaRun[] }
const shapes = new Map<string, Promise<AccessoryAlphaShape>>();

/** Reuse decoded photo assets; generate a compact hit contour once per source image. */
export function loadAccessoryAlphaShape(config: LayerPhotoItemConfig): Promise<AccessoryAlphaShape> {
  const key = config.imageSrc;
  const cached = shapes.get(key);
  if (cached) return cached;
  const task = loadPhotoImage(config.imageSrc).then(image => {
    const scale = Math.min(1, 240 / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.ceil(image.naturalWidth * scale), height = Math.ceil(image.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Cannot read accessory alpha');
    context.drawImage(image, 0, 0, width, height);
    if (config.catalogId === 'bag-techwear-crossbody') {
      context.globalCompositeOperation = 'destination-in';
      context.scale(width / image.naturalWidth, height / image.naturalHeight);
      context.fill(new Path2D(TECHWEAR_VISIBLE_CONTOUR));
      context.resetTransform();
    }
    const pixels = context.getImageData(0, 0, width, height).data;
    const sx = image.naturalWidth / width, sy = image.naturalHeight / height;
    const runs: AlphaRun[] = [];
    for (let y = 0; y < height; y++) {
      let start = -1;
      for (let x = 0; x <= width; x++) {
        const painted = x < width && pixels[(y * width + x) * 4 + 3] >= 20;
        if (painted && start < 0) start = x;
        if (!painted && start >= 0) {
          // Store source coordinates; fitting to the mannequin never reloads the asset.
          runs.push({ x: start * sx, y: y * sy, width: (x - start) * sx, height: sy });
          start = -1;
        }
      }
    }
    // One source-pixel row height is derived from the downsampled grid.
    return { runs };
  });
  shapes.set(key, task);
  if (shapes.size > 24) shapes.delete(shapes.keys().next().value!);
  task.catch(() => shapes.delete(key));
  return task;
}

export function fitAccessoryHitShape(shape: AccessoryAlphaShape, config: LayerPhotoItemConfig, clipTop?: number) {
  const p = config.svgPlacement;
  const sx = p.width / config.sourceDimensions.width, sy = p.height / config.sourceDimensions.height;
  const coordinates = shape.runs.map(run => {
    const top = p.y + run.y * sy, bottom = top + run.height * sy;
    return { x: p.x + run.x * sx, y: Math.max(top, clipTop ?? top), width: run.width * sx, bottom };
  }).filter(run => run.bottom > run.y);
  if (!coordinates.length) return null;
  const x = Math.min(...coordinates.map(r => r.x)), y = Math.min(...coordinates.map(r => r.y));
  const bounds: AccessoryBounds = { x, y,
    width: Math.max(...coordinates.map(r => r.x + r.width)) - x,
    height: Math.max(...coordinates.map(r => r.bottom)) - y,
  };
  const n = (value: number) => Number(value.toFixed(3));
  const path = coordinates.map(r => `M${n(r.x)} ${n(r.y)}h${n(r.width)}v${n(r.bottom-r.y)}h${n(-r.width)}Z`).join('');
  return { path, bounds };
}
