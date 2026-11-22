// GILDED — the game itself: loop, input, rooms, scoring, and the screens.
// Plain Canvas 2D, no build step, no network. `?shot=<name>` freezes a staged
// scene for screenshots; otherwise the game plays live.
import { VIEW_W, VIEW_H, TUNING, clamp } from './config.js';
import { ROOMS } from './world.js';
import { makeGuard, updateGuard, guardSeesThief, guardHearsNoise } from './guards.js';
import { makeCamera, updateCamera, cameraSeesThief } from './cameras.js';
import { makeThief, updateThief, nearestInteractable } from './player.js';
import { useTool, updateSmoke } from './tools.js';
import { makeCases, makeCoins, collectCoins, lootValueTotal } from './loot.js';
import { makeAlarm, updateAlarm } from './alarm.js';
import { drawGame } from './render.js';
import { drawHUD, drawTitle, drawCaught, drawRoomClear, drawGetaway, drawPaused } from './hud.js';
import { makeAudio } from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = {
  mode: 'title', // title | play | paused | caught | roomclear | getaway
  roomIndex: 0,
  room: null,
  thief: null,
  guards: [],
  cameras: [],
  cases: [],
  coinList: [],
  smoke: [],
  alarm: makeAlarm(),
  coins: 0,
  lootStolen: [],
  lootTakenThisRoom: 0,
  ropeOpen: false,
  time: 0,
  spottedCount: 0,
  score: 0,
  message: '',
  messageT: 0,
  prompt: '',
  caughtReason: '',
  nextRoomName: '',
  roomClearT: 0,
  staged: null,
  objective: '',
  sfx: makeAudio(),
  input: { keys: new Set(), mouse: { x: 0, y: 0, clicked: false } },
  roomEntryLoot: [],
  roomEntryCoins: 0,
};

game.flash = function (text) {
  game.message = text;
  game.messageT = 3.2;
};

game.updateScore = function () {
  const ghostBonus = game.spottedCount === 0 ? 500 : 0;
  const timeBonus = Math.max(0, 600 - Math.floor(game.time)) * 2;
  game.score = lootValueTotal(game) + game.coins * 25 + ghostBonus + timeBonus;
};

game.collectLoot = function (target) {
  target.taken = true;
  game.lootStolen.push({ name: target.name, value: target.value });
  game.lootTakenThisRoom += 1;
  game.sfx.grab();
  game.flash(target.name + ' SECURED — $' + target.value);
  game.updateScore();
};

game.loadRoom = function (index) {
  game.roomIndex = index;
  // Clone the room definition: rope removal and coin state stay per-run.
  game.room = structuredClone(ROOMS[index]);
  game.thief = makeThief(game.room.spawn);
  game.guards = game.room.guards.map((d, i) => makeGuard(d, i));
  game.cameras = game.room.cameras.map((d, i) => makeCamera(d, i));
  game.cases = makeCases(game.room);
  game.coinList = makeCoins(game.room);
  game.smoke = [];
  game.alarm = makeAlarm();
  game.lootTakenThisRoom = 0;
  game.ropeOpen = false;
  game.roomClearT = 0;
  game.objective = 'Lift ' + game.room.needLoot + ' artifact' + (game.room.needLoot > 1 ? 's' : '') +
    ', then reach the ' + game.room.exit.label + '.';
  game.roomEntryLoot = game.lootStolen.slice();
  game.roomEntryCoins = game.coins;
  game.prompt = '';
};

function retryRoom() {
  game.lootStolen = game.roomEntryLoot.slice();
  game.coins = game.roomEntryCoins;
  game.loadRoom(game.roomIndex);
  game.mode = 'play';
  game.flash('ROOM RESET — ' + game.room.name);
  game.updateScore();
}

function advanceRoom() {
  if (game.roomIndex + 1 >= ROOMS.length) {
    game.mode = 'getaway';
    game.updateScore();
    game.sfx.fanfare();
    return;
  }
  game.nextRoomName = ROOMS[game.roomIndex + 1].name;
  game.mode = 'roomclear';
  game.roomClearT = 0;
}

