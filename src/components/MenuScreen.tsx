'use client';

/**
 * MenuScreen — the main menu with difficulty selection and level picker.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Difficulty, Level } from '@/types/game';
import { LEVELS_BY_DIFFICULTY } from '@/data/levels';
import { getBestMoves, formatTime, getBestTime } from '@/utils/storage';

interface Props {
  onSelectLevel: (level: Level) => void;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

const DIFF_META: Record<Difficulty, { label: string; color: string; description: string; emoji: string }> = {
  easy:   { label: 'Easy',   color: '#4ade80', description: '2–5 moves', emoji: '🟢' },
  medium: { label: 'Medium', color: '#ffe600', description: '6–10 moves', emoji: '🟡' },
  hard:   { label: 'Hard',   color: '#ff3366', description: '11+ moves',  emoji: '🔴' },
};

export default function MenuScreen({ onSelectLevel }: Props) {
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>('easy');

  const levels = LEVELS_BY_DIFFICULTY[selectedDiff];

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-start pt-10 pb-16 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Logo / Title */}
      <motion.div
        className="text-center mb-10"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        <div className="text-6xl mb-2">🚗</div>
        <h1
          className="text-5xl font-black tracking-tight"
          style={{
            background: 'linear-gradient(90deg, #ff3366, #a855f7, #00f5d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 20px #ff336688)',
          }}
        >
          RUSH HOUR
        </h1>
        <p className="text-white/40 mt-2 text-sm tracking-widest uppercase">
          Slide your way out
        </p>
      </motion.div>

      {/* Difficulty tabs */}
      <motion.div
        className="flex gap-2 mb-8 p-1.5 rounded-2xl"
        style={{ background: '#ffffff0a', border: '1px solid #ffffff14' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {DIFFICULTIES.map((diff) => {
          const meta = DIFF_META[diff];
          const active = selectedDiff === diff;
          return (
            <motion.button
              key={diff}
              onClick={() => setSelectedDiff(diff)}
              className="relative px-5 py-2 rounded-xl font-bold text-sm transition-colors"
              style={{
                color: active ? meta.color : '#ffffff55',
                background: active ? `${meta.color}20` : 'transparent',
                border: active ? `1px solid ${meta.color}55` : '1px solid transparent',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {meta.emoji} {meta.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Level grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDiff}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
        >
          {levels.map((level, idx) => (
            <LevelCard
              key={level.id}
              level={level}
              delay={idx * 0.06}
              color={DIFF_META[selectedDiff].color}
              onSelect={() => onSelectLevel(level)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Footer hint */}
      <motion.p
        className="text-white/20 text-xs mt-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Drag or use arrow keys to move vehicles · 🔑 Keyboard · 👆 Touch supported
      </motion.p>
    </motion.div>
  );
}

function LevelCard({
  level,
  delay,
  color,
  onSelect,
}: {
  level: Level;
  delay: number;
  color: string;
  onSelect: () => void;
}) {
  const best = getBestMoves(level.id);
  const bestT = getBestTime(level.id);
  const completed = best !== null;

  return (
    <motion.button
      onClick={onSelect}
      className="relative rounded-2xl p-4 text-left overflow-hidden group"
      style={{
        background: completed ? `${color}0f` : '#ffffff06',
        border: `1px solid ${completed ? color + '44' : '#ffffff15'}`,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 280 }}
      whileHover={{ scale: 1.04, boxShadow: `0 0 20px ${color}44` }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Completed badge */}
      {completed && (
        <div
          className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: `${color}30`, color }}
        >
          ✓
        </div>
      )}

      <div className="font-bold text-white text-sm mb-1 pr-5">{level.name}</div>
      <div className="text-white/30 text-[11px]">Optimal: {level.optimalMoves} moves</div>

      {completed && (
        <div className="mt-2 space-y-0.5">
          <div className="text-[11px]" style={{ color }}>
            Best: {best} moves
          </div>
          {bestT !== null && (
            <div className="text-white/30 text-[10px]">{formatTime(bestT)}</div>
          )}
        </div>
      )}

      {!completed && (
        <div className="mt-2 text-white/20 text-[11px]">Not yet solved</div>
      )}

      {/* Hover glow strip */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
    </motion.button>
  );
}
