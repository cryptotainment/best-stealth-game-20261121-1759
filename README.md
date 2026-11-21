[![make.fun · best-stealth-game-20261121-1759](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/cryptotainment/best-stealth-game-20261121-1759/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/cryptotainment/best-stealth-game-20261121-1759/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)

# Shadow Vault — Stealth Heist

A top-down 2D stealth heist that runs in a desktop browser from static files, no network needed. You are a lone infiltrator slipping through a night warehouse to steal the vault codes and reach the exit unseen.

## Play

Open `game/index.html` in desktop Chrome (or serve `game/` with any static server).

- **WASD / arrow keys** — move. **Shift** — sneak: slower, quieter, harder to spot. **Mouse click** — click to move.
- Guards patrol fixed routes with **vision cones**. Stand in a cone with a clear line of sight and their **detection meter** fills; break line of sight behind a crate or wall and it drains — a near miss can be recovered from.
- **Dark shadow zones** slow detection. **Crates, shelves and walls block sight.**
- Collect **3 code shards**, then reach the glowing green **EXIT**. 3 levels, rising difficulty. 3 lives — get caught and the level restarts.
- Sound is synthesised WebAudio only: footsteps, an alert sting, a pickup chime. No audio files.

## Screenshots

Deterministic scenes of the game's own code: `game/index.html?shot=cover` (level 1 mid-play), `?shot=play` (level 2, guard closing in), `?shot=win` (level 3, exit reached).

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library.

## Layout

- `game/index.html` — the page, canvas and HUD shell
- `game/src/config.js` — sizes, speeds, colours, tuning
- `game/src/world.js` — the 3 level maps and geometry (line of sight, collision)
- `game/src/guard.js` — patrol, vision cones, detection, chase, alarm
- `game/src/player.js` — movement, sneaking, shard pickup, exit
- `game/src/render.js` — canvas drawing: floor, cover, cones, HUD, overlays
- `game/src/input.js` — keyboard and mouse
- `game/src/sound.js` — WebAudio footsteps, alert, pickup
- `game/src/shots.js` — deterministic `?shot=` screenshot scenes
- `game/src/main.js` — the game loop, level flow, lives, win and lose

MIT licensed. Built for the make.fun best stealth game competition.
