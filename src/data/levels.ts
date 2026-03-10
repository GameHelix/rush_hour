import type { Level } from '@/types/game';

/**
 * Rush Hour puzzle definitions — all collision-free, bounds-checked.
 * Grid: 6×6.  x=col(0–5), y=row(0–5).
 * Red car exits rightward through y=2.
 */

type V = Level['vehicles'][number];

const R  = (x: number, y: number): V =>
  ({ id: 'R', x, y, length: 2, orientation: 'horizontal', isTarget: true });
const h  = (id: string, x: number, y: number, len: 2 | 3 = 2): V =>
  ({ id, x, y, length: len, orientation: 'horizontal', isTarget: false });
const vv = (id: string, x: number, y: number, len: 2 | 3 = 2): V =>
  ({ id, x, y, length: len, orientation: 'vertical',   isTarget: false });

// ─── Easy ────────────────────────────────────────────────────────────────────

const EASY_LEVELS: Level[] = [
  // E1 — . . . . . .   A down → R exits                (2 moves)
  //      . . . . . .
  //      R─R A . . .  →
  //          A
  { id:1, difficulty:'easy', name:'First Steps', optimalMoves:2,
    vehicles:[R(0,2), vv('A',2,2)] },

  // E2 — A down, B up/down → R exits                   (3 moves)
  //      R─R A . B .  →
  //          A   B
  { id:2, difficulty:'easy', name:'Double Block', optimalMoves:3,
    vehicles:[R(0,2), vv('A',2,2), vv('B',4,2)] },

  // E3 — . . A . . .  A(2,1–2) blocks x=2, B(3,2–3) blocks x=3
  //      R─R A B . .  →  A up, B up → R exits          (3 moves)
  //          . B
  { id:3, difficulty:'easy', name:'Side Step', optimalMoves:3,
    vehicles:[R(0,2), vv('A',2,1), vv('B',3,2), h('C',0,0)] },

  // E4 — . B─B . . .  B(1,1)H2 blocks A's upward (2,1).
  //      R─R A . C .  B right→(3–4,1), A up, C down→R  (4 moves)
  //          A   C  →
  { id:4, difficulty:'easy', name:'Chain Reaction', optimalMoves:4,
    vehicles:[R(0,2), vv('A',2,2), h('B',1,1), vv('C',4,2), h('D',0,4)] },

  // E5 — C . . . . .  A and D block row 2.              (5 moves)
  //      C . . . B .  B(4,0–1) blocks D from going up.
  //      R─R A . D .  →   B up/down, D up, A down, R exits
  //          A   D
  { id:5, difficulty:'easy', name:'Rush Hour Lite', optimalMoves:5,
    vehicles:[R(0,2), vv('A',2,2), vv('D',4,2), vv('B',4,0), vv('C',0,0), h('E',2,5)] },
];

// ─── Medium ───────────────────────────────────────────────────────────────────

