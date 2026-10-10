import { useCallback, useEffect, useMemo, useReducer } from 'react';

export type MovableCategory = 'bag' | 'accent';
export interface AccessoryPoint { x: number; y: number }
export interface AccessoryBounds extends AccessoryPoint { width: number; height: number }
export type AccessoryPositions = Record<MovableCategory, AccessoryPoint | null>;
export interface AccessoryContext { coreId: string; bagId: string; accentId: string | null }
export interface AccessoryPlacementState {
  context: AccessoryContext;
  positions: AccessoryPositions;
}
export type AccessoryPlacementAction =
  | { type: 'sync'; context: AccessoryContext }
  | { type: 'reset'; context: AccessoryContext }
  | { type: 'move'; context: AccessoryContext; category: MovableCategory; point: AccessoryPoint };

export const createAccessoryPlacement = (context: AccessoryContext): AccessoryPlacementState => ({
  context, positions: { bag: null, accent: null },
});

export function alignAccessoryPlacement(state: AccessoryPlacementState, context: AccessoryContext): AccessoryPlacementState {
  if (state.context.coreId !== context.coreId) return createAccessoryPlacement(context);
  if (state.context.bagId === context.bagId && state.context.accentId === context.accentId) return state;
  return { context, positions: {
    bag: state.context.bagId === context.bagId ? state.positions.bag : null,
    accent: state.context.accentId === context.accentId ? state.positions.accent : null,
  } };
}

export function accessoryPlacementReducer(state: AccessoryPlacementState, action: AccessoryPlacementAction): AccessoryPlacementState {
  const aligned = alignAccessoryPlacement(state, action.context);
  if (action.type === 'sync') return aligned;
  if (action.type === 'reset') return createAccessoryPlacement(action.context);
  if (![action.point.x, action.point.y].every(Number.isFinite)) return aligned;
  if (action.category === 'accent' && !action.context.accentId) return aligned;
  return { ...aligned, positions: { ...aligned.positions, [action.category]: action.point } };
}

// Absolute top-left of the visible item, in the existing 300 × 600 SVG coordinate system.
// A custom position therefore survives changes to the default collision/carry fitting.
export function clampAccessoryPoint(point: AccessoryPoint, bounds: AccessoryBounds): AccessoryPoint {
  const clamp = (value: number, limit: number) => Math.max(2, Math.min(value, Math.max(2, limit)));
  return { x: clamp(point.x, 298 - bounds.width), y: clamp(point.y, 598 - bounds.height) };
}

export function useAccessoryPlacement(coreId: string, bagId: string, accentId: string | null) {
  const context = useMemo(() => ({ coreId, bagId, accentId }), [coreId, bagId, accentId]);
  const [state, dispatch] = useReducer(accessoryPlacementReducer, context, createAccessoryPlacement);
  const active = alignAccessoryPlacement(state, context);
  // Render aligned positions immediately; commit context changes without a stale-position frame.
  useEffect(() => { dispatch({ type: 'sync', context }); }, [context]);
  const onMove = useCallback((category: MovableCategory, point: AccessoryPoint) => {
    dispatch({ type: 'move', context, category, point });
  }, [context]);
  const onReset = useCallback(() => dispatch({ type: 'reset', context }), [context]);
  return { positions: active.positions, onMove, onReset };
}
