/*
 * The goo is one material. Every piece of it moves with these springs, the same feels as the nav's
 * blob (components/nav-goo.ts), so it all reads as the same liquid.
 */

export type Spring = { value: number; velocity: number };
export type Feel = { stiffness: number; damping: number };

/** The front of the goo: quick, with a little overshoot. */
export const KNOB: Feel = { stiffness: 420, damping: 26 };
/** What trails the knob. */
export const TAIL: Feel = { stiffness: 190, damping: 22 };
/** What trails the tail. */
export const DROP: Feel = { stiffness: 120, damping: 19 };
export const GROW: Feel = { stiffness: 380, damping: 22 };

export const spring = (value = 0): Spring => ({ value, velocity: 0 });

export function step(s: Spring, target: number, feel: Feel, dt: number) {
  s.velocity += (-feel.stiffness * (s.value - target) - feel.damping * s.velocity) * dt;
  s.value += s.velocity * dt;
}

export function settled(s: Spring, target: number, distance = 0.2, speed = 3) {
  return Math.abs(s.value - target) < distance && Math.abs(s.velocity) < speed;
}

export function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Runs `tick(dt)` every frame until it returns false. A long gap (a background tab) counts as one short
 * frame, and each frame is split into small steps so stiff springs stay stable.
 */
export function animate(tick: (dt: number) => boolean) {
  let frame = 0;
  let last = performance.now();
  const loop = (now: number) => {
    const elapsed = Math.min(0.05, Math.max(0, now - last) / 1000);
    last = now;
    if (elapsed === 0) {
      frame = requestAnimationFrame(loop);
      return;
    }
    const steps = Math.max(1, Math.ceil(elapsed / 0.008));
    let more = true;
    for (let i = 0; i < steps && more; i++) more = tick(elapsed / steps);
    frame = more ? requestAnimationFrame(loop) : 0;
  };
  frame = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(frame);
}
