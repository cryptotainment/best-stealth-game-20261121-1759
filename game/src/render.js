// Shadow Vault — everything drawn on the canvas: the floor, shadow zones,
// walls, crates and shelves, the exit, shards, guards with their vision
// cones and detection rings, the player, the HUD, and the title, caught,
// level-clear, win and game-over overlays. All art is drawn shapes, no
// images: the game loads nothing over the network.

import { COLOURS, GUARD, LEVEL, VIEW } from './config.js';
import { GUARD_CHASE } from './guard.js';
import { shardsTaken } from './player.js';
import { blockersOf, rayBlockDistance } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_CAUGHT = 'caught';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';

/** Draw the whole frame for the current screen and game state. */
export function render(ctx, screen, game, time) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  drawFloor(ctx, game.level);
  drawShadows(ctx, game.level);
  drawExit(ctx, game.level, game.shards, time);
  drawShards(ctx, game.shards, time);
  drawCover(ctx, game.level);
  drawGuards(ctx, game.guards, time, game.level);
  drawPlayer(ctx, game.player, time);
  drawHud(ctx, game, screen);
  if (screen === SCREEN_TITLE) drawTitle(ctx, game);
  else if (screen === SCREEN_CAUGHT) drawCaught(ctx, game);
  else if (screen === SCREEN_CLEAR) drawClear(ctx, game);
  else if (screen === SCREEN_WIN) drawWin(ctx, game);
  else if (screen === SCREEN_OVER) drawOver(ctx, game);
}

// ---------------------------------------------------------------- the floor

function drawFloor(ctx, level) {
  ctx.fillStyle = COLOURS.floor;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // Checker tiles, faint, so the floor reads as a warehouse slab.
  const tile = 80;
  ctx.fillStyle = COLOURS.floorAlt;
  for (let y = 0; y < VIEW.height; y += tile) {
    for (let x = 0; x < VIEW.width; x += tile) {
      if (((x + y) / tile) % 2 === 0) ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.strokeStyle = COLOURS.floorLine;
  ctx.lineWidth = 1;
  for (let x = 0; x <= VIEW.width; x += tile) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, VIEW.height);
    ctx.stroke();
  }
  for (let y = 0; y <= VIEW.height; y += tile) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW.width, y);
    ctx.stroke();
  }
  void level;
}

function drawShadows(ctx, level) {
  for (const s of level.shadows) {
    ctx.fillStyle = COLOURS.shadow;
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.strokeStyle = COLOURS.shadowEdge;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(s.x + 1, s.y + 1, s.w - 2, s.h - 2);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(154, 167, 189, 0.55)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SHADOW — hard to spot here', s.x + 8, s.y + 16);
  }
}

// ---------------------------------------------------------------- cover and goal

function drawCover(ctx, level) {
  for (const w of level.walls) {
    ctx.fillStyle = COLOURS.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = COLOURS.wallTop;
    ctx.fillRect(w.x, w.y, w.w, Math.min(6, w.h));
  }
  for (const c of level.crates) {
    ctx.fillStyle = COLOURS.crate;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = COLOURS.crateEdge;
    ctx.lineWidth = 3;
    ctx.strokeRect(c.x + 1.5, c.y + 1.5, c.w - 3, c.h - 3);
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x + c.w, c.y + c.h);
    ctx.moveTo(c.x + c.w, c.y);
    ctx.lineTo(c.x, c.y + c.h);
    ctx.stroke();
    ctx.fillStyle = COLOURS.crateTop;
    ctx.fillRect(c.x + 4, c.y + 4, c.w - 8, 8);
  }
  for (const s of level.shelves) {
    ctx.fillStyle = COLOURS.shelf;
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.fillStyle = COLOURS.shelfTop;
    ctx.fillRect(s.x, s.y, s.w, 6);
    ctx.strokeStyle = '#3a2d26';
    ctx.lineWidth = 2;
    for (let x = s.x + 18; x < s.x + s.w; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, s.y + 6);
      ctx.lineTo(x, s.y + s.h);
      ctx.stroke();
    }
  }
}

function drawExit(ctx, level, shards, time) {
  const e = level.exit;
  const open = shards.every((s) => s.taken);
  const pulse = open ? 0.7 + 0.3 * Math.sin(time * 4) : 1;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = open ? COLOURS.exitOpen : COLOURS.exitLocked;
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.restore();
  ctx.strokeStyle = open ? COLOURS.exitGlow : '#5a6a5a';
  ctx.lineWidth = open ? 4 : 2;
  ctx.strokeRect(e.x + 2, e.y + 2, e.w - 4, e.h - 4);
  ctx.fillStyle = open ? '#062b0d' : '#9aa7bd';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'EXIT' : 'LOCKED', e.x + e.w / 2, e.y + e.h / 2 + 5);
  if (open) {
    ctx.fillStyle = COLOURS.exitGlow;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('▼ GO!', e.x + e.w / 2, e.y + e.h + 16);
  }
}

