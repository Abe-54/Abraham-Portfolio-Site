"use client";

import { useEffect, useRef, useState } from "react";
import { Drop } from "./drop";
import { DROP, GooFilter, GROW, TAIL, animate, spring, step } from "./goo";
import { labHistory } from "./history-data";

/*
 * History A, the strand. A thread of goo runs down beside the stops, a bead on it for each one. A drop
 * rides the thread on the reading line as the page scrolls, pulls away from a bead with a neck, and
 * feeds every bead it reaches: the bead swells and stays full. Every stop reads in full at all times;
 * the goo only shows how far you have come.
 */

const READING_LINE = 0.55;
const BEAD = 8;
const FED = 16;
const DROP_R = 11;

export function HistoryStrand() {
  const listRef = useRef<HTMLOListElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [current, setCurrent] = useState(0);
  const [size, setSize] = useState<{ h: number; beads: number[] } | null>(null);

  useEffect(() => {
    const list = listRef.current;
    const svg = svgRef.current;
    if (!list || !svg) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let beads: number[] = [];
    let radii = labHistory.map(() => spring(BEAD));
    const fed = labHistory.map(() => false);
    const drop = spring(0);
    const tail = spring(0);
    let stop: (() => void) | null = null;
    let visible = false;
    let last = -1;

    const measure = () => {
      const top = list.getBoundingClientRect().top;
      beads = Array.from(list.querySelectorAll<HTMLElement>("[data-bead]")).map((el) => {
        const box = el.getBoundingClientRect();
        return box.top - top + box.height / 2;
      });
      setSize({ h: list.offsetHeight, beads });
      if (reduced) {
        radii = labHistory.map(() => spring(FED));
        drop.value = tail.value = beads[0];
      }
    };

    const targetY = () => {
      const top = list.getBoundingClientRect().top;
      const line = window.innerHeight * READING_LINE - top;
      return Math.min(Math.max(line, beads[0]), beads[beads.length - 1]);
    };

    const draw = () => {
      const circles = svg.querySelectorAll<SVGCircleElement>(".strand-bead");
      circles.forEach((c, i) => c.setAttribute("r", Math.max(0, radii[i].value).toFixed(2)));
      const blob = svg.querySelector<SVGEllipseElement>(".strand-drop");
      const trail = svg.querySelector<SVGCircleElement>(".strand-tail");
      if (!blob || !trail) return;
      // The drop stretches along the thread with its speed.
      const v = Math.abs(drop.velocity);
      blob.setAttribute("cy", drop.value.toFixed(1));
      blob.setAttribute("rx", (DROP_R * (1 - Math.min(0.3, v / 2600))).toFixed(2));
      blob.setAttribute("ry", (DROP_R * (1 + Math.min(0.9, v / 900))).toFixed(2));
      trail.setAttribute("cy", tail.value.toFixed(1));
      trail.setAttribute("r", (DROP_R * 0.6).toFixed(2));
    };

    const tick = (dt: number) => {
      if (!beads.length) return false;
      const y = targetY();
      step(drop, y, TAIL, dt);
      step(tail, drop.value, DROP, dt);
      let reached = 0;
      beads.forEach((b, i) => {
        if (drop.value >= b - 2) {
          fed[i] = true;
          reached = i;
        }
        step(radii[i], fed[i] ? FED : BEAD, GROW, dt);
      });
      if (reached !== last) {
        last = reached;
        setCurrent(reached);
      }
      draw();
      const still =
        Math.abs(drop.value - y) < 0.3 &&
        Math.abs(drop.velocity) < 2 &&
        Math.abs(tail.value - drop.value) < 0.3 &&
        radii.every((r, i) => Math.abs(r.value - (fed[i] ? FED : BEAD)) < 0.05 && Math.abs(r.velocity) < 0.5);
      if (still || !visible) {
        stop = null;
        return false;
      }
      return true;
    };

    const wake = () => {
      if (reduced || !visible || stop) return;
      stop = animate(tick);
    };

    measure();
    drop.value = tail.value = beads[0] ?? 0;
    fed[0] = true;
    radii[0] = spring(FED);
    draw();
    const resize = new ResizeObserver(() => {
      measure();
      draw();
      wake();
    });
    resize.observe(list);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    observer.observe(list);
    window.addEventListener("scroll", wake, { passive: true });
    return () => {
      stop?.();
      resize.disconnect();
      observer.disconnect();
      window.removeEventListener("scroll", wake);
    };
  }, []);

  return (
    <section data-tone="night" className="lab-history strand" aria-labelledby="strand-title">
      <div className="flex flex-col gap-3">
        <p className="t-label t-tag">History</p>
        <h3 id="strand-title" className="t-section drop-heading">
          How I got here<Drop />
        </h3>
      </div>
      <div className="strand-map">
        <div className="strand-rail" aria-hidden="true">
          <svg ref={svgRef} className="strand-svg" height={size?.h ?? 0}>
            <defs>
              <GooFilter id="strand-goo" blur={5} sharpness={18} cut={7} />
            </defs>
            {size ? (
              <>
                <line
                  className="strand-wire"
                  x1="50%"
                  x2="50%"
                  y1={size.beads[0]}
                  y2={size.beads[size.beads.length - 1]}
                />
                <g filter="url(#strand-goo)" fill="#3366FF" className="strand-goo">
                  {size.beads.map((y, i) => (
                    <circle key={i} className="strand-bead" cx="50%" cy={y} r={i === 0 ? FED : BEAD} />
                  ))}
                  <circle className="strand-tail" cx="50%" cy={size.beads[0]} r="0" />
                  <ellipse className="strand-drop" cx="50%" cy={size.beads[0]} rx={DROP_R} ry={DROP_R} />
                </g>
              </>
            ) : null}
          </svg>
        </div>
        <ol ref={listRef} className="strand-list">
          {labHistory.map((stop, index) => (
            <li key={stop.title} className="strand-row" data-current={index === current || undefined}>
              <p className="t-label strand-level">
                Level {stop.level} · {stop.label}
              </p>
              <div className="strand-main">
                <div data-bead className="flex flex-col gap-1">
                  <h4 className="strand-title">{stop.title}</h4>
                  <p className="strand-org">{stop.org}</p>
                </div>
                <ul className="strand-details">
                  {stop.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
