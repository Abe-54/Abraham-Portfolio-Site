"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { DROP, GooFilter, GROW, KNOB, SHRINK, TAIL, animate, settled, spring, type Spring } from "./goo";

/*
 * Rules are wires, and goo runs along them. A short bar of goo sits on the rule over the item you point
 * at. Moving to another item it travels there like the nav's blob: a knob that stretches with its speed,
 * and a tail and a drop that trail it and melt back in. Between stacked rules it falls from one to the
 * next, so it stretches down like a drip.
 */

type Box = { cx: number; cy: number; w: number; h: number };

class WireGoo {
  private knob = { x: spring(), y: spring(), w: spring(), h: spring() };
  private tail = { x: spring(), y: spring() };
  private drop = { x: spring(), y: spring() };
  private scale = spring();
  private target: Box | null = null;
  private stop: (() => void) | null = null;

  constructor(private parts: SVGRectElement[]) {}

  set(box: Box | null, still: boolean) {
    this.target = box;
    if (still) {
      this.stop?.();
      this.stop = null;
      if (box) this.place(box);
      this.scale = spring(box ? 1 : 0);
      this.render();
      return;
    }
    if (box && this.scale.value < 0.01) this.place(box);
    if (!this.stop) this.stop = animate(this.tick);
  }

  dispose() {
    this.stop?.();
  }

  private place(box: Box) {
    this.knob = { x: spring(box.cx), y: spring(box.cy), w: spring(box.w), h: spring(box.h) };
    this.tail = { x: spring(box.cx), y: spring(box.cy) };
    this.drop = { x: spring(box.cx), y: spring(box.cy) };
  }

  private tick = (dt: number) => {
    const box = this.target;
    const { knob, tail, drop } = this;
    if (box) {
      for (const [s, t] of [
        [knob.x, box.cx],
        [knob.y, box.cy],
        [knob.w, box.w],
        [knob.h, box.h],
      ] as [Spring, number][])
        step(s, t, KNOB, dt);
      step(tail.x, knob.x.value, TAIL, dt);
      step(tail.y, knob.y.value, TAIL, dt);
      step(drop.x, tail.x.value, DROP, dt);
      step(drop.y, tail.y.value, DROP, dt);
      // A rope: each trailer stays within reach of the one in front, so a long move pulls one neck of
      // goo instead of leaving balls behind.
      const reach = Math.max(knob.w.value, knob.h.value) * 0.5;
      tether(tail, knob, reach);
      tether(drop, tail, reach);
    }
    step(this.scale, box ? 1 : 0, box ? GROW : SHRINK, dt);
    if (this.scale.value < 0) this.scale = spring(0);
    this.render();
    const done = box
      ? [knob.x, tail.x, drop.x].every((s) => settled(s, box.cx)) &&
        [knob.y, tail.y, drop.y].every((s) => settled(s, box.cy)) &&
        settled(knob.w, box.w) &&
        settled(knob.h, box.h) &&
        settled(this.scale, 1, 0.002, 0.05)
      : this.scale.value < 0.01;
    if (done) {
      if (box) this.place(box);
      this.scale = spring(box ? 1 : 0);
      this.render();
      this.stop = null;
      return false;
    }
    return true;
  };

  private render() {
    const s = this.scale.value;
    const { knob, tail, drop } = this;
    const vx = Math.abs(knob.x.velocity);
    const vy = Math.abs(knob.y.velocity);
    // It stretches along the way it moves and thins across it.
    const along = Math.min(0.5, Math.max(vx, vy) / 1600);
    const sx = vx >= vy ? 1 + along : 1 - along * 0.35;
    const sy = vy > vx ? 1 + along * 3 : 1 - along * 0.35;
    const w = knob.w.value;
    const h = knob.h.value;
    const thick = Math.min(w, h);
    this.draw(0, knob.x.value, knob.y.value, w * sx * s, h * sy * s);
    // The trailers fit inside the knob, so at rest the shape is exactly the knob.
    this.draw(1, tail.x.value, tail.y.value, Math.max(thick * 0.75, w * 0.55) * s, Math.max(thick * 0.75, h * 0.55) * s);
    this.draw(2, drop.x.value, drop.y.value, thick * 0.6 * s, thick * 0.6 * s);
  }

  private draw(part: number, cx: number, cy: number, w: number, h: number) {
    const rect = this.parts[part];
    const width = Math.max(0, w);
    const height = Math.max(0, h);
    rect.setAttribute("x", (cx - width / 2).toFixed(2));
    rect.setAttribute("y", (cy - height / 2).toFixed(2));
    rect.setAttribute("width", width.toFixed(2));
    rect.setAttribute("height", height.toFixed(2));
    rect.setAttribute("rx", (Math.min(width, height) / 2).toFixed(2));
  }
}

