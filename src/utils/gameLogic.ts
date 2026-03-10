import type { Vehicle, Level, MoveRecord } from '@/types/game';
import { VEHICLE_COLORS } from '@/data/levels';

// ─── Grid Constants ───────────────────────────────────────────────────────────

export const GRID_SIZE = 6; // 6×6 board
export const EXIT_ROW = 2;  // The red car must exit through this row (right side)

// ─── Cell Helpers ─────────────────────────────────────────────────────────────

/**
 * Returns all (x, y) cells occupied by a vehicle.
 */
export function getCells(v: Vehicle): Array<{ x: number; y: number }> {
  const cells: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < v.length; i++) {
    cells.push(
      v.orientation === 'horizontal'
        ? { x: v.x + i, y: v.y }
        : { x: v.x, y: v.y + i }
    );
  }
  return cells;
}

/**
 * Builds a 6×6 occupancy grid.
 * Each cell contains the vehicle id that occupies it, or null.
 */
export function buildGrid(vehicles: Vehicle[]): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null)
  );
  for (const v of vehicles) {
    for (const { x, y } of getCells(v)) {
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        grid[y][x] = v.id;
      }
    }
  }
  return grid;
}

// ─── Move Validation ──────────────────────────────────────────────────────────

/**
 * Returns the maximum number of steps a vehicle can slide in the given direction.
 * direction: -1 (left/up) or +1 (right/down)
 */
export function maxSlide(
  vehicle: Vehicle,
  direction: -1 | 1,
  vehicles: Vehicle[]
): number {
  const grid = buildGrid(vehicles);
  let steps = 0;

  if (vehicle.orientation === 'horizontal') {
    // Moving left (−1) or right (+1) along x
    const leadX =
      direction === 1 ? vehicle.x + vehicle.length - 1 : vehicle.x;
    for (let step = 1; step <= GRID_SIZE; step++) {
      const nx = leadX + direction * step;
      if (nx < 0 || nx >= GRID_SIZE) break;
      if (grid[vehicle.y][nx] !== null) break;
      steps = step;
    }
  } else {
    // Moving up (−1) or down (+1) along y
    const leadY =
      direction === 1 ? vehicle.y + vehicle.length - 1 : vehicle.y;
    for (let step = 1; step <= GRID_SIZE; step++) {
      const ny = leadY + direction * step;
      if (ny < 0 || ny >= GRID_SIZE) break;
      if (grid[ny][vehicle.x] !== null) break;
      steps = step;
    }
  }

  return steps;
}

/**
 * Applies a move and returns the new vehicles array.
 * No mutation — returns a new array.
 */
export function applyMove(
  vehicles: Vehicle[],
  vehicleId: string,
  dx: number, // for horizontal vehicles
  dy: number  // for vertical vehicles
): Vehicle[] {
  return vehicles.map((v) =>
    v.id === vehicleId
      ? { ...v, x: v.x + dx, y: v.y + dy }
      : v
  );
}

// ─── Win Detection ────────────────────────────────────────────────────────────

/**
 * Returns true when the red car's right end is at the last column (x=5)
 * or when the path from its right end to the exit is fully clear.
 */
export function isSolved(vehicles: Vehicle[]): boolean {
  const target = vehicles.find((v) => v.isTarget);
  if (!target) return false;

  // Red car must be in EXIT_ROW and its right edge must have clear path to x=5
  if (target.y !== EXIT_ROW) return false;

  const grid = buildGrid(vehicles);
  const rightEdge = target.x + target.length - 1;

  // Check all cells from rightEdge+1 to the last column
  for (let x = rightEdge + 1; x < GRID_SIZE; x++) {
    if (grid[EXIT_ROW][x] !== null) return false;
  }

  // Target car must be at x=4 or further right (so it can exit)
  return rightEdge >= GRID_SIZE - 1;
}

/**
 * Checks if the puzzle is in a winning state, which includes the red car
 * being able to fully exit (right edge touching or passing column 5).
 */
export function checkWin(vehicles: Vehicle[]): boolean {
  const target = vehicles.find((v) => v.isTarget);
  if (!target) return false;
  if (target.y !== EXIT_ROW) return false;

  const grid = buildGrid(vehicles);
  const rightEdge = target.x + target.length - 1;

  // Check path is clear from target's right side to column 5
  for (let x = rightEdge + 1; x < GRID_SIZE; x++) {
    if (grid[EXIT_ROW][x] !== null) return false;
  }

  return rightEdge === GRID_SIZE - 1;
}

// ─── Level Initialisation ─────────────────────────────────────────────────────

/**
 * Converts a raw Level definition into a playable Vehicle[] with colors.
 * The red car always gets the neon-red color; others cycle through the palette.
 */
export function initVehicles(level: Level): Vehicle[] {
  let colorIdx = 0;
  return level.vehicles.map((raw) => {
    const color = raw.isTarget ? '#ff3366' : VEHICLE_COLORS[colorIdx++ % VEHICLE_COLORS.length];
    return { ...raw, color };
  });
}

// ─── Undo Helpers ─────────────────────────────────────────────────────────────

/**
 * Builds a MoveRecord from the vehicle's current state (snapshot before the move).
 */
export function makeMoveRecord(vehicle: Vehicle): MoveRecord {
  return { vehicleId: vehicle.id, fromX: vehicle.x, fromY: vehicle.y };
}

/**
 * Reverts the last move in history and returns the updated vehicles array
 * together with the remaining history.
 */
export function undoMove(
  vehicles: Vehicle[],
  history: MoveRecord[]
): { vehicles: Vehicle[]; history: MoveRecord[] } {
  if (history.length === 0) return { vehicles, history };
  const last = history[history.length - 1];
  const newVehicles = vehicles.map((v) =>
    v.id === last.vehicleId ? { ...v, x: last.fromX, y: last.fromY } : v
  );
  return { vehicles: newVehicles, history: history.slice(0, -1) };
}
