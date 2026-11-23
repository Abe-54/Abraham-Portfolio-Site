"use client";

import { useEffect, useRef } from "react";
import { FRAGMENT, VERTEX, type MetaBallsFrame } from "./MetaBalls";

/*
 * Text the goo passes over turns white: the portrait's goo over the hero, the pool's over the footer. The goo is painted above the text, so it hides the
 * real words, and each block below draws them again in white, only where the goo is.
 *
 * CSS cannot mask with a WebGL canvas, so each block keeps a small mirror canvas that draws the same
 * goo, in white, every time the goo draws a frame: the same shader with the same balls, framed on the
 * block instead of the portrait. (Copying the goo's pixels instead makes Firefox read them back from
 * the GPU every frame, which costs it most of its frame rate.)
 *
 * The overlay is one blended group: the mirror (white goo on black) with the words in white on black
 * multiplied over it. That leaves white exactly where a word and the goo overlap and black everywhere
 * else, and screening it onto the page keeps the black parts invisible.
 */

type Mirror = {
  gl: WebGL2RenderingContext;
  loc: Record<string, WebGLUniformLocation | null>;
};

/** Which goo draws into a block: each goo only ever paints, and clears, its own blocks. */
type Source = "portrait" | "pool";

type Target = {
  canvas: HTMLCanvasElement;
  source: Source;
  mirror: Mirror | null | undefined;
  drawn: boolean;
  mask: string;
};

const targets = new Set<Target>();

function createMirror(canvas: HTMLCanvasElement): Mirror | null {
  const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) return null;
  const program = gl.createProgram();
  const shader = (type: number, source: string) => {
    const s = gl.createShader(type) as WebGLShader;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    gl.attachShader(program, s);
  };
  shader(gl.VERTEX_SHADER, VERTEX);
  shader(gl.FRAGMENT_SHADER, FRAGMENT);
  gl.bindAttribLocation(program, 0, "position");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const names = ["uResolution", "uScale", "uBalls", "uShapes", "uCount", "uGamma", "uThreshold", "uColor", "uCursorColor", "uVariant", "uOpaque"];
  const loc = Object.fromEntries(names.map((name) => [name, gl.getUniformLocation(program, name)]));
  // White goo with soft edges, transparent around it: the solid variant, never opaque.
  gl.uniform3f(loc.uColor, 1, 1, 1);
  gl.uniform3f(loc.uCursorColor, 1, 1, 1);
  gl.uniform1i(loc.uVariant, 0);
  gl.uniform1f(loc.uOpaque, 0);
  gl.clearColor(0, 0, 0, 0);
  return { gl, loc };
}

/** Draw a goo's current frame into every one of its blocks it overlaps. Called right after it draws. */
function paint(source: Source, goo: HTMLCanvasElement, frame: MetaBallsFrame) {
  if (targets.size === 0) return;
  const g = goo.getBoundingClientRect();
  if (g.width === 0 || g.height === 0) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const centerX = g.left + g.width / 2;
  const centerY = g.top + g.height / 2;
  for (const target of Array.from(targets)) {
    if (target.source !== source) continue;
    const { canvas } = target;
    // The mirror covers the block plus a margin, so tall letters at its edge are never cut.
    const box = canvas.getBoundingClientRect();
    const overlaps = box.left < g.right && box.right > g.left && box.top < g.bottom && box.bottom > g.top;
    if (!overlaps && !target.drawn) continue;
    if (target.mirror === undefined) target.mirror = createMirror(canvas);
    const mirror = target.mirror;
    if (!mirror) continue;
    const { gl, loc } = mirror;
    const width = Math.max(1, Math.round(box.width * ratio));
    const height = Math.max(1, Math.round(box.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    target.drawn = overlaps;
    if (!overlaps) continue;
    // The shader centres the goo at half of uResolution, in pixels from the bottom-left corner.
    gl.uniform2f(loc.uResolution, 2 * ratio * (centerX - box.left), 2 * ratio * (box.bottom - centerY));
    gl.uniform1f(loc.uScale, frame.animationSize / g.height / ratio);
    gl.uniform4fv(loc.uBalls, frame.balls);
    gl.uniform4fv(loc.uShapes, frame.shapes);
    gl.uniform1i(loc.uCount, frame.count);
    gl.uniform1f(loc.uGamma, frame.gamma);
    gl.uniform1f(loc.uThreshold, frame.threshold);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // The same round fade the portrait goo's own mask gives it (.portrait-goo in hero.css).
    if (source !== "portrait") continue;
    const mask = `radial-gradient(circle ${g.width / 2}px at ${centerX - box.left}px ${centerY - box.top}px, #000 88%, transparent 100%)`;
    if (mask !== target.mask) {
      target.mask = mask;
      canvas.style.maskImage = mask;
      canvas.style.setProperty("-webkit-mask-image", mask);
    }
  }
}

/** For the portrait goo's onDraw. */
export const paintInk = (goo: HTMLCanvasElement, frame: MetaBallsFrame) => paint("portrait", goo, frame);
/** For the footer pool's onDraw. */
export const paintPoolInk = (goo: HTMLCanvasElement, frame: MetaBallsFrame) => paint("pool", goo, frame);

/** Clear every copy of one goo, for when it stops drawing (reduced motion turned on). */
export function clearInk(source: Source = "portrait") {
  for (const target of Array.from(targets)) {
    if (target.source !== source || !target.drawn || !target.mirror) continue;
    target.mirror.gl.clear(target.mirror.gl.COLOR_BUFFER_BIT);
    target.drawn = false;
  }
}

/** A block of text the goo can pass over. Its one child is rendered twice: for real, and as the ink. */
export default function GooInk({
  className,
  source = "portrait",
  children,
}: {
  className?: string;
  source?: Source;
  children: React.ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const target: Target = { canvas, source, mirror: undefined, drawn: false, mask: "" };
    targets.add(target);
    // Compiling the shader takes a few milliseconds, so it happens while the page is idle rather
    // than in the frame where the goo first reaches this block.
    const prepare = () => {
      if (target.mirror !== undefined || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      target.mirror = createMirror(canvas);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const box = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(box.width * ratio));
      canvas.height = Math.max(1, Math.round(box.height * ratio));
      target.mirror?.gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle ? window.requestIdleCallback(prepare, { timeout: 2000 }) : window.setTimeout(prepare, 500);
    return () => {
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      targets.delete(target);
    };
  }, [source]);

  return (
    <div className={`goo-ink ${className ?? ""}`.trim()}>
      {children}
      {/* inert keeps the copy out of find-in-page as well as out of the accessibility tree. */}
      <div className="ink" aria-hidden="true" inert>
        <canvas ref={canvasRef} />
        <div className="ink-text">{children}</div>
      </div>
    </div>
  );
}
