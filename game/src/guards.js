// GILDED — museum guards: waypoint patrols, suspicion, chase and search.
// A guard reads the thief through its vision cone and line of sight; it never
// sees through tall cover, a hidden thief, or a smoke cloud.
import { TUNING, angleDelta, angleLerp, clamp, dist } from './config.js';
import { losBlocked, losBlockedBySmoke } from './world.js';

export function makeGuard(def, index) {
  const wp = def.waypoints[0];
  return {
    name: def.name,
    color: def.color,
    initial: def.initial,
    waypoints: def.waypoints,
    wpIndex: 0,
    x: wp.x,
    y: wp.y,
    angle: 0,
    state: 'patrol', // patrol | suspicious | chase | search
    suspicion: 0,
    pauseT: 0,
    chaseT: 0,
    lostT: 0,
    lastSeen: null,
    searchT: 0,
    walkPhase: index * 1.7,
    index,
  };
}

export function guardSeesThief(g, room, thief, smoke) {
  if (thief.hidden) return false;
  const d = dist(g.x, g.y, thief.x, thief.y);
  const range = TUNING.guardVisionRange * (thief.sneaking ? 0.62 : 1);
  if (d > range) return false;
  const toThief = Math.atan2(thief.y - g.y, thief.x - g.x);
  if (Math.abs(angleDelta(g.angle, toThief)) > TUNING.guardVisionHalfAngle) return false;
  if (losBlocked(room, g.x, g.y, thief.x, thief.y)) return false;
  if (losBlockedBySmoke(smoke, g.x, g.y, thief.x, thief.y)) return false;
  return true;
}

// Noise (a sprinting thief) pulls a patrolling guard to investigate.
export function guardHearsNoise(g, room, thief, noise) {
  if (!noise) return false;
  if (g.state !== 'patrol') return false;
  return dist(g.x, g.y, noise.x, noise.y) < TUNING.noiseSprintRadius;
}

export function updateGuard(g, dt, room, thief, smoke, alarm, sfx) {
  const sees = guardSeesThief(g, room, thief, smoke);
  const speed = g.state === 'chase' ? TUNING.guardChaseSpeed : TUNING.guardPatrolSpeed;

  if (sees) {
    g.lastSeen = { x: thief.x, y: thief.y };
    const closeness = 1 - dist(g.x, g.y, thief.x, thief.y) / TUNING.guardVisionRange;
    g.suspicion = clamp(g.suspicion + TUNING.alarmRiseGuard * (0.7 + closeness) * dt, 0, 100);
    g.lostT = 0;
    if (g.suspicion >= 100 && g.state !== 'chase') {
      g.state = 'chase';
      g.chaseT = 0;
      alarm.raise(34, 'GUARD SPOTTED THE THIEF');
      sfx.alert();
    } else if (g.suspicion > 35 && g.state === 'patrol') {
      g.state = 'suspicious';
    }
  } else {
    g.suspicion = clamp(g.suspicion - 26 * dt, 0, 100);
    if (g.state === 'suspicious' && g.suspicion <= 5) g.state = 'patrol';
    if (g.state === 'chase') {
      g.lostT += dt;
      if (g.lostT > 3) {
        g.state = 'search';
        g.searchT = 0;
      }
    }
  }

  if (g.state === 'chase') {
    g.chaseT += dt;
    // Chase the last seen position; re-aim while the thief is visible.
    const tx = sees ? thief.x : g.lastSeen.x;
    const ty = sees ? thief.y : g.lastSeen.y;
    moveToward(g, tx, ty, speed, dt);
    if (dist(g.x, g.y, thief.x, thief.y) < TUNING.catchDistance && !thief.hidden) {
      return 'caught';
    }
  } else if (g.state === 'search' && g.lastSeen) {
    moveToward(g, g.lastSeen.x, g.lastSeen.y, speed, dt);
    g.searchT += dt;
    if (dist(g.x, g.y, g.lastSeen.x, g.lastSeen.y) < 14 || g.searchT > 6) {
      g.state = 'patrol';
      g.suspicion = 0;
    }
  } else {
    // Patrol: walk the waypoint loop, pausing briefly at each stop.
    if (g.pauseT > 0) {
      g.pauseT -= dt;
    } else {
      const target = g.waypoints[g.wpIndex];
      const d = dist(g.x, g.y, target.x, target.y);
      if (d < 10) {
        g.wpIndex = (g.wpIndex + 1) % g.waypoints.length;
        g.pauseT = 0.7;
      } else {
        moveToward(g, target.x, target.y, speed, dt);
      }
    }
  }
  return null;
}

function moveToward(g, tx, ty, speed, dt) {
  const d = dist(g.x, g.y, tx, ty);
  if (d < 1) return;
  const step = Math.min(d, speed * dt);
  const nx = g.x + ((tx - g.x) / d) * step;
  const ny = g.y + ((ty - g.y) / d) * step;
  const targetAngle = Math.atan2(ty - g.y, tx - g.x);
  g.angle = angleLerp(g.angle, targetAngle, Math.min(1, dt * 8));
  g.x = nx;
  g.y = ny;
  g.walkPhase += dt * (speed / 14);
}

export function guardStateLabel(g) {
  if (g.state === 'chase') return 'CHASE';
  if (g.state === 'search') return 'SEARCH';
  if (g.state === 'suspicious') return 'SUSPICIOUS';
  return 'PATROL';
}
