"use client";

/*
 * Shared pieces for the goo lab. One material: the same blue, the same goo filter, and the same three
 * spring feels as the nav (components/nav-goo.ts), so every specimen moves like the same liquid.
 */

import { useEffect, useState, type RefObject } from "react";

export const BLUE = "#3366FF";

export type Spring = { value: number; velocity: number };
export type Feel = { stiffness: number; damping: number };

export const KNOB: Feel = { stiffness: 420, damping: 26 };
export const TAIL: Feel = { stiffness: 190, damping: 22 };
export const DROP: Feel = { stiffness: 120, damping: 19 };
export const GROW: Feel = { stiffness: 380, damping: 22 };
export const SHRINK: Feel = { stiffness: 520, damping: 46 };

export const spring = (value = 0): Spring => ({ value, velocity: 0 });

export function step(s: Spring, target: number, feel: Feel, dt: number) {
  s.velocity += (-feel.stiffness * (s.value - target) - feel.damping * s.velocity) * dt;
  s.value += s.velocity * dt;
}

export function settled(s: Spring, target: number, distance = 0.2, speed = 3) {
  return Math.abs(s.value - target) < distance && Math.abs(s.velocity) < speed;
}

/**
 * Runs `tick(dt)` every frame until it returns false. Long gaps (a background tab) count as one short
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

// Numbers are user units; percentages are shares of the SVG.
type Region = { x: number | string; y: number | string; width: number | string; height: number | string };

/**
 * The goo filter: blur, then a hard alpha threshold, so nearby shapes fuse with a liquid neck. By default
 * its region follows the shapes' box. Shapes that grow from nothing need a fixed `region` in user units:
 * Firefox measures the box with the shapes' current scale, so a box-relative region crops them.
 */
export function GooFilter({
  id,
  blur = 6,
  sharpness = 18,
  cut = 7,
  region,
}: {
  id: string;
  blur?: number;
  sharpness?: number;
  cut?: number;
  region?: Region;
}) {
  const bounds = region
    ? { filterUnits: "userSpaceOnUse" as const, ...region }
    : { x: "-20%", y: "-20%", width: "140%", height: "140%" };
  return (
    <filter id={id} {...bounds} colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation={blur} />
      <feColorMatrix values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${sharpness} -${cut}`} />
    </filter>
  );
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/** True while the element is on screen (or within `margin` of it). */
export function useInView(ref: RefObject<Element | null>, margin = "0px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: margin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, margin]);
  return inView;
}
