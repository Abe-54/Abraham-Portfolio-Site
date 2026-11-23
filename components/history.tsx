"use client";

import { useEffect, useRef, useState } from "react";
import { GROW, animate, reducedMotion, settled, spring, step, type Feel } from "@/lib/goo";
import { history } from "@/lib/content";
import GooFilter from "./goo-filter";
import NightEdges from "./night-edges";
import withDrop from "./with-drop";

/*
 * History as a level map. The map sticks under the nav while the levels scroll up beneath it, oldest
 * first. A level is current from when it reaches the reading line, a little above the middle of the
 * space under the map, until the next one does. Each level is at least as tall as the room above that
 * line, so the current one is always in full view. A goo player follows the scroll along
 * the path, filling it in behind itself and swallowing each level dot it reaches. It dwells on a level
 * while you read it and travels to the next as that one comes up. Click a level on the map to jump to
 * it. Every level's words are in the page as plain text, so nothing needs the map to be read.
 */

const levels = [...history].reverse();
// The player chases the scroll with some lag, so it stretches and its trail pulls into a neck.
const FOLLOW: Feel = { stiffness: 200, damping: 24 };
const LINK: Feel = { stiffness: 260, damping: 24 };
// The strand behind the player: each link's radius as a share of the player's. Each link chases the
// one in front of it but can fall at most a short way behind, like a rope.
const STRAND = [0.74, 0.62, 0.5, 0.4, 0.3];
// Of the scroll from one level to the next, the share the player waits before it sets off.
const DWELL = 0.4;
// The reading line, as a share of the height under the stuck map.
const LINE = 0.4;

/** Where the reading line sits in the window, and how far below the stuck map. */
function readingLine(stage: HTMLElement) {
  const stuckBottom = parseFloat(getComputedStyle(stage).top) + stage.offsetHeight;
  const room = Math.round((window.innerHeight - stuckBottom) * LINE);
  return { y: stuckBottom + room, room };
}

type Layout = { w: number; h: number; nodes: { x: number; y: number }[]; d: string; r: number; dot: number; line: number };

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
  return { w, h, nodes, d, r: small ? 22 : 30, dot: small ? 11 : 14, line: small ? 7 : 10 };
}

