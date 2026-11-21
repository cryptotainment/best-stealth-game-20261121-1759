// Shadow Vault — deterministic screenshot scenes behind ?shot=.
// Each scene builds a real level with the real rules and then stages it by
// hand (player, guards and shards placed at fixed spots), so the same URL
// always renders the same frame. No randomness, no simulation drift: what
// you see is what the game itself draws while playing.
//
//   ?shot=cover  level 1 mid-play: cones visible, one shard taken, cover in view
//   ?shot=play   level 2: a guard close by, the detection meter half full
//   ?shot=win    level 3: every shard taken, the player at the open EXIT
//   anything else (or none) plays the game normally from the title screen.

import { LEVELS } from './world.js';
import { GUARD_PATROL } from './guard.js';
import { SCREEN_CLEAR, SCREEN_PLAY, SCREEN_WIN } from './render.js';

/**
 * Build a fresh game state for level `levelIndex` (0-based) and stage the
 * named shot on it. Returns { game, screen }: the state render.js draws and
 * the screen to draw over it.
 */
export function stageShot(name, levelIndex, makeGame) {
  const level = LEVELS[levelIndex];
  const game = makeGame(levelIndex);

  if (name === 'play') {
    // Level 2, the player hugging a crate while a guard's cone sweeps past:
    // two shards taken, the meter half full, one guard suspicious.
    game.player.x = 470;
    game.player.y = 380;
    game.player.sneaking = true;
    game.player.facing = Math.PI;
    game.shards[0].taken = true;
    game.shards[1].taken = true;
    const guard = game.guards[0];
    guard.x = 470;
    guard.y = 250;
    guard.facing = Math.PI / 2;
    guard.detection = 0.55;
    guard.state = GUARD_PATROL;
    game.guards[1].x = 780;
    game.guards[1].y = 240;
    game.guards[1].facing = Math.PI;
    game.elapsed = 87;
    game.score = 220;
    return { game, screen: SCREEN_PLAY };
  }

  if (name === 'win') {
    // Level 3, all three shards taken, the player stepping into the open
    // EXIT: the win overlay on top.
    for (const shard of game.shards) shard.taken = true;
    game.player.x = level.exit.x + level.exit.w / 2;
    game.player.y = level.exit.y + level.exit.h / 2 + 6;
    game.player.facing = -Math.PI / 2;
    game.elapsed = 214;
    game.score = 940;
    return { game, screen: SCREEN_WIN };
  }

  if (name === 'clear') {
    for (const shard of game.shards) shard.taken = true;
    game.player.x = 860;
    game.player.y = 120;
    game.elapsed = 132;
    game.score = 610;
    return { game, screen: SCREEN_CLEAR };
  }

  // Cover: level 1 mid-play. The player crouches behind the crate pair at
  // the centre-left, one shard already taken, a guard patrolling the middle
  // with its cone sweeping across the floor, the second guard up top.
  game.player.x = 250;
  game.player.y = 350;
  game.player.sneaking = true;
  game.player.facing = Math.PI / 2;
  game.shards[0].taken = true;
  const guard = game.guards[0];
  guard.x = 480;
  guard.y = 400;
  guard.facing = -Math.PI / 2;
  guard.detection = 0.18;
  const second = game.guards[1];
  second.x = 430;
  second.y = 120;
  second.facing = 0;
  game.elapsed = 43;
  game.score = 100;
  return { game, screen: SCREEN_PLAY };
}

/** The level index a shot name stages (cover 0, play 1, win 2, clear 1). */
export function shotLevelIndex(name) {
  if (name === 'play') return 1;
  if (name === 'win') return 2;
  if (name === 'clear') return 1;
  return 0;
}
