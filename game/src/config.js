// GILDED — shared constants, palette and tuning.
// Marble white / gold / deep green: the museum at midnight, distinct from any train heist.
export const VIEW_W = 1280;
export const VIEW_H = 720;
export const WALL = 26;

export const PALETTE = {
  marbleA: '#e9e4d8',
  marbleB: '#cfc7b4',
  marbleVein: '#b8ad93',
  gold: '#d4a017',
  goldBright: '#f2c94c',
  goldDark: '#8a6a0c',
  green: '#0d3b2e',
  greenDeep: '#082a20',
  greenCarpet: '#14503d',
  greenCarpetDark: '#0e3a2c',
  brass: '#b08d2f',
  steel: '#23282e',
  steelLight: '#39414b',
  steelLine: '#4a545f',
  ink: '#10151a',
  paper: '#f4efe2',
  thief: '#1b1e26',
  thiefTrim: '#f2c94c',
  alarmGreen: '#37c978',
  alarmAmber: '#f2a93b',
  alarmRed: '#e5484d',
  smoke: '#c9cdd4',
};

export const TUNING = {
  walkSpeed: 152,
  sneakSpeed: 86,
  sprintSpeed: 232,
  guardPatrolSpeed: 56,
  guardChaseSpeed: 102,
  guardVisionRange: 235,
  guardVisionHalfAngle: 0.56,
  cameraRange: 265,
  cameraHalfAngle: 0.46,
  cameraWarnSeconds: 0.9,
  alarmRiseGuard: 58,
  alarmRiseCamera: 95,
  alarmDecay: 7,
  alarmChaseAt: 100,
  alarmGraceSeconds: 1.4,
  breakawaySeconds: 4,
  lootGrabSeconds: 0.7,
  empCost: 3,
  empFreezeSeconds: 8,
  empRange: 430,
  smokeCost: 2,
  smokeSeconds: 6,
  smokeRadius: 92,
  lockpickCost: 2,
  lockpickRange: 76,
  catchDistance: 27,
  noiseSprintRadius: 170,
};

// Deterministic RNG so staged shots and smoke tests reproduce exactly.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function dist(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

// Smallest signed angle from a to b, in (-PI, PI].
export function angleDelta(a, b) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

export function angleLerp(a, b, t) {
  return a + angleDelta(a, b) * t;
}
