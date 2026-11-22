// GILDED — wall cameras: a sweeping cone, a fair warning, then a spot.
// A camera never spots instantly: it flashes amber and beeps for a beat first,
// so the thief can break line of sight. An EMP freezes it for eight seconds.
import { TUNING, angleDelta, clamp, dist } from './config.js';
import { losBlocked, losBlockedBySmoke } from './world.js';

export function makeCamera(def, index) {
  return {
    name: def.name,
    x: def.x,
    y: def.y,
    baseAngle: def.baseAngle,
    sweep: def.sweep,
    angle: def.baseAngle,
    sweepT: index * 1.3,
    state: 'sweep', // sweep | warn | spot | frozen
    warnT: 0,
    frozenT: 0,
    index,
  };
}

export function cameraSeesThief(c, room, thief, smoke) {
  if (thief.hidden) return false;
  const d = dist(c.x, c.y, thief.x, thief.y);
  if (d > TUNING.cameraRange) return false;
  const toThief = Math.atan2(thief.y - c.y, thief.x - c.x);
  if (Math.abs(angleDelta(c.angle, toThief)) > TUNING.cameraHalfAngle) return false;
  if (losBlocked(room, c.x, c.y, thief.x, thief.y)) return false;
  if (losBlockedBySmoke(smoke, c.x, c.y, thief.x, thief.y)) return false;
  return true;
}

export function updateCamera(c, dt, room, thief, smoke, alarm, sfx) {
  if (c.frozenT > 0) {
    c.frozenT -= dt;
    if (c.frozenT <= 0) {
      c.frozenT = 0;
      c.state = 'sweep';
    }
    return;
  }
  // Sweep back and forth around the mounting angle.
  c.sweepT += dt;
  c.angle = c.baseAngle + Math.sin(c.sweepT * 0.55) * c.sweep;

  const sees = cameraSeesThief(c, room, thief, smoke);
  if (c.state === 'sweep' && sees) {
    c.state = 'warn';
    c.warnT = 0;
    sfx.warn();
  } else if (c.state === 'warn') {
    if (!sees) {
      c.state = 'sweep';
    } else {
      c.warnT += dt;
      if (c.warnT >= TUNING.cameraWarnSeconds) {
        c.state = 'spot';
        alarm.raise(46, c.name + ' SPOTTED THE THIEF');
        sfx.alert();
      }
    }
  } else if (c.state === 'spot') {
    if (!sees) {
      c.state = 'sweep';
    } else {
      alarm.raise(TUNING.alarmRiseCamera * dt, null);
    }
  }
}

export function freezeCamera(c, seconds) {
  c.frozenT = seconds;
  c.state = 'frozen';
}

export function cameraStateLabel(c) {
  if (c.state === 'frozen') return 'FROZEN ' + Math.ceil(c.frozenT) + 's';
  if (c.state === 'spot') return 'SPOTTED';
  if (c.state === 'warn') return 'WARNING';
  return 'SWEEP';
}

// Nearest camera the thief could EMP, within range and not already frozen.
export function nearestFreezableCamera(cameras, thief) {
  let best = null;
  let bestD = TUNING.empRange;
  for (const c of cameras) {
    if (c.frozenT > 0) continue;
    const d = dist(c.x, c.y, thief.x, thief.y);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}
