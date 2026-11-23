'use client';

import { useEffect, useRef, type CSSProperties, type MutableRefObject } from 'react';

type Variant = 'solid' | 'outline' | 'contour';
type Motion = 'orbit' | 'drift' | 'lava';

interface MetaBallsProps {
  className?: string;
  color?: string;
  cursorBallColor?: string;
  speed?: number;
  enableMouseInteraction?: boolean;
  hoverSmoothness?: number;
  animationSize?: number;
  ballCount?: number;
  clumpFactor?: number;
  cursorBallSize?: number;
  enableTransparency?: boolean;
  variant?: Variant;
  motion?: Motion;
  gooeyness?: number;
  stickiness?: number;
  stretch?: number;
  wobble?: number;
  lineWidth?: number;
  rings?: number;
  clickBurst?: boolean;
  intro?: boolean;
  paused?: boolean;
  dpr?: number;
  style?: CSSProperties;
  /** Local addition: runs right after each frame is drawn, with what the frame was drawn from. */
  onDraw?: (canvas: HTMLCanvasElement, frame: MetaBallsFrame) => void;
  /**
   * Local addition: keep the goo to part of the box, given as shares of its width and height from the
   * top left. Lava lives there, the pointer's ball is held there, and soft walls keep the edge of every
   * ball inside it, so the canvas edge never cuts the goo.
   */
  area?: { left: number; right: number; top: number; bottom: number };
  /**
   * Local addition, for lava with an area: no ball of its own follows the pointer. Instead the ball
   * nearest the pointer reaches toward it, and goes back to its own path once another ball is nearer.
   */
  pointerReach?: boolean;
  /**
   * Local addition, for lava with an area: how many of the `ballCount` balls are there from the start.
   * The rest come one at a time, poured in through `pourRef`. Leave it out and every ball is there.
   */
  fill?: number;
  /**
   * Local addition, for lava with an area: the engine puts its pour function here. A drop poured in
   * comes through the edge where it landed and swells into the next ball still missing; once every ball
   * is there, a drop flows to the nearest one instead and swells it for a moment. A drop poured with
   * `join` always does that.
   */
  pourRef?: MutableRefObject<Pour | null>;
  /** Local addition: the colour a poured drop comes in; it turns to `color` as it settles. */
  dropColor?: string;
}

/** A drop of radius `r` px landing at window point (x, y), falling at `speed` px/s. */
export type Pour = (x: number, y: number, r: number, speed: number, join?: boolean) => void;

/** Local addition: the uniforms one frame was drawn with, so the same goo can be drawn elsewhere. */
export interface MetaBallsFrame {
  balls: Float32Array;
  shapes: Float32Array;
  count: number;
  gamma: number;
  threshold: number;
  animationSize: number;
}

interface Body {
  vx: number;
  vy: number;
  a: number;
  b: number;
  va: number;
  vb: number;
}

interface Look {
  size: number;
  time: number;
}

const MAX_BALLS = 50;
const SLOTS = MAX_BALLS + 1;
// Local: drops poured in that can be on their way into a ball at once.
const VISITORS = 4;
// Local, for poured drops: seconds a new ball takes to swell, a fed ball to settle back, and a drop
// to lose its own colour.
const SWELL = 0.8;
const SETTLE = 1.4;
const FADE = 0.6;
// Local, for a poured drop: seconds it falls on into the goo before the lava takes it, how hard the goo
// slows it, and the pull that keeps it sinking (per second, and world units per second squared).
const SINK = 1.4;
const DRAG = 3.5;
const SINKING = 10;
// Local, for pointerReach: how near the pointer must come to a ball's edge for it to reach, and the
// farthest it reaches, in world units.
const REACH = 14;
const REACH_MAX = 6;

const over = (value: number, low: number, high: number) => (value < low ? low - value : value > high ? high - value : 0);
const VARIANTS: Record<string, number> = { solid: 0, outline: 1, contour: 2 };
const VISIBLE = 0.877;

const fract = (x: number) => x - Math.floor(x);

const hash31 = (p: number) => {
  const r = [p * 0.1031, p * 0.103, p * 0.0973].map(fract);
  const dot = r[0] * (r[1] + 33.33) + r[1] * (r[2] + 33.33) + r[2] * (r[0] + 33.33);
  return r.map(value => fract(value + dot));
};

const hash33 = (v: number[]) => {
  const p = [v[0] * 0.1031, v[1] * 0.103, v[2] * 0.0973].map(fract);
  const dot = p[0] * (p[1] + 33.33) + p[1] * (p[0] + 33.33) + p[2] * (p[2] + 33.33);
  const q = p.map(value => fract(value + dot));
  return [fract((q[0] + q[1]) * q[2]), fract((q[0] + q[0]) * q[1]), fract((q[1] + q[0]) * q[0])];
};

