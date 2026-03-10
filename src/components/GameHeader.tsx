'use client';

/**
 * GameHeader — displays the current level name, move counter, elapsed timer,
 * and personal bests for the active level.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '@/utils/storage';
import type { Difficulty } from '@/types/game';

interface Props {
  levelName: string;
  levelId: number;
  difficulty: Difficulty;
  moves: number;
  optimalMoves: number;
  elapsed: number;
  bestMoves: number | null;
  bestTime: number | null;
  hintsUsed: number;
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '🟢 Easy',
  medium: '🟡 Medium',
  hard: '🔴 Hard',
};

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: '#4ade80',
  medium: '#ffe600',
  hard: '#ff3366',
};

export default function GameHeader({
  levelName,
  levelId,
  difficulty,
  moves,
  optimalMoves,
  elapsed,
  bestMoves,
  bestTime,
  hintsUsed,
}: Props) {
  const efficiency =
    optimalMoves > 0 ? Math.max(0, Math.round((optimalMoves / Math.max(moves, 1)) * 100)) : 100;

  return (
    <div className="w-full max-w-lg mx-auto space-y-3">
      {/* Level title row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                color: DIFFICULTY_COLOR[difficulty],
                border: `1px solid ${DIFFICULTY_COLOR[difficulty]}55`,
                backgroundColor: `${DIFFICULTY_COLOR[difficulty]}15`,
              }}
            >
              {DIFFICULTY_LABEL[difficulty]}
            </span>
            <span className="text-white/40 text-xs">Level {levelId}</span>
          </div>
          <h2 className="text-white font-bold text-lg mt-0.5">{levelName}</h2>
        </div>

        {/* Timer */}
        <div className="text-right">
          <div className="text-white/40 text-xs uppercase tracking-widest">Time</div>
          <div
            className="text-2xl font-mono font-bold tabular-nums"
            style={{ color: '#00f5d4', textShadow: '0 0 10px #00f5d4' }}
          >
            {formatTime(elapsed)}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Moves"
          value={moves.toString()}
          sub={`/ ${optimalMoves} optimal`}
          color="#ffe600"
        />
        <StatCard
          label="Efficiency"
          value={`${Math.min(efficiency, 999)}%`}
          sub={moves === 0 ? '–' : efficiency >= 100 ? 'Perfect!' : efficiency >= 80 ? 'Great' : 'Keep going'}
          color={efficiency >= 100 ? '#4ade80' : efficiency >= 70 ? '#ffe600' : '#fb7185'}
        />
        <StatCard
          label="Best"
          value={bestMoves !== null ? `${bestMoves}` : '–'}
          sub={bestTime !== null ? formatTime(bestTime) : 'No record'}
          color="#a855f7"
        />
      </div>

      {/* Hints used indicator */}
      {hintsUsed > 0 && (
        <div className="text-center text-white/30 text-xs">
          💡 {hintsUsed} hint{hintsUsed !== 1 ? 's' : ''} used
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{
        background: '#ffffff08',
        border: `1px solid ${color}30`,
      }}
    >
      <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">{label}</div>
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          className="font-bold text-xl tabular-nums"
          style={{ color, textShadow: `0 0 8px ${color}88` }}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {value}
        </motion.div>
      </AnimatePresence>
      <div className="text-white/30 text-[10px] mt-0.5 truncate">{sub}</div>
    </div>
  );
}
