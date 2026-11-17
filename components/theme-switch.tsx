"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "day" | "night";

const GOO_DUMBBELL =
  "M20,6 C28,6 32,12 38,14 C41,15 43,15 46,14 C52,12 56,6 64,6 C72,6 78,12 78,20 C78,28 72,34 64,34 C56,34 52,28 46,26 C43,25 41,25 38,26 C32,28 28,34 20,34 C12,34 6,28 6,20 C6,12 12,6 20,6 Z";

const LEFT_LOBE = "inset(0 50px 0 0)";
const RIGHT_LOBE = "inset(0 0 0 50px)";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function applyTheme(next: Theme, origin: { x: number; y: number }, reduce: boolean) {
  const root = document.documentElement;
  const commit = () => {
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };
  if (reduce || typeof document.startViewTransition !== "function") {
    commit();
    return;
  }
  const growing = next === "night";
  root.dataset.themeShift = growing ? "grow" : "shrink";
  const transition = document.startViewTransition(commit);
  transition.ready.then(() => {
    const radius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    );
    const disc = [
      `circle(0px at ${origin.x}px ${origin.y}px)`,
      `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
    ];
    root.animate(
      { clipPath: growing ? disc : disc.reverse() },
      {
        duration: 450,
        easing: "cubic-bezier(0.23, 1, 0.32, 1)",
        fill: "forwards",
        pseudoElement: growing ? "::view-transition-new(root)" : "::view-transition-old(root)",
      },
    );
  });
  transition.finished.finally(() => delete root.dataset.themeShift);
}

export default function ThemeSwitch() {
  const [night, setNight] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const gooRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setNight(document.documentElement.dataset.theme === "night");
  }, []);

  function toggle() {
    const next: Theme = document.documentElement.dataset.theme === "night" ? "day" : "night";
    const button = buttonRef.current;
    const goo = gooRef.current;
    if (!button || !goo) return;
    const reduce = prefersReducedMotion();
    const box = button.getBoundingClientRect();
    setNight(next === "night");

    if (!reduce) {
      button.dataset.moving = "";
      const lobes = next === "night" ? [LEFT_LOBE, RIGHT_LOBE] : [RIGHT_LOBE, LEFT_LOBE];
      goo
        .animate(
          [
            { clipPath: lobes[0], opacity: 1 },
            { clipPath: "inset(0 0 0 0)", opacity: 1, offset: 0.5 },
            { clipPath: lobes[1], opacity: 1 },
          ],
          { duration: 300, easing: "cubic-bezier(0.77, 0, 0.175, 1)" },
        )
        .finished.finally(() => delete button.dataset.moving);
    }

    applyTheme(next, { x: box.left + box.width / 2, y: box.top + box.height / 2 }, reduce);
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      aria-pressed={night}
      aria-label="Night mode"
      className="goo-switch press"
    >
      <svg viewBox="0 0 84 40" aria-hidden="true">
        <rect className="gs-track" x="1" y="1" width="82" height="38" rx="19" strokeWidth="1.5" />
        <circle className="gs-blob gs-blob-day" cx="20" cy="20" r="14" />
        <circle className="gs-blob gs-blob-night" cx="64" cy="20" r="14" />
      </svg>
      <svg ref={gooRef} className="gs-goo" viewBox="0 0 84 40" aria-hidden="true">
        <path d={GOO_DUMBBELL} />
      </svg>
      <svg viewBox="0 0 84 40" aria-hidden="true">
        <circle className="gs-sun" cx="20" cy="20" r="8" />
        <path className="gs-moon" d="M65,13 A7,7 0 1 0 71,25 A6,6 0 0 1 65,13 Z" />
      </svg>
    </button>
  );
}
