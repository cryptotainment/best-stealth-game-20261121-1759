// Shadow Vault — synthesised sound, WebAudio only, no audio files.
// Soft footsteps that tell you how fast you are moving, a rising alert sting
// when a guard spots you, a chime when a shard is picked up, and a low thud
// when you are caught. Nothing plays until the first user gesture creates
// the audio context, so a silent page load stays silent.

/** Fresh sound state; call unlock() from the first user gesture. */
export function createSound() {
  return { ctx: null, master: null, unlocked: false };
}

/** Create the AudioContext after a user gesture; safe to call more than once. */
export function unlockSound(sound) {
  if (sound.unlocked) return;
  try {
    const Ctx = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctx) return;
    sound.ctx = new Ctx();
    sound.master = sound.ctx.createGain();
    sound.master.gain.value = 0.9;
    sound.master.connect(sound.ctx.destination);
    sound.unlocked = true;
  } catch {
    // No audio on this machine: the game stays silent and keeps playing.
  }
}

/** A short oscillator blip with a volume envelope. */
function blip(sound, { freq, freqEnd, type, duration, volume, when }) {
  if (!sound.unlocked || !sound.ctx) return;
  const t0 = sound.ctx.currentTime + (when ?? 0);
  const osc = sound.ctx.createOscillator();
  const gain = sound.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd !== undefined) osc.frequency.exponentialRampToValueAtTime(freqEnd, t0 + duration);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(sound.master);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

/** A soft footstep: a low thud, quieter and further apart while sneaking. */
export function playStep(sound, sneaking) {
  blip(sound, {
    freq: sneaking ? 120 : 150,
    freqEnd: 70,
    type: 'sine',
    duration: 0.09,
    volume: sneaking ? 0.035 : 0.1,
  });
}

/** The alert sting: two rising notes when a guard's meter fills. */
export function playAlert(sound) {
  blip(sound, { freq: 320, freqEnd: 520, type: 'square', duration: 0.16, volume: 0.12 });
  blip(sound, { freq: 520, freqEnd: 780, type: 'square', duration: 0.2, volume: 0.12, when: 0.14 });
}

/** The pickup chime: a bright two-note ping for a code shard. */
export function playPickup(sound) {
  blip(sound, { freq: 880, type: 'sine', duration: 0.12, volume: 0.14 });
  blip(sound, { freq: 1318, type: 'sine', duration: 0.18, volume: 0.12, when: 0.09 });
}

/** A low thud when the player is caught. */
export function playCaught(sound) {
  blip(sound, { freq: 180, freqEnd: 55, type: 'triangle', duration: 0.4, volume: 0.2 });
}

/** A short rising arpeggio when a level is cleared. */
export function playClear(sound) {
  blip(sound, { freq: 523, type: 'sine', duration: 0.12, volume: 0.12 });
  blip(sound, { freq: 659, type: 'sine', duration: 0.12, volume: 0.12, when: 0.1 });
  blip(sound, { freq: 784, type: 'sine', duration: 0.22, volume: 0.12, when: 0.2 });
}
