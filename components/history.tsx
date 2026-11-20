"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { history } from "@/lib/content";

type Point = { x: number; y: number };

type Geometry = {
  width: number;
  height: number;
  scale: number;
  stops: Point[];
  path: string;
  samples: Point[];
  winding: boolean;
};

type Progress = { engaged: boolean; current: number };

type StopState = "open" | "closed" | "passed" | "ahead";

type ViewTimelineConstructor = new (options: { subject: Element; axis?: "block" | "inline" }) => AnimationTimeline;

const SAMPLES_PER_SEGMENT = 32;

function stopState(index: number, progress: Progress, reduced: boolean): StopState {
  if (reduced) return "open";
  if (!progress.engaged) return index === 0 ? "open" : "closed";
  if (index < progress.current) return "passed";
  return index === progress.current ? "open" : "ahead";
}

/** Scroll-driven animations let the compositor move the marker along the curve in the same frame as the scroll. */
function viewTimeline(): ViewTimelineConstructor | null {
  const constructor = (window as unknown as { ViewTimeline?: ViewTimelineConstructor }).ViewTimeline;
  return typeof constructor === "function" ? constructor : null;
}

function bezier(a: Point, c1: Point, c2: Point, b: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
    y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y,
  };
}

function measure(column: HTMLElement, list: HTMLElement, heads: HTMLElement[], winding: boolean): Geometry {
  const width = column.clientWidth;
  const listTop = list.getBoundingClientRect().top;
  const stops = heads.map((head, index) => {
    const box = head.getBoundingClientRect();
    const x = winding ? width * (index % 2 === 0 ? 0.3 : 0.7) : width * 0.5;
    return { x, y: box.top - listTop + box.height / 2 };
  });

  let path = `M${stops[0].x},${stops[0].y}`;
  const samples: Point[] = [stops[0]];
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1];
    const b = stops[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const c1 = { x: a.x + dx * 1.125, y: a.y + dy * 0.25 };
    const c2 = { x: b.x + dx * 0.125, y: a.y + dy * 0.75 };
    path += ` C${c1.x},${c1.y} ${c2.x},${c2.y} ${b.x},${b.y}`;
    for (let step = 1; step <= SAMPLES_PER_SEGMENT; step++) {
      samples.push(bezier(a, c1, c2, b, step / SAMPLES_PER_SEGMENT));
    }
  }

  return { width, height: list.offsetHeight, scale: width / 200, stops, path, samples, winding };
}

function xAt(samples: Point[], y: number) {
  let low = 0;
  let high = samples.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (samples[mid].y < y) low = mid;
    else high = mid;
  }
  const a = samples[low];
  const b = samples[high];
  const t = b.y === a.y ? 0 : (y - a.y) / (b.y - a.y);
  return a.x + (b.x - a.x) * Math.min(Math.max(t, 0), 1);
}

function sameGeometry(a: Geometry | null, b: Geometry) {
  return !!a && a.path === b.path && a.width === b.width && a.height === b.height;
}

