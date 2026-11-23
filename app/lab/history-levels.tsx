"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Drop } from "./drop";
import { GooFilter, KNOB, animate, settled, spring, step, type Feel } from "./goo";
import { labHistory } from "./history-data";

/*
 * History B, level select. The stops become a level map, oldest on the left. A goo player sits on the
 * level you pick and travels the path to the next one, trailing a strand that thins to a drop and
 * melts back in, and it swallows each level dot it passes. The first time the map comes into view the
 * player walks it from Level 1 to Level 4: how I got here, once. The panel below reads the picked level.
 */

const levels = [...labHistory].reverse();
const TOUR: Feel = { stiffness: 34, damping: 11 };
const LINK: Feel = { stiffness: 260, damping: 24 };
// The strand behind the player: each link's radius as a share of the player's. Each link chases the
// one in front of it but can fall at most a short way behind, like a rope, so the strand stretches as
// one neck instead of breaking into separate balls.
const STRAND = [0.74, 0.62, 0.5, 0.4, 0.3];

type Layout = { w: number; h: number; nodes: { x: number; y: number }[]; d: string; r: number; dot: number };

function layout(w: number): Layout {
  const small = w < 560;
  const h = small ? 140 : 230;
  const pad = small ? 34 : 80;
  const amp = small ? 16 : 34;
  const nodes = levels.map((_, i) => ({
    x: pad + (i * (w - pad * 2)) / (levels.length - 1),
    y: h / 2 + (i % 2 === 0 ? amp : -amp),
  }));
  let d = `M${nodes[0].x},${nodes[0].y}`;
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i - 1];
    const b = nodes[i];
    const mx = (a.x + b.x) / 2;
    d += ` C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
  }
  return { w, h, nodes, d, r: small ? 22 : 30, dot: small ? 11 : 14 };
}

export function HistoryLevels() {
  const mapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const gooRef = useRef<SVGGElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Layout | null>(null);
  const [picked, setPicked] = useState(levels.length - 1);
  const engine = useRef<{ go: (index: number, feel?: Feel) => void } | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const measure = () => setGeo(layout(map.clientWidth));
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(map);
    return () => resize.disconnect();
  }, []);

  useEffect(() => {
    const path = pathRef.current;
    const goo = gooRef.current;
    const map = mapRef.current;
    if (!geo || !path || !goo || !map) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Path length at each level, so the player can travel along the curve rather than straight.
    const at = geo.nodes.map((_, i) => {
      if (i === 0) return 0;
      const part = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const sub = geo.d.split(" C").slice(0, i + 1).join(" C");
      part.setAttribute("d", sub);
      return part.getTotalLength();
    });
    const dots = Array.from(goo.querySelectorAll<SVGCircleElement>(".lv-dot"));
    const linkEls = Array.from(goo.querySelectorAll<SVGCircleElement>(".lv-link"));
    const knobEl = goo.querySelector<SVGEllipseElement>(".lv-knob");
    if (!knobEl) return;
    const knob = spring(at[picked]);
    const links = STRAND.map(() => spring(at[picked]));
    // How far, along the path, a link may trail the one in front of it.
    const slack = geo.r * 0.42;
    const swell = geo.nodes.map(() => spring(1));
    let target = at[picked];
    let feel: Feel = KNOB;
    let stop: (() => void) | null = null;

    const point = (s: number) => path.getPointAtLength(Math.min(Math.max(s, 0), at[at.length - 1]));
    const place = (s: number) => {
      knob.value = s;
      knob.velocity = 0;
      for (const link of links) {
        link.value = s;
        link.velocity = 0;
      }
    };
    const draw = () => {
      const p = point(knob.value);
      const ahead = point(knob.value + 1);
      const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
      const stretch = Math.min(0.4, Math.abs(knob.velocity) / 1400);
      knobEl.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${angle.toFixed(1)})`);
      knobEl.setAttribute("rx", (geo.r * (1 + stretch)).toFixed(2));
      knobEl.setAttribute("ry", (geo.r * (1 - stretch * 0.4)).toFixed(2));
      links.forEach((link, i) => {
        const q = point(link.value);
        linkEls[i].setAttribute("cx", q.x.toFixed(1));
        linkEls[i].setAttribute("cy", q.y.toFixed(1));
      });
      dots.forEach((dot, i) => dot.setAttribute("r", (geo.dot * swell[i].value).toFixed(2)));
    };

    const tick = (dt: number) => {
      step(knob, target, feel, dt);
      let lead = knob.value;
      for (const link of links) {
        step(link, lead, LINK, dt);
        // The rope: never more than `slack` behind the link in front.
        const gap = link.value - lead;
        if (Math.abs(gap) > slack) {
          link.value = lead + Math.sign(gap) * slack;
          link.velocity = knob.velocity;
        }
        lead = link.value;
      }
      // A dot the player crosses swells, as if it took a bite.
      at.forEach((s, i) => {
        const near = Math.abs(knob.value - s) < geo.r;
        step(swell[i], near ? 1.45 : 1, KNOB, dt);
      });
      draw();
      const done =
        settled(knob, target, 0.3, 4) &&
        links.every((link) => settled(link, target, 0.3, 4)) &&
        swell.every((s, i) => settled(s, Math.abs(target - at[i]) < geo.r ? 1.45 : 1, 0.01, 0.1));
      if (done) stop = null;
      return !done;
    };

    engine.current = {
      go: (index, how = KNOB) => {
        target = at[index];
        feel = how;
        if (reduced) {
          place(target);
          draw();
          return;
        }
        stop ??= animate(tick);
      },
    };
    draw();

    // The tour: once, the first time the map is in view, the player walks from Level 1 up to now.
    let toured = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || toured || reduced) return;
        toured = true;
        observer.disconnect();
        place(at[0]);
        draw();
        window.setTimeout(() => engine.current?.go(levels.length - 1, TOUR), 250);
      },
      { rootMargin: "0px 0px -30% 0px" },
    );
    observer.observe(map);
    return () => {
      stop?.();
      observer.disconnect();
      engine.current = null;
    };
    // The player is placed from `picked` only when the layout changes; picks after that animate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo]);

  const pick = (index: number) => {
    setPicked(index);
    engine.current?.go(index);
  };

  const onKey = (event: KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowRight: picked + 1,
      ArrowDown: picked + 1,
      ArrowLeft: picked - 1,
      ArrowUp: picked - 1,
      Home: 0,
      End: levels.length - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = Math.min(Math.max(keys[event.key], 0), levels.length - 1);
    pick(next);
    tabsRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };

  const stop = levels[picked];

  return (
    <section data-tone="night" className="lab-history levels" aria-labelledby="levels-title">
      <div className="flex flex-col gap-3">
        <p className="t-label t-tag">History</p>
        <h3 id="levels-title" className="t-section drop-heading">
          How I got here<Drop />
        </h3>
      </div>

      <div ref={mapRef} className="lv-map" style={{ height: geo?.h }}>
        {geo ? (
          <>
            <svg className="lv-svg" width={geo.w} height={geo.h} aria-hidden="true">
              <defs>
                <GooFilter id="lv-goo" blur={6} sharpness={18} cut={7} />
              </defs>
              <path ref={pathRef} d={geo.d} className="lv-path" />
              <g ref={gooRef} filter="url(#lv-goo)" fill="#3366FF">
                {geo.nodes.map((n, i) => (
                  <circle key={i} className="lv-dot" cx={n.x} cy={n.y} r={geo.dot} />
                ))}
                {STRAND.map((share, i) => (
                  <circle key={i} className="lv-link" r={geo.r * share} />
                ))}
                <ellipse className="lv-knob" rx={geo.r} ry={geo.r} />
              </g>
            </svg>
            <div ref={tabsRef} role="tablist" aria-label="Levels" className="lv-tabs" onKeyDown={onKey}>
              {levels.map((level, i) => (
                <button
                  key={level.title}
                  type="button"
                  role="tab"
                  id={`lv-tab-${i}`}
                  aria-selected={i === picked}
                  aria-controls="lv-panel"
                  tabIndex={i === picked ? 0 : -1}
                  className="lv-node"
                  style={{ left: geo.nodes[i].x, top: geo.nodes[i].y }}
                  onClick={() => pick(i)}
                >
                  <span className="lv-num">{level.level}</span>
                  <span className={`lv-caption ${i % 2 === 0 ? "below" : "above"}`}>
                    <span className="lv-year">{level.label === "Now playing" ? "Now" : level.label}</span>
                    <span className="lv-name">{level.title}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div id="lv-panel" role="tabpanel" aria-labelledby={`lv-tab-${picked}`} className="lv-panel" key={picked}>
        <div className="flex flex-col gap-2">
          <p className="t-label lv-panel-level">
            Level {stop.level} · {stop.label}
          </p>
          <h4 className="lv-title">{stop.title}</h4>
          <p className="lv-org">{stop.org}</p>
        </div>
        <ul className="lv-details">
          {stop.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
