// GILDED — the HUD and the screens: alarm meter, loot, coins, tool buttons,
// the guard list with uniform swatches, and title / caught / getaway screens.
import { PALETTE, VIEW_W, VIEW_H, WALL, mulberry32 } from './config.js';
import { TOOL_DEFS } from './tools.js';
import { alarmColor, alarmLabel } from './alarm.js';
import { guardStateLabel } from './guards.js';
import { lootValueTotal } from './loot.js';

export function drawHUD(ctx, game, time) {
  drawTopBar(ctx, game, time);
  drawToolBar(ctx, game, time);
  drawGuardList(ctx, game);
  drawPrompt(ctx, game);
  drawMessage(ctx, game, time);
  drawHints(ctx, game);
}

function drawTopBar(ctx, game, time) {
  ctx.fillStyle = 'rgba(8,11,15,0.88)';
  ctx.fillRect(0, 0, VIEW_W, 58);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(0, 58, VIEW_W, 2);
  // Room + objective, left.
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.goldBright;
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillText(game.room.name, 16, 24);
  ctx.fillStyle = '#c9cdd4';
  ctx.font = '13px Georgia, serif';
  ctx.fillText(game.objective, 16, 44);
  // Alarm meter, centre.
  const ax = VIEW_W / 2 - 190;
  const aw = 380;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f4efe2';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText('ALARM', VIEW_W / 2, 18);
  ctx.fillStyle = '#1a2027';
  ctx.beginPath();
  ctx.roundRect(ax, 26, aw, 18, 9);
  ctx.fill();
  ctx.fillStyle = alarmColor(game.alarm);
  ctx.beginPath();
  ctx.roundRect(ax, 26, Math.max(18, (aw * game.alarm.value) / 100), 18, 9);
  ctx.fill();
  ctx.strokeStyle = 'rgba(244,239,226,0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(ax, 26, aw, 18, 9);
  ctx.stroke();
  const label = alarmLabel(game.alarm) + '  ' + Math.round(game.alarm.value);
  ctx.fillStyle = game.alarm.value > 55 ? '#ffb3b5' : '#f4efe2';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.fillText(label, VIEW_W / 2, 40);
  if (game.alarm.state === 'alarm') {
    ctx.fillStyle = (Math.floor(time * 4) % 2 === 0) ? '#ff6b6e' : '#f2a93b';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.fillText('BREAK LINE OF SIGHT TO STAND DOWN', VIEW_W / 2, 54);
  }
  // Loot, coins, time, right.
  ctx.textAlign = 'right';
  ctx.fillStyle = PALETTE.goldBright;
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText('◆ $' + lootValueTotal(game) + '  ·  LOOT ' + game.lootStolen.length, VIEW_W - 16, 24);
  ctx.fillStyle = '#f2c94c';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText('¢ ' + game.coins + ' coins', VIEW_W - 16, 44);
  ctx.fillStyle = '#c9cdd4';
  ctx.font = '13px Georgia, serif';
  ctx.fillText(fmtTime(game.time), VIEW_W - 230, 44);
}

function drawToolBar(ctx, game, time) {
  const y = VIEW_H - 64;
  ctx.fillStyle = 'rgba(8,11,15,0.82)';
  ctx.beginPath();
  ctx.roundRect(14, y, 470, 50, 10);
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#c9cdd4';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.fillText('TOOLS — CLICK OR PRESS 1 / 2 / 3', 26, y + 15);
  TOOL_DEFS.forEach((t, i) => {
    const x = 26 + i * 150;
    const afford = game.coins >= t.cost;
    ctx.fillStyle = afford ? '#2c3a2a' : '#3a2020';
    ctx.beginPath();
    ctx.roundRect(x, y + 21, 140, 24, 6);
    ctx.fill();
    ctx.strokeStyle = afford ? PALETTE.gold : '#7a5a3a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y + 21, 140, 24);
    ctx.fillStyle = afford ? '#f4efe2' : '#9a8a7a';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText('[' + t.key + '] ' + t.name + ' · ' + t.cost + '¢', x + 8, y + 37);
  });
}

function drawGuardList(ctx, game) {
  const x = VIEW_W - 208;
  let y = 74;
  ctx.fillStyle = 'rgba(8,11,15,0.82)';
  ctx.beginPath();
  ctx.roundRect(x - 10, y - 6, 204, 30 + game.guards.length * 24, 10);
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#c9cdd4';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.fillText('GUARDS ON THE FLOOR', x, y + 12);
  y += 30;
  for (const g of game.guards) {
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.arc(x + 8, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.initial, x + 8, y + 3.5);
    ctx.fillStyle = '#f4efe2';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(g.name, x + 22, y + 4);
    const state = guardStateLabel(g);
    ctx.fillStyle = state === 'CHASE' ? '#ff8a8e' : state === 'PATROL' ? '#9fb3a8' : '#f2c94c';
    ctx.textAlign = 'right';
    ctx.fillText(state, x + 184, y + 4);
    y += 24;
  }
}

