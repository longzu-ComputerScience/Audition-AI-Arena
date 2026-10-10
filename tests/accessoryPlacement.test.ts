import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accessoryPlacementReducer, alignAccessoryPlacement, clampAccessoryPoint, createAccessoryPlacement } from '../src/utils/accessoryPlacement';
import { fitAccessoryHitShape } from '../src/utils/accessoryHitShape';
import { getOutfitLayerConfig } from '../src/data/photoLayerFitting';

const context = { coreId: 'ao-dai', bagId: 'bag-gam-vintage', accentId: 'accent-silver-jewelry' };
test('accessory coordinates belong to a core and item; changing one slot does not inherit or clear another slot', () => {
  let state = createAccessoryPlacement(context);
  state = accessoryPlacementReducer(state, { type: 'move', context, category: 'bag', point: { x: 70, y: 350 } });
  state = accessoryPlacementReducer(state, { type: 'move', context, category: 'accent', point: { x: 140, y: 180 } });
  assert.equal(alignAccessoryPlacement(state, { ...context }), state);
  const bagChange = alignAccessoryPlacement(state, { ...context, bagId: 'bag-tote-linen' });
  assert.equal(bagChange.positions.bag, null);
  assert.deepEqual(bagChange.positions.accent, { x: 140, y: 180 });
  const removed = alignAccessoryPlacement(state, { ...context, accentId: null });
  assert.equal(removed.positions.accent, null);
  assert.deepEqual(removed.positions.bag, { x: 70, y: 350 });
  assert.deepEqual(alignAccessoryPlacement(state, { ...context, coreId: 'ao-tac' }).positions, { bag: null, accent: null });
});
test('reset clears coordinates only; invalid points and absent accents cannot move an item', () => {
  const moved = accessoryPlacementReducer(createAccessoryPlacement(context), { type: 'move', context, category: 'bag', point: { x: 80, y: 320 } });
  const reset = accessoryPlacementReducer(moved, { type: 'reset', context });
  assert.deepEqual(reset.context, context);
  assert.deepEqual(reset.positions, { bag: null, accent: null });
  assert.equal(accessoryPlacementReducer(moved, { type: 'move', context, category: 'bag', point: { x: NaN, y: 5 } }), moved);
  assert.equal(accessoryPlacementReducer(moved, { type: 'move', context: { ...context, accentId: null }, category: 'accent', point: { x: 5, y: 5 } }).positions.accent, null);
});
test('drag and keyboard bounds retain the visible item inside the canonical frame at both extremes', () => {
  const bounds = { x: 30, y: 200, width: 68, height: 80 };
  assert.deepEqual(clampAccessoryPoint({ x: -500, y: -500 }, bounds), { x: 2, y: 2 });
  assert.deepEqual(clampAccessoryPoint({ x: 1000, y: 1000 }, bounds), { x: 230, y: 518 });
  assert.deepEqual(clampAccessoryPoint({ x: 70, y: 250 }, bounds), { x: 70, y: 250 });
});
test('necklace hit contour excludes the concealed rear loop and clips a partially visible alpha row', () => {
  const base = getOutfitLayerConfig('ao-dai', 'accent', 'accent-silver-jewelry')!;
  const config = { ...base, sourceDimensions: { width: 100, height: 100 }, svgPlacement: { x: 100, y: 110, width: 50, height: 50 } };
  const shape = { runs: [{ x: 20, y: 0, width: 60, height: 10 }, { x: 30, y: 10, width: 40, height: 10 }, { x: 40, y: 20, width: 20, height: 10 }] };
  const fitted = fitAccessoryHitShape(shape, config, 116)!;
  assert.deepEqual(fitted.bounds, { x: 115, y: 116, width: 20, height: 9 });
  assert.equal(fitted.path, 'M115 116h20v4h-20ZM120 120h10v5h-10Z');
});
test('all five necklace defaults preserve aspect ratio and place the original lotus below the collar', () => {
  for (const core of ['ao-nhat-binh', 'ao-tac', 'ao-dai', 'ao-tu-than', 'ao-ngu-than']) {
    const config = getOutfitLayerConfig(core, 'accent', 'accent-silver-jewelry')!;
    const p = config.svgPlacement, scale = p.width/config.sourceDimensions.width;
    assert.ok(config.frontClipTop! >= 118 && config.frontClipTop! <= 123);
    assert.ok(Math.abs(p.y+160*scale-config.frontClipTop!) < .000001);
    assert.ok(p.y+550*scale > 136); // Original center lotus, not a new drawn pendant.
    assert.ok(p.y+config.visibleBounds.maxY*scale < 155);
    assert.ok(Math.abs(p.width/p.height-800/720) < .000001);
    for (const other of ['accent-non-la', 'accent-y2k-shades', 'accent-quai-thao-mini']) {
      assert.equal(getOutfitLayerConfig(core, 'accent', other)?.frontClipTop, undefined);
    }
  }
});