const toRgb = (color: string): [number, number, number] => {
  let hex = String(color || '')
    .trim()
    .replace('#', '');
  if (hex.length === 3) hex = hex.replace(/./g, c => c + c);
  if (!/^[0-9a-f]{6}/i.test(hex)) return [1, 1, 1];
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255) as [number, number, number];
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeInOut = (t: number) => {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

export const VERTEX = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const FRAGMENT = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uScale;
uniform vec4 uBalls[${SLOTS}];
uniform vec4 uShapes[${SLOTS}];
uniform int uCount;
uniform float uGamma;
uniform float uThreshold;
uniform vec3 uColor;
uniform vec3 uCursorColor;
uniform vec3 uDropColor;
uniform int uVariant;
uniform float uLine;
uniform float uSpacing;
uniform float uRings;
uniform float uOpaque;

out vec4 outColor;

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) * uScale;
  float field = 0.0;
  float tint = 0.0;
  float mass = 0.0;
  float fresh = 0.0;
  vec2 grad = vec2(0.0);
  bool classic = abs(uGamma - 1.0) < 0.001;
  for (int i = 0; i < ${SLOTS}; i++) {
    if (i >= uCount) break;
    vec4 ball = uBalls[i];
    vec4 shape = uShapes[i];
    vec2 d = p - ball.xy;
    vec2 q = vec2(shape.x * d.x + shape.y * d.y, shape.y * d.x + shape.z * d.y);
    float qq = max(dot(q, q), ball.z * 1e-4 + 1e-12);
    float v = ball.z / qq;
    float w = classic ? v : pow(v, uGamma);
    field += w;
    float weight = w / (1.0 + w / uThreshold);
    mass += weight;
    tint += weight * ball.w;
    fresh += weight * shape.w;
    grad -= 2.0 * uGamma * w / qq * vec2(shape.x * q.x + shape.y * q.y, shape.y * q.x + shape.z * q.y);
  }
  float slope = max(length(grad) * uScale, 1e-8);
  vec3 color = mix(uColor, uCursorColor, mass > 0.0 ? clamp(tint / mass, 0.0, 1.0) : 0.0);
  color = mix(color, uDropColor, mass > 0.0 ? clamp(fresh / mass, 0.0, 1.0) : 0.0);
  float alpha;
  if (uVariant == 0) {
    alpha = field > 3.0 * uThreshold ? 1.0 : clamp((field - uThreshold) / slope + 0.5, 0.0, 1.0);
  } else if (uVariant == 1) {
    alpha = field > 3.0 * uThreshold ? 0.0 : clamp(0.5 * uLine + 0.5 - abs((field - uThreshold) / slope), 0.0, 1.0);
  } else {
    float rho = pow(max(field / uThreshold, 1e-6), -0.5 / uGamma);
    float rate = rho * slope / (2.0 * uGamma * max(field, 1e-8));
    float u = (rho - 1.0) / uSpacing;
    float ring = floor(u + 0.5);
    float gap = (u - ring) * uSpacing / max(rate, 1e-8);
    alpha = clamp(0.5 * uLine + 0.5 - abs(gap), 0.0, 1.0);
    alpha *= ring < -0.5 || ring > uRings + 0.5 ? 0.0 : 1.0 - ring / (uRings + 1.0);
    if (ring > 0.5) alpha *= smoothstep(uLine * 6.0, uLine * 12.0, uSpacing / max(rate, 1e-8));
  }
  outColor = vec4(color * alpha, uOpaque > 0.5 ? 1.0 : alpha);
}
`;

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type) as WebGLShader;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

const createBall = (index: number) => {
  const h1 = hash31(index + 1);
  const h2 = hash33(h1);
  return {
    start: h1[0] * Math.PI * 2,
    rate: 0.1 * Math.PI + h1[1] * 0.3 * Math.PI,
    reach: 5 + h1[1] * 5,
    toggle: Math.floor(h2[0] * 2),
    radius: 0.5 + h2[2] * 1.5,
    lane: h2[1] * 2 - 1,
    rise: 0.55 + h1[2] * 0.7,
    sway: h2[0] * Math.PI * 2,
    delay: 0.1 + fract(h1[2] * 7.31 + h2[1] * 3.17) * 0.55,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    fx: 0,
    fy: 0,
    ax: 0,
    ay: 0,
    avx: 0,
    avy: 0,
    a: 0,
    b: 0,
    va: 0,
    vb: 0,
    // Local: how much of its full size it has, how newly it was poured in (it shows in the drop's
    // colour while fresh), and, for a drop on its way into another ball, which one.
    grow: 1,
    fresh: 0,
    feeds: -1,
    // Local: how much of its fall a poured drop has left, and how far a ball reaches off its path toward
    // the pointer.
    sink: 0,
    ox: 0,
    oy: 0
  };
};

type Ball = ReturnType<typeof createBall>;

const MetaBalls = ({
  className = '',
  color = '#ffffff',
  cursorBallColor = '#ffffff',
  speed = 0.3,
  enableMouseInteraction = true,
  hoverSmoothness = 0.1,
  animationSize = 30,
  ballCount = 15,
  clumpFactor = 1,
  cursorBallSize = 3,
  enableTransparency = false,
  variant = 'solid',
  motion = 'orbit',
  gooeyness = 0.5,
  stickiness = 0.5,
  stretch = 0.5,
  wobble = 0.5,
  lineWidth = 1.5,
  rings = 4,
  clickBurst = true,
  intro = true,
  paused = false,
  dpr,
  style,
  onDraw,
  area,
  pointerReach = false,
  fill,
  pourRef,
  dropColor
}: MetaBallsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settings = {
    color,
    cursorBallColor,
    speed,
    enableMouseInteraction,
    hoverSmoothness,
    animationSize,
    ballCount,
    clumpFactor,
    cursorBallSize,
    enableTransparency,
    variant,
    motion,
    gooeyness,
    stickiness,
    stretch,
    wobble,
    lineWidth,
    rings,
    clickBurst,
    paused,
    dpr,
    onDraw,
    area,
    pointerReach,
    fill,
    pourRef,
    dropColor
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const introRef = useRef(intro);
  const engineRef = useRef<{ refresh: () => void } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) return;

    const program = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.bindAttribLocation(program, 0, 'position');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const loc = {
      resolution: uniform('uResolution'),
      scale: uniform('uScale'),
      balls: uniform('uBalls'),
      shapes: uniform('uShapes'),
      count: uniform('uCount'),
      gamma: uniform('uGamma'),
      threshold: uniform('uThreshold'),
      color: uniform('uColor'),
      cursorColor: uniform('uCursorColor'),
      dropColor: uniform('uDropColor'),
      variant: uniform('uVariant'),
      line: uniform('uLine'),
      spacing: uniform('uSpacing'),
      rings: uniform('uRings'),
      opaque: uniform('uOpaque')
    };

    const ballData = new Float32Array(SLOTS * 4);
    const shapeData = new Float32Array(SLOTS * 4);
    const balls = Array.from({ length: MAX_BALLS }, (_, index) => createBall(index));
    const idle = createBall(MAX_BALLS + 7);
    // With pointerReach, the ball reaching toward the pointer, or -1.
    let reacher = -1;
    // Poured drops (pourRef): how many balls are there so far (they are always the first ones), the
    // drops on their way into a ball, and any drop poured before the first frame knew where anything is.
    const initialFill = settingsRef.current.fill;
    let filled = initialFill === undefined ? MAX_BALLS : clamp(Math.round(initialFill), 0, MAX_BALLS);
    balls.forEach((ball, index) => {
      ball.grow = index < filled ? 1 : 0;
    });
    const visitors = Array.from({ length: VISITORS }, (_, index) => createBall(MAX_BALLS + 20 + index));
    const pending: Parameters<Pour>[] = [];
    const cursor = { x: 0, y: 0, vx: 0, vy: 0, a: 0, b: 0, va: 0, vb: 0, pulse: 0, pulseVelocity: 0, ready: false };
    const pointer = { x: 0, y: 0, inside: false };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const view = { width: 1, height: 1, ratio: 1 };
    const colors = new Map<string, [number, number, number]>();
    const rgb = (value: string) => {
      if (!colors.has(value)) colors.set(value, toRgb(value));
      return colors.get(value) as [number, number, number];
    };
    let phase = 0;
    let clock = 0;
    let introAt = introRef.current && !reduced ? 0 : -1;
    let visible = true;
    let raf = 0;
    let last = 0;
    let dirty = true;
    let placed = false;

    let resizePending = false;
    const applyResize = () => {
      const rect = container.getBoundingClientRect();
      const s = settingsRef.current;
      const ratio = Math.max(0.5, Math.min(s.dpr ?? window.devicePixelRatio ?? 1, 2));
      view.width = Math.max(1, rect.width);
      view.height = Math.max(1, rect.height);
      view.ratio = ratio;
      canvas.width = Math.max(1, Math.round(view.width * ratio));
      canvas.height = Math.max(1, Math.round(view.height * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      dirty = true;
    };

    const resize = () => {
      resizePending = true;
      start();
    };

    const toWorld = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const scale = settingsRef.current.animationSize / Math.max(1, rect.height);
      return {
        x: (clientX - rect.left - rect.width / 2) * scale,
        y: (rect.top + rect.height / 2 - clientY) * scale,
        inside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
      };
    };

    const presence = (): Look => {
      if (introAt < 0) return { size: 1, time: Infinity };
      const t = clock - introAt;
      return { size: easeOut(t / 0.5), time: t };
    };

    const release = (ball: Ball, look: Look) =>
      look.time === Infinity ? 1 : easeInOut((look.time - ball.delay) / 1.15);

    // The part of the world the goo keeps to: the `area` share of the box, centre and half sizes.
    const bounds = (s: typeof settings) => {
      const halfWidth = (s.animationSize * view.width) / view.height / 2;
      const halfHeight = s.animationSize / 2;
      const a = s.area ?? { left: 0, right: 1, top: 0, bottom: 1 };
      const left = -halfWidth + 2 * halfWidth * a.left;
      const right = -halfWidth + 2 * halfWidth * a.right;
      const top = halfHeight - 2 * halfHeight * a.top;
      const bottom = halfHeight - 2 * halfHeight * a.bottom;
      return { cx: (left + right) / 2, cy: (top + bottom) / 2, hw: (right - left) / 2, hh: (top - bottom) / 2 };
    };
    // How far past its centre a ball's edge reaches, with the goo it pulls around it.
    const margin = (radius: number) => radius * VISIBLE * 1.25 + 0.4;

    const anchor = (ball: Ball, s: typeof settings, spread: number): [number, number] => {
      if (s.area && s.motion === 'lava') {
        const box = bounds(s);
        const room = margin(ball.radius);
        const hw = Math.max(0, box.hw - room);
        const hh = Math.max(0, box.hh - room);
        const cycle = Math.sin(phase * ball.rise * 1.6 + ball.start);
        const x =
          ball.lane * hw * 0.9 * Math.min(1, s.clumpFactor) + Math.sin(phase * 0.5 * ball.rise + ball.sway) * hw * 0.06;
        const y = Math.sign(cycle) * Math.pow(Math.abs(cycle), 0.55) * hh;
        return [box.cx + x * spread, box.cy + y * spread];
      }
      const halfWidth = (s.animationSize * view.width) / view.height / 2;
      const halfHeight = s.animationSize / 2;
      const clump = Math.min(1.25, s.clumpFactor);
      if (s.motion === 'lava') {
        const cycle = Math.sin(phase * ball.rise * 1.6 + ball.start);
        const x =
          ball.lane * halfWidth * 0.8 * clump + Math.sin(phase * 0.5 * ball.rise + ball.sway) * halfWidth * 0.06;
        const y = Math.sign(cycle) * Math.pow(Math.abs(cycle), 0.55) * halfHeight * 0.9;
        return [x * spread, y * spread];
      }
      if (s.motion === 'drift') {
        const x = Math.sin(phase * ball.rise * 0.9 + ball.start) * halfWidth * 0.84 * clump;
        const y = Math.sin(phase * ball.rate * 1.3 + ball.sway) * halfHeight * 0.78 * clump;
        return [x * spread, y * spread];
      }
      const t = phase * ball.rate;
      const angle = ball.start + t;
      return [
        Math.cos(angle) * ball.reach * s.clumpFactor * spread,
        Math.sin(angle + t * ball.toggle) * ball.reach * s.clumpFactor * spread
      ];
    };

    // A body stretches along the way it moves, and (local) along any pull (px, py) it feels at rest.
    const deform = (body: Body, h: number, s: typeof settings, px = 0, py = 0) => {
      const vx = body.vx + px;
      const vy = body.vy + py;
      const speed = Math.hypot(vx, vy);
      const amount = 0.6 * s.stretch * Math.tanh(speed / 14);
      let ta = 0;
      let tb = 0;
      if (speed > 1e-4) {
        ta = (amount * (vx * vx - vy * vy)) / (speed * speed);
        tb = (amount * 2 * vx * vy) / (speed * speed);
      }
      const omega = 13;
      const zeta = 0.85 - 0.68 * clamp(s.wobble, 0, 1);
      body.va += (omega * omega * (ta - body.a) - 2 * zeta * omega * body.va) * h;
      body.vb += (omega * omega * (tb - body.b) - 2 * zeta * omega * body.vb) * h;
      body.a += body.va * h;
      body.b += body.vb * h;
    };

    const bridge = (s: typeof settings) => {
      const goo = clamp(s.gooeyness, 0, 1);
      const gamma = goo < 0.5 ? 1 + (0.5 - goo) * 1.2 : 1 - (goo - 0.5) * 0.5;
      return { gamma, threshold: Math.pow(1.3, gamma), reach: Math.pow(2, 0.5 / gamma) };
    };

    const step = (h: number, s: typeof settings, count: number, look: Look) => {
      const { reach } = bridge(s);
      const pull = 36 * clamp(s.stickiness, 0, 1);
      const cursorRadius = s.cursorBallSize * VISIBLE * look.size * (1 + cursor.pulse);
      // The pointer's own ball, unless the nearest ball reaches for the pointer instead.
      const own = !s.pointerReach;
      const ease = 1 - Math.exp(-h / 0.12);
      phase += h * s.speed;

      for (let i = 0; i < count; i++) {
        const ball = balls[i];
        // While a poured drop is still falling, its lava path keeps up with it, so the lava takes it on
        // from wherever its fall ends.
        if (ball.sink > 0) adopt(ball, s, ball.x, ball.y, ball.vy > 0);
        const [x, y] = anchor(ball, s, release(ball, look));
        ball.avx = clamp((x - ball.ax) / h, -40, 40);
        ball.avy = clamp((y - ball.ay) / h, -40, 40);
        ball.ax = x;
        ball.ay = y;
        // The ball reaching for the pointer leans off its path toward it; any other eases back onto it.
        const [rx, ry] = i === reacher ? reachFor(ball, x, y, look) : [0, 0];
        ball.ox += (rx - ball.ox) * ease;
        ball.oy += (ry - ball.oy) * ease;
        ball.fx = 20 * (x + ball.ox - ball.x) - 5.4 * (ball.vx - ball.avx);
        ball.fy = 20 * (y + ball.oy - ball.y) - 5.4 * (ball.vy - ball.avy);
        if (ball.sink > 0) {
          // Falling, the goo slows it and it sinks on, until the lava has it.
          const falling = ball.sink;
          ball.fx = ball.fx * (1 - falling) - DRAG * falling * ball.vx;
          ball.fy = ball.fy * (1 - falling) - (DRAG * ball.vy + SINKING) * falling;
          ball.sink = Math.max(0, ball.sink - h / SINK);
        }
      }

      for (let i = 0; i < count; i++) {
        const p = balls[i];
        const rp = p.radius * VISIBLE * look.size * p.grow;
        for (let j = i + 1; j < count; j++) {
          const q = balls[j];
          const rq = q.radius * VISIBLE * look.size * q.grow;
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const distance = Math.hypot(dx, dy) || 1e-4;
          const far = (rp + rq) * reach;
          if (distance >= far) continue;
          const core = (rp + rq) * 0.62;
          let force;
          if (distance < core) force = -60 * (core - distance);
          else {
            const t = (distance - core) / (far - core);
            force = pull * Math.min(rp, rq) * smoothstep(0, 0.6, t) * (1 - smoothstep(0.82, 1, t));
          }
          const nx = dx / distance;
          const ny = dy / distance;
          const mp = rp * rp + 0.05;
          const mq = rq * rq + 0.05;
          p.fx += (nx * force) / mp;
          p.fy += (ny * force) / mp;
          q.fx -= (nx * force) / mq;
          q.fy -= (ny * force) / mq;
        }
        if (!own) continue;
        const dx = cursor.x - p.x;
        const dy = cursor.y - p.y;
        const distance = Math.hypot(dx, dy) || 1e-4;
        const far = (rp + cursorRadius) * reach;
        if (distance < far) {
          const core = (rp + cursorRadius) * 0.62;
          let force;
          if (distance < core) force = -140 * (core - distance);
          else {
            const t = (distance - core) / (far - core);
            force = pull * 0.6 * rp * smoothstep(0, 0.6, t) * (1 - smoothstep(0.82, 1, t));
          }
          p.fx += ((dx / distance) * force) / (rp * rp + 0.05);
          p.fy += ((dy / distance) * force) / (rp * rp + 0.05);
        }
      }

      // Soft walls: a ball pushed or pulled toward the edge of its area is pressed back inside it.
      if (s.area) {
        const box = bounds(s);
        for (let i = 0; i < count; i++) {
          const ball = balls[i];
          const room = margin(ball.radius * look.size * ball.grow);
          ball.fx += 300 * over(ball.x, box.cx - box.hw + room, box.cx + box.hw - room);
          ball.fy += 300 * over(ball.y, box.cy - box.hh + room, box.cy + box.hh - room);
        }
      }

      for (let i = 0; i < count; i++) {
        const ball = balls[i];
        ball.vx += ball.fx * h;
        ball.vy += ball.fy * h;
        ball.x += ball.vx * h;
        ball.y += ball.vy * h;
        // Reaching for the pointer draws it out toward it.
        deform(ball, h, s, ball.ox * 5, ball.oy * 5);
        if (!Number.isFinite(ball.x + ball.y + ball.vx + ball.vy + ball.a + ball.b + ball.va + ball.vb)) {
          Object.assign(ball, { x: ball.ax, y: ball.ay, vx: 0, vy: 0, a: 0, b: 0, va: 0, vb: 0 });
        }
        // A ball poured in swells to its full size, and one just fed a drop settles back to it.
        if (ball.grow < 1) ball.grow = Math.min(1, ball.grow + (1.02 - ball.grow) * (1 - Math.exp(-h / SWELL)));
        else if (ball.grow > 1) ball.grow = 1 + (ball.grow - 1) * Math.exp(-h / SETTLE);
        ball.fresh *= Math.exp(-h / FADE);
      }

      // A drop on its way into a ball falls on into the goo and, as its fall slows, flows to the ball
      // nearest where it is. Whichever ball it meets first, it pours into: the ball takes the drop's area
      // as the drop shrinks away.
      const box = bounds(s);
      const inside = (ball: Ball) => (ball.radius * ball.grow * VISIBLE + 0.1) * look.size;
      for (const drop of visitors) {
        if (drop.feeds < 0) continue;
        if (drop.sink > 0 || drop.feeds >= count) drop.feeds = nearest(drop.x, drop.y, count);
        if (drop.feeds < 0) continue;
        for (let i = 0; i < count; i++) {
          if (Math.hypot(balls[i].x - drop.x, balls[i].y - drop.y) < inside(balls[i])) {
            drop.feeds = i;
            break;
          }
        }
        const target = balls[drop.feeds];
        const falling = drop.sink;
        const settled = 1 - falling;
        const damping = 4.5 * settled + DRAG * falling;
        const room = margin(drop.radius * look.size * drop.grow);
        const wallX = 300 * over(drop.x, box.cx - box.hw + room, box.cx + box.hw - room);
        const wallY = 300 * over(drop.y, box.cy - box.hh + room, box.cy + box.hh - room);
        drop.vx += (10 * settled * (target.x - drop.x) - damping * (drop.vx - settled * target.vx) + wallX) * h;
        drop.vy += (10 * settled * (target.y - drop.y) - damping * (drop.vy - settled * target.vy) - SINKING * falling + wallY) * h;
        drop.x += drop.vx * h;
        drop.y += drop.vy * h;
        drop.sink = Math.max(0, drop.sink - h / SINK);
        deform(drop, h, s);
        drop.fresh *= Math.exp(-h / FADE);
        if (Math.hypot(target.x - drop.x, target.y - drop.y) < inside(target)) {
          const before = drop.grow;
          drop.grow = Math.max(0, drop.grow - h * 3);
          const given = (before * before - drop.grow * drop.grow) * (drop.radius / target.radius) ** 2;
          target.grow = Math.min(1.6, Math.sqrt(target.grow * target.grow + given));
          if (drop.grow <= 0) drop.feeds = -1;
        }
        if (!Number.isFinite(drop.x + drop.y + drop.vx + drop.vy + drop.a + drop.b)) drop.feeds = -1;
      }
    };

    // Give a ball the lava path (with an area) that passes through (x, y) right now, rising or sinking.
    const adopt = (ball: Ball, s: typeof settings, x: number, y: number, rising: boolean) => {
      const box = bounds(s);
      const room = margin(ball.radius);
      const hw = Math.max(1e-3, box.hw - room);
      const hh = Math.max(1e-3, box.hh - room);
      const across = Math.sin(phase * 0.5 * ball.rise + ball.sway) * 0.06;
      ball.lane = clamp(((x - box.cx) / hw - across) / (0.9 * Math.min(1, s.clumpFactor)), -1, 1);
      const u = clamp((y - box.cy) / hh, -1, 1);
      const c = Math.asin(Math.sign(u) * Math.pow(Math.abs(u), 1 / 0.55));
      ball.start = (rising ? c : Math.PI - c) - phase * ball.rise * 1.6;
    };

    // How far a ball whose path is at (x, y) reaches toward the pointer: the nearer the pointer comes to
    // its edge, the farther, never past REACH_MAX.
    const reachFor = (ball: Ball, x: number, y: number, look: Look): [number, number] => {
      const dx = pointer.x - x;
      const dy = pointer.y - y;
      const distance = Math.hypot(dx, dy) || 1e-4;
      const edge = Math.max(0, distance - ball.radius * ball.grow * VISIBLE * look.size);
      const length = Math.min(REACH_MAX, distance * 0.7) * (1 - smoothstep(0, REACH, edge));
      return [(dx / distance) * length, (dy / distance) * length];
    };

    // Which ball reaches for the pointer: the one whose edge is nearest it, within REACH. It keeps
    // reaching until another is clearly nearer, so two balls side by side do not take turns every frame.
    const pickReacher = (s: typeof settings, count: number, look: Look) => {
      if (!s.pointerReach || !pointer.inside || !s.enableMouseInteraction) {
        reacher = -1;
        return;
      }
      const gap = (i: number) =>
        Math.hypot(balls[i].x - pointer.x, balls[i].y - pointer.y) - balls[i].radius * balls[i].grow * VISIBLE * look.size;
      let found = -1;
      let best = REACH;
      for (let i = 0; i < count; i++) {
        const g = gap(i);
        if (g < best) {
          best = g;
          found = i;
        }
      }
      if (reacher >= 0 && reacher < count && found !== reacher && gap(reacher) < REACH && best > gap(reacher) - 1) return;
      reacher = found;
    };

    /** The index of the ball nearest (x, y) among the first `count`, or -1 if there are none. */
    const nearest = (x: number, y: number, count: number) => {
      let found = -1;
      let best = Infinity;
      for (let i = 0; i < count; i++) {
        const distance = Math.hypot(balls[i].x - x, balls[i].y - y);
        if (distance < best) {
          best = distance;
          found = i;
        }
      }
      return found;
    };

    // A drop comes in through the edge it landed on, just inside it, at the speed it fell, and falls on
    // into the goo. Its visible size is the drop's own. While balls are missing it becomes the next one,
    // swelling to that ball's size as it sinks; otherwise it pours into the first ball it meets.
    const land: Pour = (clientX, clientY, r, fallSpeed, join = false) => {
      const s = settingsRef.current;
      const count = clamp(Math.round(s.ballCount), 0, MAX_BALLS);
      const scale = s.animationSize / view.height;
      const radius = Math.max(0.1, (r * scale) / VISIBLE);
      const point = toWorld(clientX, clientY);
      const box = bounds(s);
      const x = clamp(point.x, box.cx - box.hw + radius, box.cx + box.hw - radius);
      const y = Math.min(point.y, s.animationSize / 2) - radius * VISIBLE;
      const vy = -Math.min(fallSpeed, 900) * scale;
      const enter = (ball: Ball, grow: number) =>
        Object.assign(ball, { x, y, vx: 0, vy, a: 0, b: 0, va: 0, vb: 0, ox: 0, oy: 0, grow, fresh: 1, sink: 1 });
      if (!join && filled < count) {
        const ball = balls[filled++];
        enter(ball, Math.min(1, radius / ball.radius));
        adopt(ball, s, x, y, false);
        [ball.ax, ball.ay] = anchor(ball, s, 1);
      } else {
        const into = nearest(x, y, Math.min(filled, count));
        if (into < 0) return;
        const drop = visitors.find(visitor => visitor.feeds < 0);
        if (drop) {
          drop.radius = radius;
          drop.feeds = into;
          enter(drop, 1);
        } else {
          // Too many on their way already: the nearest ball takes this one at once.
          const target = balls[into];
          target.grow = Math.min(1.6, Math.hypot(target.grow, radius / target.radius));
        }
      }
    };
    // Until the first frame has placed the goo in its area, drops wait for it.
    const pour: Pour = (...drop) => {
      if (placed) land(...drop);
      else if (pending.length < 40) pending.push(drop);
      dirty = true;
      start();
    };
    if (settingsRef.current.pourRef) settingsRef.current.pourRef.current = pour;

    const moveCursor = (dt: number, s: typeof settings, look: Look) => {
      let tx: number;
      let ty: number;
      if (pointer.inside && s.enableMouseInteraction) {
        tx = pointer.x;
        ty = pointer.y;
      } else {
        const out = look.time === Infinity ? 1 : easeInOut((look.time - 0.75) / 1.3);
        if (s.motion === 'lava' || s.motion === 'drift') {
          [tx, ty] = anchor(idle, s, out);
        } else {
          const halfWidth = (s.animationSize * view.width) / view.height / 2;
          const halfHeight = s.animationSize / 2;
          tx = Math.cos(clock * s.speed) * halfWidth * 0.3 * out;
          ty = Math.sin(clock * s.speed) * halfHeight * 0.3 * out;
        }
      }
      // With an area, the pointer's ball reaches toward the pointer but stays inside it.
      if (s.area) {
        const box = bounds(s);
        const room = margin(s.cursorBallSize);
        tx = clamp(tx, box.cx - box.hw + room, box.cx + box.hw - room);
        ty = clamp(ty, box.cy - box.hh + room, box.cy + box.hh - room);
      }
      if (!cursor.ready) {
        cursor.x = tx;
        cursor.y = ty;
        cursor.ready = true;
      }
      const follow = 1 - Math.pow(1 - clamp(s.hoverSmoothness, 0.001, 1), dt * 60);
      const nx = cursor.x + (tx - cursor.x) * follow;
      const ny = cursor.y + (ty - cursor.y) * follow;
      const blend = 1 - Math.exp(-dt / 0.05);
      cursor.vx += ((nx - cursor.x) / Math.max(dt, 1e-4) - cursor.vx) * blend;
      cursor.vy += ((ny - cursor.y) / Math.max(dt, 1e-4) - cursor.vy) * blend;
      cursor.x = nx;
      cursor.y = ny;
    };

    const burst = (x: number, y: number) => {
      const s = settingsRef.current;
      const count = clamp(Math.round(s.ballCount), 0, MAX_BALLS);
      const radius = s.animationSize * 0.45;
      for (let i = 0; i < count; i++) {
        const ball = balls[i];
        const dx = ball.x - x;
        const dy = ball.y - y;
        const distance = Math.hypot(dx, dy) || 1e-4;
        if (distance > radius) continue;
        const falloff = Math.pow(1 - distance / radius, 1.2);
        const kick = 72 * falloff;
        ball.vx += (dx / distance) * kick - (dy / distance) * kick * 0.3;
        ball.vy += (dy / distance) * kick + (dx / distance) * kick * 0.3;
      }
      cursor.pulseVelocity += 9;
    };

    const shapeOf = (body: Body, out: Float32Array, offset: number) => {
      const m = Math.hypot(body.a, body.b);
      const c = Math.cosh(m);
      const k = m > 1e-6 ? Math.sinh(m) / m : 1;
      out[offset] = c - k * body.a;
      out[offset + 1] = -k * body.b;
      out[offset + 2] = c + k * body.a;
      out[offset + 3] = 0;
    };

    const draw = () => {
      const s = settingsRef.current;
      const look = presence();
      const { gamma, threshold } = bridge(s);
      // The balls that are there, then the drops on their way into them, then the pointer's own ball.
      const present = Math.min(filled, clamp(Math.round(s.ballCount), 0, MAX_BALLS));
      let count = 0;
      const put = (ball: Ball) => {
        if (count >= MAX_BALLS) return;
        const radius = ball.radius * look.size * ball.grow;
        ballData[count * 4] = ball.x;
        ballData[count * 4 + 1] = ball.y;
        ballData[count * 4 + 2] = radius * radius;
        ballData[count * 4 + 3] = 0;
        shapeOf(ball, shapeData, count * 4);
        shapeData[count * 4 + 3] = ball.fresh;
        count++;
      };
      for (let i = 0; i < present; i++) put(balls[i]);
      for (const drop of visitors) if (drop.feeds >= 0) put(drop);
      if (!s.pointerReach) {
        const cursorRadius = s.cursorBallSize * look.size * (1 + cursor.pulse);
        ballData[count * 4] = cursor.x;
        ballData[count * 4 + 1] = cursor.y;
        ballData[count * 4 + 2] = cursorRadius * cursorRadius;
        ballData[count * 4 + 3] = 1;
        shapeOf(cursor, shapeData, count * 4);
        count++;
      }

      gl.uniform2f(loc.resolution, canvas.width, canvas.height);
      gl.uniform1f(loc.scale, s.animationSize / canvas.height);
      gl.uniform4fv(loc.balls, ballData);
      gl.uniform4fv(loc.shapes, shapeData);
      gl.uniform1i(loc.count, count);
      gl.uniform1f(loc.gamma, gamma);
      gl.uniform1f(loc.threshold, threshold);
      gl.uniform3fv(loc.color, rgb(s.color));
      gl.uniform3fv(loc.cursorColor, rgb(s.cursorBallColor));
      gl.uniform3fv(loc.dropColor, rgb(s.dropColor ?? s.color));
      gl.uniform1i(loc.variant, VARIANTS[s.variant] ?? 0);
      gl.uniform1f(loc.line, Math.max(0.25, s.lineWidth) * view.ratio);
      gl.uniform1f(loc.spacing, 0.28);
      gl.uniform1f(loc.rings, clamp(Math.round(s.rings), 0, 12));
      gl.uniform1f(loc.opaque, s.enableTransparency ? 0 : 1);
      gl.clearColor(0, 0, 0, s.enableTransparency ? 0 : 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      dirty = false;
      s.onDraw?.(canvas, { balls: ballData, shapes: shapeData, count, gamma, threshold, animationSize: s.animationSize });
    };

    const frame = (now: number) => {
      raf = 0;
      if (resizePending) {
        resizePending = false;
        applyResize();
      }
      if (!visible) return;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      const s = settingsRef.current;
      if (!s.paused && dt > 1e-4) {
        clock += dt;
        const count = Math.min(filled, clamp(Math.round(s.ballCount), 0, MAX_BALLS));
        const look = presence();
        // With an area, the goo starts from its middle rather than the middle of the box.
        if (!placed && s.area) {
          const box = bounds(s);
          for (const ball of balls) {
            ball.x = box.cx;
            ball.y = box.cy;
          }
          placed = true;
          for (const drop of pending.splice(0)) land(...drop);
        }
        if (s.pointerReach) pickReacher(s, count, look);
        else moveCursor(dt, s, look);
        const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
        for (let i = 0; i < steps; i++) step(dt / steps, s, count, look);
        deform(cursor, dt, s);
        cursor.pulseVelocity += (-170 * cursor.pulse - 2 * 0.42 * 13 * cursor.pulseVelocity) * dt;
        cursor.pulse = Math.max(-0.4, cursor.pulse + cursor.pulseVelocity * dt);
        dirty = true;
      }
      if (dirty) draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || !visible) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    const onMove = (event: PointerEvent) => {
      const point = toWorld(event.clientX, event.clientY);
      pointer.x = point.x;
      pointer.y = point.y;
      pointer.inside = point.inside;
    };
    const onLeave = (event: PointerEvent) => {
      if (!event.relatedTarget) pointer.inside = false;
    };
    const onLift = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') pointer.inside = false;
    };
    const onDown = (event: PointerEvent) => {
      const s = settingsRef.current;
      if (!s.clickBurst || !s.enableMouseInteraction || s.paused || event.button !== 0) return;
      const point = toWorld(event.clientX, event.clientY);
      if (point.inside) burst(point.x, point.y);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) start();
    });
    intersection.observe(container);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerout', onLeave);
    window.addEventListener('pointerup', onLift);
    window.addEventListener('pointercancel', onLift);

    resize();
    start();
    engineRef.current = {
      refresh: () => {
        dirty = true;
      }
    };

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerout', onLeave);
      window.removeEventListener('pointerup', onLift);
      window.removeEventListener('pointercancel', onLift);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      engineRef.current = null;
      const poured = settingsRef.current.pourRef;
      if (poured?.current === pour) poured.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.refresh();
  });

  return (
    <div ref={containerRef} className={`relative h-full w-full ${className}`.trim()} style={style}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
};

export default MetaBalls;
