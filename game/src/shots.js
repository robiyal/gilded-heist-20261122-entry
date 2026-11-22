// GILDED — staged shots: deterministic scenes for screenshots/.
// Each shot freezes the game in a composed state — real renders of the game's
// own code, with the thief, guards, cones, cameras, loot and alarm all in frame.
//   ?shot=action   Room 2, dense: thief, two guards, a sweeping camera, loot.
//   ?shot=spotted  Room 1, camera spotted the thief, a guard chasing.
//   ?shot=hidden   Room 3, thief hidden, a camera searching.
//   ?shot=getaway  The Ghost-rank getaway screen with the route map.
import { TUNING } from './config.js';

export const SHOT_NAMES = ['action', 'spotted', 'hidden', 'getaway'];

export function applyShot(game, name) {
  game.staged = { name, t: 4.2 };
  if (name === 'action') stageAction(game);
  else if (name === 'spotted') stageSpotted(game);
  else if (name === 'hidden') stageHidden(game);
  else if (name === 'getaway') stageGetaway(game);
  else game.staged = null;
}

function stageAction(game) {
  game.loadRoom(1);
  game.mode = 'play';
  game.thief.x = 560;
  game.thief.y = 330;
  game.thief.angle = Math.PI / 4;
  game.coins = 5;
  game.time = 84;
  game.alarm.value = 35;
  game.alarm.state = 'alert';
  // One artifact already lifted; the second glints in its case.
  game.cases[0].taken = true;
  game.lootStolen.push({ name: 'EMERALD IDOL', value: 600 });
  game.lootTakenThisRoom = 1;
  game.score = 600;
  // Guards mid-patrol, cones sweeping across the gallery.
  const g0 = game.guards[0];
  g0.x = 470; g0.y = 300; g0.angle = 0.5; g0.suspicion = 42; g0.state = 'suspicious';
  const g1 = game.guards[1];
  g1.x = 300; g1.y = 470; g1.angle = -1.2; g1.suspicion = 0; g1.state = 'patrol';
  const g2 = game.guards[2];
  g2.x = 1000; g2.y = 260; g2.angle = 2.4; g2.suspicion = 0; g2.state = 'patrol';
  // Cameras mid-sweep, cones crossing the runner.
  game.cameras[0].angle = 1.1;
  game.cameras[1].angle = -1.9;
  game.prompt = 'E — GRAB RUBY CROWN';
}

function stageSpotted(game) {
  game.loadRoom(0);
  game.mode = 'play';
  game.thief.x = 700;
  game.thief.y = 420;
  game.thief.angle = Math.PI;
  game.coins = 3;
  game.time = 61;
  game.spottedCount = 1;
  game.alarm.value = 72;
  game.alarm.state = 'alert';
  game.alarm.lastReason = 'CAM 1 SPOTTED THE THIEF';
  game.score = 400;
  game.lootStolen.push({ name: 'GOLDEN SCARAB', value: 400 });
  game.lootTakenThisRoom = 1;
  // The camera has the thief dead-centre, mid-warning flash.
  const cam = game.cameras[0];
  cam.angle = Math.atan2(game.thief.y - cam.y, game.thief.x - cam.x);
  cam.state = 'spot';
  // Marco is chasing, Lena closing from the east.
  const g0 = game.guards[0];
  g0.x = 560; g0.y = 380; g0.angle = 0.4; g0.suspicion = 100; g0.state = 'chase';
  g0.lastSeen = { x: game.thief.x, y: game.thief.y };
  const g1 = game.guards[1];
  g1.x = 940; g1.y = 420; g1.angle = Math.PI; g1.suspicion = 60; g1.state = 'suspicious';
  game.prompt = 'BREAK LINE OF SIGHT!';
}

function stageHidden(game) {
  game.loadRoom(2);
  game.mode = 'play';
  // The thief is tucked behind the statue in the south-west hide zone.
  game.thief.x = 170;
  game.thief.y = 580;
  game.thief.angle = 0;
  game.thief.hidden = true;
  game.coins = 6;
  game.time = 190;
  game.spottedCount = 1;
  game.alarm.value = 18;
  game.alarm.state = 'calm';
  game.score = 1700;
  game.lootStolen.push({ name: 'JADE MASK', value: 900 });
  game.lootStolen.push({ name: 'EMERALD IDOL', value: 600 });
  game.lootTakenThisRoom = 1;
  // Cameras sweep the empty vault; Petra searches the last seen spot.
  game.cameras[0].angle = 1.6;
  game.cameras[1].angle = 0.6;
  const g0 = game.guards[0];
  g0.x = 640; g0.y = 380; g0.angle = -0.8; g0.suspicion = 20; g0.state = 'search';
  g0.lastSeen = { x: 700, y: 300 };
  const g1 = game.guards[1];
  g1.x = 300; g1.y = 300; g1.angle = 1.8; g1.suspicion = 0; g1.state = 'patrol';
  const g2 = game.guards[2];
  g2.x = 980; g2.y = 380; g2.angle = 2.6; g2.suspicion = 0; g2.state = 'patrol';
  game.prompt = 'HIDDEN — CONES CANNOT SEE YOU';
}

function stageGetaway(game) {
  game.loadRoom(2);
  game.mode = 'getaway';
  game.roomIndex = 2;
  game.coins = 4;
  game.time = 312;
  game.spottedCount = 0;
  game.score = 4800;
  game.lootStolen.push({ name: 'GOLDEN SCARAB', value: 400 });
  game.lootStolen.push({ name: 'EMERALD IDOL', value: 600 });
  game.lootStolen.push({ name: 'RUBY CROWN', value: 800 });
  game.lootStolen.push({ name: 'VAULT DIAMOND', value: 1500 });
  game.lootTakenThisRoom = 2;
  game.alarm.value = 12;
  game.alarm.state = 'calm';
}