function drawPrompt(ctx, game) {
  if (!game.prompt) return;
  ctx.font = 'bold 15px Georgia, serif';
  const w = ctx.measureText(game.prompt).width + 28;
  ctx.fillStyle = 'rgba(8,11,15,0.88)';
  ctx.beginPath();
  ctx.roundRect(VIEW_W / 2 - w / 2, VIEW_H - 118, w, 30, 15);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = PALETTE.goldBright;
  ctx.textAlign = 'center';
  ctx.fillText(game.prompt, VIEW_W / 2, VIEW_H - 98);
}

function drawMessage(ctx, game, time) {
  if (!game.message || game.messageT <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, game.messageT);
  ctx.font = 'bold 15px Georgia, serif';
  const w = ctx.measureText(game.message).width + 28;
  ctx.fillStyle = 'rgba(8,11,15,0.9)';
  ctx.beginPath();
  ctx.roundRect(VIEW_W / 2 - w / 2, 70, w, 30, 15);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#f4efe2';
  ctx.textAlign = 'center';
  ctx.fillText(game.message, VIEW_W / 2, 90);
  ctx.restore();
}

function drawHints(ctx, game) {
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(201,205,212,0.75)';
  ctx.font = '12px Georgia, serif';
  ctx.fillText('WASD move · SHIFT sneak · SPACE sprint (loud) · E interact / hide · 1/2/3 tools · R retry · ESC pause', VIEW_W / 2, VIEW_H - 8);
}

export function fmtTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

// --- screens ---

