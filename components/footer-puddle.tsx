"use client";

import { useEffect, useRef } from "react";
import { animate, reducedMotion } from "@/lib/goo";
import { Puddle, addSurface } from "@/lib/rain";

/*
 * The footer's top edge is the last surface the rain reaches (lib/rain.ts). The drops that fall from
 * the History band land on it, and it takes them like a puddle: it dips where each one goes in, rings
 * out along the edge and throws a bead back up. On a wide screen the edge is the day half's rule and
 * the top of the night half; on a phone it is the rule.
 *
 * It draws that edge itself, over the real one, and only in the day theme with motion allowed; then the
 * real rule is hidden (styles/goo.css). Otherwise it draws nothing and the plain rule stays. It runs
 * only while a drop's rings are still moving.
 */

// How far the drawing reaches above and below the footer's top edge.
const PAD = 40;
const BEADS = 9;

export default function FooterPuddle() {
  const svgRef = useRef<SVGSVGElement>(null);
  const coverRef = useRef<SVGPathElement>(null);
  const nightRef = useRef<SVGPathElement>(null);
  const ruleRef = useRef<SVGPathElement>(null);
  const beadsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const cover = coverRef.current;
    const nightEdge = nightRef.current;
    const rule = ruleRef.current;
    const beadLayer = beadsRef.current;
    const footer = svg?.closest("footer");
    const dayHalf = footer?.querySelector<HTMLElement>(':scope > [data-tone="day"]');
    const nightHalf = footer?.querySelector<HTMLElement>(":scope > .pool");
    if (!svg || !cover || !nightEdge || !rule || !beadLayer || !footer || !dayHalf || reducedMotion()) return;
    const beadEls = Array.from(beadLayer.querySelectorAll("circle"));
    const puddle = new Puddle();
    // Where the rule runs, and where the night half meets the edge (a wide screen only), from the left.
    let day: [number, number] = [0, 0];
    let night: [number, number] | null = null;
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

    const draw = () => {
      rule.setAttribute("d", `M${edge(day[0], day[1], 0.75).join(" L")}`);
      if (night && !puddle.calm) {
        const line = edge(night[0], night[1], 0);
        // Where the edge rises, night fills up to it; where it dips, the page ground covers down to it
        // (drawn second, so it wins). At rest neither is drawn and the real edge shows.
        nightEdge.setAttribute("d", `M${night[0]},${PAD} L${line.join(" L")} L${night[1]},${PAD} Z`);
        cover.setAttribute("d", `M${night[0]},0 L${line.join(" L")} L${night[1]},0 Z`);
      } else {
        cover.setAttribute("d", "");
        nightEdge.setAttribute("d", "");
      }
      beadEls.forEach((el, i) => {
        const bead = puddle.beads[i];
        if (!bead || bead.wait > 0) return el.setAttribute("r", "0");
        el.setAttribute("cx", bead.x.toFixed(1));
        el.setAttribute("cy", (PAD + bead.y).toFixed(1));
        el.setAttribute("r", bead.r.toFixed(2));
      });
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
        if (document.documentElement.dataset.theme === "night") return;
        puddle.hit(x - footer.getBoundingClientRect().left, r, speed);
        stop ??= animate(tick);
      },
    });
    const resize = new ResizeObserver(measure);
    resize.observe(footer);
    measure();
    return () => {
      stop?.();
      removeSurface();
      resize.disconnect();
      delete footer.dataset.puddle;
    };
  }, []);

  return (
    <svg ref={svgRef} className="puddle" aria-hidden="true">
      <g data-tone="night">
        <path ref={nightRef} className="puddle-night" />
      </g>
      <path ref={coverRef} className="puddle-cover" />
      <g data-tone="night">
        <g ref={beadsRef} className="puddle-beads">
          {Array.from({ length: BEADS }, (_, index) => (
            <circle key={index} r="0" />
          ))}
        </g>
      </g>
      <g data-tone="day">
        <path ref={ruleRef} className="puddle-rule" />
      </g>
    </svg>
  );
}
