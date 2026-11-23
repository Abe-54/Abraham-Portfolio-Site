/*
 * Rain. The night bands drip (components/night-edges.tsx), and every drop falls, behind everything on
 * the page, until it lands on a liquid surface below it: the footer's top edge
 * (components/footer-puddle.tsx). The surface takes a drop the way a puddle takes rain: it dips where
 * the drop went in and rings out both ways along the edge. In night theme the rain is the blue goo,
 * and where the edge is black on black only its rings show.
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

// The rings: how fast they travel along the edge, how hard the edge pulls back flat (which also makes
// a ring of several crests rather than one bump), and how quickly they die out.
const WAVE = 260;
const SETTLE = 500;
const DAMP = 3.5;
// Columns of the edge, in pixels.
const COLUMN = 10;

/** A liquid edge: how far each column sits below its resting line (negative is above). */
export class Puddle {
  width = 0;
  dx = COLUMN;
  h = new Float32Array(0);
  v = new Float32Array(0);

  resize(width: number) {
    const n = Math.max(8, Math.min(240, Math.round(width / COLUMN) + 1));
    if (n !== this.h.length) {
      this.h = new Float32Array(n);
      this.v = new Float32Array(n);
    }
    this.width = width;
    // Never finer than half a column: an edge measured at no width at all (a window minimised or
    // hidden for a moment) would divide by zero, and one only a few pixels wide would ring out of control.
    this.dx = Math.max(COLUMN / 2, width / (n - 1));
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

  /** A drop of radius `r` goes in at x, falling at `speed` px/s. */
  hit(x: number, r: number, speed: number) {
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
  }

  /**
   * Where the edge itself cannot be seen (black on black in night theme), only its rings show: the sliver
   * between the resting line and the moving edge, wherever the edge still moves between x `from` and
   * `to`, as one path. It tapers to nothing at both ends of every crest and as the rings die out.
   * `rest(i)` is where column i rests.
   */
  rings(rest: (i: number) => number, from = 0, to = this.width) {
    const { h, dx } = this;
    const first = Math.max(0, Math.floor(from / dx));
    const last = Math.min(h.length - 1, Math.ceil(to / dx));
    const x = (i: number) => Math.min(to, Math.max(from, i * dx)).toFixed(1);
    let d = "";
    let run: number[] = [];
    // Close a stretch: out along the moving edge, back along the resting line.
    const close = () => {
      if (run.length > 1) {
        d += ` M${run.map((i) => `${x(i)},${(rest(i) + h[i]).toFixed(2)}`).join(" L")}`;
        d += ` L${run.reverse().map((i) => `${x(i)},${rest(i).toFixed(2)}`).join(" L")} Z`;
      }
      run = [];
    };
    // Columns since the last moving one: a short calm between two crests keeps one stretch going.
    let calm = 0;
    for (let i = first; i <= last; i++) {
      const moving = Math.abs(h[i]) > 0.15;
      calm = moving ? 0 : calm + 1;
      if (moving && !run.length && i > first) run.push(i - 1);
      if (moving || (run.length && calm <= 3)) run.push(i);
      else if (run.length) close();
    }
    close();
    return d.trim();
  }

  get calm() {
    for (let i = 0; i < this.h.length; i++) {
      if (Math.abs(this.h[i]) > 0.05 || Math.abs(this.v[i]) > 1) return false;
    }
    return true;
  }
}