function interact() {
  const it = nearestInteractable(game.thief, game.room, game);
  if (!it) return;
  if (it.kind === 'loot') {
    game.thief.grabbing = it.target;
    game.thief.grabT = 0;
  } else if (it.kind === 'rope') {
    useTool(game, 'lockpick');
  } else if (it.kind === 'exit') {
    advanceRoom();
  } else if (it.kind === 'exit-locked') {
    game.flash(it.label);
    game.sfx.deny();
  }
}

function update(dt) {
  if (game.mode !== 'play') return;
  game.time += dt;
  if (game.messageT > 0) game.messageT -= dt;

  // Remember who was chasing, so a fresh spot counts exactly once.
  const wasChasing = new Set(game.guards.filter((g) => g.state === 'chase').map((g) => g.name));
  const wasSpotted = new Set(game.cameras.filter((c) => c.state === 'spot').map((c) => c.name));

  updateThief(game.thief, dt, game.input, game.room, game);
  if (game.thief.noise) {
    for (const g of game.guards) {
      if (guardHearsNoise(g, game.room, game.thief, game.thief.noise)) {
        g.state = 'suspicious';
        g.lastSeen = { x: game.thief.noise.x, y: game.thief.noise.y };
      }
    }
  }
  let caughtBy = null;
  for (const g of game.guards) {
    const result = updateGuard(g, dt, game.room, game.thief, game.smoke, game.alarm, game.sfx);
    if (result === 'caught') caughtBy = g;
  }
  for (const c of game.cameras) updateCamera(c, dt, game.room, game.thief, game.smoke, game.alarm, game.sfx);
  updateSmoke(game, dt);
  collectCoins(game);

  const anySees = game.guards.some((g) => guardSeesThief(g, game.room, game.thief, game.smoke)) ||
    game.cameras.some((c) => cameraSeesThief(c, game.room, game.thief, game.smoke));
  // Guards and cameras already raised the alarm through alarm.raise; here we
  // only track the decay / stand-down state.
  updateAlarm(game.alarm, dt, anySees, game.sfx);

  for (const g of game.guards) {
    if (g.state === 'chase' && !wasChasing.has(g.name)) {
      game.spottedCount += 1;
      game.flash('SPOTTED BY ' + g.name + '!');
      game.updateScore();
    }
  }
  for (const c of game.cameras) {
    if (c.state === 'spot' && !wasSpotted.has(c.name)) {
      game.spottedCount += 1;
      game.flash('SPOTTED BY ' + c.name + '!');
      game.updateScore();
    }
  }

  if (caughtBy) {
    game.mode = 'caught';
    game.caughtReason = caughtBy.name + ' closed the distance in the ' + game.room.name + '.';
    game.sfx.caught();
    return;
  }

  game.prompt = (nearestInteractable(game.thief, game.room, game) || {}).label || '';
  if (game.input.mouse.clicked) {
    game.input.mouse.clicked = false;
    handleClick(game.input.mouse.x, game.input.mouse.y);
  }
}

function handleClick(x, y) {
  // Tool buttons live in the bottom-left bar; a click there uses the tool.
  const barY = VIEW_H - 64;
  if (y >= barY + 21 && y <= barY + 45) {
    for (let i = 0; i < 3; i++) {
      const bx = 26 + i * 150;
      if (x >= bx && x <= bx + 140) {
        useTool(game, ['emp', 'smoke', 'lockpick'][i]);
        return;
      }
    }
  }
}

function render(time) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawGame(ctx, game, time);
  if (game.mode === 'title') drawTitle(ctx, game, time);
  else if (game.mode === 'caught') { drawHUD(ctx, game, time); drawCaught(ctx, game); }
  else if (game.mode === 'roomclear') { drawHUD(ctx, game, time); drawRoomClear(ctx, game); }
  else if (game.mode === 'getaway') drawGetaway(ctx, game);
  else if (game.mode === 'paused') { drawHUD(ctx, game, time); drawPaused(ctx); }
  else drawHUD(ctx, game, time);
}