const MEDIUM_LEVELS: Level[] = [
  // M1 — verified: R(0,2)H2  A(2,2)V2  B(4,2)V2  D(2,1)H2  E(4,5)H2  C(0,0)V2  F(5,0)V2
  // Cells: (0,2)(1,2) | (2,2)(2,3) | (4,2)(4,3) | (2,1)(3,1) | (4,5)(5,5) | (0,0)(0,1) | (5,0)(5,1)
  // No overlaps ✓
  { id:6, difficulty:'medium', name:'The Maze Begins', optimalMoves:6,
    vehicles:[R(0,2), vv('A',2,2), vv('B',4,2), h('D',2,1), h('E',4,5), vv('C',0,0), vv('F',5,0)] },

  // M2 — verified: R(0,2)H2  A(3,1)V2  B(4,2)V2  C(0,4)H2  D(5,0)V2  E(0,0)H2  F(2,3)V2
  // Cells: (0,2)(1,2) | (3,1)(3,2) | (4,2)(4,3) | (0,4)(1,4) | (5,0)(5,1) | (0,0)(1,0) | (2,3)(2,4)
  // No overlaps ✓
  { id:7, difficulty:'medium', name:'Gridlock', optimalMoves:7,
    vehicles:[R(0,2), vv('A',3,1), vv('B',4,2), h('C',0,4), vv('D',5,0), h('E',0,0), vv('F',2,3)] },

  // M3 — A is a V3 truck. Verified:
  // R(0,2)H2  A(2,1)V3  B(4,2)V2  C(1,0)H2  D(0,3)V2  E(3,4)H2
  // Cells: (0,2)(1,2) | (2,1)(2,2)(2,3) | (4,2)(4,3) | (1,0)(2,0) | (0,3)(0,4) | (3,4)(4,4)
  // No overlaps ✓
  { id:8, difficulty:'medium', name:'Tangled', optimalMoves:6,
    vehicles:[R(0,2), vv('A',2,1,3), vv('B',4,2), h('C',1,0), vv('D',0,3), h('E',3,4)] },

  // M4 — verified:
  // R(0,2)H2  A(3,2)V2  D(3,0)V2  B(5,1)V2  C(0,4)V2  E(3,5)H2  F(1,3)H2
  // Cells: (0,2)(1,2) | (3,2)(3,3) | (3,0)(3,1) | (5,1)(5,2) | (0,4)(0,5) | (3,5)(4,5) | (1,3)(2,3)
  // No overlaps ✓
  { id:9, difficulty:'medium', name:'Crossroads', optimalMoves:8,
    vehicles:[R(0,2), vv('A',3,2), vv('D',3,0), vv('B',5,1), vv('C',0,4), h('E',3,5), h('F',1,3)] },

  // M5 — A is a V3 truck. Verified:
  // R(0,2)H2  A(2,2)V3  B(4,3)V2  C(3,5)H2  D(0,0)V2  E(3,1)H2  F(5,0)V2
  // Cells: (0,2)(1,2) | (2,2)(2,3)(2,4) | (4,3)(4,4) | (3,5)(4,5) | (0,0)(0,1) | (3,1)(4,1) | (5,0)(5,1)
  // No overlaps ✓
  { id:10, difficulty:'medium', name:'The Bottleneck', optimalMoves:8,
    vehicles:[R(0,2), vv('A',2,2,3), vv('B',4,3), h('C',3,5), vv('D',0,0), h('E',3,1), vv('F',5,0)] },
];

// ─── Hard ────────────────────────────────────────────────────────────────────

const HARD_LEVELS: Level[] = [
  // H1 — verified:
  // R(0,2)H2  A(2,2)V2  B(4,2)V2  C(2,0)H2  D(4,0)V2  E(0,0)V2
  // F(1,3)V2  G(3,4)H2  H(5,3)V2  I(0,5)H2
  // Cells: (0,2)(1,2)|(2,2)(2,3)|(4,2)(4,3)|(2,0)(3,0)|(4,0)(4,1)|(0,0)(0,1)|
  //        (1,3)(1,4)|(3,4)(4,4)|(5,3)(5,4)|(0,5)(1,5)  — no overlaps ✓
  { id:11, difficulty:'hard', name:'Expert Zone', optimalMoves:10,
    vehicles:[R(0,2), vv('A',2,2), vv('B',4,2), h('C',2,0), vv('D',4,0), vv('E',0,0),
              vv('F',1,3), h('G',3,4), vv('H',5,3), h('I',0,5)] },

  // H2 — verified:
  // R(0,2)H2  A(2,1)V2  B(4,1)V2  C(0,0)H2  D(3,0)H2  E(5,0)V3
  // F(1,3)H3  G(3,4)V2  H(0,4)V2  I(4,5)H2
  // Cells: (0,2)(1,2)|(2,1)(2,2)|(4,1)(4,2)|(0,0)(1,0)|(3,0)(4,0)|(5,0)(5,1)(5,2)|
  //        (1,3)(2,3)(3,3)|(3,4)(3,5)|(0,4)(0,5)|(4,5)(5,5)  — no overlaps ✓
  { id:12, difficulty:'hard', name:'Grand Puzzle', optimalMoves:12,
    vehicles:[R(0,2), vv('A',2,1), vv('B',4,1), h('C',0,0), h('D',3,0), vv('E',5,0,3),
              h('F',1,3,3), vv('G',3,4), vv('H',0,4), h('I',4,5)] },

  // H3 — verified:
  // R(0,2)H2  A(3,2)V2  B(5,2)V2  C(2,0)H2  D(4,0)V2  E(0,0)V2
  // F(1,1)H2  G(2,4)H2  H(1,4)V2  I(4,4)H3
  // Cells: (0,2)(1,2)|(3,2)(3,3)|(5,2)(5,3)|(2,0)(3,0)|(4,0)(4,1)|(0,0)(0,1)|
  //        (1,1)(2,1)|(2,4)(3,4)|(1,4)(1,5)|(4,4)(5,4)  — no overlaps ✓
  { id:13, difficulty:'hard', name:'The Gauntlet', optimalMoves:12,
    vehicles:[R(0,2), vv('A',3,2), vv('B',5,2), h('C',2,0), vv('D',4,0), vv('E',0,0),
              h('F',1,1), h('G',2,4), vv('H',1,4), h('I',4,4)] },

  // H4 — verified:
  // R(0,2)H2  A(2,1)V2  B(4,1)V2  C(0,0)H2  D(3,0)H2  E(5,0)V2
  // F(0,3)V2  G(1,3)H3  H(4,3)V2  I(2,5)H2
  // Cells: (0,2)(1,2)|(2,1)(2,2)|(4,1)(4,2)|(0,0)(1,0)|(3,0)(4,0)|(5,0)(5,1)|
  //        (0,3)(0,4)|(1,3)(2,3)(3,3)|(4,3)(4,4)|(2,5)(3,5)  — no overlaps ✓
  { id:14, difficulty:'hard', name:'Nightmare Mode', optimalMoves:14,
    vehicles:[R(0,2), vv('A',2,1), vv('B',4,1), h('C',0,0), h('D',3,0), vv('E',5,0),
              vv('F',0,3), h('G',1,3,3), vv('H',4,3), h('I',2,5)] },

  // H5 — verified:
  // R(0,2)H2  A(2,2)V2  B(4,1)V2  C(0,0)V2  D(1,0)H3  E(4,0)H2
  // F(5,2)V2  G(3,3)H2  H(1,3)V2  I(0,5)H3  J(3,5)H3
  // Cells: (0,2)(1,2)|(2,2)(2,3)|(4,1)(4,2)|(0,0)(0,1)|(1,0)(2,0)(3,0)|(4,0)(5,0)|
  //        (5,2)(5,3)|(3,3)(4,3)|(1,3)(1,4)|(0,5)(1,5)(2,5)|(3,5)(4,5)(5,5)
  // no overlaps ✓
  { id:15, difficulty:'hard', name:'Ultimate Rush', optimalMoves:16,
    vehicles:[R(0,2), vv('A',2,2), vv('B',4,1), vv('C',0,0), h('D',1,0,3), h('E',4,0),
              vv('F',5,2), h('G',3,3), vv('H',1,3), h('I',0,5,3), h('J',3,5,3)] },
];

