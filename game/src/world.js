// Shadow Vault — the levels and the geometry the game stands on.
// A level is walls, crates, shelves (all block movement and sight), dark
// shadow zones (detection fills slower inside them), 3 code shards, a glowing
// EXIT, the player's start, and each guard's patrol waypoints. Everything
// here is plain data; guard.js and player.js read it, render.js draws it.

// A rectangle: { x, y, w, h } in play-area pixels (960 x 640).
// A point: { x, y }.

/** The three levels, easiest first: more guards, faster patrols, tighter cover. */
export const LEVELS = [
  {
    name: 'LEVEL 1 — THE LOADING DOCK',
    hint: 'Hold SHIFT to sneak. Crates block sight. Grab 3 shards, then reach the EXIT.',
    playerStart: { x: 70, y: 580 },
    exit: { x: 890, y: 70, w: 52, h: 52 },
    shards: [
      { x: 300, y: 120 },
      { x: 620, y: 480 },
      { x: 850, y: 330 },
    ],
    walls: [
      { x: 0, y: 0, w: 960, h: 18 },
      { x: 0, y: 622, w: 960, h: 18 },
      { x: 0, y: 0, w: 18, h: 640 },
      { x: 942, y: 0, w: 18, h: 640 },
      { x: 380, y: 150, w: 200, h: 26 },
      { x: 180, y: 380, w: 26, h: 150 },
    ],
    crates: [
      { x: 220, y: 260, w: 64, h: 64 },
      { x: 300, y: 260, w: 64, h: 64 },
      { x: 520, y: 360, w: 64, h: 64 },
      { x: 700, y: 140, w: 64, h: 64 },
      { x: 120, y: 480, w: 64, h: 64 },
      { x: 700, y: 440, w: 64, h: 64 },
    ],
    shelves: [
      { x: 470, y: 130, w: 110, h: 30 },
      { x: 640, y: 560, w: 110, h: 30 },
    ],
    shadows: [
      { x: 40, y: 200, w: 170, h: 130 },
      { x: 560, y: 120, w: 170, h: 110 },
      { x: 700, y: 380, w: 200, h: 120 },
    ],
    guards: [
      {
        waypoints: [
          { x: 480, y: 300 },
          { x: 480, y: 520 },
          { x: 820, y: 520 },
          { x: 820, y: 300 },
        ],
        patrolSpeed: 62,
      },
      {
        waypoints: [
          { x: 200, y: 90 },
          { x: 660, y: 90 },
          { x: 660, y: 210 },
          { x: 200, y: 210 },
        ],
        patrolSpeed: 55,
      },
    ],
  },
  {
    name: 'LEVEL 2 — THE VAULT FLOOR',
    hint: 'Two guards cross the middle. Wait for a cone to turn, then move.',
    playerStart: { x: 70, y: 580 },
    exit: { x: 890, y: 70, w: 52, h: 52 },
    shards: [
      { x: 180, y: 100 },
      { x: 480, y: 320 },
      { x: 830, y: 540 },
    ],
    walls: [
      { x: 0, y: 0, w: 960, h: 18 },
      { x: 0, y: 622, w: 960, h: 18 },
      { x: 0, y: 0, w: 18, h: 640 },
      { x: 942, y: 0, w: 18, h: 640 },
      { x: 300, y: 240, w: 26, h: 180 },
      { x: 620, y: 180, w: 26, h: 180 },
      { x: 520, y: 430, w: 120, h: 26 },
    ],
    crates: [
      { x: 130, y: 300, w: 64, h: 64 },
      { x: 360, y: 300, w: 64, h: 64 },
      { x: 600, y: 380, w: 64, h: 64 },
      { x: 780, y: 300, w: 64, h: 64 },
      { x: 380, y: 90, w: 64, h: 64 },
      { x: 120, y: 480, w: 64, h: 64 },
      { x: 760, y: 380, w: 64, h: 64 },
    ],
    shelves: [
      { x: 240, y: 90, w: 110, h: 30 },
      { x: 340, y: 560, w: 110, h: 30 },
      { x: 700, y: 130, w: 110, h: 30 },
    ],
    shadows: [
      { x: 40, y: 120, w: 160, h: 130 },
      { x: 380, y: 480, w: 180, h: 110 },
      { x: 700, y: 440, w: 180, h: 120 },
      { x: 400, y: 180, w: 150, h: 90 },
    ],
    guards: [
      {
        waypoints: [
          { x: 250, y: 180 },
          { x: 250, y: 480 },
          { x: 470, y: 480 },
          { x: 470, y: 180 },
        ],
        patrolSpeed: 70,
      },
      {
        waypoints: [
          { x: 700, y: 180 },
          { x: 700, y: 480 },
          { x: 880, y: 480 },
          { x: 880, y: 180 },
        ],
        patrolSpeed: 70,
      },
      {
        waypoints: [
          { x: 480, y: 90 },
          { x: 880, y: 90 },
          { x: 880, y: 560 },
          { x: 480, y: 560 },
        ],
        patrolSpeed: 58,
      },
    ],
  },
  {
    name: 'LEVEL 3 — THE INNER VAULT',
    hint: 'Four guards, fast patrols. Shadows are your only friends now.',
    playerStart: { x: 70, y: 580 },
    exit: { x: 890, y: 70, w: 52, h: 52 },
    shards: [
      { x: 140, y: 160 },
      { x: 480, y: 120 },
      { x: 480, y: 520 },
    ],
    walls: [
      { x: 0, y: 0, w: 960, h: 18 },
      { x: 0, y: 622, w: 960, h: 18 },
      { x: 0, y: 0, w: 18, h: 640 },
      { x: 942, y: 0, w: 18, h: 640 },
      { x: 280, y: 260, w: 26, h: 140 },
      { x: 500, y: 260, w: 26, h: 120 },
      { x: 720, y: 260, w: 26, h: 100 },
      { x: 300, y: 430, w: 80, h: 26 },
    ],
    crates: [
      { x: 60, y: 280, w: 64, h: 64 },
      { x: 320, y: 120, w: 64, h: 64 },
      { x: 580, y: 120, w: 64, h: 64 },
      { x: 720, y: 440, w: 64, h: 64 },
      { x: 640, y: 440, w: 64, h: 64 },
      { x: 60, y: 480, w: 64, h: 64 },
    ],
    shelves: [
      { x: 60, y: 90, w: 110, h: 30 },
      { x: 200, y: 580, w: 110, h: 30 },
    ],
    shadows: [
      { x: 40, y: 100, w: 160, h: 140 },
      { x: 560, y: 400, w: 200, h: 130 },
      { x: 300, y: 300, w: 150, h: 110 },
      { x: 760, y: 180, w: 160, h: 110 },
    ],
    guards: [
      {
        waypoints: [
          { x: 160, y: 220 },
          { x: 160, y: 520 },
          { x: 400, y: 520 },
          { x: 400, y: 220 },
        ],
        patrolSpeed: 78,
      },
      {
        waypoints: [
          { x: 560, y: 220 },
          { x: 560, y: 520 },
          { x: 800, y: 520 },
          { x: 800, y: 220 },
        ],
        patrolSpeed: 78,
      },
      {
        waypoints: [
          { x: 250, y: 90 },
          { x: 880, y: 90 },
          { x: 880, y: 560 },
          { x: 250, y: 560 },
        ],
        patrolSpeed: 66,
      },
      {
        waypoints: [
          { x: 480, y: 200 },
          { x: 700, y: 200 },
          { x: 700, y: 420 },
          { x: 480, y: 420 },
        ],
        patrolSpeed: 72,
      },
    ],
  },
];