function step(s: Spring, target: number, feel: { stiffness: number; damping: number }, dt: number) {
  s.velocity += (-feel.stiffness * (s.value - target) - feel.damping * s.velocity) * dt;
  s.value += s.velocity * dt;
}

type Point = { x: Spring; y: Spring };

/** Pulls `follower` back to within `reach` of `leader`, moving with it as if dragged. */
function tether(follower: Point, leader: Point, reach: number) {
  const dx = follower.x.value - leader.x.value;
  const dy = follower.y.value - leader.y.value;
  const distance = Math.hypot(dx, dy);
  if (distance <= reach) return;
  const k = reach / distance;
  follower.x.value = leader.x.value + dx * k;
  follower.y.value = leader.y.value + dy * k;
  follower.x.velocity = leader.x.velocity;
  follower.y.velocity = leader.y.velocity;
}

/**
 * Items inside `children` marked `data-wire-item` get the goo. As a "bar", it rides the nearest
 * `data-wire-rule` (the item itself or a row around it), as wide as the item's `data-wire-over`
 * element (the title). As a "bead", it sits behind the item's `data-wire-over` element (the number),
 * so between stacked items it travels down that clear column instead of across the text. The item
 * under the goo is marked `data-wire-active`.
 */
export function Wire({
  id,
  className,
  shape = "bar",
  children,
}: {
  id: string;
  className?: string;
  shape?: "bar" | "bead";
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg) return;
    const goo = new WireGoo(Array.from(svg.querySelectorAll("rect")));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current: HTMLElement | null = null;

    const boxOf = (item: HTMLElement): Box => {
      const base = root.getBoundingClientRect();
      // The rule is the item's own top border, or the border of the row it sits in.
      const rule = (item.closest("[data-wire-rule]") ?? item).getBoundingClientRect();
      const over = (item.querySelector("[data-wire-over]") ?? item).getBoundingClientRect();
      if (shape === "bead") {
        const size = Math.max(over.width, over.height) + 8;
        return { cx: over.left + over.width / 2 - base.left, cy: over.top + over.height / 2 - base.top, w: size, h: size };
      }
      return { cx: over.left + over.width / 2 - base.left, cy: rule.top - base.top, w: over.width + 16, h: 8 };
    };

    const point = (item: HTMLElement | null) => {
      current?.removeAttribute("data-wire-active");
      current = item;
      item?.setAttribute("data-wire-active", "");
      goo.set(item ? boxOf(item) : null, reduced);
    };

    const itemOf = (target: EventTarget | null) =>
      target instanceof Element ? (target.closest("[data-wire-item]") as HTMLElement | null) : null;

    const onOver = (event: PointerEvent) => {
      const item = itemOf(event.target);
      if (item && item !== current) point(item);
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === "mouse") point(null);
    };
    const onFocus = (event: FocusEvent) => point(itemOf(event.target));
    const onBlur = (event: FocusEvent) => {
      if (!root.contains(event.relatedTarget as Node)) point(null);
    };
    const resize = new ResizeObserver(() => {
      if (current) goo.set(boxOf(current), true);
    });
    resize.observe(root);
    root.addEventListener("pointerover", onOver);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onFocus);
    root.addEventListener("focusout", onBlur);
    return () => {
      goo.dispose();
      resize.disconnect();
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onFocus);
      root.removeEventListener("focusout", onBlur);
    };
  }, [shape]);

  const goo = (
    <svg ref={svgRef} className="wire-goo" data-shape={shape} aria-hidden="true">
      <defs>
        <GooFilter
          id={`${id}-goo`}
          blur={shape === "bead" ? 5 : 3}
          sharpness={16}
          cut={6}
          region={{ x: "-5%", y: "-10%", width: "110%", height: "120%" }}
        />
      </defs>
      <g filter={`url(#${id}-goo)`} fill="#3366FF">
        <rect width="0" height="0" />
        <rect width="0" height="0" />
        <rect width="0" height="0" />
      </g>
    </svg>
  );

  // A bead sits behind its item's number; a bar sits on top of its rule.
  return (
    <div ref={rootRef} className={`wire ${className ?? ""}`} data-shape={shape}>
      {shape === "bead" ? goo : null}
      {children}
      {shape === "bar" ? goo : null}
    </div>
  );
}