function dim(ctx) {
  ctx.fillStyle = 'rgba(6,9,13,0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

export function drawTitle(ctx, game, time) {
  dim(ctx);
  ctx.textAlign = 'center';
  const shimmer = 0.75 + 0.25 * Math.sin(time * 1.6);
  ctx.fillStyle = 'rgba(242,201,76,' + shimmer + ')';
  ctx.font = 'bold 96px Georgia, serif';
  ctx.fillText('GILDED', VIEW_W / 2, 220);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(VIEW_W / 2 - 260, 244, 520, 2);
  ctx.fillStyle = '#f4efe2';
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText('A museum heist at midnight', VIEW_W / 2, 292);
  ctx.fillStyle = '#c9cdd4';
  ctx.font = '16px Georgia, serif';
  ctx.fillText('Three galleries. Six guards. Five cameras. One thief.', VIEW_W / 2, 336);
  ctx.fillText('Lift the loot, keep the alarm quiet, and walk out the east wing.', VIEW_W / 2, 362);
  ctx.fillStyle = PALETTE.goldBright;
  ctx.font = 'bold 20px Georgia, serif';
  if (Math.floor(time * 1.4) % 2 === 0) ctx.fillText('PRESS ENTER TO BEGIN', VIEW_W / 2, 440);
  ctx.fillStyle = '#9fb3a8';
  ctx.font = '14px Georgia, serif';
  ctx.fillText('WASD move · SHIFT sneak · SPACE sprint · E grab / hide · 1 EMP · 2 smoke · 3 lockpick', VIEW_W / 2, 500);
  ctx.fillText('Cameras flash a warning before they spot you — break the line of sight.', VIEW_W / 2, 526);
}

export function drawCaught(ctx, game) {
  dim(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff6b6e';
  ctx.font = 'bold 72px Georgia, serif';
  ctx.fillText('CAUGHT!', VIEW_W / 2, 250);
  ctx.fillStyle = '#f4efe2';
  ctx.font = '20px Georgia, serif';
  ctx.fillText(game.caughtReason || 'A guard closed the distance.', VIEW_W / 2, 300);
  drawStats(ctx, game, 360);
  ctx.fillStyle = PALETTE.goldBright;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('PRESS R TO RETRY THE ROOM', VIEW_W / 2, 520);
}

export function drawRoomClear(ctx, game) {
  dim(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.goldBright;
  ctx.font = 'bold 56px Georgia, serif';
  ctx.fillText('ROOM CLEAR', VIEW_W / 2, 280);
  ctx.fillStyle = '#f4efe2';
  ctx.font = '20px Georgia, serif';
  ctx.fillText('Loot secured. On to ' + game.nextRoomName + '.', VIEW_W / 2, 330);
  drawStats(ctx, game, 380);
}

export function drawGetaway(ctx, game, time) {
  dim(ctx);
  // A warm gold glow behind the title + drifting sparkles: the payoff
  // screen should feel like a celebration, not a dark overlay.
  const glow = ctx.createRadialGradient(VIEW_W / 2, 180, 10, VIEW_W / 2, 180, 340);
  glow.addColorStop(0, 'rgba(242,201,76,0.16)');
  glow.addColorStop(1, 'rgba(242,201,76,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const rng = mulberry32(99);
  for (let i = 0; i < 16; i += 1) {
    const sx = 200 + rng() * 880;
    const sy = 120 + rng() * 480;
    const sr = 1 + rng() * 1.8;
    const sa = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(time * 2 + i * 1.7));
    ctx.fillStyle = 'rgba(242,201,76,' + sa.toFixed(2) + ')';
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.goldBright;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('CLEAN GETAWAY', VIEW_W / 2, 150);
  // Rank: Ghost when never spotted, Shadow when rarely, Pro otherwise.
  const rank = game.spottedCount === 0 ? 'GHOST' : game.spottedCount <= 2 ? 'SHADOW' : 'PRO';
  const rankColor = rank === 'GHOST' ? '#9fe870' : rank === 'SHADOW' ? '#f2c94c' : '#f2a93b';
  ctx.fillStyle = rankColor;
  ctx.font = 'bold 40px Georgia, serif';
  ctx.fillText('RANK: ' + rank, VIEW_W / 2, 210);
  ctx.fillStyle = '#c9cdd4';
  ctx.font = '16px Georgia, serif';
  ctx.fillText(
    rank === 'GHOST' ? 'Never seen. The museum never knew you were there.'
    : rank === 'SHADOW' ? 'Seen, but never held. A clean shadow.'
    : 'Loud, but out. The vault remembers you.',
    VIEW_W / 2, 242,
  );
  drawStats(ctx, game, 290);
  drawRouteMap(ctx, game);
  ctx.fillStyle = PALETTE.goldBright;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('PRESS R TO RUN IT AGAIN', VIEW_W / 2, 660);
}

function drawStats(ctx, game, y) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f4efe2';
  ctx.font = '19px Georgia, serif';
  const lines = [
    'Loot  $' + lootValueTotal(game) + '  (' + game.lootStolen.length + ' artifacts)',
    'Time  ' + fmtTime(game.time) + '     Spotted  ' + game.spottedCount + ' times',
    'Score  ' + game.score,
  ];
  lines.forEach((l, i) => ctx.fillText(l, VIEW_W / 2, y + i * 30));
}

function drawRouteMap(ctx, game) {
  // Escape route map: three gallery boxes, the thief's path through them.
  const x0 = VIEW_W / 2 - 330;
  const y0 = 420;
  const bw = 200;
  const bh = 110;
  const names = ['HALL OF MARBLE', 'GOLD GALLERY', 'THE VAULT'];
  ctx.textAlign = 'center';
  for (let i = 0; i < 3; i++) {
    const x = x0 + i * (bw + 15);
    const done = i < game.roomIndex + 1;
    if (done) {
      ctx.save();
      ctx.shadowColor = PALETTE.goldBright;
      ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgba(20,80,61,0.9)';
      ctx.beginPath();
      ctx.roundRect(x, y0, bw, bh, 10);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = 'rgba(26,32,39,0.9)';
      ctx.beginPath();
      ctx.roundRect(x, y0, bw, bh, 10);
      ctx.fill();
    }
    ctx.strokeStyle = done ? PALETTE.goldBright : '#5a6673';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = done ? '#f4efe2' : '#8a939e';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.fillText(names[i], x + bw / 2, y0 + 26);
    ctx.font = '12px Georgia, serif';
    ctx.fillText(i === 0 ? 'Scarab · Chalice' : i === 1 ? 'Idol · Crown' : 'Mask · Diamond', x + bw / 2, y0 + 48);
    ctx.fillStyle = PALETTE.goldBright;
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText(done ? '✓' : '·', x + bw / 2, y0 + 84);
    if (i < 2) {
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + bw, y0 + bh / 2);
      ctx.lineTo(x + bw + 15, y0 + bh / 2);
      ctx.stroke();
      ctx.fillStyle = PALETTE.gold;
      ctx.beginPath();
      ctx.moveTo(x + bw + 15, y0 + bh / 2 - 5);
      ctx.lineTo(x + bw + 15, y0 + bh / 2 + 5);
      ctx.lineTo(x + bw + 22, y0 + bh / 2);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.fillStyle = '#c9cdd4';
  ctx.font = '13px Georgia, serif';
  ctx.fillText('ESCAPE ROUTE — WEST DOOR → EAST WING → THE VAULT → THE NIGHT', VIEW_W / 2, y0 + bh + 26);
}

export function drawPaused(ctx) {
  dim(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f4efe2';
  ctx.font = 'bold 48px Georgia, serif';
  ctx.fillText('PAUSED', VIEW_W / 2, 330);
  ctx.fillStyle = '#c9cdd4';
  ctx.font = '17px Georgia, serif';
  ctx.fillText('ESC to resume · R to retry the room', VIEW_W / 2, 372);
}