export default function History() {
  const levelsRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const gooRef = useRef<SVGGElement>(null);
  const stepRefs = useRef<HTMLLIElement[]>([]);
  const [geo, setGeo] = useState<Layout | null>(null);
  const [current, setCurrent] = useState(0);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const measure = () => setGeo((previous) => (previous?.w === map.clientWidth ? previous : layout(map.clientWidth)));
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(map);
    return () => resize.disconnect();
  }, []);

  useEffect(() => {
    const path = pathRef.current;
    const goo = gooRef.current;
    const stage = stageRef.current;
    const root = levelsRef.current;
    if (!geo || !path || !goo || !stage || !root) return;
    const still = reducedMotion();
    // Path length at each level, so the player travels along the curve.
    const at = geo.nodes.map((_, i) => {
      if (i === 0) return 0;
      const part = document.createElementNS("http://www.w3.org/2000/svg", "path");
      part.setAttribute("d", geo.d.split(" C").slice(0, i + 1).join(" C"));
      return part.getTotalLength();
    });
    const total = at[at.length - 1];
    const dots = Array.from(goo.querySelectorAll<SVGCircleElement>(".lv-dot"));
    const linkEls = Array.from(goo.querySelectorAll<SVGCircleElement>(".lv-link"));
    const knobEl = goo.querySelector<SVGEllipseElement>(".lv-knob");
    const trail = goo.querySelector<SVGPathElement>(".lv-trail");
    if (!knobEl || !trail) return;
    const slack = geo.r * 0.42;
    const knob = spring(0);
    const links = STRAND.map(() => spring(0));
    const swell = geo.nodes.map(() => spring(1));
    let target = 0;
    let stop: (() => void) | null = null;

    // Where the scroll puts the player: on the level at the reading line, or on its way to the next one.
    const read = () => {
      const { y: line, room } = readingLine(stage);
      root.style.setProperty("--lv-room", `${room}px`);
      const tops = stepRefs.current.map((el) => el.getBoundingClientRect().top);
      let reached = 0;
      tops.forEach((top, i) => {
        if (top <= line) reached = i;
      });
      let travel = 0;
      if (reached < tops.length - 1 && tops[reached] <= line) {
        const share = (line - tops[reached]) / Math.max(1, tops[reached + 1] - tops[reached]);
        travel = Math.min(1, Math.max(0, (share - DWELL) / (1 - DWELL)));
      }
      const next = reached < at.length - 1 ? at[reached + 1] : at[reached];
      return { position: at[reached] + (next - at[reached]) * travel, level: travel >= 1 ? reached + 1 : reached };
    };

    const point = (s: number) => path.getPointAtLength(Math.min(Math.max(s, 0), total));
    const fed = (i: number) => knob.value >= at[i] - geo.r;
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
      // The path behind the player is filled in.
      trail.setAttribute("stroke-dasharray", `${Math.max(0, knob.value).toFixed(1)} ${total + 40}`);
      dots.forEach((dot, i) => dot.setAttribute("r", (geo.dot * swell[i].value).toFixed(2)));
    };

    const place = () => {
      knob.value = target;
      knob.velocity = 0;
      for (const link of links) {
        link.value = target;
        link.velocity = 0;
      }
      swell.forEach((s, i) => {
        s.value = fed(i) ? 1.3 : 1;
        s.velocity = 0;
      });
      draw();
    };

    const tick = (dt: number) => {
      step(knob, target, FOLLOW, dt);
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
      // A level dot swells once the player has reached it, as if it took a bite.
      swell.forEach((s, i) => step(s, fed(i) ? 1.3 : 1, GROW, dt));
      draw();
      const done =
        settled(knob, target, 0.3, 4) &&
        links.every((link) => settled(link, target, 0.3, 4)) &&
        swell.every((s, i) => settled(s, fed(i) ? 1.3 : 1, 0.01, 0.1));
      if (done) stop = null;
      return !done;
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      const { position, level } = read();
      setCurrent(level);
      target = position;
      if (still) place();
      else stop ??= animate(tick);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const first = read();
    target = first.position;
    setCurrent(first.level);
    setLive(true);
    place();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      stop?.();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [geo]);

  // Bring a level up to the reading line.
  const jump = (index: number) => {
    const stage = stageRef.current;
    const level = stepRefs.current[index];
    if (!stage || !level) return;
    window.scrollTo({
      top: window.scrollY + level.getBoundingClientRect().top - readingLine(stage).y + 2,
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <section
      id="history"
      data-nav="history"
      data-tone="night"
      aria-labelledby="history-title"
      className="history shell liquid"
    >
      <NightEdges />
      <div className="flex flex-col gap-3">
        <p className="t-label t-tag">History</p>
        <h2 id="history-title" className="t-section">
          {withDrop("How I got here.")}
        </h2>
      </div>

      <div ref={levelsRef} className="lv" data-live={live || undefined}>
        <div className="lv-cap" aria-hidden="true" />
        <div ref={stageRef} className="lv-stage">
          <div ref={mapRef} className="lv-map">
            {geo ? (
              <>
                <svg className="lv-svg" width={geo.w} height={geo.h} aria-hidden="true">
                  <defs>
                    <GooFilter id="lv-goo" blur={6} region={{ x: -40, y: -40, width: geo.w + 80, height: geo.h + 80 }} />
                  </defs>
                  <path ref={pathRef} d={geo.d} className="lv-path" />
                  <g ref={gooRef} filter="url(#lv-goo)" fill="#3366FF">
                    <path className="lv-trail" d={geo.d} strokeWidth={geo.line} />
                    {geo.nodes.map((n, i) => (
                      <circle key={i} className="lv-dot" cx={n.x} cy={n.y} r={geo.dot} />
                    ))}
                    {STRAND.map((share, i) => (
                      <circle key={i} className="lv-link" r={geo.r * share} />
                    ))}
                    <ellipse className="lv-knob" rx={geo.r} ry={geo.r} />
                  </g>
                </svg>
                {levels.map((level, i) => (
                  <button
                    key={level.title}
                    type="button"
                    aria-label={`Level ${level.level}: ${level.title}`}
                    aria-current={i === current ? "step" : undefined}
                    className="lv-node"
                    style={{ left: geo.nodes[i].x, top: geo.nodes[i].y }}
                    onClick={() => jump(i)}
                  >
                    <span className="lv-num" aria-hidden="true">
                      {level.level}
                    </span>
                    <span className={`lv-caption ${i % 2 === 0 ? "below" : "above"}`} aria-hidden="true">
                      <span className="lv-year">{level.label === "Now playing" ? "Now" : level.label}</span>
                      <span className="lv-name">{level.title}</span>
                    </span>
                  </button>
                ))}
              </>
            ) : null}
          </div>
        </div>

        <ol className="lv-steps">
          {levels.map((level, i) => (
            <li
              key={level.title}
              ref={(element) => {
                if (element) stepRefs.current[i] = element;
              }}
              data-state={i < current ? "passed" : i === current ? "current" : "ahead"}
              className="lv-step"
            >
              <div className="flex flex-col gap-2">
                <p className="t-label lv-step-level">
                  Level {level.level} · {level.label}
                </p>
                <h3 className="lv-title">{level.title}</h3>
                <p className="lv-org">{level.org}</p>
              </div>
              <ul className="lv-details">
                {level.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
