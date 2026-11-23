"use client";

import { useEffect, useRef, useState } from "react";
import njHomes from "@/public/nj_homes.webp";
import { GooFilter, KNOB, animate, settled, spring, step } from "./goo";

/*
 * A project cover pours out of a drop of goo the first time it comes into view: blobs grow from the
 * corner where the goo sits and fuse into the whole picture. The goo stays behind the cover, the way
 * it sits behind the portrait, and leans toward the pointer.
 */

const W = 1680;
const H = 1140;
const COLS = 4;
const ROWS = 3;
// Blobs from the bottom-left corner outward; each covers its cell once grown.
const CELLS = Array.from({ length: COLS * ROWS }, (_, i) => {
  const cx = ((i % COLS) + 0.5) * (W / COLS);
  const cy = (Math.floor(i / COLS) + 0.5) * (H / ROWS);
  return { cx, cy, delay: Math.hypot(cx, H - cy) / Math.hypot(W, H) };
});

export function GooCover() {
  const [round, setRound] = useState(0);
  return (
    <div className="lab-cover-stage">
      <Cover key={round} id={`cover${round}`} />
      <button type="button" className="lab-replay press" onClick={() => setRound((r) => r + 1)}>
        Replay
      </button>
    </div>
  );
}

function Cover({ id }: { id: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<SVGGElement>(null);
  const [phase, setPhase] = useState<"wait" | "pour" | "done">("wait");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return;
    }
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setPhase("pour");
        // The mask's filter costs every frame; drop it once the picture is whole.
        timer = window.setTimeout(() => setPhase("done"), 1500);
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // The goo behind leans toward the pointer and swells a little while it is over the cover.
  useEffect(() => {
    const root = rootRef.current;
    const blob = blobRef.current;
    if (!root || !blob || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const x = spring();
    const y = spring();
    const s = spring(1);
    let target = { x: 0, y: 0, s: 1 };
    let stop: (() => void) | null = null;
    const run = () => {
      stop ??= animate((dt) => {
        step(x, target.x, KNOB, dt);
        step(y, target.y, KNOB, dt);
        step(s, target.s, KNOB, dt);
        blob.setAttribute("transform", `translate(${x.value.toFixed(1)} ${y.value.toFixed(1)}) scale(${s.value.toFixed(3)})`);
        const done = settled(x, target.x) && settled(y, target.y) && settled(s, target.s, 0.002, 0.02);
        if (done) stop = null;
        return !done;
      });
    };
    const onMove = (event: PointerEvent) => {
      const box = root.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width - 0.5;
      const py = (event.clientY - box.top) / box.height - 0.5;
      target = { x: px * 260 + 120, y: py * 200 - 60, s: 1.12 };
      run();
    };
    const onLeave = () => {
      target = { x: 0, y: 0, s: 1 };
      run();
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      stop?.();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="lab-cover" data-phase={phase}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="NJ HOMES home page">
        <defs>
          <GooFilter
            id={`${id}-goo`}
            blur={22}
            sharpness={20}
            cut={8}
            region={{ x: -400, y: -400, width: W + 800, height: H + 800 }}
          />
          <clipPath id={`${id}-clip`}>
            <rect width={W} height={H} rx="30" />
          </clipPath>
          <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={-200} y={-200} width={W + 400} height={H + 400}>
            <g filter={`url(#${id}-goo)`} fill="#ffffff">
              {CELLS.map((cell, index) => (
                <circle
                  key={index}
                  className="lab-cover-cell"
                  cx={cell.cx}
                  cy={cell.cy}
                  r={360}
                  style={{
                    // Each blob grows from its own centre. Set in user units: Firefox ignores
                    // `transform-box: fill-box` inside a mask and would grow them all from the corner.
                    transformOrigin: `${cell.cx}px ${cell.cy}px`,
                    transitionDelay: `${Math.round(cell.delay * 520)}ms`,
                  }}
                />
              ))}
            </g>
          </mask>
        </defs>
        <g filter={`url(#${id}-goo)`} fill="#3366FF">
          <g ref={blobRef} className="lab-cover-blob">
            <circle cx="150" cy="1020" r="260" />
            <circle cx="420" cy="1190" r="150" />
            <circle cx="10" cy="800" r="120" />
          </g>
        </g>
        <image
          href={njHomes.src}
          width={W}
          height={H}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${id}-clip)`}
          mask={phase === "done" ? undefined : `url(#${id}-mask)`}
        />
      </svg>
    </div>
  );
}
