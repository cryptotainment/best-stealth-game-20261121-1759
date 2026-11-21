// Shadow Vault — keyboard and mouse input.
// WASD or the arrow keys move, Shift sneaks, Enter confirms on the menus,
// and a mouse click sets a click-to-move target. The game reads a plain
// snapshot each frame: { dx, dy, sneak } plus one-shot flags.

/** Fresh input state, bound to the canvas for click-to-move. */
export function createInput(canvas, onConfirm, onClickMove) {
  const keys = new Set();
  const input = {
    keys,
    clickTarget: null,
    confirmPressed: false,
    anyKeyPressed: false,
  };

  const KEY_DIRS = {
    KeyW: [0, -1],
    ArrowUp: [0, -1],
    KeyS: [0, 1],
    ArrowDown: [0, 1],
    KeyA: [-1, 0],
    ArrowLeft: [-1, 0],
    KeyD: [1, 0],
    ArrowRight: [1, 0],
  };

  function onKeyDown(event) {
    if (event.code === 'Enter' || event.code === 'Space') {
      input.confirmPressed = true;
      if (onConfirm) onConfirm();
      event.preventDefault();
      return;
    }
    if (KEY_DIRS[event.code] || event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
      event.preventDefault();
    }
    keys.add(event.code);
    input.anyKeyPressed = true;
  }

  function onKeyUp(event) {
    keys.delete(event.code);
  }

  function onBlur() {
    keys.clear();
  }

  function onMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const point = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
    input.clickTarget = point;
    input.anyKeyPressed = true;
    if (onClickMove) onClickMove(point);
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('mousedown', onMouseDown);

  input.destroy = () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
    canvas.removeEventListener('mousedown', onMouseDown);
  };
  return input;
}

/**
 * The move direction for this frame: keyboard first (normalised), else a
 * click-to-move target that is still further than 6 px away. Returns
 * { dx, dy, sneak } and clears a reached click target.
 */
export function readMove(input, player) {
  let dx = 0;
  let dy = 0;
  const dirs = {
    KeyW: [0, -1],
    ArrowUp: [0, -1],
    KeyS: [0, 1],
    ArrowDown: [0, 1],
    KeyA: [-1, 0],
    ArrowLeft: [-1, 0],
    KeyD: [1, 0],
    ArrowRight: [1, 0],
  };
  for (const code of input.keys) {
    const d = dirs[code];
    if (d) {
      dx += d[0];
      dy += d[1];
    }
  }
  if (dx !== 0 || dy !== 0) {
    input.clickTarget = null;
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
  } else if (input.clickTarget) {
    const tx = input.clickTarget.x - player.x;
    const ty = input.clickTarget.y - player.y;
    const len = Math.hypot(tx, ty);
    if (len < 6) {
      input.clickTarget = null;
    } else {
      dx = tx / len;
      dy = ty / len;
    }
  }
  const sneak = input.keys.has('ShiftLeft') || input.keys.has('ShiftRight');
  return { dx, dy, sneak };
}
