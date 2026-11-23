"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * The full stop at the end of a heading, as a drop of the goo: it falls in when the heading first comes
 * into view, splats on the baseline and settles. A real glyph, so it stays crisp and selectable.
 */
export function Drop() {
  const ref = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<"rest" | "armed" | "fall" | "done">("rest");

  // Before paint, so a replayed drop never flashes at rest first.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setState("armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("fall");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className="drop"
      data-state={state}
      onAnimationEnd={(event) => {
        if (event.animationName === "drop-fall") setState("done");
      }}
    >
      .
    </span>
  );
}

export function DropHeadingDemo() {
  const [round, setRound] = useState(0);
  return (
    <div className="lab-pair">
      <div data-tone="day" className="lab-panel">
        <h3 key={`a${round}`} className="t-section drop-heading">
          Things I figured out<Drop />
        </h3>
      </div>
      <div data-tone="night" className="lab-panel">
        <h3 key={`b${round}`} className="t-section drop-heading">
          How I got here<Drop />
        </h3>
      </div>
      <button type="button" className="lab-replay press" onClick={() => setRound((r) => r + 1)}>
        Replay
      </button>
    </div>
  );
}
