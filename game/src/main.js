// Shadow Vault — the game loop: screens, level flow, lives, win and lose.
// One level per screen, three levels in all. The player collects 3 code
// shards, then reaches the glowing EXIT. Getting caught costs a life and
// restarts the level; three lives lost ends the run. ?shot= modes stage a
// fixed scene for screenshots instead of starting at the title screen.

import { VIEW } from './config.js';
import { LEVELS } from './world.js';
import { anyChasing, createGuard, stepGuard } from './guard.js';
import { createPlayer, shardsTaken, stepPlayer } from './player.js';
import { createInput, readMove } from './input.js';
import { createSound, playAlert, playCaught, playClear, playPickup, playStep, unlockSound } from './sound.js';
import {
  render,
  SCREEN_CAUGHT,
  SCREEN_CLEAR,
  SCREEN_OVER,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_WIN,
} from './render.js';
import { shotLevelIndex, stageShot } from './shots.js';

const BEST_KEY = 'shadow-vault-best';

/** A fresh game state for level `levelIndex` (0-based). */
function makeGame(levelIndex, lives, score, elapsed) {
  const level = LEVELS[levelIndex];
  return {
    levelIndex,
    level,
    player: createPlayer(level.playerStart),
    guards: level.guards.map((spec) => createGuard(spec, level)),
    shards: level.shards.map((s) => ({ x: s.x, y: s.y, taken: false })),
    lives,
    score,
    elapsed,
    best: Number(window.localStorage?.getItem(BEST_KEY) ?? 0) || 0,
  };
}

function loadBest() {
  try {
    return Number(window.localStorage?.getItem(BEST_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function saveBest(score) {
  try {
    window.localStorage?.setItem(BEST_KEY, String(score));
  } catch {
    // Private mode or no storage: the best score just is not kept.
  }
}

function main() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const sound = createSound();

  let game = makeGame(0, 3, 0, 0);
  game.best = loadBest();
  let screen = SCREEN_TITLE;
  let time = 0;
  let last = performance.now();
  let wasChasing = false;

  const input = createInput(canvas, onConfirm, () => unlockSound(sound));
  canvas.addEventListener('mousedown', () => unlockSound(sound));

  /** Enter (or a click on the title) advances the current screen. */
  function onConfirm() {
    unlockSound(sound);
    if (screen === SCREEN_TITLE) {
      game = makeGame(0, 3, 0, 0);
      game.best = loadBest();
      screen = SCREEN_PLAY;
    } else if (screen === SCREEN_CAUGHT) {
      if (game.lives > 0) {
        game = makeGame(game.levelIndex, game.lives, game.score, game.elapsed);
        screen = SCREEN_PLAY;
      } else {
        screen = SCREEN_OVER;
      }
    } else if (screen === SCREEN_CLEAR) {
      const next = game.levelIndex + 1;
      if (next >= LEVELS.length) {
        screen = SCREEN_WIN;
      } else {
        game = makeGame(next, game.lives, game.score, game.elapsed);
        screen = SCREEN_PLAY;
      }
    } else if (screen === SCREEN_WIN || screen === SCREEN_OVER) {
      game = makeGame(0, 3, 0, 0);
      game.best = loadBest();
      screen = SCREEN_PLAY;
    }
  }

  /** One frame of play: move the player, step the guards, handle events. */
  function stepPlay(dt) {
    game.elapsed += dt;
    const move = readMove(input, game.player);
    const events = [];
    stepPlayer(game.player, move, game.level, game.shards, dt, events);
    for (const guard of game.guards) {
      const caught = stepGuard(guard, game.player, game.level, dt, events);
      if (caught === 'caught') {
        game.lives -= 1;
        playCaught(sound);
        if (game.lives <= 0) {
          if (game.score > game.best) {
            game.best = game.score;
            saveBest(game.score);
          }
          screen = SCREEN_OVER;
        } else {
          screen = SCREEN_CAUGHT;
        }
        return;
      }
    }
    const chasing = anyChasing(game.guards);
    if (chasing && !wasChasing) playAlert(sound);
    wasChasing = chasing;
    for (const event of events) {
      if (event === 'step') playStep(sound, game.player.sneaking);
      else if (event === 'shard') {
        game.score += 100;
        playPickup(sound);
      } else if (event === 'exit') {
        game.score += 250 + Math.max(0, 300 - Math.floor(game.elapsed));
        playClear(sound);
        if (game.score > game.best) {
          game.best = game.score;
          saveBest(game.score);
        }
        if (game.levelIndex + 1 >= LEVELS.length) screen = SCREEN_WIN;
        else screen = SCREEN_CLEAR;
      }
    }
    void 0;
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;
    if (screen === SCREEN_PLAY) stepPlay(dt);
    render(ctx, screen, game, time);
    requestAnimationFrame(frame);
  }

  if (shot) {
    // A deterministic screenshot scene: stage it and draw one still frame.
    // The game does not run in this mode; the frame is exactly the staged state.
    const staged = stageShot(shot, shotLevelIndex(shot), (i) => makeGame(i, 3, 0, 0));
    game = staged.game;
    game.best = loadBest();
    screen = staged.screen;
    render(ctx, screen, game, 1.2);
    document.title = `Shadow Vault — shot ${shot}`;
  } else {
    requestAnimationFrame(frame);
  }

  // A small handle for automated play-testing: the live state, the current
  // screen and the level the player is on. Read-only from outside the game.
  window.__shadowVault = {
    get game() {
      return game;
    },
    get screen() {
      return screen;
    },
    get levelIndex() {
      return game.levelIndex;
    },
    start() {
      onConfirm();
    },
    confirm: onConfirm,
  };
}

main();
