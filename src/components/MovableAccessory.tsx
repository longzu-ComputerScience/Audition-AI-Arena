import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LayerPhotoItemConfig } from '../data/photoLayerFitting';
import { AccessoryAlphaShape, fitAccessoryHitShape, loadAccessoryAlphaShape } from '../utils/accessoryHitShape';
import { AccessoryBounds, AccessoryPoint, MovableCategory, clampAccessoryPoint } from '../utils/accessoryPlacement';

interface MovableAccessoryProps {
  category: MovableCategory;
  itemId: string;
  name: string;
  coreId: string;
  photoConfig?: LayerPhotoItemConfig;
  photoReady: boolean;
  pending: boolean;
  position: AccessoryPoint | null;
  selected: boolean;
  nodeRef: React.RefObject<SVGGElement | null>;
  clipTop?: number;
  onSelect: (category: MovableCategory) => void;
  onMove: (category: MovableCategory, point: AccessoryPoint) => void;
  onOffset: (category: MovableCategory, offset: AccessoryPoint, bounds: AccessoryBounds | null) => void;
  children: React.ReactNode;
}
interface DragSession {
  pointerId: number;
  clientX: number; clientY: number;
  start: AccessoryPoint; origin: AccessoryPoint;
  moved: boolean;
}

export const MovableAccessory: React.FC<MovableAccessoryProps> = ({
  category, itemId, name, coreId, photoConfig, photoReady, pending, position, selected,
  nodeRef, clipTop, onSelect, onMove, onOffset, children,
}) => {
  const [alpha, setAlpha] = useState<{ src: string; shape: AccessoryAlphaShape } | null>(null);
  const [vectorBounds, setVectorBounds] = useState<AccessoryBounds | null>(null);
  const [dragging, setDragging] = useState(false);
  const artworkRef = useRef<SVGGElement>(null);
  const session = useRef<DragSession | null>(null);
  const frame = useRef(0);
  const nextPoint = useRef<AccessoryPoint | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    if (!photoReady || !photoConfig) return;
    let cancelled = false;
    loadAccessoryAlphaShape(photoConfig).then(shape => {
      if (!cancelled) setAlpha({ src: photoConfig.imageSrc, shape });
    }).catch(() => { /* Keep the original artwork visible if its optional hit contour cannot be built. */ });
    return () => { cancelled = true; };
  }, [photoReady, photoConfig?.imageSrc]);

  const p = photoConfig?.svgPlacement;
  const fitted = useMemo(() => alpha && photoConfig && alpha.src === photoConfig.imageSrc
    ? fitAccessoryHitShape(alpha.shape, photoConfig, clipTop) : null,
  [alpha, photoConfig?.imageSrc, p?.x, p?.y, p?.width, p?.height, clipTop]);

  useLayoutEffect(() => {
    if (photoReady || pending) return;
    const b = artworkRef.current?.getBBox();
    if (b?.width && b.height) setVectorBounds({ x: b.x, y: b.y, width: b.width, height: b.height });
  }, [photoReady, pending, itemId, coreId]);

  const bounds = photoReady ? fitted?.bounds : vectorBounds;
  const point = bounds ? (position ? clampAccessoryPoint(position, bounds) : { x: bounds.x, y: bounds.y }) : { x: 0, y: 0 };
  const offset = bounds ? { x: point.x - bounds.x, y: point.y - bounds.y } : { x: 0, y: 0 };
  const ready = Boolean(bounds && !pending);
  useLayoutEffect(() => { onOffset(category, offset, bounds ?? null); }, [category, offset.x, offset.y, bounds?.x, bounds?.y, bounds?.width, bounds?.height, onOffset]);

  const finish = (cancelled = false) => {
    const drag = session.current;
    if (!drag) return;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = 0;
    if (nextPoint.current && drag.moved) onMove(category, nextPoint.current);
    nextPoint.current = null;
    session.current = null;
    suppressClick.current = drag.moved || cancelled;
    const node = nodeRef.current;
    if (node?.hasPointerCapture(drag.pointerId)) node.releasePointerCapture(drag.pointerId);
    setDragging(false);
  };

  useEffect(() => {
    // Changing a garment/item cancels its old gesture before it can move the new item.
    session.current = null; nextPoint.current = null; setDragging(false);
    return () => {
      cancelAnimationFrame(frame.current); frame.current = 0;
      const drag = session.current;
      session.current = null; nextPoint.current = null;
      if (drag && nodeRef.current?.hasPointerCapture(drag.pointerId)) nodeRef.current.releasePointerCapture(drag.pointerId);
    };
  }, [coreId, itemId]);

  useEffect(() => {
    const node = nodeRef.current;
    // Some mobile browsers pan an SVG despite touch-action on its painted paths.
    // Cancel native scrolling only for a touch that starts on this ready item's hit contour.
    const preventItemPan = (event: TouchEvent) => {
      if (node?.dataset.ready === 'true' && event.cancelable) event.preventDefault();
    };
    node?.addEventListener('touchstart', preventItemPan, { passive: false });
    return () => node?.removeEventListener('touchstart', preventItemPan);
  }, [nodeRef]);

  const toSvg = (clientX: number, clientY: number): AccessoryPoint | null => {
    const svg = nodeRef.current?.ownerSVGElement;
    const matrix = svg?.getScreenCTM();
    if (!matrix) return null;
    const value = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
    return { x: value.x, y: value.y };
  };

  const down = (event: React.PointerEvent<SVGGElement>) => {
    if (!ready || (event.pointerType === 'mouse' && event.button !== 0) || !event.isPrimary || session.current) return;
    const origin = toSvg(event.clientX, event.clientY);
    if (!origin) return;
    event.stopPropagation();
    suppressClick.current = false;
    onSelect(category);
    setDragging(true);
    nodeRef.current?.focus({ preventScroll: true });
    nodeRef.current?.setPointerCapture(event.pointerId);
    session.current = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY,
      origin, start: point, moved: false };
  };

  const move = (event: React.PointerEvent<SVGGElement>) => {
    const drag = session.current;
    if (!drag || drag.pointerId !== event.pointerId || !bounds) return;
    if (!drag.moved && Math.hypot(event.clientX-drag.clientX, event.clientY-drag.clientY) < 4) return;
    const current = toSvg(event.clientX, event.clientY);
    if (!current) return;
    event.preventDefault(); event.stopPropagation();
    if (!drag.moved) { drag.moved = true; setDragging(true); }
    nextPoint.current = clampAccessoryPoint({ x: drag.start.x+current.x-drag.origin.x, y: drag.start.y+current.y-drag.origin.y }, bounds);
    if (!frame.current) frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      if (nextPoint.current && session.current) onMove(category, nextPoint.current);
    });
  };

  const keyDown = (event: React.KeyboardEvent<SVGGElement>) => {
    if (!ready || !bounds) return;
    const amount = event.shiftKey ? 20 : 5;
    const directions: Record<string, AccessoryPoint> = { ArrowLeft: {x:-amount,y:0}, ArrowRight:{x:amount,y:0}, ArrowUp:{x:0,y:-amount}, ArrowDown:{x:0,y:amount} };
    const delta = directions[event.key];
    if (delta) {
      event.preventDefault(); onSelect(category);
      onMove(category, clampAccessoryPoint({ x:point.x+delta.x, y:point.y+delta.y }, bounds));
    } else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(category); }
    else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); finish(true); }
  };

  return (
    <g ref={nodeRef} role="button" tabIndex={ready ? 0 : -1}
      aria-label={`Di chuyển ${category === 'bag' ? 'túi' : 'phụ kiện'}: ${name}`}
      aria-describedby="accessory-move-help" aria-disabled={!ready}
      aria-pressed={selected} data-movable-layer={category} data-item-id={itemId}
      data-x={point.x} data-y={point.y} data-offset-x={offset.x} data-offset-y={offset.y}
      data-dragging={dragging} data-ready={ready}
      transform={`translate(${offset.x} ${offset.y})`}
      className={`movable-accessory ${photoReady ? 'movable-accessory-photo' : 'movable-accessory-vector'}`}
      onPointerDown={down} onPointerMove={move}
      onPointerUp={event => { if (session.current?.pointerId === event.pointerId) finish(); }}
      onPointerCancel={event => { if (session.current?.pointerId === event.pointerId) finish(true); }}
      onLostPointerCapture={() => finish(true)} onKeyDown={keyDown}
      onFocus={() => onSelect(category)}
      onClick={event => { event.stopPropagation(); if (suppressClick.current) { suppressClick.current = false; return; } if (ready) onSelect(category); }}
    >
      <g ref={artworkRef}>{children}</g>
      {photoReady && fitted && <path data-accessory-hit-area d={fitted.path} fill="transparent" stroke="transparent" strokeWidth="6" vectorEffect="non-scaling-stroke" className="accessory-hit-area" />}
      {ready && bounds && selected && <rect data-accessory-selection x={bounds.x-2} y={bounds.y-2} width={bounds.width+4} height={bounds.height+4}
        rx="3" fill="none" stroke="#8F2925" strokeWidth="1.5" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" pointerEvents="none" />}
    </g>
  );
};
