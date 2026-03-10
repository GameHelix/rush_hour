'use client';

/**
 * WinScreen — animated overlay shown when the player solves the puzzle.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '@/utils/storage';
import type { Difficulty } from '@/types/game';

interface Props {
  visible: boolean;
  moves: number;
  optimalMoves: number;
  elapsed: number;
  bestMoves: number | null;
  bestTime: number | null;
  hintsUsed: number;
  levelName: string;
  difficulty: Difficulty;
  onNext: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

/** Star rating: 3 = perfect/near-perfect, 2 = good, 1 = completed. */
function starRating(moves: number, optimal: number, hints: number): 1 | 2 | 3 {
  if (hints > 0) return 1;
  const ratio = moves / optimal;
  if (ratio <= 1.2) return 3;
  if (ratio <= 1.8) return 2;
  return 1;
}

const RATINGS: Record<1 | 2 | 3, { label: string; color: string }> = {
  3: { label: 'Perfect!', color: '#ffe600' },
  2: { label: 'Nice job!', color: '#4ade80' },
  1: { label: 'Solved!', color: '#00f5d4' },
};

export default function WinScreen({
  visible,
  moves,
  optimalMoves,
  elapsed,
  bestMoves,
  bestTime,
  hintsUsed,
  levelName,
  difficulty,
  onNext,
  onRestart,
  onMenu,
}: Props) {
  const stars = starRating(moves, optimalMoves, hintsUsed);
  const rating = RATINGS[stars];
  const isNewBest = bestMoves !== null && moves <= bestMoves;

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(t);
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Confetti particles */}
          {showConfetti && <Confetti />}

          {/* Card */}
          <motion.div
            className="relative w-full max-w-sm rounded-3xl p-8 text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #12122a 0%, #1a1a38 100%)',
              border: '1px solid #7c3aed55',
              boxShadow: '0 0 80px 20px #7c3aed33',
            }}
            initial={{ scale: 0.7, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.7, y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            {/* Glow accent */}
            <div
              className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: rating.color }}
            />

            {/* Stars */}
            <motion.div
              className="text-5xl mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {'⭐'.repeat(stars)}
              {'☆'.repeat(3 - stars)}
            </motion.div>

            <motion.h2
              className="text-3xl font-black mb-1"
              style={{ color: rating.color, textShadow: `0 0 20px ${rating.color}` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {rating.label}
            </motion.h2>

            <p className="text-white/50 text-sm mb-6">{levelName}</p>

            {/* Stats grid */}
            <motion.div
              className="grid grid-cols-2 gap-3 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <StatBox label="Moves" value={moves.toString()} color="#ffe600" />
              <StatBox label="Time" value={formatTime(elapsed)} color="#00f5d4" />
              <StatBox
                label="Optimal"
                value={`${optimalMoves} moves`}
                color="#a855f7"
              />
              <StatBox
                label="Hints"
                value={hintsUsed === 0 ? 'None 🏆' : `${hintsUsed} used`}
                color={hintsUsed === 0 ? '#4ade80' : '#fb7185'}
              />
            </motion.div>

            {/* New record badge */}
            {isNewBest && (
              <motion.div
                className="mb-4 py-1 px-3 rounded-full text-xs font-bold inline-block"
                style={{ background: '#ffe60022', border: '1px solid #ffe60055', color: '#ffe600' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
              >
                🎉 New Personal Best!
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              className="flex flex-col gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <WinButton onClick={onNext} color="#4ade80" label="Next Level →" primary />
              <WinButton onClick={onRestart} color="#00f5d4" label="↺ Play Again" />
              <WinButton onClick={onMenu} color="#ffffff44" label="☰ Main Menu" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: '#ffffff08', border: `1px solid ${color}30` }}
    >
      <div className="text-white/40 text-[10px] uppercase tracking-widest">{label}</div>
      <div className="font-bold text-lg mt-0.5" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function WinButton({
  onClick,
  color,
  label,
  primary,
}: {
  onClick: () => void;
  color: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full py-2.5 rounded-xl font-bold text-sm"
      style={{
        background: primary ? `${color}33` : `${color}15`,
        border: `1px solid ${color}55`,
        color,
        textShadow: `0 0 8px ${color}88`,
      }}
      whileHover={{ scale: 1.03, boxShadow: `0 0 18px ${color}66` }}
      whileTap={{ scale: 0.97 }}
    >
      {label}
    </motion.button>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function Confetti() {
  const COLORS = ['#ff3366', '#00f5d4', '#ffe600', '#a855f7', '#4ade80', '#fb7185'];
  const pieces = Array.from({ length: 40 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((_, i) => {
        const color = COLORS[i % COLORS.length];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const size = 6 + Math.random() * 8;
        const rotate = Math.random() * 360;
        const duration = 1.5 + Math.random() * 1.5;

        return (
          <motion.div
            key={i}
            className="absolute top-0 rounded-sm"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}`,
            }}
            initial={{ y: -20, opacity: 1, rotate }}
            animate={{ y: '110vh', opacity: [1, 1, 0], rotate: rotate + 360 * 2 }}
            transition={{ duration, delay, ease: 'linear' }}
          />
        );
      })}
    </div>
  );
}
