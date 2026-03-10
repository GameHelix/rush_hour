import type { StorageData } from '@/types/game';

const STORAGE_KEY = 'rush_hour_data';

/** Default values for a fresh install. */
const DEFAULT_DATA: StorageData = {
  bestMoves: {},
  bestTimes: {},
  soundEnabled: true,
  musicEnabled: false,
};

/** Loads persisted game data from localStorage (SSR-safe). */
export function loadData(): StorageData {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    return { ...DEFAULT_DATA, ...JSON.parse(raw) } as StorageData;
  } catch {
    return DEFAULT_DATA;
  }
}

/** Persists updated game data to localStorage. */
export function saveData(data: StorageData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors (private browsing, quota exceeded, etc.)
  }
}

/** Updates the best-moves record for a specific level if the new score is better. */
export function updateBestMoves(levelId: number, moves: number): void {
  const data = loadData();
  const prev = data.bestMoves[levelId];
  if (prev === undefined || moves < prev) {
    data.bestMoves[levelId] = moves;
    saveData(data);
  }
}

/** Updates the best-time record for a specific level if the new time is better. */
export function updateBestTime(levelId: number, seconds: number): void {
  const data = loadData();
  const prev = data.bestTimes[levelId];
  if (prev === undefined || seconds < prev) {
    data.bestTimes[levelId] = seconds;
    saveData(data);
  }
}

/** Retrieves the best-moves record for a specific level. */
export function getBestMoves(levelId: number): number | null {
  const data = loadData();
  return data.bestMoves[levelId] ?? null;
}

/** Retrieves the best-time record for a specific level (in seconds). */
export function getBestTime(levelId: number): number | null {
  const data = loadData();
  return data.bestTimes[levelId] ?? null;
}

/** Formats seconds as MM:SS. */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