// ─── Validation ───────────────────────────────────────────────────────────────

function getCells(veh: V): string[] {
  return Array.from({ length: veh.length }, (_, i) =>
    veh.orientation === 'horizontal'
      ? `${veh.x + i},${veh.y}`
      : `${veh.x},${veh.y + i}`
  );
}

export function validateLevel(level: Level): string | null {
  const seen = new Set<string>();
  for (const veh of level.vehicles) {
    for (const cell of getCells(veh)) {
      const [cx, cy] = cell.split(',').map(Number);
      if (cx < 0 || cx > 5 || cy < 0 || cy > 5)
        return `Vehicle ${veh.id} out-of-bounds at (${cx},${cy}) in L${level.id}`;
      if (seen.has(cell))
        return `Collision at (${cell}) in L${level.id}`;
      seen.add(cell);
    }
  }
  return null;
}

function filterValid(levels: Level[]): Level[] {
  return levels.filter(l => {
    const err = validateLevel(l);
    if (err && typeof console !== 'undefined') console.warn('[RushHour]', err);
    return err === null;
  });
}

export const EASY_VALID   = filterValid(EASY_LEVELS);
export const MEDIUM_VALID = filterValid(MEDIUM_LEVELS);
export const HARD_VALID   = filterValid(HARD_LEVELS);

const fallback = EASY_LEVELS.slice(0, 2);

export const LEVELS_BY_DIFFICULTY = {
  easy:   EASY_VALID.length   > 0 ? EASY_VALID   : fallback,
  medium: MEDIUM_VALID.length > 0 ? MEDIUM_VALID : fallback,
  hard:   HARD_VALID.length   > 0 ? HARD_VALID   : fallback,
} as const;

export const ALL_LEVELS = [
  ...LEVELS_BY_DIFFICULTY.easy,
  ...LEVELS_BY_DIFFICULTY.medium,
  ...LEVELS_BY_DIFFICULTY.hard,
];

/** Neon palette — assigned in order to non-target vehicles. */
export const VEHICLE_COLORS = [
  '#00f5d4', '#ffe600', '#a855f7', '#00c9ff',
  '#f97316', '#4ade80', '#fb7185', '#c084fc',
  '#fbbf24', '#34d399', '#38bdf8', '#e879f9',
] as const;
