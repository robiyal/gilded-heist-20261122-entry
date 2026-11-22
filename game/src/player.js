// GILDED — the thief: hooded, quick, quiet when it matters.
// WASD/arrows move, SHIFT sneaks, SPACE sprints (loud), E interacts or hides.
import { TUNING, VIEW_W, VIEW_H, WALL, clamp, dist } from './config.js';
import { pointInRect, distToRect, resolveCircleRect, solidRects } from './world.js';

export function makeThief(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    r: 13,
    angle: 0,
    sneaking: false,
    sprinting: false,
    hidden: false,
    moving: false,
    walkPhase: 0,
    grabT: 0,
    grabbing: null,
    noise: null,
  };
}

export function updateThief(thief, dt, input, room, game) {
  const left = input.keys.has('KeyA') || input.keys.has('ArrowLeft');
  const right = input.keys.has('KeyD') || input.keys.has('ArrowRight');
  const up = input.keys.has('KeyW') || input.keys.has('ArrowUp');
  const down = input.keys.has('KeyS') || input.keys.has('ArrowDown');
  thief.sneaking = input.keys.has('ShiftLeft') || input.keys.has('ShiftRight');
  thief.sprinting =
    (input.keys.has('Space')) && !thief.sneaking && (left || right || up || down);

  let mx = (right ? 1 : 0) - (left ? 1 : 0);
  let my = (down ? 1 : 0) - (up ? 1 : 0);
  const len = Math.hypot(mx, my);
  thief.moving = len > 0;
  if (len > 0) {
    mx /= len;
    my /= len;
    const speed = thief.sprinting ? TUNING.sprintSpeed : thief.sneaking ? TUNING.sneakSpeed : TUNING.walkSpeed;
    thief.x += mx * speed * dt;
    thief.y += my * speed * dt;
    thief.angle = Math.atan2(my, mx);
    thief.walkPhase += dt * (speed / 12);
    // Sprinting is loud: guards nearby come to look.
    thief.noise = thief.sprinting ? { x: thief.x, y: thief.y } : null;
  } else {
    thief.noise = null;
  }

  // Stay inside the room and out of solid cover. The top clamp keeps the
  // thief fully below the HUD top bar (58px) instead of hiding under it.
  thief.x = clamp(thief.x, WALL + thief.r, VIEW_W - WALL - thief.r);
  thief.y = clamp(thief.y, 58 + thief.r, VIEW_H - WALL - thief.r);
  for (const rect of solidRects(room)) {
    const p = resolveCircleRect(thief.x, thief.y, thief.r, rect);
    thief.x = p.x;
    thief.y = p.y;
  }

  // Hiding: standing in a hide zone makes the thief invisible to cones.
  thief.hidden = false;
  for (const z of room.hideZones) {
    if (pointInRect(thief.x, thief.y, z)) {
      thief.hidden = true;
      break;
    }
  }

  // Loot grab channel: stay close to the case and the grab completes;
  // walk away and it cancels.
  if (thief.grabbing) {
    const target = thief.grabbing;
    if (distToRect(thief.x, thief.y, target.rect) > 64) {
      thief.grabbing = null;
      thief.grabT = 0;
    } else {
      thief.grabT += dt;
      if (thief.grabT >= TUNING.lootGrabSeconds) {
        game.collectLoot(target);
        thief.grabbing = null;
        thief.grabT = 0;
      }
    }
  }
  return thief;
}

// What can the thief interact with right now? (E key / on-screen prompt)
export function nearestInteractable(thief, room, game) {
  if (thief.grabbing) return { kind: 'grabbing', label: 'GRABBING…' };
  for (const c of game.cases) {
    if (!c.taken && distToRect(thief.x, thief.y, c.rect) < 42) {
      return { kind: 'loot', label: 'E — GRAB ' + c.name, target: c };
    }
  }
  if (room.ropeGate && !game.ropeOpen) {
    const g = room.ropeGate;
    const cx = g.x + g.w / 2;
    const cy = g.y + g.h / 2;
    if (dist(thief.x, thief.y, cx, cy) < TUNING.lockpickRange + 30) {
      return { kind: 'rope', label: 'E — LOCKPICK THE ROPE GATE (2 COINS)', target: g };
    }
  }
  const e = room.exit;
  if (thief.x > e.x - 40 && thief.y > e.y - 20 && thief.y < e.y + e.h + 20) {
    if (game.lootTakenThisRoom >= room.needLoot) {
      return { kind: 'exit', label: 'E — ' + (room.id === 3 ? 'MAKE THE GETAWAY' : 'ENTER ' + e.label) };
    }
    return { kind: 'exit-locked', label: 'NEED ' + room.needLoot + ' LOOT TO OPEN THE EXIT' };
  }
  if (thief.hidden) return { kind: 'hidden', label: 'HIDDEN — CONES CANNOT SEE YOU' };
  return null;
}
