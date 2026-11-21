// Shadow Vault — shared constants: sizes, speeds, colours, tuning.
// One place for every number the rest of the game reads, so a level or a
// mechanic can be retuned here without touching the code that uses it.

export const VIEW = { width: 960, height: 640 };

export const PLAYER = {
  radius: 13,
  walkSpeed: 165, // px per second, standing up and moving
  sneakSpeed: 82, // px per second, holding Shift: slower, quieter, harder to spot
  accel: 1400, // px/s^2 toward the wanted velocity
};

export const GUARD = {
  radius: 14,
  patrolSpeed: 62, // px per second along the patrol route
  chaseSpeed: 148, // px per second once the alarm is raised
  returnSpeed: 95, // px per second walking back to the patrol route
  viewDistance: 215, // how far a guard can see, in px
  viewHalfAngle: 0.62, // radians either side of the facing direction
  catchDistance: 22, // touching the player while chasing ends the level
  // Detection fills per second while the player is seen. Sneaking and standing
  // in shadow both slow it; running in the open fills it fastest.
  detectSeen: 0.85,
  detectSeenSneak: 0.5,
  detectSeenShadow: 0.45,
  detectSeenSneakShadow: 0.26,
  detectDrain: 0.34, // detection drains per second once line of sight breaks
  giveUpSeconds: 2.6, // chasing without seeing the player before giving up
  pauseAtWaypoint: 0.9, // seconds a guard waits at each waypoint, looking around
  lookAroundArc: 1.15, // radians a guard sweeps while paused at a waypoint
};

export const LEVEL = {
  lives: 3,
  shardsPerLevel: 3,
  shardRadius: 11,
  pickupDistance: 26,
  exitRadius: 26,
  exitOpenGlow: 0.55,
};

export const COLOURS = {
  floor: '#1d2431',
  floorAlt: '#202839',
  floorLine: '#262f42',
  shadow: '#101623', // dark floor zones: detection fills slower inside them
  shadowEdge: '#2b3648',
  wall: '#3d4b66',
  wallTop: '#55648a',
  crate: '#6b5233',
  crateTop: '#8a6c42',
  crateEdge: '#4a3820',
  shelf: '#54423a',
  shelfTop: '#6e564a',
  exitLocked: '#3a4a3a',
  exitOpen: '#39d353',
  exitGlow: '#7CFC00',
  shard: '#ffd23e',
  shardGlow: '#ffea8a',
  player: '#e8e6df',
  playerHood: '#2c3550',
  guardBody: '#c0392b',
  guardVisor: '#f5d76e',
  coneCalm: 'rgba(245, 215, 110, 0.20)',
  coneHot: 'rgba(231, 76, 60, 0.34)',
  coneEdge: 'rgba(245, 215, 110, 0.55)',
  hudText: '#e8ecf4',
  hudDim: '#9aa7bd',
  hudDanger: '#ff5d4d',
  hudOk: '#39d353',
  overlay: 'rgba(8, 11, 18, 0.82)',
  title: '#f2c94c',
};

export const SOUND = {
  stepIntervalWalk: 0.34, // seconds between footstep ticks while walking
  stepIntervalSneak: 0.5, // sneaking steps are further apart and softer
  stepVolumeWalk: 0.10,
  stepVolumeSneak: 0.035,
};
