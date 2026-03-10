'use client';

/**
 * VehicleComponent — renders and handles drag/swipe for one vehicle.
 *
 * Mouse: pointerdown → pointermove (global) → pointerup (global).
 * Touch: same via pointer events (unified handler).
 * Keyboard: focus vehicle, then arrow keys move it one step.
 *
 * The vehicle moves in increments of `totalCell` px.  On pointer-up the
 * fractional offset is rounded to the nearest cell and emitted via onMove.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Vehicle } from '@/types/game';

interface Props {
  vehicle: Vehicle;
  cellSize: number;
  gap: number;
  disabled: boolean;
  isHint: boolean;
  onMove: (vehicleId: string, dx: number, dy: number) => boolean;
}

export default function VehicleComponent({
  vehicle,
  cellSize,
  gap,
  disabled,
  isHint,
  onMove,
}: Props) {
  const totalCell = cellSize + gap;
  const isH = vehicle.orientation === 'horizontal';

  // Pixel position of the vehicle on the board
  const baseX = vehicle.x * totalCell + gap / 2;
  const baseY = vehicle.y * totalCell + gap / 2;

  // Visual drag offset (pixels, relative to base position)
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const startClient = useRef(0);

  // ─── Pointer handlers ─────────────────────────────────────────────────────

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      isDragging.current = true;
      startClient.current = isH ? e.clientX : e.clientY;
      setDragOffset(0);
    },
    [disabled, isH]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current || disabled) return;
      const delta = (isH ? e.clientX : e.clientY) - startClient.current;
      setDragOffset(delta);
    },
    [disabled, isH]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current || disabled) {
        isDragging.current = false;
        setDragOffset(0);
        return;
      }
      isDragging.current = false;

      const delta = (isH ? e.clientX : e.clientY) - startClient.current;
      const steps = Math.round(delta / totalCell);
      setDragOffset(0);

      if (steps !== 0) {
        const [dx, dy] = isH ? [steps, 0] : [0, steps];
        onMove(vehicle.id, dx, dy);
      }
    },
    [disabled, isH, totalCell, onMove, vehicle.id]
  );

  // ─── Keyboard ─────────────────────────────────────────────────────────────

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      const map: Record<string, [number, number]> = {
        ArrowLeft:  [-1, 0], ArrowRight: [1, 0],
        ArrowUp:    [0, -1], ArrowDown:  [0, 1],
      };
      const move = map[e.key];
      if (!move) return;
      const [dx, dy] = move;
      if ((isH && dy !== 0) || (!isH && dx !== 0)) return; // wrong axis
      e.preventDefault();
      onMove(vehicle.id, dx, dy);
    },
    [disabled, isH, onMove, vehicle.id]
  );

  // ─── Computed geometry ────────────────────────────────────────────────────

  const width  = isH ? vehicle.length * totalCell - gap : cellSize;
  const height = isH ? cellSize : vehicle.length * totalCell - gap;

  // Current visual position (base + drag offset clamped to valid range)
  const visualX = baseX + (isH  ? dragOffset : 0);
  const visualY = baseY + (!isH ? dragOffset : 0);

  const glowColor = vehicle.isTarget ? '#ff3366' : vehicle.color;

  return (
    <motion.div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`${vehicle.isTarget ? 'Target car' : `Car ${vehicle.id}`} — ${vehicle.orientation}`}
      className={[
        'absolute rounded-lg select-none outline-none',
        'flex items-center justify-center font-bold text-white/90',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing',
        isHint ? 'ring-2 ring-white animate-pulse' : '',
      ].join(' ')}
      style={{
        left: visualX,
        top: visualY,
        width,
        height,
        backgroundColor: `${vehicle.color}cc`,
        border: `2px solid ${vehicle.color}`,
        fontSize: Math.max(9, cellSize * 0.26),
        boxShadow: isHint
          ? `0 0 0 3px #fff, 0 0 20px 6px ${glowColor}`
          : `0 0 10px 2px ${glowColor}55, inset 0 0 8px ${glowColor}18`,
        zIndex: isDragging.current ? 50 : isHint ? 20 : 10,
        // Smooth snap-back; no transition while dragging
        transition: isDragging.current ? 'none' : 'left 0.12s ease, top 0.12s ease, box-shadow 0.3s',
        touchAction: 'none', // prevent scroll interference
      }}
      // Entrance animation
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      {/* Label / icon */}
      <span className="pointer-events-none drop-shadow-md select-none">
        {vehicle.isTarget ? '🚗' : vehicle.length === 3 ? '🚛' : vehicle.id}
      </span>

      {/* Axis indicator arrows */}
      {isH ? (
        <>
          <span className="absolute left-0.5 top-1/2 -translate-y-1/2 opacity-30 text-[9px] pointer-events-none">◀</span>
          <span className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-30 text-[9px] pointer-events-none">▶</span>
        </>
      ) : (
        <>
          <span className="absolute top-0.5 left-1/2 -translate-x-1/2 opacity-30 text-[9px] pointer-events-none">▲</span>
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 opacity-30 text-[9px] pointer-events-none">▼</span>
        </>
      )}
    </motion.div>
  );
}