function drawShards(ctx, shards, time) {
  for (const s of shards) {
    if (s.taken) continue;
    const bob = Math.sin(time * 3 + s.x) * 3;
    const glow = 10 + 4 * Math.sin(time * 5 + s.y);
    ctx.save();
    ctx.shadowColor = COLOURS.shardGlow;
    ctx.shadowBlur = glow;
    ctx.fillStyle = COLOURS.shard;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y - 12 + bob);
    ctx.lineTo(s.x + 9, s.y + bob);
    ctx.lineTo(s.x, s.y + 12 + bob);
    ctx.lineTo(s.x - 9, s.y + bob);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#7a5c00';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CODE', s.x, s.y + 26 + bob);
  }
}

// ---------------------------------------------------------------- guards and player

function drawGuards(ctx, guards, time, level) {
  for (const g of guards) drawCone(ctx, g, level);
  for (const g of guards) drawGuard(ctx, g, time);
}

/**
 * The vision cone, clipped by walls, crates and shelves: a fan of rays is
 * cast across the cone and each one stops at the first blocker it hits, so
 * the cone shows exactly what the guard can see — never through a wall.
 */
function drawCone(ctx, guard, level) {
  const hot = guard.state === GUARD_CHASE;
  const range = GUARD.viewDistance;
  const blockers = blockersOf(level);
  const rays = 26;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  for (let i = 0; i <= rays; i += 1) {
    const angle = guard.facing - GUARD.viewHalfAngle + (2 * GUARD.viewHalfAngle * i) / rays;
    const dist = rayBlockDistance(guard.x, guard.y, angle, range, blockers);
    ctx.lineTo(guard.x + Math.cos(angle) * dist, guard.y + Math.sin(angle) * dist);
  }
  ctx.closePath();
  ctx.fillStyle = hot ? COLOURS.coneHot : COLOURS.coneCalm;
  ctx.fill();
  ctx.strokeStyle = hot ? 'rgba(231, 76, 60, 0.7)' : COLOURS.coneEdge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawGuard(ctx, guard, time) {
  // Body: a red circle with a visor facing the patrol direction.
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 6;
  ctx.fillStyle = COLOURS.guardBody;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, GUARD.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = COLOURS.guardVisor;
  ctx.beginPath();
  ctx.arc(
    guard.x + Math.cos(guard.facing) * 7,
    guard.y + Math.sin(guard.facing) * 7,
    5,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Detection ring: fills as the guard grows suspicious, red at full.
  if (guard.detection > 0.02) {
    ctx.strokeStyle = guard.detection > 0.75 ? '#ff3b2f' : COLOURS.shard;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, GUARD.radius + 7, -Math.PI / 2, -Math.PI / 2 + guard.detection * Math.PI * 2);
    ctx.stroke();
  }
  if (guard.state === GUARD_CHASE) {
    ctx.fillStyle = '#ff3b2f';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', guard.x, guard.y - GUARD.radius - 8 + Math.sin(time * 8) * 2);
  } else if (guard.detection > 0.4) {
    ctx.fillStyle = COLOURS.shard;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', guard.x, guard.y - GUARD.radius - 8);
  }
}

function drawPlayer(ctx, player, time) {
  const bob = player.moving ? Math.sin(time * (player.sneaking ? 8 : 14)) * 1.5 : 0;
  ctx.save();
  ctx.translate(player.x, player.y + bob);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = COLOURS.playerHood;
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = COLOURS.player;
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  // A direction tick, so the player reads as a hooded figure facing somewhere.
  ctx.strokeStyle = COLOURS.playerHood;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(Math.cos(player.facing) * 6, Math.sin(player.facing) * 6);
  ctx.lineTo(Math.cos(player.facing) * 14, Math.sin(player.facing) * 14);
  ctx.stroke();
  if (player.sneaking) {
    ctx.fillStyle = '#9aa7bd';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SNEAK', player.x, player.y - 20);
  }
}

// ---------------------------------------------------------------- the HUD

function drawHud(ctx, game, screen) {
  const bar = { x: 14, y: 10, w: 932, h: 30 };
  ctx.fillStyle = 'rgba(8, 11, 18, 0.72)';
  ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
  ctx.fillStyle = COLOURS.hudText;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(game.level.name, bar.x + 10, bar.y + 20);
  const taken = shardsTaken(game.shards);
  ctx.fillStyle = taken === LEVEL.shardsPerLevel ? COLOURS.hudOk : COLOURS.shard;
  ctx.fillText(`◆ SHARDS ${taken}/${LEVEL.shardsPerLevel}`, 330, bar.y + 20);
  ctx.fillStyle = COLOURS.hudText;
  ctx.fillText(`♥ LIVES ${'●'.repeat(game.lives)}${'○'.repeat(Math.max(0, LEVEL.lives - game.lives))}`, 500, bar.y + 20);
  ctx.fillText(`⏱ ${formatTime(game.elapsed)}`, 660, bar.y + 20);
  ctx.fillText(`SCORE ${game.score}`, 800, bar.y + 20);

  // The alarm meter: the highest detection among the guards.
  const top = game.guards.reduce((m, g) => Math.max(m, g.detection), 0);
  const chasing = game.guards.some((g) => g.state === GUARD_CHASE);
  const meter = { x: 14, y: 48, w: 300, h: 14 };
  ctx.fillStyle = 'rgba(8, 11, 18, 0.72)';
  ctx.fillRect(meter.x - 4, meter.y - 4, meter.w + 8, meter.h + 8);
  ctx.fillStyle = '#2a3347';
  ctx.fillRect(meter.x, meter.y, meter.w, meter.h);
  ctx.fillStyle = chasing ? '#ff3b2f' : top > 0.6 ? '#ff8c1a' : COLOURS.shard;
  ctx.fillRect(meter.x, meter.y, meter.w * top, meter.h);
  ctx.fillStyle = chasing ? COLOURS.hudDanger : COLOURS.hudDim;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(chasing ? '⚠ SPOTTED — RUN!' : top > 0.02 ? 'DETECTION' : 'UNSEEN', meter.x + meter.w + 10, meter.y + 12);

  ctx.fillStyle = COLOURS.hudDim;
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(game.level.hint, 14, VIEW.height - 12);
  void screen;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ---------------------------------------------------------------- overlays

function overlay(ctx) {
  ctx.fillStyle = COLOURS.overlay;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

function overlayTitle(ctx, text, y) {
  ctx.fillStyle = COLOURS.title;
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, VIEW.width / 2, y);
}

function overlayLine(ctx, text, y, colour, size) {
  ctx.fillStyle = colour ?? COLOURS.hudText;
  ctx.font = `${size ?? 17}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(text, VIEW.width / 2, y);
}

function drawTitle(ctx, game) {
  overlay(ctx);
  overlayTitle(ctx, 'SHADOW VAULT', 170);
  overlayLine(ctx, 'A top-down stealth heist — slip in, steal the codes, slip out.', 210, COLOURS.hudText, 18);
  overlayLine(ctx, 'WASD / ARROWS — move      SHIFT — sneak (slow, quiet, hard to spot)', 260, COLOURS.hudText, 16);
  overlayLine(ctx, 'MOUSE — click to move      Yellow cones are guard vision — crates and walls block it', 288, COLOURS.hudText, 16);
  overlayLine(ctx, 'Dark SHADOW zones slow detection. Break line of sight and the meter drains.', 316, COLOURS.hudText, 16);
  overlayLine(ctx, 'Collect 3 code shards, then reach the glowing green EXIT. 3 lives.', 344, COLOURS.hudText, 16);
  overlayLine(ctx, 'PRESS ENTER OR CLICK TO START', 420, COLOURS.hudOk, 20);
  overlayLine(ctx, `Best score: ${game.best}`, 470, COLOURS.hudDim, 14);
}

function drawCaught(ctx, game) {
  overlay(ctx);
  overlayTitle(ctx, 'CAUGHT!', 240);
  overlayLine(ctx, `A guard laid hands on you. ${game.lives} ${game.lives === 1 ? 'life' : 'lives'} left.`, 290, COLOURS.hudText, 18);
  overlayLine(ctx, 'PRESS ENTER TO TRY THE LEVEL AGAIN', 350, COLOURS.hudOk, 18);
}

function drawClear(ctx, game) {
  overlay(ctx);
  overlayTitle(ctx, 'LEVEL CLEAR', 240);
  overlayLine(ctx, `You slipped out with the codes. Score ${game.score}.`, 290, COLOURS.hudText, 18);
  overlayLine(ctx, 'PRESS ENTER FOR THE NEXT LEVEL', 350, COLOURS.hudOk, 18);
}

function drawWin(ctx, game) {
  overlay(ctx);
  overlayTitle(ctx, 'YOU MADE IT!', 220);
  overlayLine(ctx, 'All three vaults cracked. The Shadow Vault is yours.', 270, COLOURS.hudText, 18);
  overlayLine(ctx, `Final score ${game.score}   •   Time ${formatTime(game.elapsed)}`, 310, COLOURS.hudText, 18);
  overlayLine(ctx, 'PRESS ENTER TO PLAY AGAIN', 380, COLOURS.hudOk, 18);
}

function drawOver(ctx, game) {
  overlay(ctx);
  overlayTitle(ctx, 'GAME OVER', 240);
  overlayLine(ctx, 'The vault keeps its secrets — this time.', 290, COLOURS.hudText, 18);
  overlayLine(ctx, `Score ${game.score}`, 320, COLOURS.hudText, 18);
  overlayLine(ctx, 'PRESS ENTER TO TRY AGAIN', 380, COLOURS.hudOk, 18);
}
