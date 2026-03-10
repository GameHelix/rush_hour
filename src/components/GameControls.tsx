'use client';

/**
 * GameControls — action buttons below the game board.
 * Includes: Undo, Hint, Restart, Pause, Sound, Music toggles.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  canUndo: boolean;
  paused: boolean;
  solved: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onUndo: () => void;
  onHint: () => void;
  onRestart: () => void;
  onPause: () => void;
  onResume: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onMenu: () => void;
}

export default function GameControls({
  canUndo,
  paused,
  solved,
  soundEnabled,
  musicEnabled,
  onUndo,
  onHint,
  onRestart,
  onPause,
  onResume,
  onToggleSound,
  onToggleMusic,
  onMenu,
}: Props) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-3 mt-4">
      {/* Primary controls */}
      <div className="flex gap-3 justify-center">
        <CtrlButton
          onClick={onUndo}
          disabled={!canUndo || solved}
          color="#00f5d4"
          label="↩ Undo"
          title="Undo last move"
        />
        <CtrlButton
          onClick={onHint}
          disabled={solved}
          color="#ffe600"
          label="💡 Hint"
          title="Show a hint"
        />
        <CtrlButton
          onClick={onRestart}
          color="#fb7185"
          label="↺ Restart"
          title="Restart this level"
        />
        <CtrlButton
          onClick={paused ? onResume : onPause}
          disabled={solved}
          color="#a855f7"
          label={paused ? '▶ Resume' : '⏸ Pause'}
          title={paused ? 'Resume game' : 'Pause game'}
        />
      </div>

      {/* Secondary controls */}
      <div className="flex gap-3 justify-center">
        <CtrlButton
          onClick={onToggleSound}
          color={soundEnabled ? '#4ade80' : '#ffffff30'}
          label={soundEnabled ? '🔊 SFX' : '🔇 SFX'}
          title="Toggle sound effects"
          small
        />
        <CtrlButton
          onClick={onToggleMusic}
          color={musicEnabled ? '#4ade80' : '#ffffff30'}
          label={musicEnabled ? '🎵 Music' : '🎵 Music'}
          title="Toggle background music"
          small
        />
        <CtrlButton
          onClick={onMenu}
          color="#ffffff44"
          label="☰ Menu"
          title="Back to main menu"
          small
        />
      </div>
    </div>
  );
}

interface CtrlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  color: string;
  label: string;
  title: string;
  small?: boolean;
}

function CtrlButton({ onClick, disabled, color, label, title, small }: CtrlButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        'rounded-xl font-bold tracking-wide select-none outline-none',
        'transition-colors duration-150',
        small ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
      style={{
        background: `${color}18`,
        border: `1px solid ${color}55`,
        color: disabled ? '#ffffff44' : color,
        textShadow: disabled ? 'none' : `0 0 8px ${color}88`,
      }}
      whileHover={disabled ? {} : { scale: 1.05, boxShadow: `0 0 14px ${color}66` }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {label}
    </motion.button>
  );
}
