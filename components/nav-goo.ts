/*
 * The blue blob behind the current nav link, in the same goo as the theme switch: a knob that marks the
 * link, and a tail and a drop that trail it when it moves and melt back into it when it stops. An SVG
 * goo filter (nav.tsx) fuses the three into one shape.
 *
 * Springs move them, each part chasing the one ahead of it, so a new target mid-move bends the path
 * instead of restarting it. The knob stretches with its speed. The frame loop runs only while
 * something moves.
 */

export type GooBox = { cx: number; cy: number; w: number; h: number };

type Spring = { value: number; velocity: number };
type Feel = { stiffness: number; damping: number };

// The knob overshoots a little and settles; the tail and the drop are slower, so they lag behind it.
const KNOB: Feel = { stiffness: 420, damping: 26 };
const TAIL: Feel = { stiffness: 190, damping: 22 };
const DROP: Feel = { stiffness: 120, damping: 19 };
// Growing in pops past full size and back; shrinking away never undershoots.
const GROW: Feel = { stiffness: 380, damping: 22 };
const SHRINK: Feel = { stiffness: 520, damping: 46 };

const spring = (value = 0): Spring => ({ value, velocity: 0 });

function step(s: Spring, target: number, feel: Feel, dt: number) {
  s.velocity += (-feel.stiffness * (s.value - target) - feel.damping * s.velocity) * dt;
  s.value += s.velocity * dt;
}

function still(s: Spring, target: number, distance = 0.2, speed = 3) {
  return Math.abs(s.value - target) < distance && Math.abs(s.velocity) < speed;
}

export class NavGoo {
  private knob = { x: spring(), y: spring(), w: spring(), h: spring() };
  private tail = { x: spring(), y: spring() };
  private drop = { x: spring(), y: spring() };
  private scale = spring();
  private target: GooBox | null = null;
  private frame = 0;
  private last = 0;

  /** `parts[i]` holds every copy of part i (knob, tail, drop): one per goo layer. */
  constructor(private parts: SVGRectElement[][]) {}

  /** Mark a link's box, or nothing with null. Without `animate` the blob is simply there, or gone. */
  set(box: GooBox | null, animate: boolean) {
    this.target = box;
    if (!animate) {
      this.stop();
      if (box) this.place(box);
      this.scale = spring(box ? 1 : 0);
      this.render();
      return;
    }
    // A hidden blob grows where it is needed instead of flying in from where it last was.
    if (box && this.scale.value < 0.01) this.place(box);
    if (!this.frame) {
      this.last = performance.now();
      this.frame = requestAnimationFrame(this.tick);
    }
  }

  /** The link moved or changed size (fonts loading, the window resized): follow it. */
  refit(box: GooBox | null) {
    this.set(box, this.frame !== 0);
  }

  stop() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private place(box: GooBox) {
    this.knob = { x: spring(box.cx), y: spring(box.cy), w: spring(box.w), h: spring(box.h) };
    this.tail = { x: spring(box.cx), y: spring(box.cy) };
    this.drop = { x: spring(box.cx), y: spring(box.cy) };
  }

  private tick = (now: number) => {
    // A long gap (a background tab) is taken as one short frame, so nothing jumps.
    const elapsed = Math.min(0.05, Math.max(0, now - this.last) / 1000);
    this.last = now;
    const steps = Math.max(1, Math.ceil(elapsed / 0.008));
    const dt = elapsed / steps;
    const box = this.target;
    const { knob, tail, drop } = this;
    for (let i = 0; i < steps; i++) {
      if (box) {
        step(knob.x, box.cx, KNOB, dt);
        step(knob.y, box.cy, KNOB, dt);
        step(knob.w, box.w, KNOB, dt);
        step(knob.h, box.h, KNOB, dt);
        step(tail.x, knob.x.value, TAIL, dt);
        step(tail.y, knob.y.value, TAIL, dt);
        step(drop.x, tail.x.value, DROP, dt);
        step(drop.y, tail.y.value, DROP, dt);
      }
      step(this.scale, box ? 1 : 0, box ? GROW : SHRINK, dt);
      if (this.scale.value < 0) this.scale = spring(0);
    }
    const done = box
      ? [knob.x, knob.y, tail.x, tail.y, drop.x, drop.y].every((s, i) => still(s, i % 2 ? box.cy : box.cx)) &&
        still(knob.w, box.w) &&
        still(knob.h, box.h) &&
        still(this.scale, 1, 0.002, 0.05)
      : this.scale.value < 0.01;
    if (done) {
      this.frame = 0;
      if (box) this.place(box);
      this.scale = spring(box ? 1 : 0);
    } else {
      this.frame = requestAnimationFrame(this.tick);
    }
    this.render();
  };

  private render() {
    const s = this.scale.value;
    const { knob, tail, drop } = this;
    const w = knob.w.value;
    const h = knob.h.value;
    // Fast travel stretches the knob along its path and thins it, like the switch's knob.
    const stretch = Math.min(0.3, Math.abs(knob.x.velocity) / 2600);
    this.draw(0, knob.x.value, knob.y.value, w * (1 + stretch) * s, h * (1 - stretch / 2) * s);
    // Both trailers fit inside the knob, so at rest the shape is exactly the knob.
    this.draw(1, tail.x.value, tail.y.value, w * 0.6 * s, h * 0.72 * s);
    this.draw(2, drop.x.value, drop.y.value, h * 0.46 * s, h * 0.46 * s);
  }

  private draw(part: number, cx: number, cy: number, w: number, h: number) {
    const width = Math.max(0, w);
    const height = Math.max(0, h);
    for (const rect of this.parts[part]) {
      rect.setAttribute("x", (cx - width / 2).toFixed(2));
      rect.setAttribute("y", (cy - height / 2).toFixed(2));
      rect.setAttribute("width", width.toFixed(2));
      rect.setAttribute("height", height.toFixed(2));
      rect.setAttribute("rx", (height / 2).toFixed(2));
    }
  }
}
