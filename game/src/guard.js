// Shadow Vault — the guards: patrol, vision, detection, chase, alarm.
// A guard walks its waypoints, pauses at each one and looks around. When the
// player is inside its vision cone, in range and in line of sight, its
// detection meter fills; when sight breaks, the meter drains, so a near miss
// can be recovered from. A full meter raises the alarm: the guard chases, and
// touching the player ends the level. Lose sight long enough and the guard
// gives up and walks back to its patrol.

import { GUARD } from './config.js';
import { blockersOf, distance, inShadow, lineOfSightBlocked, moveCircle } from './world.js';

export const GUARD_PATROL = 'patrol';
export const GUARD_PAUSE = 'pause';
export const GUARD_CHASE = 'chase';
export const GUARD_RETURN = 'return';

/** A fresh guard on its first waypoint, facing the next one. */
export function createGuard(spec, level) {
  const first = spec.waypoints[0];
  const second = spec.waypoints[1] ?? first;
  return {
    x: first.x,
    y: first.y,
    facing: Math.atan2(second.y - first.y, second.x - first.x),
    waypointIndex: 1 % spec.waypoints.length,
    waypoints: spec.waypoints,
    patrolSpeed: spec.patrolSpeed ?? GUARD.patrolSpeed,
    state: GUARD_PATROL,
    pauseTimer: 0,
    lookBase: 0,
    lookPhase: 0,
    detection: 0,
    lastSeen: null,
    unseenTimer: 0,
    level,
  };
}

/** The angle from the guard to the player, in radians. */
function angleTo(guard, target) {
  return Math.atan2(target.y - guard.y, target.x - guard.x);
}

/** The smallest difference between two angles, in (-PI, PI]. */
function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * Whether the guard can see the player right now: close enough, inside the
 * vision cone, and no wall, crate or shelf between them.
 */
export function guardCanSee(guard, player, level) {
  const d = distance(guard, player);
  if (d > GUARD.viewDistance) return false;
  const diff = Math.abs(angleDiff(angleTo(guard, player), guard.facing));
  if (diff > GUARD.viewHalfAngle) return false;
  return !lineOfSightBlocked(guard, player, blockersOf(level));
}

/** How fast detection fills while the player is seen (sneaking and shadows slow it). */
function detectRate(player, level) {
  const shadowed = inShadow(player, level);
  if (player.sneaking && shadowed) return GUARD.detectSeenSneakShadow;
  if (player.sneaking) return GUARD.detectSeenSneak;
  if (shadowed) return GUARD.detectSeenShadow;
  return GUARD.detectSeen;
}

/**
 * Step one guard forward by dt seconds. Returns 'caught' when the guard
 * touches the player while chasing, else null. `events` collects 'spotted'
 * (the meter just filled) and 'lost' (a chase just gave up) for the sound.
 */
export function stepGuard(guard, player, level, dt, events) {
  const blockers = blockersOf(level);
  const seen = guardCanSee(guard, player, level);

  if (seen) {
    guard.detection = Math.min(1, guard.detection + detectRate(player, level) * dt);
    guard.lastSeen = { x: player.x, y: player.y };
    guard.unseenTimer = 0;
    if (guard.detection >= 1 && guard.state !== GUARD_CHASE) {
      guard.state = GUARD_CHASE;
      events.push('spotted');
    }
  } else {
    guard.detection = Math.max(0, guard.detection - GUARD.detectDrain * dt);
    guard.unseenTimer += dt;
    if (guard.state === GUARD_CHASE && guard.unseenTimer >= GUARD.giveUpSeconds) {
      guard.state = GUARD_RETURN;
      guard.detection = 0.4;
      events.push('lost');
    }
  }

  if (guard.state === GUARD_CHASE) {
    // Chase the player's last seen spot; keep facing the player while visible.
    const target = seen ? player : guard.lastSeen ?? player;
    const angle = angleTo(guard, target);
    guard.facing = angle;
    const step = GUARD.chaseSpeed * dt;
    const next = moveCircle(guard.x, guard.y, Math.cos(angle) * step, Math.sin(angle) * step, GUARD.radius, blockers);
    guard.x = next.x;
    guard.y = next.y;
    if (distance(guard, player) <= GUARD.catchDistance) return 'caught';
    return null;
  }

  if (guard.state === GUARD_RETURN) {
    // Walk back to the nearest waypoint, then resume the patrol from there.
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < guard.waypoints.length; i += 1) {
      const d = distance(guard, guard.waypoints[i]);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    const target = guard.waypoints[best];
    if (bestD < 6) {
      guard.state = GUARD_PATROL;
      guard.waypointIndex = (best + 1) % guard.waypoints.length;
      return null;
    }
    const angle = angleTo(guard, target);
    guard.facing = angle;
    const step = GUARD.returnSpeed * dt;
    const next = moveCircle(guard.x, guard.y, Math.cos(angle) * step, Math.sin(angle) * step, GUARD.radius, blockers);
    guard.x = next.x;
    guard.y = next.y;
    return null;
  }

  if (guard.state === GUARD_PAUSE) {
    // Stand still and sweep the view from side to side.
    guard.pauseTimer -= dt;
    guard.lookPhase += dt;
    const sweep = Math.sin(guard.lookPhase * 1.6) * GUARD.lookAroundArc;
    guard.facing = guard.lookBase + sweep;
    if (guard.pauseTimer <= 0) guard.state = GUARD_PATROL;
    return null;
  }

  // Patrol: walk to the next waypoint, pause and look around on arrival.
  const target = guard.waypoints[guard.waypointIndex];
  const d = distance(guard, target);
  const angle = angleTo(guard, target);
  guard.facing = angle;
  if (d < 6) {
    guard.state = GUARD_PAUSE;
    guard.pauseTimer = GUARD.pauseAtWaypoint;
    guard.lookBase = angle;
    guard.lookPhase = 0;
    guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
    return null;
  }
  const step = guard.patrolSpeed * dt;
  const next = moveCircle(guard.x, guard.y, Math.cos(angle) * step, Math.sin(angle) * step, GUARD.radius, blockers);
  guard.x = next.x;
  guard.y = next.y;
  return null;
}

/** The highest detection among the guards: the HUD's alarm meter. */
export function maxDetection(guards) {
  let top = 0;
  for (const g of guards) if (g.detection > top) top = g.detection;
  return top;
}

/** Whether any guard is currently chasing the player. */
export function anyChasing(guards) {
  return guards.some((g) => g.state === GUARD_CHASE);
}