export default function History() {
  const columnRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const headRefs = useRef<HTMLDivElement[]>([]);
  const probeRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<SVGSVGElement>(null);
  const geometryRef = useRef<Geometry | null>(null);
  const updateRef = useRef(() => {});
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [progress, setProgress] = useState<Progress>({ engaged: false, current: 0 });
  const [reduced, setReduced] = useState(false);
  const [live, setLive] = useState(false);

  useLayoutEffect(() => {
    const column = columnRef.current;
    const list = listRef.current;
    if (!column || !list) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Without scroll-driven animations the marker cannot follow a curve in step with the scroll, so the path runs straight.
    const winding = reduceMotion || viewTimeline() !== null;
    setReduced(reduceMotion);
    setLive(true);
    let frame = 0;
    let alive = true;

    // Only the stop states read the scroll here. The marker and the solid path are positioned by CSS.
    const update = () => {
      frame = 0;
      const g = geometryRef.current;
      const probe = probeRef.current;
      if (!g || !probe || reduceMotion) return;
      const travelled = -probe.getBoundingClientRect().top;
      const line = g.stops[0].y + travelled;
      const engaged = travelled > 0;
      const current = g.stops.reduce((reached, stop, index) => (stop.y <= line ? index : reached), 0);
      setProgress((previous) =>
        previous.engaged === engaged && previous.current === current ? previous : { engaged, current },
      );
    };
    updateRef.current = update;

    const remeasure = () => {
      if (!alive) return;
      const next = measure(column, list, headRefs.current, winding);
      if (sameGeometry(geometryRef.current, next)) return;
      geometryRef.current = next;
      setGeometry(next);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    remeasure();
    document.fonts?.ready.then(remeasure);
    const resizeObserver = new ResizeObserver(remeasure);
    resizeObserver.observe(list);
    resizeObserver.observe(column);
    if (!reduceMotion) {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
    }

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useLayoutEffect(() => {
    updateRef.current();
    const marker = markerRef.current;
    const probe = probeRef.current;
    const Timeline = viewTimeline();
    if (!geometry || !geometry.winding || reduced || !marker || !probe || !Timeline) return;
    const first = geometry.stops[0].y;
    const travel = geometry.stops[geometry.stops.length - 1].y - first;
    const keyframes = geometry.samples.map((point) => ({
      transform: `translateX(${point.x}px) scale(${geometry.scale})`,
      offset: travel > 0 ? Math.min(Math.max((point.y - first) / travel, 0), 1) : 0,
    }));
    // The probe sits 55dvh above the marker track, so "exit-crossing" spans exactly the sticky marker's travel.
    const animation = marker.animate(keyframes, {
      fill: "both",
      timeline: new Timeline({ subject: probe, axis: "block" }),
      rangeStart: "exit-crossing 0%",
      rangeEnd: "exit-crossing 100%",
    } as KeyframeAnimationOptions);
    return () => animation.cancel();
  }, [geometry, reduced]);

  const s = geometry?.scale ?? 1;
  const first = geometry?.stops[0].y ?? 0;
  const travel = geometry ? geometry.stops[geometry.stops.length - 1].y - first : 0;
  const coverHeight = geometry ? geometry.height - first : 0;
  const markerX = geometry ? xAt(geometry.samples, first) : 0;

  return (
    <section
      id="history"
      data-nav="history"
      data-tone="night"
      data-live={live || undefined}
      aria-labelledby="history-title"
      className="history shell"
    >
      <div className="flex flex-col gap-3">
        <p className="t-label t-tag">History</p>
        <h2 id="history-title" className="t-section">
          How I got here.
        </h2>
      </div>

      <div className="history-map">
        <div ref={columnRef} className="history-column" aria-hidden="true">
          {geometry ? (
            <>
              <svg className="history-layer" width={geometry.width} height={geometry.height}>
                <path
                  d={geometry.path}
                  fill="none"
                  stroke="#3366FF"
                  strokeWidth={Math.max(3, 6 * s)}
                  strokeLinecap="round"
                />
              </svg>
              {/* A sticky cover hides the solid path below the marker; it moves with the marker on the compositor. */}
              <div className="history-cover-clip" style={{ top: first }}>
                <div style={{ height: travel + coverHeight }}>
                  <div className="history-cover" style={{ height: coverHeight }} />
                </div>
              </div>
              <svg className="history-layer" width={geometry.width} height={geometry.height}>
                <path
                  d={geometry.path}
                  fill="none"
                  stroke="#3366FF"
                  strokeWidth={Math.max(2.5, 4 * s)}
                  strokeLinecap="round"
                  strokeDasharray={`${Math.max(1, 2 * s)} ${Math.max(8, 14 * s)}`}
                />
              </svg>
              <svg className="history-layer" width={geometry.width} height={geometry.height}>
                {geometry.stops.map((stop, index) => (
                  <g
                    key={index}
                    data-state={stopState(index, progress, reduced)}
                    transform={`translate(${stop.x} ${stop.y}) scale(${s})`}
                  >
                    <circle className="history-ring" r="22" fill="#0B0B0C" stroke="#FFFFFF" strokeWidth={Math.max(3, 2 / s)} />
                    <g className="history-tick">
                      <circle r="22" fill="#3366FF" />
                      <path
                        d="M-10,1 L-3,8 L11,-7"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  </g>
                ))}
              </svg>
              {/* The marker track spans first to last stop. Its sticky anchor holds the marker on the reading line. */}
              <div className="history-track" style={{ top: first, height: travel }}>
                <div ref={probeRef} className="history-probe" />
                <div className="history-anchor">
                  <svg
                    ref={markerRef}
                    className="history-marker"
                    viewBox="-70 -70 140 140"
                    style={{ transform: `translateX(${markerX}px) scale(${s})` }}
                  >
                    <path
                      d="M2,-48 C32,-50 52,-28 50,0 C48,30 26,50 -2,48 C-30,46 -50,26 -48,-2 C-46,-28 -26,-46 2,-48 Z"
                      fill="#3366FF"
                    />
                    <circle r="24" fill="#FFFFFF" />
                    <circle r="9" fill="#3366FF" />
                    <circle
                      className="history-droplet"
                      data-hidden={progress.engaged || undefined}
                      cx="64"
                      cy="37"
                      r="6"
                      fill="#3366FF"
                    />
                  </svg>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <ol ref={listRef} className="history-list">
          {history.map((stop, index) => (
            <li key={stop.title} data-state={stopState(index, progress, reduced)} className="history-row">
              <div className="history-main">
                <div
                  ref={(element) => {
                    if (element) headRefs.current[index] = element;
                  }}
                  className="flex flex-col gap-1.5"
                >
                  <h3 className="history-title">{stop.title}</h3>
                  <p className="history-org">{stop.org}</p>
                </div>
                <ul className="history-details">
                  {stop.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
              <p className="history-level t-label">
                Level {stop.level} · {stop.label}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
