"use client";

import { useEffect, useRef } from "react";
import { animate, reducedMotion } from "@/lib/goo";
import { Puddle, addSurface } from "@/lib/rain";

/*
 * The footer's top edge is the last surface the rain reaches (lib/rain.ts). The drops that fall from
 * the History band land on it, and it takes them like a puddle: it dips where each one goes in and
 * rings out along the edge, and the drop goes on through into the footer's lava, which hears a
 * `goo-rain` event for each one (components/goo-pool.tsx). On a wide screen the edge runs along the
 * tops of both halves; on a phone, along the day half.
 *
 * It draws that edge itself, over the real one, whenever motion is allowed; then the real rule is hidden
 * (styles/goo.css). Where the colours above and below the edge differ, the edge is the line between
 * them: the page ground above, the half's own ground below, each following the rings. In the day theme
 * the day half is white under white, so there the edge is its black rule. In night theme the night half
 * is black under black, so there only the rings show, in the blue of the rain. It runs only while a
 * drop's rings are still moving.
 */

/** The `goo-rain` event's detail: a drop of radius `r` px went into the footer at window point (x, y). */
export type Rain = { x: number; y: number; r: number; speed: number };

// How far the drawing reaches above and below the footer's top edge.
const PAD = 40;

type Range = [number, number];

export default function FooterPuddle() {
  const svgRef = useRef<SVGSVGElement>(null);
  const dayBelowRef = useRef<SVGPathElement>(null);
  const dayAboveRef = useRef<SVGPathElement>(null);
  const nightBelowRef = useRef<SVGPathElement>(null);
  const nightAboveRef = useRef<SVGPathElement>(null);
  const ruleRef = useRef<SVGPathElement>(null);
  const ringsRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const dayBelow = dayBelowRef.current;
    const dayAbove = dayAboveRef.current;
    const nightBelow = nightBelowRef.current;
    const nightAbove = nightAboveRef.current;
    const rule = ruleRef.current;
    const rings = ringsRef.current;
    const footer = svg?.closest("footer");
    const dayHalf = footer?.querySelector<HTMLElement>(':scope > [data-tone="day"]');
    const nightHalf = footer?.querySelector<HTMLElement>(':scope > [data-tone="night"]');
    if (!svg || !dayBelow || !dayAbove || !nightBelow || !nightAbove || !rule || !rings) return;
    if (!footer || !dayHalf || reducedMotion()) return;
    const puddle = new Puddle();
    // Where the day half meets the edge, and the night half (a wide screen only), from the left.
    let day: Range = [0, 0];
    let night: Range | null = null;
    let stop: (() => void) | null = null;
    footer.dataset.puddle = "";

    // The edge between two x positions, at a depth below the line, sampled on the puddle's columns.
    const edge = (from: number, to: number, depth: number) => {
      const points = [`${from.toFixed(1)},${(PAD + depth + puddle.at(from)).toFixed(2)}`];
      for (let i = 0; i < puddle.h.length; i++) {
        const x = i * puddle.dx;
        if (x > from && x < to) points.push(`${x.toFixed(1)},${(PAD + depth + puddle.h[i]).toFixed(2)}`);
      }
      points.push(`${to.toFixed(1)},${(PAD + depth + puddle.at(to)).toFixed(2)}`);
      return points;
    };

    // Where the edge rises, the half's ground fills up to it; where it dips, the page ground covers down
    // to it (drawn second, so it wins). At rest neither is drawn and the real edge shows.
    const fill = (below: SVGPathElement, above: SVGPathElement, range: Range | null) => {
      if (!range || puddle.calm) {
        below.setAttribute("d", "");
        above.setAttribute("d", "");
        return;
      }
      const line = edge(range[0], range[1], 0).join(" L");
      below.setAttribute("d", `M${range[0]},${PAD} L${line} L${range[1]},${PAD} Z`);
      above.setAttribute("d", `M${range[0]},0 L${line} L${range[1]},0 Z`);
    };

    const draw = () => {
      const dark = document.documentElement.dataset.theme === "night";
      rule.setAttribute("d", dark ? "" : `M${edge(day[0], day[1], 0.75).join(" L")}`);
      fill(dayBelow, dayAbove, dark ? day : null);
      fill(nightBelow, nightAbove, dark ? null : night);
      rings.setAttribute("d", dark && night && !puddle.calm ? puddle.rings(() => PAD, night[0], night[1]) : "");
    };

    const measure = () => {
      const box = footer.getBoundingClientRect();
      const d = dayHalf.getBoundingClientRect();
      day = [d.left - box.left, d.right - box.left];
      const n = nightHalf?.getBoundingClientRect();
      night = n && Math.abs(n.top - box.top) < 2 ? [n.left - box.left, n.right - box.left] : null;
      puddle.resize(box.width);
      draw();
    };

    const tick = (dt: number) => {
      puddle.step(dt);
      draw();
      if (puddle.calm) {
        stop = null;
        return false;
      }
      return true;
    };

    const removeSurface = addSurface({
      lineAt: (x) => {
        const box = footer.getBoundingClientRect();
        return x >= box.left && x <= box.right ? box.top : null;
      },
      hit: (x, r, speed) => {
        const box = footer.getBoundingClientRect();
        // No splash: the drop goes on into the footer, where the lava takes it (components/goo-pool.tsx).
        puddle.hit(x - box.left, r, speed, false);
        stop ??= animate(tick);
        footer.dispatchEvent(new CustomEvent<Rain>("goo-rain", { detail: { x, y: box.top, r, speed } }));
      },
    });
    const resize = new ResizeObserver(measure);
    resize.observe(footer);
    // The rule is drawn only in the day theme, so a new theme redraws the edge at once.
    const theme = new MutationObserver(draw);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    measure();
    return () => {
      stop?.();
      removeSurface();
      resize.disconnect();
      theme.disconnect();
      delete footer.dataset.puddle;
    };
  }, []);

  return (
    <svg ref={svgRef} className="puddle" aria-hidden="true">
      <g data-tone="day">
        <path ref={dayBelowRef} className="puddle-fill" />
      </g>
      <g data-tone="night">
        <path ref={nightBelowRef} className="puddle-fill" />
      </g>
      <path ref={dayAboveRef} className="puddle-fill" />
      <path ref={nightAboveRef} className="puddle-fill" />
      <path ref={ringsRef} className="puddle-rings" />
      <g data-tone="day">
        <path ref={ruleRef} className="puddle-rule" />
      </g>
    </svg>
  );
}
