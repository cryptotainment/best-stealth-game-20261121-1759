// Shadow Vault — the player: movement, sneaking, collision, pickups, exit.
// The infiltrator moves with WASD or the arrow keys (or click-to-move),
// holds Shift to sneak, slides along walls, picks up code shards by touch,
// and slips through the EXIT once all three shards are collected.

import { LEVEL, PLAYER } from './config.js';
import { blockersOf, distance, moveCircle } from './world.js';

/** A fresh player at the level's start point. */
export function createPlayer(start) {
  return {
    x: start.x,
    y: start.y,
    vx: 0,
    vy: 0,
    facing: -Math.PI / 2, // facing up, into the warehouse
    sneaking: false,
    moving: false,
    stepTimer: 0,
  };
}

/**
 * Step the player forward by dt seconds from the current input.
 * `input` carries { dx, dy } (a unit-ish move direction, or 0,0) and
 * { sneak } (Shift held). Returns 'step' when a footstep tick is due, for
 * the sound, and fills `events` with 'shard' or 'exit' when one happens.
 */
export function stepPlayer(player, input, level, shards, dt, events) {
  const speed = input.sneak ? PLAYER.sneakSpeed : PLAYER.walkSpeed;
  player.sneaking = input.sneak;
  const wantX = input.dx * speed;
  const wantY = input.dy * speed;
  const k = Math.min(1, (PLAYER.accel * dt) / speed || 0);
  player.vx += (wantX - player.vx) * k;
  player.vy += (wantY - player.vy) * k;
  const blockers = blockersOf(level);
  const next = moveCircle(player.x, player.y, player.vx * dt, player.vy * dt, PLAYER.radius, blockers);
  const moved = Math.hypot(next.x - player.x, next.y - player.y);
  player.x = next.x;
  player.y = next.y;
  player.moving = moved > 0.5;
  if (player.moving) {
    player.facing = Math.atan2(player.vy, player.vx);
    player.stepTimer -= dt;
    if (player.stepTimer <= 0) {
      player.stepTimer = input.sneak ? 0.5 : 0.34;
      events.push('step');
    }
  } else {
    player.stepTimer = 0;
  }

  // Pick up any shard within reach.
  for (const shard of shards) {
    if (!shard.taken && distance(player, shard) <= LEVEL.pickupDistance) {
      shard.taken = true;
      events.push('shard');
    }
  }

  // The exit opens only once every shard is taken.
  const allTaken = shards.every((s) => s.taken);
  if (allTaken) {
    const exit = level.exit;
    const centre = { x: exit.x + exit.w / 2, y: exit.y + exit.h / 2 };
    if (distance(player, centre) <= LEVEL.exitRadius + 8) events.push('exit');
  }
  return null;
}

/** How many shards the player has collected in this level. */
export function shardsTaken(shards) {
  return shards.filter((s) => s.taken).length;
}
