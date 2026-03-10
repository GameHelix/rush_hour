/**
 * useGameState — central game state manager using useReducer.
 *
 * Handles: vehicle moves, undo, pause/resume, new game, hints, win detection.
 */

import { useCallback, useReducer } from 'react';
import type { Vehicle, Level, MoveRecord, Difficulty } from '@/types/game';
import {
  initVehicles,
  applyMove,
  makeMoveRecord,
  undoMove,
  checkWin,
  maxSlide,
} from '@/utils/gameLogic';
import { getHint } from '@/utils/solver';
import { LEVELS_BY_DIFFICULTY } from '@/data/levels';

// ─── State ────────────────────────────────────────────────────────────────────

export interface State {
  vehicles: Vehicle[];
  moves: number;
  solved: boolean;
  paused: boolean;
  currentLevel: Level;
  difficulty: Difficulty;
  hintsUsed: number;
  history: MoveRecord[];
  /** vehicle id currently being shown as hint (highlighted) */
  hintVehicleId: string | null;
  /** direction the hint vehicle should move (-1 or +1) */
  hintDirection: -1 | 1 | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'MOVE'; vehicleId: string; dx: number; dy: number }
  | { type: 'UNDO' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'NEW_LEVEL'; level: Level }
  | { type: 'HINT'; vehicleId: string; direction: -1 | 1 }
  | { type: 'CLEAR_HINT' }
  | { type: 'WIN' };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'MOVE': {
      const { vehicleId, dx, dy } = action;
      const vehicle = state.vehicles.find((v) => v.id === vehicleId);
      if (!vehicle || state.solved || state.paused) return state;

      // Validate the slide is allowed
      const dir = dx !== 0 ? (dx > 0 ? 1 : -1) : (dy > 0 ? 1 : -1);
      const steps = Math.abs(dx || dy);
      const allowed = maxSlide(vehicle, dir as -1 | 1, state.vehicles);
      if (steps > allowed || steps === 0) return state;

      // Record the pre-move position for undo
      const record = makeMoveRecord(vehicle);
      const newVehicles = applyMove(state.vehicles, vehicleId, dx, dy);
      const solved = checkWin(newVehicles);

      return {
        ...state,
        vehicles: newVehicles,
        moves: state.moves + 1,
        history: [...state.history, record],
        solved,
        hintVehicleId: null,
        hintDirection: null,
      };
    }

    case 'UNDO': {
      if (state.history.length === 0 || state.solved) return state;
      const { vehicles, history } = undoMove(state.vehicles, state.history);
      return {
        ...state,
        vehicles,
        history,
        moves: state.moves > 0 ? state.moves - 1 : 0,
        hintVehicleId: null,
        hintDirection: null,
      };
    }

    case 'PAUSE':
      return { ...state, paused: true };

    case 'RESUME':
      return { ...state, paused: false };

    case 'NEW_LEVEL': {
      return {
        ...state,
        vehicles: initVehicles(action.level),
        moves: 0,
        solved: false,
        paused: false,
        hintsUsed: 0,
        history: [],
        hintVehicleId: null,
        hintDirection: null,
        currentLevel: action.level,
        difficulty: action.level.difficulty,
      };
    }

    case 'HINT':
      return {
        ...state,
        hintsUsed: state.hintsUsed + 1,
        hintVehicleId: action.vehicleId,
        hintDirection: action.direction,
      };

    case 'CLEAR_HINT':
      return { ...state, hintVehicleId: null, hintDirection: null };

    case 'WIN':
      return { ...state, solved: true };

    default:
      return state;
  }
}

// ─── Initial state builder ────────────────────────────────────────────────────

function makeInitialState(level: Level): State {
  return {
    vehicles: initVehicles(level),
    moves: 0,
    solved: false,
    paused: false,
    hintsUsed: 0,
    history: [],
    hintVehicleId: null,
    hintDirection: null,
    currentLevel: level,
    difficulty: level.difficulty,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameState(initialLevel: Level) {
  const [state, dispatch] = useReducer(reducer, initialLevel, makeInitialState);

  /** Try to slide a vehicle. Returns true if the move was valid. */
  const moveVehicle = useCallback(
    (vehicleId: string, dx: number, dy: number): boolean => {
      const vehicle = state.vehicles.find((v) => v.id === vehicleId);
      if (!vehicle) return false;

      const dir = dx !== 0 ? (dx > 0 ? 1 : -1) : (dy > 0 ? 1 : -1);
      const steps = Math.abs(dx || dy);
      const allowed = maxSlide(vehicle, dir as -1 | 1, state.vehicles);
      if (steps === 0 || steps > allowed) return false;

      dispatch({ type: 'MOVE', vehicleId, dx, dy });
      return true;
    },
    [state.vehicles]
  );

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);

  /** Loads a new level by id. */
  const loadLevel = useCallback((level: Level) => {
    dispatch({ type: 'NEW_LEVEL', level });
  }, []);

  /** Loads the next level in the current difficulty (loops around). */
  const nextLevel = useCallback(() => {
    const levels = LEVELS_BY_DIFFICULTY[state.difficulty];
    const idx = levels.findIndex((l) => l.id === state.currentLevel.id);
    const next = levels[(idx + 1) % levels.length];
    dispatch({ type: 'NEW_LEVEL', level: next });
  }, [state.difficulty, state.currentLevel.id]);

  /** Resets the current level. */
  const restartLevel = useCallback(() => {
    dispatch({ type: 'NEW_LEVEL', level: state.currentLevel });
  }, [state.currentLevel]);

  /** Computes and shows the next hint. */
  const showHint = useCallback(() => {
    const hint = getHint(state.vehicles);
    if (!hint) return;
    const dir = hint.dx !== 0 ? (hint.dx > 0 ? 1 : -1) : (hint.dy > 0 ? 1 : -1);
    dispatch({ type: 'HINT', vehicleId: hint.vehicleId, direction: dir as -1 | 1 });

    // Auto-clear the hint after 2 seconds
    setTimeout(() => dispatch({ type: 'CLEAR_HINT' }), 2000);
  }, [state.vehicles]);

  return {
    state,
    moveVehicle,
    undo,
    pause,
    resume,
    loadLevel,
    nextLevel,
    restartLevel,
    showHint,
  };
}
