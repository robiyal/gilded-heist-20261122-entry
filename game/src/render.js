// GILDED — rendering: material floors, lamp light pools, vision cones, the
// thief and the guards, and the midnight grade (warm vignette + soft bloom).
// Everything is procedural; no image ever loads.
import { PALETTE, TUNING, VIEW_W, VIEW_H, WALL, clamp, dist, mulberry32 } from './config.js';
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
  drawLightPools(ctx, room, game, time);
  drawShafts(ctx, room, time);
  drawGrade(ctx, game, time);
}

function drawFloor(ctx, room, time) {
  if (room.floor === 'marble') drawMarble(ctx, time);
  else if (room.floor === 'carpet') drawCarpet(ctx, time);
  else drawSteel(ctx, room, time);
}

function drawMarble(ctx, time) {
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
  // Marble accents: every seventh tile carries a faint fossil swirl (a
  // darker ring + dot), so the checker stops reading as a flat grid.
  for (let y = 0; y < VIEW_H; y += tile) {
    for (let x = 0; x < VIEW_W; x += tile) {
      if ((((x + y) / tile) % 7) !== 0) continue;
      const cx = x + tile / 2;
      const cy = y + tile / 2;
      ctx.strokeStyle = 'rgba(120,110,85,0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(120,110,85,0.22)';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Faint diagonal sheen across the floor, as if from a high window.
  ctx.save();
  ctx.translate(VIEW_W / 2, VIEW_H / 2);
  ctx.rotate(-0.5);
  const sheen = ctx.createLinearGradient(-700, 0, 700, 0);
  sheen.addColorStop(0, 'rgba(255,255,255,0)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.05)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(-700, -90, 1400, 180);
  ctx.restore();
  // Framed portraits on the north wall, kept clear of the camera and rope.
  drawFrame(ctx, 120, WALL + 14, 120, 44, time, 1);
  drawFrame(ctx, 320, WALL + 14, 120, 44, time, 2);
  drawFrame(ctx, 920, WALL + 14, 120, 44, time, 0);
  drawFrame(ctx, 1120, WALL + 14, 120, 44, time, 1);
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
  // Inlaid carpet medallions at the four open corners.
  for (const [mx, my] of [[140, 140], [1140, 140], [140, 580], [1140, 580]]) {
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = 'rgba(20,80,61,0.9)';
    ctx.fillRect(-13, -13, 26, 26);
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(-13, -13, 26, 26);
    ctx.restore();
    ctx.fillStyle = PALETTE.goldBright;
    ctx.beginPath();
    ctx.arc(mx, my, 3, 0, Math.PI * 2);
    ctx.fill();
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
  // Gold picture frames along the north and south walls (variants cycle).
  let fi = 0;
  for (let x = 120; x < VIEW_W - 120; x += 200) {
    drawFrame(ctx, x, WALL + 14, 120, 44, time, fi % 3);
    drawFrame(ctx, x, VIEW_H - WALL - 58, 120, 44, time, (fi + 1) % 3);
    fi += 1;
  }
}

function drawFrame(ctx, x, y, w, h, time, variant = 0) {
  ctx.fillStyle = '#0a2e22';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(242,201,76,0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
  if (variant === 1) {
    // Portrait: dark-red ground with a gold bust silhouette.
    ctx.fillStyle = '#4a1f24';
    ctx.fillRect(x + 8, y + 8, w - 16, h - 16);
    ctx.fillStyle = '#c98f2e';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.38, w * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - w * 0.2, y + h - 8);
    ctx.lineTo(x + w / 2 - w * 0.06, y + h * 0.55);
    ctx.lineTo(x + w / 2 + w * 0.06, y + h * 0.55);
    ctx.lineTo(x + w / 2 + w * 0.2, y + h - 8);
    ctx.closePath();
    ctx.fill();
  } else if (variant === 2) {
    // Tapestry: deep-green ground with a gold diamond and dot border.
    ctx.fillStyle = '#0d3b2e';
    ctx.fillRect(x + 8, y + 8, w - 16, h - 16);
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#c98f2e';
    ctx.fillRect(-8, -8, 16, 16);
    ctx.restore();
    ctx.fillStyle = '#c98f2e';
    ctx.beginPath();
    ctx.arc(x + 16, y + h / 2, 2, 0, Math.PI * 2);
    ctx.arc(x + w - 16, y + h / 2, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // A painted canvas inside: a tiny gilded landscape.
    ctx.fillStyle = '#c98f2e';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2 + 6, 11, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#274b63';
    ctx.fillRect(x + 10, y + h - 16, w - 20, 8);
  }
  // A slow glint sweeping the glass, so the frames feel lit, not printed.
  const glint = 0.08 + 0.05 * Math.sin(time * 0.8 + x * 0.01);
  ctx.strokeStyle = 'rgba(255,255,255,' + glint.toFixed(2) + ')';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 12, y + h - 8);
  ctx.lineTo(x + w - 12, y + 10);
  ctx.stroke();
}

function drawSteel(ctx, room, time) {
  ctx.fillStyle = PALETTE.steel;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Brushed steel: long horizontal streaks.
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 100; i++) {
    const y = (i * 47.7) % VIEW_H;
    const x = (i * 211) % 400;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 500 + (i % 5) * 90, y);
    ctx.stroke();
  }
  // Steel plate seams: faint panels so the floor reads at thumbnail size.
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  for (let x = 200; x < VIEW_W; x += 200) {
    ctx.beginPath();
    ctx.moveTo(x, WALL);
    ctx.lineTo(x, VIEW_H - WALL);
    ctx.stroke();
  }
  for (let y = 180; y < VIEW_H; y += 180) {
    ctx.beginPath();
    ctx.moveTo(WALL, y);
    ctx.lineTo(VIEW_W - WALL, y);
    ctx.stroke();
  }
  // Green accent stripes guiding the eye to the vault door.
  ctx.fillStyle = 'rgba(55,201,120,0.36)';
  ctx.fillRect(0, 120, VIEW_W, 6);
  ctx.fillRect(0, 594, VIEW_W, 6);
  ctx.fillStyle = 'rgba(55,201,120,0.22)';
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
  // Warm light smears below each display case: the loot glows onto steel.
  for (const c of room.cover) {
    if (c.kind !== 'case') continue;
    const smear = ctx.createLinearGradient(0, c.y + c.h, 0, c.y + c.h + 70);
    smear.addColorStop(0, 'rgba(255,240,200,0.10)');
    smear.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = smear;
    ctx.fillRect(c.x, c.y + c.h, c.w, 70);
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
    else if (c.kind === 'chandelier') drawChandelier(ctx, c, time);
    else if (c.kind === 'clock') drawClock(ctx, c, time);
    else if (c.kind === 'dial') drawDial(ctx, c);
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
  // In the dark vault the glint is bigger and hotter so the loot reads
  // at thumbnail size.
  if (loot && !loot.taken) {
    const cx = c.x + c.w / 2;
    const cy = c.y + (c.h - 14) / 2;
    const pulse = 0.6 + 0.3 * Math.sin(time * 2.4 + c.x);
    const steel = game.room.floor === 'steel';
    // A soft radial glow behind the artifact (replaces the plain orb).
    const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 26);
    glow.addColorStop(0, 'rgba(242,201,76,' + (0.45 * pulse).toFixed(2) + ')');
    glow.addColorStop(1, 'rgba(242,201,76,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();
    // The artifact itself: a distinct coloured silhouette per prize.
    drawArtifact(ctx, loot.id, cx, cy);
    ctx.fillStyle = '#fff8dc';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 3, steel ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (loot && loot.taken) {
    ctx.fillStyle = 'rgba(244,239,226,0.5)';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMPTY', c.x + c.w / 2, c.y + (c.h - 14) / 2 + 4);
  }
  // Glass streak: a diagonal light catch across the vitrine.
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(c.x + 14, c.y + c.h - 20);
  ctx.lineTo(c.x + c.w - 10, c.y + 8);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(c.x + 24, c.y + c.h - 20);
  ctx.lineTo(c.x + c.w - 4, c.y + 12);
  ctx.stroke();
}

// Draw one loot artifact as a small coloured silhouette (centred at cx, cy).
// Each prize has a distinct shape and colour so cases read differently at
// a glance; the glow behind it comes from drawCase.
function drawArtifact(ctx, id, cx, cy) {
  ctx.save();
  ctx.lineWidth = 1.5;
  if (id === 'scarab') {
    ctx.fillStyle = '#e8b23a';
    ctx.strokeStyle = '#8a6a0c';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#8a6a0c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i += 1) {
        ctx.moveTo(cx + s * 7, cy - 1 + i * 3);
        ctx.lineTo(cx + s * 13, cy - 3 + i * 3);
      }
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 4);
    ctx.lineTo(cx, cy + 8);
    ctx.stroke();
  } else if (id === 'chalice') {
    ctx.fillStyle = '#dfe6ea';
    ctx.strokeStyle = '#7a8a94';
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 10);
    ctx.lineTo(cx + 8, cy - 10);
    ctx.lineTo(cx + 4, cy + 2);
    ctx.lineTo(cx - 4, cy + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(cx - 1.5, cy + 2, 3, 6);
    ctx.fillRect(cx - 6, cy + 8, 12, 2.5);
  } else if (id === 'idol') {
    ctx.fillStyle = '#2fae6e';
    ctx.strokeStyle = '#14532f';
    ctx.beginPath();
    ctx.roundRect(cx - 6, cy - 2, 12, 13, 5);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy - 7, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#f2c94c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + 4);
    ctx.lineTo(cx + 6, cy + 4);
    ctx.stroke();
  } else if (id === 'crown') {
    ctx.fillStyle = '#f2c94c';
    ctx.strokeStyle = '#8a6a0c';
    ctx.beginPath();
    ctx.moveTo(cx - 11, cy + 8);
    ctx.lineTo(cx - 11, cy - 4);
    ctx.lineTo(cx - 5.5, cy + 2);
    ctx.lineTo(cx, cy - 8);
    ctx.lineTo(cx + 5.5, cy + 2);
    ctx.lineTo(cx + 11, cy - 4);
    ctx.lineTo(cx + 11, cy + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e5484d';
    ctx.beginPath();
    ctx.arc(cx, cy + 3, 2, 0, Math.PI * 2);
    ctx.arc(cx - 7, cy + 3, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + 7, cy + 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'mask') {
    ctx.fillStyle = '#4fae7a';
    ctx.strokeStyle = '#14532f';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 9, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0d3b2e';
    ctx.beginPath();
    ctx.ellipse(cx - 3.5, cy - 2, 2, 1.2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 3.5, cy - 2, 2, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f2c94c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 6);
    ctx.lineTo(cx + 6, cy - 6);
    ctx.stroke();
  } else {
    // diamond: a pale-blue cut gem with facet lines and a sparkle.
    ctx.fillStyle = '#bfe9f7';
    ctx.strokeStyle = '#5a8aa0';
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 6);
    ctx.lineTo(cx + 10, cy - 6);
    ctx.lineTo(cx + 5, cy + 2);
    ctx.lineTo(cx, cy + 10);
    ctx.lineTo(cx - 5, cy + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(90,138,160,0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 6);
    ctx.lineTo(cx - 5, cy + 2);
    ctx.lineTo(cx + 5, cy + 2);
    ctx.lineTo(cx + 10, cy - 6);
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 3, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
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

// A swaying chandelier: chain from the ceiling, brass arms, warm crystal
// glints that drift as the fixture swings (driven by render time).
function drawChandelier(ctx, c, time) {
  const cx = c.x + c.w / 2;
  const cy = c.y + c.h / 2;
  const sway = Math.sin(time * 0.8) * 3;
  const glint = 0.5 + 0.5 * Math.sin(time * 1.6 + cx * 0.01);
  // Chain from the ceiling to the fixture.
  ctx.strokeStyle = '#8a6a0c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, 26);
  ctx.lineTo(cx + sway * 0.4, cy - 20);
  ctx.stroke();
  // Brass ring + arms.
  ctx.fillStyle = '#c98f2e';
  ctx.beginPath();
  ctx.arc(cx + sway, cy, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c98f2e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx + sway - 12, cy);
  ctx.lineTo(cx + sway - 26, cy - 8);
  ctx.moveTo(cx + sway + 12, cy);
  ctx.lineTo(cx + sway + 26, cy - 8);
  ctx.stroke();
  // Crystal glints at the arm tips + the centre candle.
  ctx.fillStyle = 'rgba(255,244,200,' + (0.5 + 0.5 * glint).toFixed(2) + ')';
  ctx.beginPath();
  ctx.arc(cx + sway - 26, cy - 8, 3, 0, Math.PI * 2);
  ctx.arc(cx + sway + 26, cy - 8, 3, 0, Math.PI * 2);
  ctx.arc(cx + sway, cy - 6, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2c94c';
  ctx.beginPath();
  ctx.arc(cx + sway, cy, 4, 0, Math.PI * 2);
  ctx.fill();
}

// A grandfather clock against the east wall, pendulum swinging.
function drawClock(ctx, c, time) {
  ctx.fillStyle = '#3a2417';
  ctx.beginPath();
  ctx.roundRect(c.x, c.y, c.w, c.h, 4);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Face.
  ctx.fillStyle = '#f5ecd2';
  ctx.beginPath();
  ctx.arc(c.x + c.w / 2, c.y + 22, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3a2417';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Hands: just past midnight, the heist hour.
  ctx.beginPath();
  ctx.moveTo(c.x + c.w / 2, c.y + 22);
  ctx.lineTo(c.x + c.w / 2, c.y + 13);
  ctx.moveTo(c.x + c.w / 2, c.y + 22);
  ctx.lineTo(c.x + c.w / 2 + 7, c.y + 25);
  ctx.stroke();
  // Pendulum, swinging with render time.
  const swing = Math.sin(time * 1.6) * 0.35;
  const px = c.x + c.w / 2;
  const py = c.y + 46;
  const bobX = px + Math.sin(swing) * 14;
  const bobY = py + Math.cos(swing) * 14;
  ctx.strokeStyle = '#c98f2e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(bobX, bobY);
  ctx.stroke();
  ctx.fillStyle = '#f2c94c';
  ctx.beginPath();
  ctx.arc(bobX, bobY, 4, 0, Math.PI * 2);
  ctx.fill();
  // Glass door sheen.
  ctx.fillStyle = 'rgba(220,235,245,0.10)';
  ctx.fillRect(c.x + 6, c.y + 40, c.w - 12, c.h - 46);
}

// A brass safe-dial medallion on the north wall of the Vault.
function drawDial(ctx, c) {
  const cx = c.x + c.w / 2;
  const cy = c.y + c.h / 2;
  ctx.fillStyle = '#8a6a0c';
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c98f2e';
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a6a0c';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14);
    ctx.lineTo(cx + Math.cos(a) * 17, cy + Math.sin(a) * 17);
    ctx.stroke();
  }
  ctx.fillStyle = '#3a2417';
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
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
    const edge = g.state === 'chase' ? 'rgba(229,72,77,0.55)' : 'rgba(242,201,76,0.38)';
    ctx.fillStyle = col;
    conePath(ctx, g.x, g.y, g.angle, TUNING.guardVisionRange, TUNING.guardVisionHalfAngle);
    ctx.fill();
    // Thin edge so the cone boundary still reads at thumbnail size.
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
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
    const moving = g.state === 'patrol' || g.state === 'chase' || g.state === 'search';
    // Walk cycle: legs swing on the walk phase; chase strides wider.
    const stride = g.state === 'chase' ? 7 : 5;
    const swing = Math.sin(g.walkPhase) * stride;
    const legSwing = moving ? swing : 0;
    // A walking guard bobs; a standing one sways gently with the room.
    const bobY = moving ? -Math.abs(Math.sin(g.walkPhase)) * 1.6 : Math.sin(time * 1.1 + g.index * 1.3) * 0.8;
    const rock = moving ? 0 : Math.sin(time * 0.9 + g.index * 1.7) * 0.02;
    const s = g.scale || 1;
    const bw = 20 * (g.build || 1);
    // Shadow (unscaled, under the figure).
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(g.x, g.y + 15, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(g.x, g.y + bobY);
    ctx.rotate(rock);
    ctx.scale(s, s);
    // Legs with a walk cycle.
    ctx.strokeStyle = '#14181d';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(-4 + legSwing * 0.4, 14);
    ctx.moveTo(0, 2);
    ctx.lineTo(4 - legSwing * 0.4, 14);
    ctx.stroke();
    // Arms: counter-swing to the legs, uniform colour, skin hands.
    const armSwing = moving ? swing * 0.8 : Math.sin(time * 1.2 + g.index * 1.3);
    ctx.strokeStyle = g.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(-9 - armSwing, 5);
    ctx.moveTo(8, -8);
    ctx.lineTo(9 + armSwing, 5);
    ctx.stroke();
    ctx.fillStyle = '#e8b98a';
    ctx.beginPath();
    ctx.arc(-9 - armSwing, 5, 2.5, 0, Math.PI * 2);
    ctx.arc(9 + armSwing, 5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Body in the guard's uniform colour (build = torso width).
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -12, bw, 17, 5);
    ctx.fill();
    // Gold buttons + belt.
    ctx.fillStyle = PALETTE.goldBright;
    ctx.fillRect(-1, -8, 2, 10);
    ctx.fillStyle = '#0c0f13';
    ctx.fillRect(-bw / 2, 2, bw, 3);
    // Head + the guard's own headwear (peaked cap, bun, flat cap, campaign).
    ctx.fillStyle = '#e8b98a';
    ctx.beginPath();
    ctx.arc(0, -17, 7.5, 0, Math.PI * 2);
    ctx.fill();
    drawHeadwear(ctx, g);
    // Direction tick: where the guard is looking.
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -17);
    ctx.lineTo(Math.cos(g.angle) * 13, -17 + Math.sin(g.angle) * 13);
    ctx.stroke();
    ctx.restore();
    // State mark above the head.
    if (g.state === 'chase') drawMark(ctx, g.x, g.y - 34, '!', '#e5484d');
    else if (g.state === 'suspicious' || g.state === 'search') drawMark(ctx, g.x, g.y - 34, '?', '#f2a93b');
    // Name pill: big initial chip in uniform colour + name, readable at 300px.
    drawNamePill(ctx, g.x, g.y + 26, g.initial, g.name, g.color, guardStateLabel(g));
  }
}

// Headwear per guard: peaked cap, hair bun, flat cap, or campaign hat —
// the NIGHTMAIL lesson: each guard reads as a different person at a glance.
function drawHeadwear(ctx, g) {
  const hat = g.hat || 'peaked';
  if (hat === 'bun') {
    // Dark hair + a bun on top.
    ctx.fillStyle = '#2a1c10';
    ctx.beginPath();
    ctx.arc(0, -20, 7, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -26, 3.5, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (hat === 'flat') {
    // Flat cap with a short brim.
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.arc(0, -20, 7, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-7, -21, 14, 2.5);
    return;
  }
  if (hat === 'campaign') {
    // Wide-brim campaign hat, KOVAC's signature.
    ctx.fillStyle = '#2f3a2f';
    ctx.beginPath();
    ctx.ellipse(0, -21, 11, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -23, 6, Math.PI, 0);
    ctx.fill();
    return;
  }
  // Peaked cap (default): crown + brim + a small gold badge.
  ctx.fillStyle = g.color;
  ctx.beginPath();
  ctx.arc(0, -20, 7, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(-7, -21, 14, 2.5);
  ctx.fillStyle = '#f2c94c';
  ctx.beginPath();
  ctx.arc(0, -22, 1.5, 0, Math.PI * 2);
  ctx.fill();
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
  // Bigger pill + bolder text than v1: at 1280px the names must still read
  // when the shot is shrunk to ~300px. The coloured initial chip still
  // carries identity; the name itself now reads too.
  ctx.font = 'bold 13px Georgia, serif';
  const nameW = ctx.measureText(name).width;
  const w = 30 + nameW + 10;
  ctx.fillStyle = 'rgba(10,14,18,0.85)';
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y, w, 24, 12);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - w / 2 + 15, y + 12, 11, 0, Math.PI * 2);
  ctx.fill();
  // Thin light rim so the chip pops off any floor at thumbnail size.
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(initial, x - w / 2 + 15, y + 17);
  ctx.fillStyle = '#f4efe2';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(name, x - w / 2 + 30, y + 17);
  if (state !== 'PATROL') {
    // State text gets the same dark backing pill as the camera labels:
    // bare amber on light marble (room 1) was nearly unreadable.
    ctx.font = 'bold 10px Georgia, serif';
    const sw = ctx.measureText(state).width + 16;
    ctx.fillStyle = 'rgba(10,14,18,0.85)';
    ctx.beginPath();
    ctx.roundRect(x - sw / 2, y + 28, sw, 18, 9);
    ctx.fill();
    ctx.fillStyle = state === 'CHASE' ? '#ff6b6f' : '#f2c94c';
    ctx.textAlign = 'center';
    ctx.fillText(state, x, y + 41);
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
  // Cloak with gold trim; the hem sways with the stride (or the room's
  // draught when the thief stands still).
  const hemShift = t.moving ? swing * 0.8 : Math.sin(time * 1.8) * 1.8;
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.moveTo(t.x - 11 + hemShift * 0.5, t.y + 6);
  ctx.quadraticCurveTo(t.x - 13 + hemShift, t.y - 10, t.x, t.y - 13);
  ctx.quadraticCurveTo(t.x + 13 + hemShift, t.y - 10, t.x + 11 + hemShift * 0.5, t.y + 6);
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
  // Rim light from the nearest lamp, so the silhouette reads in the dark.
  let nearest = null;
  let nearestD = Infinity;
  for (const lamp of game.room.lamps) {
    const d = dist(t.x, t.y, lamp.x, lamp.y);
    if (d < nearestD) { nearestD = d; nearest = lamp; }
  }
  if (nearest) {
    const lampAngle = Math.atan2(nearest.y - t.y, nearest.x - t.x);
    ctx.strokeStyle = 'rgba(255,214,120,0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 13, lampAngle - 0.9, lampAngle + 0.9);
    ctx.stroke();
  }
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

function drawLightPools(ctx, room, game, time) {
  // Warm pools under every lamp, composited additively over the floor.
  // The steel vault is the darkest room, so its pools are wider and
  // stronger; marble and carpet keep the original size.
  const steel = room.floor === 'steel';
  const poolR = steel ? 150 : 110;
  const poolA = steel ? 0.26 : 0.20;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const lamp of room.lamps) {
    const g = ctx.createRadialGradient(lamp.x, lamp.y, 6, lamp.x, lamp.y, poolR);
    g.addColorStop(0, 'rgba(255,214,120,' + poolA + ')');
    g.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, poolR, 0, Math.PI * 2);
    ctx.fill();
    // Dust motes drifting in the pool: ten specks per lamp, positions from
    // a seeded RNG so the render stays deterministic.
    const rng = mulberry32((lamp.x * 31 + lamp.y * 17) | 0);
    for (let i = 0; i < 10; i += 1) {
      const ox = (rng() * 2 - 1) * poolR * 0.8;
      const oy = (rng() * 2 - 1) * poolR * 0.6;
      const mr = 0.8 + rng() * 1.2;
      const ma = 0.12 + rng() * 0.25;
      const dx = Math.sin(time * 0.4 + i * 1.7) * 4;
      const dy = Math.cos(time * 0.33 + i * 2.1) * 3;
      ctx.fillStyle = 'rgba(255,240,200,' + ma.toFixed(2) + ')';
      ctx.beginPath();
      ctx.arc(lamp.x + ox + dx, lamp.y + oy + dy, mr, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Soft light shafts from the skylights, swaying gently with render time.
// Warm on marble/carpet, cool in the Vault.
function drawShafts(ctx, room, time) {
  const cool = room.floor === 'steel';
  const shafts = room.floor === 'marble'
    ? [{ x0: 380, x1: 460, dx: -60 }, { x0: 820, x1: 900, dx: 60 }]
    : room.floor === 'carpet'
      ? [{ x0: 300, x1: 380, dx: -70 }, { x0: 900, x1: 980, dx: 70 }]
      : [{ x0: 580, x1: 660, dx: 40 }];
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const sh of shafts) {
    const sway = Math.sin(time * 0.3) * 5;
    const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    grad.addColorStop(0, cool ? 'rgba(180,220,240,0.05)' : 'rgba(255,224,160,0.05)');
    grad.addColorStop(1, cool ? 'rgba(180,220,240,0)' : 'rgba(255,224,160,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(sh.x0, 0);
    ctx.lineTo(sh.x1, 0);
    ctx.lineTo(sh.x1 + sh.dx + sway, VIEW_H);
    ctx.lineTo(sh.x0 + sh.dx + sway, VIEW_H);
    ctx.closePath();
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
  ctx.fillStyle = 'rgba(255,180,80,0.065)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Alarm pulse: the whole frame throbs red while the alarm is live.
  if (game.alarm.state === 'alarm') {
    const pulse = 0.10 + 0.06 * Math.sin(time * 7);
    ctx.fillStyle = 'rgba(229,72,77,' + pulse + ')';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}
