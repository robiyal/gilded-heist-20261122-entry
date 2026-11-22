// GILDED — loot: artifacts in glass display cases, and the coins that pay for tools.
// A case holds one artifact. Grab it with E (a short channel); the exit of a
// room opens once the room's loot requirement is met.
import { dist } from './config.js';

export function makeCases(room) {
  return room.loot.map((l) => ({
    id: l.id,
    name: l.name,
    value: l.value,
    x: l.x,
    y: l.y,
    caseIndex: l.caseIndex,
    // The glass case itself: grabs are measured to this rect, not the centre,
    // so the thief can grab while standing at any side of a wide case.
    rect: room.cover[l.caseIndex],
    taken: false,
  }));
}

export function makeCoins(room) {
  return room.coins.map((c) => ({ x: c.x, y: c.y, taken: false, bob: c.x * 0.7 + c.y * 0.3 }));
}

// Coins the thief walks over are picked up automatically.
export function collectCoins(game) {
  for (const c of game.coinList) {
    if (!c.taken && dist(game.thief.x, game.thief.y, c.x, c.y) < 30) {
      c.taken = true;
      game.coins += 1;
      game.sfx.coin();
      game.flash('+1 COIN');
    }
  }
}

export function lootTakenCount(game) {
  return game.cases.filter((c) => c.taken).length;
}

export function lootValueTotal(game) {
  return game.lootStolen.reduce((sum, l) => sum + l.value, 0);
}
