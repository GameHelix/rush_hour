/**
 * BFS-based Rush Hour solver.
 *
 * Returns the sequence of {vehicleId, dx, dy} moves that leads to a solution,
 * or null if the puzzle is unsolvable (shouldn't happen for well-formed levels).
 *
 * The state is encoded as a compact string (each vehicle's x,y packed together)
 * so the visited set stays small and fast.
 */

import type { Vehicle } from '@/types/game';
import { GRID_SIZE, EXIT_ROW, buildGrid, checkWin } from './gameLogic';

// ─── State Encoding ───────────────────────────────────────────────────────────

/** Canonical sort order: vehicle ids alphabetically */
function encodeState(vehicles: Vehicle[]): string {
  return [...vehicles]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((v) => `${v.id}:${v.x},${v.y}`)
    .join('|');
}

// ─── Move Generation ──────────────────────────────────────────────────────────

interface SolverMove {
  vehicleId: string;
  dx: number;
  dy: number;
}

/**
 * Generates all valid single-step moves from the current vehicle list.
 * Each move slides a vehicle exactly 1 cell in the valid direction(s).
 */
function generateMoves(vehicles: Vehicle[]): Array<{ move: SolverMove; result: Vehicle[] }> {
  const grid = buildGrid(vehicles);
  const results: Array<{ move: SolverMove; result: Vehicle[] }> = [];

  for (const v of vehicles) {
    const dirs: Array<{ dx: number; dy: number }> = v.orientation === 'horizontal'
      ? [{ dx: -1, dy: 0 }, { dx: 1, dy: 0 }]
      : [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }];

    for (const { dx, dy } of dirs) {
      // Try sliding 1, 2, … cells in this direction
      let nx = v.x;
      let ny = v.y;

      for (let step = 1; step <= GRID_SIZE; step++) {
        nx = v.x + dx * step;
        ny = v.y + dy * step;

        // Check the leading edge cell
        const leadX = dx === 1 ? nx + v.length - 1 : nx;
        const leadY = dy === 1 ? ny + v.length - 1 : ny;

        // Out of bounds
        if (leadX < 0 || leadX >= GRID_SIZE || leadY < 0 || leadY >= GRID_SIZE) break;

        // Collision check for the new lead cell
        const cellId = grid[leadY][leadX];
        if (cellId !== null && cellId !== v.id) break;

        // Valid slide — record as a separate BFS node
        const newVehicles = vehicles.map((u) =>
          u.id === v.id ? { ...u, x: nx, y: ny } : u
        );
        results.push({ move: { vehicleId: v.id, dx: dx * step, dy: dy * step }, result: newVehicles });
      }
    }
  }

  return results;
}

// ─── BFS Solver ───────────────────────────────────────────────────────────────

export interface SolutionStep {
  vehicleId: string;
  dx: number;
  dy: number;
}

/**
 * Solves the puzzle using BFS.
 * Returns the full move sequence, or null if unsolvable.
 * Hard cap: 30 moves (guards against infinite loop on invalid puzzles).
 */
export function solve(vehicles: Vehicle[]): SolutionStep[] | null {
  const MAX_MOVES = 30;

  type Node = { vehicles: Vehicle[]; path: SolutionStep[] };

  const queue: Node[] = [{ vehicles, path: [] }];
  const visited = new Set<string>([encodeState(vehicles)]);

  while (queue.length > 0) {
    const node = queue.shift()!;

    if (node.path.length >= MAX_MOVES) continue;

    for (const { move, result } of generateMoves(node.vehicles)) {
      // Check win on the red car's new position
      const target = result.find((v) => v.isTarget)!;
      const path = [...node.path, move];

      // Win condition: target can exit (right edge = GRID_SIZE-1 in EXIT_ROW, path clear)
      if (target.y === EXIT_ROW) {
        const rightEdge = target.x + target.length - 1;
        if (rightEdge === GRID_SIZE - 1) {
          // Verify path is clear
          const grid = buildGrid(result);
          let pathClear = true;
          for (let x = target.x + target.length; x < GRID_SIZE; x++) {
            if (grid[EXIT_ROW][x] !== null) { pathClear = false; break; }
          }
          if (pathClear) return path;
        }
      }

      const key = encodeState(result);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ vehicles: result, path });
      }
    }
  }

  return null;
}

/**
 * Returns just the very next move hint (first step of the BFS solution).
 */
export function getHint(vehicles: Vehicle[]): SolutionStep | null {
  const solution = solve(vehicles);
  return solution && solution.length > 0 ? solution[0] : null;
}
