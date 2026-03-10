// ─── Core Game Types ────────────────────────────────────────────────────────

/** A vehicle can be oriented horizontally or vertically on the grid. */
export type Orientation = 'horizontal' | 'vertical';

/** Available difficulty levels for puzzle selection. */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Represents a single vehicle on the 6×6 Rush Hour grid.
 * Position (x, y) is the top-left cell the vehicle occupies.
 */
export interface Vehicle {
  /** Unique identifier (e.g. 'R' for the target red car, 'A', 'B', …) */
  id: string;
  /** Column index (0–5, left to right) */
  x: number;
  /** Row index (0–5, top to bottom) */
  y: number;
  /** 2 = car, 3 = truck */
  length: 2 | 3;
  orientation: Orientation;
  /** True only for the red car that must exit */
  isTarget: boolean;
  /** Tailwind / hex color class used to render this vehicle */
  color: string;
}

/**
 * A single puzzle level definition.
 * Only raw placement data is stored; colors are assigned at runtime.
 */
export interface Level {
  id: number;
  difficulty: Difficulty;
  /** Initial vehicle placements (no color field needed here) */
  vehicles: Array<Omit<Vehicle, 'color'>>;
  /** Known minimum solution length for display purposes */
  optimalMoves: number;
  /** Short human-readable name */
  name: string;
}

/** Represents one step in the move history so the player can undo. */
export interface MoveRecord {
  vehicleId: string;
  fromX: number;
  fromY: number;
}

/** Complete runtime game state managed by useGameState. */
export interface GameState {
  vehicles: Vehicle[];
  moves: number;
  bestMoves: number | null; // personal best for this level
  elapsed: number; // seconds
  solved: boolean;
  paused: boolean;
  currentLevel: Level;
  difficulty: Difficulty;
  hintsUsed: number;
  history: MoveRecord[];
  /** IDs of cells currently highlighted as a hint */
  hintPath: string[];
}

/** All personal-best records persisted to localStorage. */
export interface StorageData {
  bestMoves: Record<number, number>; // levelId → best move count
  bestTimes: Record<number, number>; // levelId → best time in seconds
  soundEnabled: boolean;
  musicEnabled: boolean;
}

/** The phase the UI is currently showing. */
export type ScreenPhase = 'menu' | 'game' | 'win' | 'paused';