/** Every rectangle that blocks movement and sight in a level. */
export function blockersOf(level) {
  return [...level.walls, ...level.crates, ...level.shelves];
}

/** Whether the point lies inside the rectangle (edges count as inside). */
export function pointInRect(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

/** Whether a circle of radius r at (x, y) overlaps the rectangle. */
export function circleHitsRect(x, y, r, rect) {
  const cx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy < r * r;
}

/** Whether any blocker contains the circle at (x, y) with radius r. */
export function collidesWithBlockers(x, y, r, blockers) {
  for (const b of blockers) if (circleHitsRect(x, y, r, b)) return true;
  return false;
}

/**
 * Move a circle from (x, y) by (dx, dy), sliding along blockers: try the full
 * move, then each axis alone, so the player slides along a wall instead of
 * sticking to it.
 */
export function moveCircle(x, y, dx, dy, r, blockers) {
  if (!collidesWithBlockers(x + dx, y + dy, r, blockers)) return { x: x + dx, y: y + dy };
  if (!collidesWithBlockers(x + dx, y, r, blockers)) return { x: x + dx, y };
  if (!collidesWithBlockers(x, y + dy, r, blockers)) return { x, y: y + dy };
  return { x, y };
}

/** Whether the segment from a to b crosses the rectangle (edges count). */
function segmentHitsRect(a, b, r) {
  if (pointInRect(a, r) || pointInRect(b, r)) return true;
  const corners = [
    { x: r.x, y: r.y },
    { x: r.x + r.w, y: r.y },
    { x: r.x + r.w, y: r.y + r.h },
    { x: r.x, y: r.y + r.h },
  ];
  for (let i = 0; i < 4; i += 1) {
    if (segmentsCross(a, b, corners[i], corners[(i + 1) % 4])) return true;
  }
  return false;
}

/** Whether segments p1-p2 and p3-p4 cross (touching counts). */
function segmentsCross(p1, p2, p3, p4) {
  const d1 = side(p3, p4, p1);
  const d2 = side(p3, p4, p2);
  const d3 = side(p1, p2, p3);
  const d4 = side(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

/** Which side of the line a-b the point p sits on (0 = on the line). */
function side(a, b, p) {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

/** Whether any blocker stands between points a and b. */
export function lineOfSightBlocked(a, b, blockers) {
  for (const r of blockers) if (segmentHitsRect(a, b, r)) return true;
  return false;
}

/** Whether the point sits in one of the level's shadow zones. */
export function inShadow(p, level) {
  for (const s of level.shadows) if (pointInRect(p, s)) return true;
  return false;
}

/**
 * How far a ray from (ox, oy) along `angle` travels before it hits a
 * blocker, capped at maxDist. The slab test per rectangle gives the
 * nearest entry distance; a ray starting inside a rectangle returns 0.
 */
export function rayBlockDistance(ox, oy, angle, maxDist, blockers) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let best = maxDist;
  for (const r of blockers) {
    let tMin = 0;
    let tMax = best;
    let ok = true;
    for (const axis of ['x', 'y']) {
      const o = axis === 'x' ? ox : oy;
      const d = axis === 'x' ? dx : dy;
      const lo = axis === 'x' ? r.x : r.y;
      const hi = axis === 'x' ? r.x + r.w : r.y + r.h;
      if (Math.abs(d) < 1e-9) {
        if (o < lo || o > hi) {
          ok = false;
          break;
        }
      } else {
        let t1 = (lo - o) / d;
        let t2 = (hi - o) / d;
        if (t1 > t2) {
          const tmp = t1;
          t1 = t2;
          t2 = tmp;
        }
        if (t1 > tMin) tMin = t1;
        if (t2 < tMax) tMax = t2;
        if (tMin > tMax) {
          ok = false;
          break;
        }
      }
    }
    if (ok && tMin < best) best = Math.max(0, tMin);
  }
  return best;
}

/** The distance between two points. */
export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
