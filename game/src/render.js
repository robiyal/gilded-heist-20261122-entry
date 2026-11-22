// GILDED — rendering: material floors, lamp light pools, vision cones, the
// thief and the guards, and the midnight grade (warm vignette + soft bloom).
// Everything is procedural; no image ever loads.
import { PALETTE, TUNING, VIEW_W, VIEW_H, WALL, clamp, dist } from './config.js';
import { guardStateLabel } from './guards.js';
import { cameraStateLabel } from './cameras.js';

export function drawGame(ctx, game, time) {
  const room = game.room;
  drawFloor(ctx, room, time);
  drawWalls(ctx, room);
  drawHideZones(ctx, room);
  drawCover(ctx, room, game, time);
  drawExit(ctx, room, game);
  drawCoins(ctx, game, time);
  drawCones(ctx, game, time);
  drawSmoke(ctx, game, time);
  drawGuards(ctx, game, time);
  drawThief(ctx, game, time);
  drawCameras(ctx, game, time);
  drawLightPools(ctx, room, game);
  drawGrade(ctx, game, time);
}

function drawFloor(ctx, room, time) {
  if (room.floor === 'marble') drawMarble(ctx);
  else if (room.floor === 'carpet') drawCarpet(ctx, time);
  else drawSteel(ctx, time);
}

function drawMarble(ctx) {
  const tile = 80;
  for (let y = 0; y < VIEW_H; y += tile) {
    for (let x = 0; x < VIEW_W; x += tile) {
      const even = ((x + y) / tile) % 2 === 0;
      ctx.fillStyle = even ? PALETTE.marbleA : PALETTE.marbleB;
      ctx.fillRect(x, y, tile, tile);
    }
  }
  // Veins: thin wandering strokes across the checker.
  ctx.strokeStyle = 'rgba(150,138,108,0.35)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 26; i++) {
    const x0 = ((i * 197) % 1280) + 20;
    const y0 = ((i * 131) % 720) + 20;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(x0 + 60, y0 + 18, x0 + 120, y0 - 24, x0 + 190, y0 + 10);
    ctx.stroke();
  }
  // Gold trim border inside the walls.
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 4;
  ctx.strokeRect(WALL + 8, WALL + 8, VIEW_W - 2 * (WALL + 8), VIEW_H - 2 * (WALL + 8));
  ctx.strokeStyle = 'rgba(212,160,23,0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(WALL + 16, WALL + 16, VIEW_W - 2 * (WALL + 16), VIEW_H - 2 * (WALL + 16));
}

function drawCarpet(ctx, time) {
  ctx.fillStyle = PALETTE.greenCarpet;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Carpet speckle: deterministic dots for a woven feel.
  ctx.fillStyle = 'rgba(255,255,255,0.045)';
  for (let i = 0; i < 900; i++) {
    const x = (i * 137.5) % VIEW_W;
    const y = (i * 89.3) % VIEW_H;
    ctx.fillRect(x, y, 2, 2);
  }
  // Brass runner down the middle of the hall.
  const grad = ctx.createLinearGradient(0, 0, 220, 0);
  grad.addColorStop(0, '#7a5c14');
  grad.addColorStop(0.5, PALETTE.goldBright);
  grad.addColorStop(1, '#7a5c14');
  ctx.fillStyle = grad;
  ctx.fillRect(VIEW_W / 2 - 110, WALL, 220, VIEW_H - 2 * WALL);
  ctx.fillStyle = 'rgba(13,59,46,0.9)';
  ctx.fillRect(VIEW_W / 2 - 96, WALL, 192, VIEW_H - 2 * WALL);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(VIEW_W / 2 - 96, WALL, 3, VIEW_H - 2 * WALL);
  ctx.fillRect(VIEW_W / 2 + 93, WALL, 3, VIEW_H - 2 * WALL);
  // Gold picture frames along the north and south walls.
  for (let x = 120; x < VIEW_W - 120; x += 200) {
    drawFrame(ctx, x, WALL + 14, 120, 44, time);
    drawFrame(ctx, x, VIEW_H - WALL - 58, 120, 44, time);
  }
}

