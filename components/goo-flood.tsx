"use client";

import { useEffect, useRef } from "react";
import { DROP, TAIL, animate, reducedMotion, settled, spring, step, type Feel, type Spring } from "@/lib/goo";
import GooFilter from "./goo-filter";

/*
 * Goo floods a button from where the pointer comes in and drains out where it leaves. Put it first
 * inside a .btn; it listens to that button. The tail and the drop lag the front like the nav's blob,
 * so the goo pulls a neck behind it both ways. The pour takes about a third of a second, so it reads
 * as liquid filling the pill, not as a colour change. Only with a real pointer, and never with
 * reduced motion: then the button keeps its plain look.
 */

const POUR: Feel = { stiffness: 110, damping: 18 };
const DRAIN: Feel = { stiffness: 240, damping: 28 };

type Ball = { x: Spring; y: Spring; r: Spring };

export default function GooFlood({ id }: { id: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const button = svg?.parentElement;
    if (!svg || !button || reducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
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
      const box = button.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top, w: box.width, h: box.height };
    };
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
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
      if (event.pointerType !== "mouse") return;
      const p = local(event);
      target = { x: Math.min(Math.max(p.x, 0), p.w), y: Math.min(Math.max(p.y, 0), p.h), r: 0 };
      run();
    };
    button.addEventListener("pointerenter", onEnter);
    button.addEventListener("pointerleave", onLeave);
    return () => {
      stop?.();
      button.removeEventListener("pointerenter", onEnter);
      button.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <svg ref={svgRef} className="goo-flood" aria-hidden="true">
      <defs>
        <GooFilter id={`${id}-goo`} blur={5} region={{ x: "-20%", y: "-60%", width: "140%", height: "220%" }} />
      </defs>
      <g filter={`url(#${id}-goo)`}>
        <circle r="0" />
        <circle r="0" />
        <circle r="0" />
      </g>
    </svg>
  );
}
