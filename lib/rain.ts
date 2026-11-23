/*
 * Rain. The night bands drip (components/night-edges.tsx), and every drop falls until it lands on the
 * next liquid surface below it: the top of the next night band, or the footer's top edge
 * (components/footer-puddle.tsx). A surface takes a drop the way a puddle takes rain: it dips where
 * the drop went in, rings out both ways along the edge, and throws a bead back up.
 */

export type Surface = {
  /** Where the surface is in the window at window x, or null where it does not reach. */
  lineAt: (x: number) => number | null;
  /** A drop of radius `r` went in at window x, falling at `speed` px/s. */
  hit: (x: number, r: number, speed: number) => void;
};

const surfaces = new Set<Surface>();

export function addSurface(surface: Surface) {
  surfaces.add(surface);
  return () => {
    surfaces.delete(surface);
  };
}

/** The nearest surface below window point (x, y), and where its line is in the window. */
export function surfaceBelow(x: number, y: number) {
  let found: { surface: Surface; line: number } | null = null;
  for (const surface of Array.from(surfaces)) {
    const line = surface.lineAt(x);
    if (line !== null && line > y && (!found || line < found.line)) found = { surface, line };
  }
  return found;
}

export const GRAVITY = 1500;
// The rings: how fast they travel along the edge, how hard the edge pulls back flat (which also makes
// a ring of several crests rather than one bump), and how quickly they die out.
const WAVE = 260;
const SETTLE = 500;
const DAMP = 3.5;
// Columns of the edge, in pixels.
const COLUMN = 10;

/** A bead thrown up by a landing. `y` is above (negative) or below the resting line, in pixels. */
export type Bead = { x: number; y: number; vx: number; vy: number; r: number; wait: number; done?: boolean };

/** A liquid edge: how far each column sits below its resting line (negative is above), and the beads in the air. */
export class Puddle {
  width = 0;
  dx = COLUMN;
  h = new Float32Array(0);
  v = new Float32Array(0);
  beads: Bead[] = [];

  resize(width: number) {
    const n = Math.max(8, Math.min(240, Math.round(width / COLUMN) + 1));
    if (n !== this.h.length) {
      this.h = new Float32Array(n);
      this.v = new Float32Array(n);
    }
    this.width = width;
    this.dx = width / (n - 1);
  }

  /** The edge's offset at x, in pixels below its resting line. */
  at(x: number) {
    const n = this.h.length;
    if (!n) return 0;
    const f = Math.min(n - 1, Math.max(0, x / this.dx));
    const i = Math.floor(f);
    const t = f - i;
    return this.h[i] * (1 - t) + this.h[Math.min(n - 1, i + 1)] * t;
  }

  /** A drop of radius `r` goes in at x, falling at `speed` px/s. A big enough one throws beads back up. */
  hit(x: number, r: number, speed: number, splash = true) {
    const n = this.h.length;
    if (!n) return;
    const centre = x / this.dx;
    const spread = Math.max(1.2, (r * 1.3) / this.dx);
    const push = Math.min(900, 140 + speed * 0.5) * Math.min(1.6, r / 6) * 0.45;
    const from = Math.max(0, Math.floor(centre - spread * 3));
    const to = Math.min(n - 1, Math.ceil(centre + spread * 3));
    for (let i = from; i <= to; i++) {
      const d = (i - centre) / spread;
      this.v[i] += push * Math.exp((-d * d) / 2);
    }
    if (!splash || r < 2.5) return;
    // A moment after the drop goes in, the middle throws a bead straight up and two specks to the sides.
    this.beads.push({ x, y: 0, vx: 0, vy: -(110 + r * 14 + speed * 0.05), r: r * 0.42, wait: 0.07 });
    for (const side of [-1, 1]) {
      this.beads.push({
        x,
        y: 0,
        vx: side * (50 + r * 7 + Math.random() * 30),
        vy: -(80 + r * 9 + Math.random() * 40),
        r: r * (0.16 + Math.random() * 0.08),
        wait: 0.02,
      });
    }
  }

  step(dt: number) {
    const { h, v } = this;
    const n = h.length;
    const k = (WAVE / this.dx) ** 2;
    for (let i = 0; i < n; i++) {
      const left = h[i > 0 ? i - 1 : Math.min(1, n - 1)];
      const right = h[i < n - 1 ? i + 1 : Math.max(0, n - 2)];
      v[i] += (k * (left + right - 2 * h[i]) - SETTLE * h[i] - DAMP * v[i]) * dt;
    }
    for (let i = 0; i < n; i++) h[i] += v[i] * dt;
    for (const bead of this.beads) {
      if (bead.wait > 0) {
        bead.wait -= dt;
        continue;
      }
      bead.vy += GRAVITY * dt;
      bead.x += bead.vx * dt;
      bead.y += bead.vy * dt;
      if (bead.vy > 0 && bead.y >= this.at(bead.x)) {
        bead.done = true;
        if (bead.x >= 0 && bead.x <= this.width) this.hit(bead.x, bead.r, bead.vy, false);
      }
    }
    if (this.beads.some((bead) => bead.done)) this.beads = this.beads.filter((bead) => !bead.done);
  }

  get calm() {
    if (this.beads.length) return false;
    for (let i = 0; i < this.h.length; i++) {
      if (Math.abs(this.h[i]) > 0.05 || Math.abs(this.v[i]) > 1) return false;
    }
    return true;
  }
}