let last = performance.now();
let roomClearWait = 0;
function frame(now) {
  const dt = clamp((now - last) / 1000, 0, 0.05);
  last = now;
  const time = game.staged ? game.staged.t : now / 1000;
  if (!game.staged) {
    if (game.mode === 'roomclear') {
      roomClearWait += dt;
      if (roomClearWait > 1.8) {
        roomClearWait = 0;
        game.loadRoom(game.roomIndex + 1);
        game.mode = 'play';
      }
    } else {
      update(dt);
    }
  }
  render(time);
  requestAnimationFrame(frame);
}

// --- input ---

window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  game.sfx.ensure();
  if (e.repeat) return;
  game.input.keys.add(e.code);
  if (e.code === 'Enter' && game.mode === 'title') {
    // Reset the run first, so the room entry snapshot starts clean.
    game.time = 0;
    game.spottedCount = 0;
    game.score = 0;
    game.coins = 0;
    game.lootStolen = [];
    game.loadRoom(0);
    game.mode = 'play';
    game.flash('LIFT THE LOOT. KEEP THE ALARM QUIET.');
  } else if (e.code === 'KeyR' && (game.mode === 'play' || game.mode === 'caught' || game.mode === 'getaway' || game.mode === 'paused')) {
    if (game.mode === 'getaway') {
      game.time = 0;
      game.spottedCount = 0;
      game.score = 0;
      game.coins = 0;
      game.lootStolen = [];
      game.loadRoom(0);
      game.mode = 'title';
    } else {
      retryRoom();
    }
  } else if (e.code === 'Escape' && (game.mode === 'play' || game.mode === 'paused')) {
    game.mode = game.mode === 'play' ? 'paused' : 'play';
  } else if (e.code === 'KeyE' && game.mode === 'play') {
    interact();
  } else if (game.mode === 'play' && e.code === 'Digit1') {
    useTool(game, 'emp');
  } else if (game.mode === 'play' && e.code === 'Digit2') {
    useTool(game, 'smoke');
  } else if (game.mode === 'play' && e.code === 'Digit3') {
    useTool(game, 'lockpick');
  } else if (e.code === 'Enter' && game.mode === 'roomclear') {
    roomClearWait = 99;
  }
});

window.addEventListener('keyup', (e) => {
  game.input.keys.delete(e.code);
});

canvas.addEventListener('pointerdown', (e) => {
  game.sfx.ensure();
  const rect = canvas.getBoundingClientRect();
  game.input.mouse.x = ((e.clientX - rect.left) / rect.width) * VIEW_W;
  game.input.mouse.y = ((e.clientY - rect.top) / rect.height) * VIEW_H;
  game.input.mouse.clicked = true;
});

canvas.addEventListener('pointermove', (e) => {
  const rect = canvas.getBoundingClientRect();
  game.input.mouse.x = ((e.clientX - rect.left) / rect.width) * VIEW_W;
  game.input.mouse.y = ((e.clientY - rect.top) / rect.height) * VIEW_H;
});

// --- boot ---

game.loadRoom(0);
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  applyShot(game, shot);
  if (game.mode === 'getaway') game.sfx.enabled = false;
} else {
  game.mode = 'title';
}

// Debug hook for the smoke test (read-only state + a teleport helper).
window.__gilded = {
  game,
  state() {
    return {
      mode: game.mode,
      room: game.roomIndex + 1,
      alarm: Math.round(game.alarm.value),
      alarmState: game.alarm.state,
      thief: { x: Math.round(game.thief.x), y: Math.round(game.thief.y), hidden: game.thief.hidden },
      guards: game.guards.map((g) => ({ name: g.name, state: g.state, suspicion: Math.round(g.suspicion) })),
      cameras: game.cameras.map((c) => ({ name: c.name, state: c.state, frozen: Math.round(c.frozenT * 10) / 10 })),
      coins: game.coins,
      loot: game.lootStolen.length,
      lootValue: lootValueTotal(game),
      spotted: game.spottedCount,
      score: game.score,
      time: Math.round(game.time),
    };
  },
};

requestAnimationFrame(frame);
