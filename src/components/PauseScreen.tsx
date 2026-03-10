'use client';

/**
 * PauseScreen — modal overlay shown when the game is paused.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export default function PauseScreen({ visible, onResume, onRestart, onMenu }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-xs rounded-3xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, #12122a 0%, #1a1a38 100%)',
              border: '1px solid #a855f755',
              boxShadow: '0 0 60px 10px #a855f733',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="text-5xl mb-4">⏸</div>
            <h2
              className="text-2xl font-black mb-6"
              style={{ color: '#a855f7', textShadow: '0 0 15px #a855f7' }}
            >
              PAUSED
            </h2>

            <div className="flex flex-col gap-3">
              <PauseButton onClick={onResume} color="#4ade80" label="▶ Resume" primary />
              <PauseButton onClick={onRestart} color="#00f5d4" label="↺ Restart Level" />
              <PauseButton onClick={onMenu} color="#ffffff44" label="☰ Main Menu" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PauseButton({
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
      className="w-full py-3 rounded-xl font-bold text-sm"
      style={{
        background: primary ? `${color}28` : `${color}12`,
        border: `1px solid ${color}55`,
        color,
        textShadow: `0 0 8px ${color}88`,
      }}
      whileHover={{ scale: 1.03, boxShadow: `0 0 16px ${color}55` }}
      whileTap={{ scale: 0.97 }}
    >
      {label}
    </motion.button>
  );
}
