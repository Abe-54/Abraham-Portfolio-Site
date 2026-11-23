"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { DROP, GooFilter, TAIL, animate, settled, spring, step, type Feel } from "./goo";

/*
 * A button floods with goo from where the pointer comes in and drains out where it leaves. The tail
 * and the drop lag the knob like the nav's, so the goo pulls a neck behind it on the way in and on the
 * way out. The knob is softer than the nav's so the pour takes about a third of a second and reads as
 * liquid filling the pill, not as a colour change.
 */

const POUR: Feel = { stiffness: 110, damping: 18 };
const DRAIN: Feel = { stiffness: 240, damping: 28 };

type Ball = { x: ReturnType<typeof spring>; y: ReturnType<typeof spring>; r: ReturnType<typeof spring> };

export function GooButton({ id, href, className, children }: { id: string; href: string; className: string; children: ReactNode }) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const circles = Array.from(svg.querySelectorAll("circle"));
    const ball = (): Ball => ({ x: spring(), y: spring(), r: spring() });
    const knob = ball();
    const tail = ball();
    const drop = ball();
    let target = { x: 0, y: 0, r: 0 };
    let stop: (() => void) | null = null;

    const draw = () => {
      [knob, tail, drop].forEach((b, i) => {
        circles[i].setAttribute("cx", b.x.value.toFixed(1));
        circles[i].setAttribute("cy", b.y.value.toFixed(1));
        circles[i].setAttribute("r", Math.max(0, b.r.value).toFixed(1));
      });
    };
    const run = () => {
      stop ??= animate((dt) => {
        const feel = target.r > 0 ? POUR : DRAIN;
        step(knob.x, target.x, feel, dt);
        step(knob.y, target.y, feel, dt);
        step(knob.r, target.r, feel, dt);
        step(tail.x, knob.x.value, TAIL, dt);
        step(tail.y, knob.y.value, TAIL, dt);
        step(tail.r, target.r * 0.55, TAIL, dt);
        step(drop.x, tail.x.value, DROP, dt);
        step(drop.y, tail.y.value, DROP, dt);
        step(drop.r, target.r * 0.32, DROP, dt);
        draw();
        const done = [knob, tail, drop].every(
          (b) => settled(b.x, target.x, 0.3) && settled(b.y, target.y, 0.3) && Math.abs(b.r.velocity) < 3,
        );
        if (done) stop = null;
        return !done;
      });
    };
    const local = (event: PointerEvent) => {
      const box = root.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top, w: box.width, h: box.height };
    };
    const onEnter = (event: PointerEvent) => {
      const p = local(event);
      // The goo starts as a point where the pointer came in, then fills the pill from there.
      for (const b of [knob, tail, drop]) {
        if (b.r.value < 1) {
          b.x = spring(p.x);
          b.y = spring(p.y);
          b.r = spring(0);
        }
      }
      target = { x: p.w / 2, y: p.h / 2, r: Math.hypot(p.w, p.h) / 2 + 6 };
      run();
    };
    const onLeave = (event: PointerEvent) => {
      const p = local(event);
      target = { x: Math.min(Math.max(p.x, 0), p.w), y: Math.min(Math.max(p.y, 0), p.h), r: 0 };
      run();
    };
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      stop?.();
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <a ref={rootRef} href={href} className={`${className} goo-btn press`}>
      <svg ref={svgRef} className="goo-btn-fill" aria-hidden="true">
        <defs>
          <GooFilter id={`${id}-goo`} blur={5} sharpness={18} cut={7} region={{ x: "-20%", y: "-60%", width: "140%", height: "220%" }} />
        </defs>
        <g filter={`url(#${id}-goo)`} fill="#3366FF">
          <circle r="0" />
          <circle r="0" />
          <circle r="0" />
        </g>
      </svg>
      <span className="goo-btn-label">{children}</span>
    </a>
  );
}