function drawFrame(ctx, x, y, w, h, time) {
  ctx.fillStyle = '#0a2e22';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(242,201,76,0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
  // A painted canvas inside: a tiny gilded landscape.
  ctx.fillStyle = '#c98f2e';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2 + 6, 11, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#274b63';
  ctx.fillRect(x + 10, y + h - 16, w - 20, 8);
}

function drawSteel(ctx, time) {
  ctx.fillStyle = PALETTE.steel;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Brushed steel: long horizontal streaks.
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 60; i++) {
    const y = (i * 47.7) % VIEW_H;
    const x = (i * 211) % 400;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 500 + (i % 5) * 90, y);
    ctx.stroke();
  }
  // Green accent stripes guiding the eye to the vault door.
  ctx.fillStyle = 'rgba(55,201,120,0.28)';
  ctx.fillRect(0, 120, VIEW_W, 6);
  ctx.fillRect(0, 594, VIEW_W, 6);
  ctx.fillStyle = 'rgba(55,201,120,0.16)';
  for (let x = 80; x < VIEW_W; x += 160) {
    ctx.fillRect(x, 300, 60, 4);
    ctx.fillRect(x, 416, 60, 4);
  }
  // Rivets along the wall line.
  ctx.fillStyle = '#5a6673';
  for (let x = 60; x < VIEW_W; x += 120) {
    ctx.beginPath();
    ctx.arc(x, WALL + 12, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, VIEW_H - WALL - 12, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWalls(ctx, room) {
  ctx.fillStyle = '#141a20';
  ctx.fillRect(0, 0, VIEW_W, WALL);
  ctx.fillRect(0, VIEW_H - WALL, VIEW_W, WALL);
  ctx.fillRect(0, 0, WALL, VIEW_H);
  ctx.fillRect(VIEW_W - WALL, 0, WALL, VIEW_H);
  ctx.fillStyle = PALETTE.goldDark;
  ctx.fillRect(0, WALL - 3, VIEW_W, 3);
  ctx.fillRect(0, VIEW_H - WALL, VIEW_W, 3);
  ctx.fillRect(WALL - 3, 0, 3, VIEW_H);
  ctx.fillRect(VIEW_W - WALL, 0, 3, VIEW_H);
  // The room name lives in the HUD top bar; the north wall itself stays
  // clean dark stone with its gold trim (the bar covers it anyway).
}

function drawHideZones(ctx, room) {
  ctx.save();
  for (const z of room.hideZones) {
    ctx.fillStyle = 'rgba(55,201,120,0.10)';
    ctx.fillRect(z.x, z.y, z.w, z.h);
    ctx.strokeStyle = 'rgba(55,201,120,0.35)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(z.x, z.y, z.w, z.h);
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawCover(ctx, room, game, time) {
  for (const c of room.cover) {
    if (c.kind === 'pillar') drawPillar(ctx, c);
    else if (c.kind === 'statue') drawStatue(ctx, c);
    else if (c.kind === 'case') drawCase(ctx, c, game, time);
    else if (c.kind === 'bench') drawBench(ctx, c);
    else if (c.kind === 'rope') drawRope(ctx, c);
    else if (c.kind === 'plant') drawPlant(ctx, c);
  }
}

function drawPillar(ctx, c) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(c.x + 4, c.y + 5, c.w, c.h);
  const grad = ctx.createLinearGradient(c.x, c.y, c.x + c.w, c.y);
  grad.addColorStop(0, '#f4efe2');
  grad.addColorStop(0.5, '#d9d2bd');
  grad.addColorStop(1, '#a89e83');
  ctx.fillStyle = grad;
  ctx.fillRect(c.x, c.y, c.w, c.h);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(c.x, c.y, c.w, c.h);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(c.x - 3, c.y - 3, c.w + 6, 6);
  ctx.fillRect(c.x - 3, c.y + c.h - 3, c.w + 6, 6);
}

function drawStatue(ctx, c) {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(c.x + c.w / 2 + 4, c.y + c.h - 2, c.w / 2 + 4, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8f8672';
  ctx.fillRect(c.x + 4, c.y + c.h - 12, c.w - 8, 12);
  ctx.fillStyle = '#b5ac93';
  ctx.beginPath();
  ctx.arc(c.x + c.w / 2, c.y + 12, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(c.x + c.w / 2 - 9, c.y + 18, 18, c.h - 30);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(c.x + c.w / 2 - 9, c.y + 18, 18, 3);
}

function drawCase(ctx, c, game, time) {
  const loot = game.cases.find((l) => l.caseIndex === game.room.cover.indexOf(c));
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(c.x + 4, c.y + 5, c.w, c.h);
  // Plinth.
  ctx.fillStyle = '#3a2f1d';
  ctx.fillRect(c.x, c.y + c.h - 14, c.w, 14);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(c.x, c.y + c.h - 16, c.w, 2);
  // Glass vitrine.
  const glass = ctx.createLinearGradient(c.x, c.y, c.x + c.w, c.y + c.h);
  glass.addColorStop(0, 'rgba(190,220,235,0.30)');
  glass.addColorStop(0.5, 'rgba(190,220,235,0.12)');
  glass.addColorStop(1, 'rgba(190,220,235,0.30)');
  ctx.fillStyle = glass;
  ctx.fillRect(c.x, c.y, c.w, c.h - 14);
  ctx.strokeStyle = 'rgba(242,201,76,0.9)';
  ctx.lineWidth = 2;
  ctx.strokeRect(c.x, c.y, c.w, c.h - 14);
  // The artifact glints inside — or an empty case once taken.
  if (loot && !loot.taken) {
    const cx = c.x + c.w / 2;
    const cy = c.y + (c.h - 14) / 2;
    const pulse = 0.6 + 0.3 * Math.sin(time * 2.4 + c.x);
    ctx.save();
    ctx.shadowColor = PALETTE.goldBright;
    ctx.shadowBlur = 16 * pulse;
    ctx.fillStyle = PALETTE.goldBright;
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#fff8dc';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 3, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (loot && loot.taken) {
    ctx.fillStyle = 'rgba(244,239,226,0.5)';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMPTY', c.x + c.w / 2, c.y + (c.h - 14) / 2 + 4);
  }
}

function drawBench(ctx, c) {
  ctx.fillStyle = '#4a2f1a';
  ctx.fillRect(c.x, c.y, c.w, c.h);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(c.x, c.y, c.w, 8);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(c.x, c.y, c.w, 2);
}

function drawRope(ctx, c) {
  ctx.strokeStyle = '#7a1f2b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(c.x, c.y + c.h / 2);
  ctx.quadraticCurveTo(c.x + c.w / 2, c.y + c.h / 2 + 8, c.x + c.w, c.y + c.h / 2);
  ctx.stroke();
  ctx.fillStyle = PALETTE.gold;
  ctx.beginPath();
  ctx.arc(c.x, c.y + c.h / 2, 4, 0, Math.PI * 2);
  ctx.arc(c.x + c.w, c.y + c.h / 2, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlant(ctx, c) {
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(c.x + c.w / 2 - 12, c.y + c.h - 18, 24, 18);
  ctx.fillStyle = '#1d5c34';
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.35;
    ctx.beginPath();
    ctx.moveTo(c.x + c.w / 2, c.y + c.h - 16);
    ctx.lineTo(c.x + c.w / 2 + Math.cos(a) * 26, c.y + c.h - 16 + Math.sin(a) * 34);
    ctx.lineTo(c.x + c.w / 2 + Math.cos(a + 0.2) * 26, c.y + c.h - 16 + Math.sin(a + 0.2) * 34);
    ctx.closePath();
    ctx.fill();
  }
}

function drawExit(ctx, room, game) {
  const e = room.exit;
  const open = game.lootTakenThisRoom >= room.needLoot;
  ctx.fillStyle = open ? '#2c4a1e' : '#3a2020';
  ctx.fillRect(e.x - 8, e.y - 6, 26, e.h + 12);
  ctx.strokeStyle = open ? PALETTE.goldBright : '#7a5a3a';
  ctx.lineWidth = 3;
  ctx.strokeRect(e.x - 8, e.y - 6, 26, e.h + 12);
  ctx.fillStyle = open ? '#9fe870' : '#c98f6a';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.save();
  ctx.translate(e.x + 5, e.y + e.h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(open ? 'EXIT OPEN' : 'LOCKED', 0, 4);
  ctx.restore();
  if (room.id === 3) {
    // The gold vault door.
    ctx.fillStyle = '#8a6a0c';
    ctx.fillRect(VIEW_W - WALL - 4, e.y - 6, 8, e.h + 12);
    ctx.beginPath();
    ctx.arc(VIEW_W - WALL - 4, e.y + e.h / 2, 12, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.goldBright;
    ctx.fill();
    ctx.fillStyle = '#8a6a0c';
    ctx.beginPath();
    ctx.arc(VIEW_W - WALL - 4, e.y + e.h / 2, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCoins(ctx, game, time) {
  for (const c of game.coinList) {
    if (c.taken) continue;
    const bob = Math.sin(time * 3 + c.bob) * 2;
    ctx.save();
    ctx.shadowColor = PALETTE.goldBright;
    ctx.shadowBlur = 10;
    ctx.fillStyle = PALETTE.goldBright;
    ctx.beginPath();
    ctx.arc(c.x, c.y + bob, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#8a6a0c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c.x, c.y + bob, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#8a6a0c';
    ctx.font = 'bold 9px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('¢', c.x, c.y + bob + 3);
  }
}

function conePath(ctx, x, y, angle, range, halfAngle) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
}

function drawCones(ctx, game, time) {
  // Guard cones: warm amber, turning red as suspicion climbs.
  for (const g of game.guards) {
    const hot = g.suspicion / 100;
    const col = g.state === 'chase'
      ? 'rgba(229,72,77,0.30)'
      : hot > 0.35
        ? 'rgba(242,169,59,' + (0.18 + hot * 0.16) + ')'
        : 'rgba(242,201,76,0.20)';
    ctx.fillStyle = col;
    conePath(ctx, g.x, g.y, g.angle, TUNING.guardVisionRange, TUNING.guardVisionHalfAngle);
    ctx.fill();
  }
  // Camera cones: cool cyan sweep; amber flash while warning, red while spotted.
  for (const c of game.cameras) {
    let col = 'rgba(84,199,230,0.16)';
    if (c.state === 'frozen') col = 'rgba(160,170,180,0.10)';
    else if (c.state === 'warn') col = (Math.floor(time * 6) % 2 === 0) ? 'rgba(242,169,59,0.34)' : 'rgba(242,169,59,0.14)';
    else if (c.state === 'spot') col = 'rgba(229,72,77,0.30)';
    ctx.fillStyle = col;
    conePath(ctx, c.x, c.y, c.angle, TUNING.cameraRange, TUNING.cameraHalfAngle);
    ctx.fill();
  }
}

function drawSmoke(ctx, game, time) {
  for (const s of game.smoke) {
    const alpha = clamp(s.t / 2, 0, 1) * 0.75;
    ctx.fillStyle = 'rgba(201,205,212,' + alpha + ')';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + s.x;
      const rr = s.r * (0.45 + ((i * 37) % 10) / 22);
      ctx.beginPath();
      ctx.arc(s.x + Math.cos(a) * rr * 0.5, s.y + Math.sin(a) * rr * 0.5, rr * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGuards(ctx, game, time) {
  for (const g of game.guards) {
    const swing = Math.sin(g.walkPhase) * 5;
    const moving = g.state === 'patrol' || g.state === 'chase' || g.state === 'search';
    // Shadow.
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(g.x, g.y + 15, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Legs with a walk cycle.
    ctx.strokeStyle = '#14181d';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    const legSwing = moving ? swing : 0;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y + 2);
    ctx.lineTo(g.x - 4 + legSwing * 0.4, g.y + 14);
    ctx.moveTo(g.x, g.y + 2);
    ctx.lineTo(g.x + 4 - legSwing * 0.4, g.y + 14);
    ctx.stroke();
    // Body in the guard's uniform colour.
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.roundRect(g.x - 10, g.y - 12, 20, 17, 5);
    ctx.fill();
    // Gold buttons + belt.
    ctx.fillStyle = PALETTE.goldBright;
    ctx.fillRect(g.x - 1, g.y - 8, 2, 10);
    ctx.fillStyle = '#0c0f13';
    ctx.fillRect(g.x - 10, g.y + 2, 20, 3);
    // Head + peaked cap.
    ctx.fillStyle = '#e8b98a';
    ctx.beginPath();
    ctx.arc(g.x, g.y - 17, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.arc(g.x, g.y - 19, 7.5, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(g.x - 8, g.y - 20, 16, 3);
    // Direction tick: where the guard is looking.
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y - 17);
    ctx.lineTo(g.x + Math.cos(g.angle) * 13, g.y - 17 + Math.sin(g.angle) * 13);
    ctx.stroke();
    // State mark above the head.
    if (g.state === 'chase') drawMark(ctx, g.x, g.y - 34, '!', '#e5484d');
    else if (g.state === 'suspicious' || g.state === 'search') drawMark(ctx, g.x, g.y - 34, '?', '#f2a93b');
    // Name pill: big initial chip in uniform colour + name, readable at 300px.
    drawNamePill(ctx, g.x, g.y + 26, g.initial, g.name, g.color, guardStateLabel(g));
  }
}

function drawMark(ctx, x, y, ch, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(ch, x, y + 4);
}

function drawNamePill(ctx, x, y, initial, name, color, state) {
  ctx.font = 'bold 11px Georgia, serif';
  const nameW = ctx.measureText(name).width;
  const w = 26 + nameW + 8;
  ctx.fillStyle = 'rgba(10,14,18,0.85)';
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y, w, 20, 10);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - w / 2 + 13, y + 10, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(initial, x - w / 2 + 13, y + 14);
  ctx.fillStyle = '#f4efe2';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(name, x - w / 2 + 26, y + 14);
  if (state !== 'PATROL') {
    ctx.fillStyle = state === 'CHASE' ? '#e5484d' : '#f2a93b';
    ctx.font = 'bold 9px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(state, x, y + 30);
  }
}

function drawThief(ctx, game, time) {
  const t = game.thief;
  const alpha = t.hidden ? 0.62 : 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  // Soft gold light ring — the thief's own pool of light.
  const ring = ctx.createRadialGradient(t.x, t.y, 4, t.x, t.y, 46);
  ring.addColorStop(0, 'rgba(242,201,76,0.30)');
  ring.addColorStop(1, 'rgba(242,201,76,0)');
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(t.x, t.y, 46, 0, Math.PI * 2);
  ctx.fill();
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(t.x, t.y + 15, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Legs.
  const swing = t.moving ? Math.sin(t.walkPhase) * 5 : 0;
  ctx.strokeStyle = '#0e1116';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(t.x, t.y + 2);
  ctx.lineTo(t.x - 4 + swing * 0.4, t.y + 14);
  ctx.moveTo(t.x, t.y + 2);
  ctx.lineTo(t.x + 4 - swing * 0.4, t.y + 14);
  ctx.stroke();
  // Cloak with gold trim.
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.moveTo(t.x - 11, t.y + 6);
  ctx.quadraticCurveTo(t.x - 13, t.y - 10, t.x, t.y - 13);
  ctx.quadraticCurveTo(t.x + 13, t.y - 10, t.x + 11, t.y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PALETTE.thiefTrim;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  // Satchel with a brass clasp.
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(t.x + 6, t.y - 2, 9, 11);
  ctx.fillStyle = PALETTE.goldBright;
  ctx.fillRect(t.x + 9, t.y - 2, 3, 3);
  // Hood + shadowed face.
  ctx.fillStyle = '#232733';
  ctx.beginPath();
  ctx.arc(t.x, t.y - 17, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0b0d12';
  ctx.beginPath();
  ctx.arc(t.x + Math.cos(t.angle) * 2, t.y - 17 + Math.sin(t.angle) * 2, 5, 0, Math.PI * 2);
  ctx.fill();
  // Eyes glint.
  ctx.fillStyle = PALETTE.goldBright;
  ctx.fillRect(t.x - 3, t.y - 18, 2, 2);
  ctx.fillRect(t.x + 2, t.y - 18, 2, 2);
  ctx.restore();
  // Label — the thief must read at a glance.
  ctx.fillStyle = 'rgba(10,14,18,0.85)';
  ctx.font = 'bold 11px Georgia, serif';
  const label = 'THE THIEF';
  const w = ctx.measureText(label).width + 16;
  ctx.beginPath();
  ctx.roundRect(t.x - w / 2, t.y + 24, w, 18, 9);
  ctx.fill();
  ctx.fillStyle = PALETTE.goldBright;
  ctx.textAlign = 'center';
  ctx.fillText(label, t.x, t.y + 37);
  // Grab progress ring.
  if (t.grabbing) {
    const p = t.grabT / TUNING.lootGrabSeconds;
    ctx.strokeStyle = 'rgba(244,239,226,0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = PALETTE.goldBright;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 24, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
    ctx.stroke();
  }
}

function drawCameras(ctx, game, time) {
  for (const c of game.cameras) {
    // Bracket arm up to the wall for cameras mounted just below the HUD bar.
    if (c.y < 100) {
      ctx.strokeStyle = '#39414b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(c.x, WALL);
      ctx.lineTo(c.x, c.y - 8);
      ctx.stroke();
      ctx.fillStyle = PALETTE.goldDark;
      ctx.fillRect(c.x - 8, WALL - 2, 16, 5);
    }
    // Wall mount.
    ctx.fillStyle = '#141a20';
    ctx.beginPath();
    ctx.roundRect(c.x - 13, c.y - 9, 26, 18, 4);
    ctx.fill();
    ctx.fillStyle = c.state === 'frozen' ? '#8a939e' : c.state === 'spot' ? '#e5484d' : '#39414b';
    ctx.beginPath();
    ctx.roundRect(c.x - 10, c.y - 6, 20, 12, 3);
    ctx.fill();
    // Lens, pointing along the sweep angle.
    const lx = c.x + Math.cos(c.angle) * 12;
    const ly = c.y + Math.sin(c.angle) * 12;
    ctx.save();
    ctx.shadowColor = c.state === 'spot' ? '#e5484d' : '#54c7e6';
    ctx.shadowBlur = 8;
    ctx.fillStyle = c.state === 'frozen' ? '#c9cdd4' : c.state === 'warn' ? '#f2a93b' : '#7ad9f2';
    ctx.beginPath();
    ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Label + state, readable small.
    ctx.fillStyle = 'rgba(10,14,18,0.85)';
    ctx.font = 'bold 10px Georgia, serif';
    const label = c.name + ' · ' + cameraStateLabel(c);
    const w = ctx.measureText(label).width + 12;
    ctx.beginPath();
    ctx.roundRect(c.x - w / 2, c.y + 14, w, 16, 8);
    ctx.fill();
    ctx.fillStyle = c.state === 'spot' ? '#ff8a8e' : c.state === 'warn' ? '#f2c94c' : '#bfe9f7';
    ctx.textAlign = 'center';
    ctx.fillText(label, c.x, c.y + 26);
  }
}

function drawLightPools(ctx, room, game) {
  // Warm pools under every lamp, composited additively over the floor.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const lamp of room.lamps) {
    const g = ctx.createRadialGradient(lamp.x, lamp.y, 6, lamp.x, lamp.y, 110);
    g.addColorStop(0, 'rgba(255,214,120,0.20)');
    g.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, 110, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGrade(ctx, game, time) {
  // Midnight grade: vignette + a warm wash, never hiding the play.
  const vg = ctx.createRadialGradient(
    VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.42,
    VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.95,
  );
  vg.addColorStop(0, 'rgba(8,10,16,0)');
  vg.addColorStop(1, 'rgba(8,10,16,0.42)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = 'rgba(255,180,80,0.045)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Alarm pulse: the whole frame throbs red while the alarm is live.
  if (game.alarm.state === 'alarm') {
    const pulse = 0.10 + 0.06 * Math.sin(time * 7);
    ctx.fillStyle = 'rgba(229,72,77,' + pulse + ')';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}
