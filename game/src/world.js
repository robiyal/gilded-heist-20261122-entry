// GILDED — the museum: three gallery rooms, their walls, cover, routes and loot.
// Each room is one screen (1280x720). Cover shapes the routes: a main hall lane,
// a side passage, and a rope-barrier shortcut a lockpick opens.
import { VIEW_W, VIEW_H, WALL } from './config.js';

// rect: {x, y, w, h} in world pixels. kind drives rendering + blocking.
//   pillar / statue: tall — blocks movement AND line of sight.
//   case / bench: low — blocks movement only (you can be seen over it).
//   rope: thin barrier — blocks movement until a lockpick opens it.
//   plant: decoration — blocks nothing.
function R(x, y, w, h, kind) {
  return { x, y, w, h, kind };
}

export const ROOMS = [
  {
    id: 1,
    name: 'HALL OF MARBLE',
    sub: 'Room 1 — the white hall',
    floor: 'marble',
    spawn: { x: 90, y: 360 },
    exit: { x: VIEW_W - WALL - 10, y: 330, w: 10, h: 90, label: 'EAST WING' },
    walls: [
      R(0, 0, VIEW_W, WALL, 'wall'),
      R(0, VIEW_H - WALL, VIEW_W, WALL, 'wall'),
      R(0, 0, WALL, VIEW_H, 'wall'),
      R(VIEW_W - WALL, 0, WALL, VIEW_H, 'wall'),
    ],
    cover: [
      R(310, 170, 44, 44, 'pillar'),
      R(926, 170, 44, 44, 'pillar'),
      R(310, 506, 44, 44, 'pillar'),
      R(926, 506, 44, 44, 'pillar'),
      R(580, 180, 120, 62, 'case'),
      R(250, 350, 104, 62, 'case'),
      R(926, 350, 104, 62, 'case'),
      R(580, 520, 140, 40, 'bench'),
      R(150, 330, 38, 38, 'statue'),
      R(1092, 330, 38, 38, 'statue'),
      R(520, 96, 240, 10, 'rope'),
      R(120, 620, 60, 60, 'plant'),
      R(1100, 620, 60, 60, 'plant'),
      // Grandfather clock against the east wall (decoration: no collision).
      R(1192, 200, 36, 90, 'clock'),
    ],
    hideZones: [
      { x: 120, y: 300, w: 100, h: 100, label: 'BEHIND THE STATUE' },
      { x: 1060, y: 300, w: 100, h: 100, label: 'BEHIND THE STATUE' },
      { x: 280, y: 140, w: 110, h: 110, label: 'BEHIND THE PILLAR' },
      { x: 890, y: 470, w: 110, h: 110, label: 'BEHIND THE PILLAR' },
    ],
    loot: [
      { id: 'scarab', name: 'GOLDEN SCARAB', value: 400, x: 640, y: 211, caseIndex: 4 },
      { id: 'chalice', name: 'SILVER CHALICE', value: 350, x: 302, y: 381, caseIndex: 5 },
    ],
    coins: [
      { x: 200, y: 120, taken: false },
      { x: 1080, y: 120, taken: false },
      { x: 640, y: 640, taken: false },
      { x: 1150, y: 600, taken: false },
    ],
    guards: [
      {
        name: 'MARCO', color: '#1f2a5e', initial: 'M', hat: 'peaked', scale: 1.08, build: 1.05,
        waypoints: [
          { x: 420, y: 300 }, { x: 640, y: 300 }, { x: 860, y: 300 },
          { x: 860, y: 470 }, { x: 640, y: 470 }, { x: 420, y: 470 },
        ],
      },
      {
        name: 'LENA', color: '#1e5e52', initial: 'L', hat: 'bun', scale: 0.97, build: 0.92,
        waypoints: [
          { x: 1080, y: 140 }, { x: 1080, y: 580 }, { x: 960, y: 580 }, { x: 960, y: 140 },
        ],
      },
    ],
    cameras: [
      { x: 640, y: 72, baseAngle: Math.PI / 2, sweep: 1.15, name: 'CAM 1' },
    ],
    lamps: [
      { x: 332, y: 192 }, { x: 948, y: 192 }, { x: 332, y: 528 }, { x: 948, y: 528 },
    ],
    ropeGate: { x: 520, y: 96, w: 240, h: 10, label: 'ROPE BARRIER — LOCKPICK TO OPEN' },
    needLoot: 1,
  },
  {
    id: 2,
    name: 'GOLD GALLERY',
    sub: 'Room 2 — the green gallery',
    floor: 'carpet',
    spawn: { x: 90, y: 360 },
    exit: { x: VIEW_W - WALL - 10, y: 330, w: 10, h: 90, label: 'THE VAULT' },
    walls: [
      R(0, 0, VIEW_W, WALL, 'wall'),
      R(0, VIEW_H - WALL, VIEW_W, WALL, 'wall'),
      R(0, 0, WALL, VIEW_H, 'wall'),
      R(VIEW_W - WALL, 0, WALL, VIEW_H, 'wall'),
    ],
    cover: [
      R(300, 150, 46, 46, 'pillar'),
      R(934, 150, 46, 46, 'pillar'),
      R(300, 524, 46, 46, 'pillar'),
      R(934, 524, 46, 46, 'pillar'),
      R(560, 150, 160, 64, 'case'),
      R(240, 330, 110, 64, 'case'),
      R(930, 330, 110, 64, 'case'),
      R(560, 500, 160, 64, 'case'),
      R(620, 300, 40, 40, 'statue'),
      R(160, 130, 38, 38, 'statue'),
      R(1080, 560, 38, 38, 'statue'),
      R(430, 600, 150, 10, 'rope'),
      R(700, 80, 150, 40, 'bench'),
      R(180, 620, 60, 60, 'plant'),
      R(1040, 100, 60, 60, 'plant'),
      // Chandelier over the gallery (decoration: hangs from the ceiling).
      R(632, 87, 56, 56, 'chandelier'),
    ],
    hideZones: [
      { x: 130, y: 100, w: 100, h: 100, label: 'BEHIND THE STATUE' },
      { x: 1050, y: 530, w: 100, h: 100, label: 'BEHIND THE STATUE' },
      { x: 590, y: 270, w: 100, h: 100, label: 'BEHIND THE STATUE' },
    ],
    loot: [
      { id: 'idol', name: 'EMERALD IDOL', value: 600, x: 640, y: 182, caseIndex: 4 },
      { id: 'crown', name: 'RUBY CROWN', value: 800, x: 640, y: 532, caseIndex: 7 },
    ],
    coins: [
      { x: 200, y: 640, taken: false },
      { x: 1080, y: 90, taken: false },
      { x: 640, y: 90, taken: false },
      { x: 1150, y: 360, taken: false },
    ],
    guards: [
      {
        name: 'OTTO', color: '#6e2440', initial: 'O', hat: 'peaked', scale: 1.06, build: 1.0,
        waypoints: [
          { x: 400, y: 260 }, { x: 640, y: 260 }, { x: 880, y: 260 },
          { x: 880, y: 460 }, { x: 640, y: 460 }, { x: 400, y: 460 },
        ],
      },
      {
        name: 'SANA', color: '#5e5a17', initial: 'S', hat: 'bun', scale: 0.94, build: 0.9,
        waypoints: [
          { x: 200, y: 200 }, { x: 200, y: 520 }, { x: 340, y: 520 }, { x: 340, y: 200 },
        ],
      },
      {
        name: 'IVAN', color: '#3a4552', initial: 'I', hat: 'flat', scale: 1.05, build: 1.1,
        waypoints: [
          { x: 1080, y: 220 }, { x: 1080, y: 500 }, { x: 960, y: 500 }, { x: 960, y: 220 },
        ],
      },
    ],
    cameras: [
      { x: 420, y: 72, baseAngle: Math.PI / 2, sweep: 0.95, name: 'CAM 2' },
      { x: 1060, y: VIEW_H - WALL - 6, baseAngle: -Math.PI / 2, sweep: 0.95, name: 'CAM 3' },
    ],
    lamps: [
      { x: 323, y: 173 }, { x: 957, y: 173 }, { x: 323, y: 547 }, { x: 957, y: 547 },
      // The chandelier's own pool, top-centre of the gallery.
      { x: 660, y: 115 },
    ],
    ropeGate: { x: 430, y: 600, w: 150, h: 10, label: 'ROPE BARRIER — LOCKPICK TO OPEN' },
    needLoot: 1,
  },
  {
    id: 3,
    name: 'THE VAULT',
    sub: 'Room 3 — the steel vault',
    floor: 'steel',
    spawn: { x: 90, y: 360 },
    exit: { x: VIEW_W - WALL - 10, y: 315, w: 10, h: 120, label: 'GETAWAY' },
    walls: [
      R(0, 0, VIEW_W, WALL, 'wall'),
      R(0, VIEW_H - WALL, VIEW_W, WALL, 'wall'),
      R(0, 0, WALL, VIEW_H, 'wall'),
      R(VIEW_W - WALL, 0, WALL, VIEW_H, 'wall'),
    ],
    cover: [
      R(340, 160, 48, 48, 'pillar'),
      R(892, 160, 48, 48, 'pillar'),
      R(340, 512, 48, 48, 'pillar'),
      R(892, 512, 48, 48, 'pillar'),
      R(560, 170, 160, 66, 'case'),
      R(240, 340, 110, 66, 'case'),
      R(930, 340, 110, 66, 'case'),
      R(560, 500, 160, 66, 'case'),
      R(640, 320, 42, 42, 'statue'),
      R(150, 560, 38, 38, 'statue'),
      R(1090, 150, 38, 38, 'statue'),
      R(200, 90, 200, 10, 'rope'),
      R(880, 620, 200, 10, 'rope'),
      R(1100, 620, 60, 60, 'plant'),
      // Brass safe-dial medallion on the north wall (decoration).
      R(756, 48, 48, 48, 'dial'),
    ],
    hideZones: [
      { x: 120, y: 530, w: 100, h: 100, label: 'BEHIND THE STATUE' },
      { x: 1060, y: 120, w: 100, h: 100, label: 'BEHIND THE STATUE' },
      { x: 610, y: 290, w: 100, h: 100, label: 'BEHIND THE STATUE' },
    ],
    loot: [
      { id: 'mask', name: 'JADE MASK', value: 900, x: 640, y: 203, caseIndex: 4 },
      { id: 'diamond', name: 'VAULT DIAMOND', value: 1500, x: 640, y: 533, caseIndex: 7 },
    ],
    coins: [
      { x: 200, y: 200, taken: false },
      { x: 1080, y: 520, taken: false },
      { x: 640, y: 90, taken: false },
      { x: 640, y: 640, taken: false },
      { x: 1150, y: 280, taken: false },
    ],
    guards: [
      {
        name: 'PETRA', color: '#4a235a', initial: 'P', hat: 'bun', scale: 1.0, build: 1.0,
        waypoints: [
          { x: 430, y: 280 }, { x: 640, y: 280 }, { x: 850, y: 280 },
          { x: 850, y: 450 }, { x: 640, y: 450 }, { x: 430, y: 450 },
        ],
      },
      {
        name: 'KOVAC', color: '#565664', initial: 'K', hat: 'campaign', scale: 1.12, build: 1.15,
        waypoints: [
          { x: 220, y: 180 }, { x: 220, y: 540 }, { x: 360, y: 540 }, { x: 360, y: 180 },
        ],
      },
      {
        name: 'MIRA', color: '#1d4a2c', initial: 'M', hat: 'flat', scale: 0.95, build: 0.92,
        waypoints: [
          { x: 1060, y: 200 }, { x: 1060, y: 520 }, { x: 920, y: 520 }, { x: 920, y: 200 },
        ],
      },
    ],
    cameras: [
      { x: 300, y: 72, baseAngle: Math.PI / 2, sweep: 1.05, name: 'CAM 4' },
      { x: 980, y: 72, baseAngle: Math.PI / 2, sweep: 1.05, name: 'CAM 5' },
    ],
    lamps: [
      { x: 364, y: 184 }, { x: 916, y: 184 }, { x: 364, y: 536 }, { x: 916, y: 536 },
      // Mid-band pools: the vault's middle lane was the darkest stretch.
      { x: 200, y: 360 }, { x: 640, y: 360 }, { x: 1080, y: 360 },
    ],
    ropeGate: { x: 200, y: 90, w: 200, h: 10, label: 'ROPE BARRIER — LOCKPICK TO OPEN' },
    needLoot: 1,
  },
];

