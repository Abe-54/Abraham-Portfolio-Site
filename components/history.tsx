"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { history } from "@/lib/content";

type Point = { x: number; y: number };

type Geometry = {
  width: number;
  height: number;
  scale: number;
  stops: Point[];
  path: string;
  samples: Point[];
};

type Progress = { engaged: boolean; current: number };

type StopState = "open" | "closed" | "passed" | "ahead";

const READING_LINE = 0.55;
const SAMPLES_PER_SEGMENT = 24;

function stopState(index: number, progress: Progress, reduced: boolean): StopState {
  if (reduced) return "open";
  if (!progress.engaged) return index === 0 ? "open" : "closed";
  if (index < progress.current) return "passed";
  return index === progress.current ? "open" : "ahead";
}

function bezier(a: Point, c1: Point, c2: Point, b: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
    y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y,
  };
}

function measure(column: HTMLElement, list: HTMLElement, heads: HTMLElement[]): Geometry {
  const width = column.clientWidth;
  const listTop = list.getBoundingClientRect().top;
  const stops = heads.map((head, index) => {
    const box = head.getBoundingClientRect();
    return { x: width * (index % 2 === 0 ? 0.3 : 0.7), y: box.top - listTop + box.height / 2 };
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

  return { width, height: list.offsetHeight, scale: width / 200, stops, path, samples };
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

export default function History() {
  const columnRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const headRefs = useRef<HTMLDivElement[]>([]);
  const solidRef = useRef<SVGSVGElement>(null);
  const markerRef = useRef<SVGSVGElement>(null);
  const geometryRef = useRef<Geometry | null>(null);
  const placeRef = useRef(() => {});
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [progress, setProgress] = useState<Progress>({ engaged: false, current: 0 });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const column = columnRef.current;
    const list = listRef.current;
    if (!column || !list) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(reduceMotion);
    let frame = 0;

    const place = () => {
      frame = 0;
      const g = geometryRef.current;
      const marker = markerRef.current;
      const solid = solidRef.current;
      if (!g || !marker || !solid) return;
      const first = g.stops[0].y;
      const last = g.stops[g.stops.length - 1].y;
      const raw = reduceMotion ? first : window.innerHeight * READING_LINE - list.getBoundingClientRect().top;
      const y = Math.min(Math.max(raw, first), last);
      marker.style.transform = `translate(${xAt(g.samples, y)}px, ${y}px) scale(${g.scale})`;
      solid.style.clipPath = `inset(0 0 ${g.height - y}px 0)`;
      const engaged = raw > first;
      const current = g.stops.reduce((reached, stop, index) => (stop.y <= raw ? index : reached), 0);
      setProgress((previous) =>
        previous.engaged === engaged && previous.current === current ? previous : { engaged, current },
      );
    };

    placeRef.current = place;

    const remeasure = () => {
      geometryRef.current = measure(column, list, headRefs.current);
      setGeometry(geometryRef.current);
      place();
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };

    remeasure();
    document.fonts?.ready.then(remeasure);
    const resizeObserver = new ResizeObserver(remeasure);
    resizeObserver.observe(list);
    resizeObserver.observe(column);
    if (!reduceMotion) window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useLayoutEffect(() => placeRef.current(), [geometry]);

  const s = geometry?.scale ?? 1;

  return (
    <section id="history" data-tone="night" aria-labelledby="history-title" className="history shell">
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
                  strokeWidth={Math.max(2.5, 4 * s)}
                  strokeLinecap="round"
                  strokeDasharray={`${Math.max(1, 2 * s)} ${Math.max(8, 14 * s)}`}
                />
              </svg>
              <svg
                ref={solidRef}
                className="history-layer"
                width={geometry.width}
                height={geometry.height}
              >
                <path
                  d={geometry.path}
                  fill="none"
                  stroke="#3366FF"
                  strokeWidth={Math.max(3, 6 * s)}
                  strokeLinecap="round"
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
              <svg ref={markerRef} className="history-marker" viewBox="-70 -70 140 140">
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
