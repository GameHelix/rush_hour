/**
 * useSound — procedural sound effects via the Web Audio API.
 * No external audio files needed. All sounds are synthesized on the fly.
 */

import { useCallback, useEffect, useRef } from 'react';
import { loadData, saveData } from '@/utils/storage';

type AudioCtxRef = React.MutableRefObject<AudioContext | null>;

function getCtx(ref: AudioCtxRef): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ref.current) {
    // AudioContext must be created after a user gesture
    try {
      ref.current = new AudioContext();
    } catch {
      return null;
    }
  }
  return ref.current;
}

/** Resumes a suspended AudioContext (required by browsers after first load). */
function ensureResumed(ctx: AudioContext) {
  if (ctx.state === 'suspended') ctx.resume();
}

// ─── Sound primitives ─────────────────────────────────────────────────────────

/** Short click/slide sound for a vehicle move. */
function playSlideSfx(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

/** Bling sound when the puzzle is solved. */
function playWinSfx(ctx: AudioContext) {
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.start(t);
    osc.stop(t + 0.35);
  });
}

/** Error thud for an invalid move. */
function playErrorSfx(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'square';
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.06);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

/** Subtle tick for button clicks. */
function playClickSfx(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'triangle';
  osc.frequency.value = 600;
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

/** Subtle hint chime. */
function playHintSfx(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

// ─── Ambient music loop ───────────────────────────────────────────────────────

function startAmbientMusic(ctx: AudioContext): () => void {
  // Simple ambient pad: two detuned oscillators + slow LFO tremolo
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const masterGain = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.value = 110;
  osc2.type = 'sine';
  osc2.frequency.value = 110.5; // Slightly detuned for shimmer

  lfo.frequency.value = 0.2;
  lfoGain.gain.value = 0.04;

  lfo.connect(lfoGain);
  lfoGain.connect(masterGain.gain);
  osc1.connect(masterGain);
  osc2.connect(masterGain);
  masterGain.connect(ctx.destination);
  masterGain.gain.value = 0.04;

  osc1.start();
  osc2.start();
  lfo.start();

  return () => {
    try {
      osc1.stop();
      osc2.stop();
      lfo.stop();
    } catch {
      // Already stopped
    }
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const stopMusicRef = useRef<(() => void) | null>(null);

  // Read persisted prefs (we use a ref so we don't re-render on load)
  const data = loadData();
  const soundEnabledRef = useRef(data.soundEnabled);
  const musicEnabledRef = useRef(data.musicEnabled);

  // Persist + apply sound toggle
  const toggleSound = useCallback(() => {
    soundEnabledRef.current = !soundEnabledRef.current;
    const d = loadData();
    d.soundEnabled = soundEnabledRef.current;
    saveData(d);
  }, []);

  // Persist + apply music toggle
  const toggleMusic = useCallback(() => {
    musicEnabledRef.current = !musicEnabledRef.current;
    const d = loadData();
    d.musicEnabled = musicEnabledRef.current;
    saveData(d);

    if (musicEnabledRef.current) {
      const ctx = getCtx(ctxRef);
      if (ctx) {
        ensureResumed(ctx);
        stopMusicRef.current = startAmbientMusic(ctx);
      }
    } else {
      stopMusicRef.current?.();
      stopMusicRef.current = null;
    }
  }, []);

  const playSlide = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = getCtx(ctxRef);
    if (ctx) { ensureResumed(ctx); playSlideSfx(ctx); }
  }, []);

  const playWin = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = getCtx(ctxRef);
    if (ctx) { ensureResumed(ctx); playWinSfx(ctx); }
  }, []);

  const playError = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = getCtx(ctxRef);
    if (ctx) { ensureResumed(ctx); playErrorSfx(ctx); }
  }, []);

  const playClick = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = getCtx(ctxRef);
    if (ctx) { ensureResumed(ctx); playClickSfx(ctx); }
  }, []);

  const playHint = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = getCtx(ctxRef);
    if (ctx) { ensureResumed(ctx); playHintSfx(ctx); }
  }, []);

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      stopMusicRef.current?.();
      ctxRef.current?.close();
    };
  }, []);

  return {
    soundEnabled: soundEnabledRef.current,
    musicEnabled: musicEnabledRef.current,
    toggleSound,
    toggleMusic,
    playSlide,
    playWin,
    playError,
    playClick,
    playHint,
  };
}
