'use client';

/**
 * GameBoard — the 6×6 Rush Hour grid with vehicle rendering and
 * mobile on-screen direction controls.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Vehicle } from '@/types/game';
import { GRID_SIZE, EXIT_ROW } from '@/utils/gameLogic';
import VehicleComponent from './VehicleComponent';

interface Props {
  vehicles: Vehicle[];
  hintVehicleId: string | null;
  disabled: boolean;
  onMove: (vehicleId: string, dx: number, dy: number) => boolean;
}

const CELL_SIZE = 64;
const GAP = 6;

export default function GameBoard({ vehicles, hintVehicleId, disabled, onMove }: Props) {
  const boardPx = GRID_SIZE * CELL_SIZE + (GRID_SIZE + 1) * GAP;

  // Track which vehicle is focused (for mobile arrow buttons)
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const focused = vehicles.find(v => v.id === focusedId) ?? null;

  const handleMove = (vehicleId: string, dx: number, dy: number) => {
    // Auto-focus moved vehicle
    setFocusedId(vehicleId);
    return onMove(vehicleId, dx, dy);
  };

  const mobileMove = (dx: number, dy: number) => {
    if (!focusedId) return;
    onMove(focusedId, dx, dy);
  };

  return (
    <div className="flex flex-col items-center gap-4">

      {/* Board */}
      <div className="relative" style={{ width: boardPx + 44, paddingRight: 44 }}>

        {/* Grid container */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            width: boardPx,
            height: boardPx,
            background: 'linear-gradient(135deg, #0d0d1a 0%, #111127 100%)',
            boxShadow: '0 0 50px 8px #7c3aed33, 0 0 0 2px #7c3aed44',
          }}
        >
          {/* Grid cells */}
          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              gap: GAP,
              padding: GAP / 2,
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isExit = y === EXIT_ROW && x === GRID_SIZE - 1;
              const isExitRow = y === EXIT_ROW;
              return (
                <motion.div
                  key={i}
                  className="rounded-md"
                  style={{
                    backgroundColor: isExit ? '#ff336610' : isExitRow ? '#ffffff07' : '#ffffff04',
                    border: isExit ? '1px solid #ff336633' : isExitRow ? '1px solid #ffffff10' : '1px solid #ffffff08',
                  }}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.005, duration: 0.25 }}
                />
              );
            })}
          </div>

          {/* Vehicles */}
          <div className="absolute inset-0" style={{ padding: GAP / 2 }}>
            {vehicles.map(veh => (
              <VehicleComponent
                key={veh.id}
                vehicle={veh}
                cellSize={CELL_SIZE}
                gap={GAP}
                disabled={disabled}
                isHint={veh.id === hintVehicleId}
                onMove={handleMove}
              />
            ))}
          </div>
        </div>

        {/* Exit arrow — sits to the right of the board */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            right: 0,
            top: EXIT_ROW * (CELL_SIZE + GAP) + GAP / 2,
            width: 40,
            height: CELL_SIZE,
            justifyContent: 'center',
          }}
        >
          <motion.div
            className="text-xl leading-none"
            style={{ color: '#ff3366', filter: 'drop-shadow(0 0 8px #ff3366)' }}
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
          >
            ▶
          </motion.div>
          <div
            className="text-[8px] font-bold tracking-widest mt-1"
            style={{ color: '#ff3366', opacity: 0.7, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            EXIT
          </div>
        </div>
      </div>

      {/* Mobile on-screen vehicle controls */}
      <MobileControls
        focused={focused}
        disabled={disabled}
        onMove={mobileMove}
        onClear={() => setFocusedId(null)}
      />
    </div>
  );
}

// ─── Mobile arrow pad ─────────────────────────────────────────────────────────

function MobileControls({
  focused,
  disabled,
  onMove,
  onClear,
}: {
  focused: Vehicle | null;
  disabled: boolean;
  onMove: (dx: number, dy: number) => void;
  onClear: () => void;
}) {
  if (!focused || disabled) return null;

  const isH = focused.orientation === 'horizontal';
  const color = focused.isTarget ? '#ff3366' : focused.color;

  const Btn = ({ dx, dy, label }: { dx: number; dy: number; label: string }) => (
    <motion.button
      onClick={() => onMove(dx, dy)}
      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
      style={{
        background: `${color}22`,
        border: `1px solid ${color}55`,
        color,
        touchAction: 'manipulation',
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {label}
    </motion.button>
  );

  return (
    <div className="flex flex-col items-center gap-1 sm:hidden">
      <div
        className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full mb-1"
        style={{ color, background: `${color}18`, border: `1px solid ${color}33` }}
      >
        Moving {focused.isTarget ? '🚗' : focused.id}
        <button onClick={onClear} className="ml-2 opacity-50">✕</button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <div />
        {isH ? null : <Btn dx={0} dy={-1} label="▲" />}
        {isH ? <Btn dx={-1} dy={0} label="◀" /> : <div />}
        <div />
        {isH ? <Btn dx={1} dy={0} label="▶" /> : <div />}
        {isH ? null : <div />}
        {isH ? null : <Btn dx={0} dy={1} label="▼" />}
      </div>
    </div>
  );
}