// --- geometry helpers (pure, no DOM) ---

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// Distance from a point to the closest point of a rect (0 when inside).
export function distToRect(px, py, r) {
  const cx = Math.max(r.x, Math.min(px, r.x + r.w));
  const cy = Math.max(r.y, Math.min(py, r.y + r.h));
  return Math.hypot(px - cx, py - cy);
}

function segmentHitsRect(x1, y1, x2, y2, r) {
  // Slab test: does the segment cross the rectangle?
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  if (Math.abs(dx) < 1e-9) {
    if (x1 < r.x || x1 > r.x + r.w) return false;
  } else {
    let t1 = (r.x - x1) / dx;
    let t2 = (r.x + r.w - x1) / dx;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  if (Math.abs(dy) < 1e-9) {
    if (y1 < r.y || y1 > r.y + r.h) return false;
  } else {
    let t1 = (r.y - y1) / dy;
    let t2 = (r.y + r.h - y1) / dy;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  return true;
}

// Tall cover (pillar/statue) and walls block sight; low cover does not.
export function losBlocked(room, x1, y1, x2, y2) {
  const blockers = room.walls.concat(room.cover.filter((c) => c.kind === 'pillar' || c.kind === 'statue'));
  for (const b of blockers) {
    if (segmentHitsRect(x1, y1, x2, y2, b)) return true;
  }
  return false;
}

// Smoke clouds also block sight.
export function losBlockedBySmoke(smoke, x1, y1, x2, y2) {
  for (const s of smoke) {
    if (segmentHitsRect(x1, y1, x2, y2, { x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 })) return true;
  }
  return false;
}

export function solidRects(room) {
  // Everything that stops the thief: walls + all cover except plants and
  // ceiling/wall decoration (chandelier, clock, dial hang clear of the floor).
  return room.walls.concat(room.cover.filter((c) => c.kind !== 'plant' && c.kind !== 'chandelier' && c.kind !== 'clock' && c.kind !== 'dial'));
}

// Push a circle out of a rect; returns the corrected position.
export function resolveCircleRect(px, py, r, rect) {
  const cx = Math.max(rect.x, Math.min(px, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(py, rect.y + rect.h));
  const dx = px - cx;
  const dy = py - cy;
  const d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return { x: px, y: py };
  if (d2 < 1e-9) return { x: rect.x + rect.w + r, y: py };
  const d = Math.sqrt(d2);
  return { x: px + (dx / d) * (r - d), y: py + (dy / d) * (r - d) };
}
