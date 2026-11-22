// GILDED — tools at a cost: every use spends coins, and coins are limited.
//   1 — EMP: freezes the nearest camera for 8 seconds.
//   2 — Smoke bomb: a cloud that blocks every line of sight for 6 seconds.
//   3 — Lockpick: opens the rope-gate shortcut.
// Using a tool you cannot afford flashes a warning instead of firing.
import { TUNING, dist } from './config.js';
import { freezeCamera, nearestFreezableCamera } from './cameras.js';

export const TOOL_DEFS = [
  { key: '1', id: 'emp', name: 'EMP', cost: TUNING.empCost, desc: 'Freeze nearest camera 8s' },
  { key: '2', id: 'smoke', name: 'SMOKE', cost: TUNING.smokeCost, desc: 'Break line of sight 6s' },
  { key: '3', id: 'lockpick', name: 'LOCKPICK', cost: TUNING.lockpickCost, desc: 'Open the rope gate' },
];

export function useTool(game, toolId) {
  const def = TOOL_DEFS.find((t) => t.id === toolId);
  if (!def) return false;
  if (game.coins < def.cost) {
    game.flash('NEED ' + def.cost + ' COINS FOR ' + def.name + ' — YOU HAVE ' + game.coins);
    game.sfx.deny();
    return false;
  }
  if (toolId === 'emp') {
    const cam = nearestFreezableCamera(game.cameras, game.thief);
    if (!cam) {
      game.flash('NO CAMERA IN EMP RANGE');
      game.sfx.deny();
      return false;
    }
    game.coins -= def.cost;
    freezeCamera(cam, TUNING.empFreezeSeconds);
    game.flash('EMP FIRED — ' + cam.name + ' FROZEN ' + TUNING.empFreezeSeconds + 's');
    game.sfx.emp();
    return true;
  }
  if (toolId === 'smoke') {
    game.coins -= def.cost;
    game.smoke.push({ x: game.thief.x, y: game.thief.y, r: TUNING.smokeRadius, t: TUNING.smokeSeconds });
    game.flash('SMOKE OUT — CONES CANNOT SEE THROUGH IT');
    game.sfx.smoke();
    return true;
  }
  if (toolId === 'lockpick') {
    const gate = game.room.ropeGate;
    if (game.ropeOpen || !gate) {
      game.flash('NO LOCKED GATE HERE');
      game.sfx.deny();
      return false;
    }
    const cx = gate.x + gate.w / 2;
    const cy = gate.y + gate.h / 2;
    if (dist(game.thief.x, game.thief.y, cx, cy) > TUNING.lockpickRange + 30) {
      game.flash('GET CLOSER TO THE ROPE GATE');
      game.sfx.deny();
      return false;
    }
    game.coins -= def.cost;
    game.ropeOpen = true;
    // Remove the rope from the room's cover so the shortcut is walkable.
    game.room.cover = game.room.cover.filter((c) => c.kind !== 'rope');
    game.flash('GATE OPEN — SHORTCUT UNLOCKED');
    game.sfx.pick();
    return true;
  }
  return false;
}

export function updateSmoke(game, dt) {
  for (const s of game.smoke) s.t -= dt;
  game.smoke = game.smoke.filter((s) => s.t > 0);
}
