'use client';

/**
 * page.tsx — Root page / game shell.
 *
 * Manages the top-level screen phase (menu ↔ game ↔ win/pause overlays),
 * wires all hooks and components together, and handles the timer lifecycle.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import type { Level } from '@/types/game';
import { LEVELS_BY_DIFFICULTY } from '@/data/levels';

import { useGameState } from '@/hooks/useGameState';
import { useSound } from '@/hooks/useSound';
import { useTimer } from '@/hooks/useTimer';

import MenuScreen from '@/components/MenuScreen';
import GameBoard from '@/components/GameBoard';
import GameHeader from '@/components/GameHeader';
import GameControls from '@/components/GameControls';
import WinScreen from '@/components/WinScreen';
import PauseScreen from '@/components/PauseScreen';

import { getBestMoves, getBestTime, updateBestMoves, updateBestTime } from '@/utils/storage';

// ─── Default starting level ───────────────────────────────────────────────────

const DEFAULT_LEVEL: Level = LEVELS_BY_DIFFICULTY.easy[0];

// ─── Page component ───────────────────────────────────────────────────────────

export default function Page() {
  // Which screen is shown
  const [phase, setPhase] = useState<'menu' | 'game'>('menu');

  // Core game state
  const { state, moveVehicle, undo, pause, resume, loadLevel, nextLevel, restartLevel, showHint } =
    useGameState(DEFAULT_LEVEL);

  // Sound
  const sound = useSound();
  // Initialise from localStorage so toggles reflect persisted prefs
  const [soundOn, setSoundOn] = useState(() => sound.soundEnabled);
  const [musicOn, setMusicOn] = useState(() => sound.musicEnabled);

  // Timer — paused when game is paused, on menu, or solved
  const timerPaused = state.paused || state.solved || phase === 'menu';
  const { elapsed, reset: resetTimer } = useTimer(timerPaused);

  // Personal bests for the active level
  const bestMoves = getBestMoves(state.currentLevel.id);
  const bestTime = getBestTime(state.currentLevel.id);

  // Save records when puzzle is solved
  const savedRef = useRef(false);
  useEffect(() => {
    if (state.solved && !savedRef.current) {
      savedRef.current = true;
      updateBestMoves(state.currentLevel.id, state.moves);
      updateBestTime(state.currentLevel.id, elapsed);
      sound.playWin();
    }
  }, [state.solved]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset saved flag when level changes
  useEffect(() => {
    savedRef.current = false;
  }, [state.currentLevel.id]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectLevel = useCallback(
    (level: Level) => {
      loadLevel(level);
      resetTimer();
      setPhase('game');
      sound.playClick();
    },
    [loadLevel, resetTimer, sound]
  );

  const handleMove = useCallback(
    (vehicleId: string, dx: number, dy: number): boolean => {
      const ok = moveVehicle(vehicleId, dx, dy);
      if (ok) sound.playSlide();
      else sound.playError();
      return ok;
    },
    [moveVehicle, sound]
  );

  const handleUndo = useCallback(() => {
    undo();
    sound.playClick();
  }, [undo, sound]);

  const handleHint = useCallback(() => {
    showHint();
    sound.playHint();
  }, [showHint, sound]);

  const handleRestart = useCallback(() => {
    restartLevel();
    resetTimer();
    sound.playClick();
  }, [restartLevel, resetTimer, sound]);

  const handlePause = useCallback(() => {
    pause();
    sound.playClick();
  }, [pause, sound]);

  const handleResume = useCallback(() => {
    resume();
    sound.playClick();
  }, [resume, sound]);

  const handleMenu = useCallback(() => {
    setPhase('menu');
    sound.playClick();
  }, [sound]);

  const handleNext = useCallback(() => {
    nextLevel();
    resetTimer();
    sound.playClick();
  }, [nextLevel, resetTimer, sound]);

  const handleToggleSound = useCallback(() => {
    sound.toggleSound();
    setSoundOn((v) => !v);
  }, [sound]);

  const handleToggleMusic = useCallback(() => {
    sound.toggleMusic();
    setMusicOn((v) => !v);
  }, [sound]);

  // ─── Keyboard shortcuts (global) ──────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'game') return;
      if (e.key === 'Escape') {
        state.paused ? handleResume() : handlePause();
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, state.paused, handlePause, handleResume, handleUndo]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="min-h-dvh flex flex-col items-center">
      <AnimatePresence mode="wait">
        {phase === 'menu' ? (
          <motion.div
            key="menu"
            className="w-full"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.35 }}
          >
            <MenuScreen onSelectLevel={handleSelectLevel} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            className="w-full flex flex-col items-center px-4 pt-6 pb-10 gap-5"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
          >
            {/* Header */}
            <GameHeader
              levelName={state.currentLevel.name}
              levelId={state.currentLevel.id}
              difficulty={state.difficulty}
              moves={state.moves}
              optimalMoves={state.currentLevel.optimalMoves}
              elapsed={elapsed}
              bestMoves={bestMoves}
              bestTime={bestTime}
              hintsUsed={state.hintsUsed}
            />

            {/* Board wrapper with responsive scaling */}
            <div className="board-scale">
              <GameBoard
                vehicles={state.vehicles}
                hintVehicleId={state.hintVehicleId}
                disabled={state.paused || state.solved}
                onMove={handleMove}
              />
            </div>

            {/* Controls */}
            <GameControls
              canUndo={state.history.length > 0}
              paused={state.paused}
              solved={state.solved}
              soundEnabled={soundOn}
              musicEnabled={musicOn}
              onUndo={handleUndo}
              onHint={handleHint}
              onRestart={handleRestart}
              onPause={handlePause}
              onResume={handleResume}
              onToggleSound={handleToggleSound}
              onToggleMusic={handleToggleMusic}
              onMenu={handleMenu}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays (rendered outside the AnimatePresence so they layer on top) */}
      <WinScreen
        visible={state.solved && phase === 'game'}
        moves={state.moves}
        optimalMoves={state.currentLevel.optimalMoves}
        elapsed={elapsed}
        bestMoves={bestMoves}
        bestTime={bestTime}
        hintsUsed={state.hintsUsed}
        levelName={state.currentLevel.name}
        difficulty={state.difficulty}
        onNext={handleNext}
        onRestart={handleRestart}
        onMenu={handleMenu}
      />

      <PauseScreen
        visible={state.paused && phase === 'game'}
        onResume={handleResume}
        onRestart={handleRestart}
        onMenu={handleMenu}
      />
    </main>
  );
}
