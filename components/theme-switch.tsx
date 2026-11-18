"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "day" | "night";

const GOO_DUMBBELL =
  "M20,6 C28,6 32,12 38,14 C41,15 43,15 46,14 C52,12 56,6 64,6 C72,6 78,12 78,20 C78,28 72,34 64,34 C56,34 52,28 46,26 C43,25 41,25 38,26 C32,28 28,34 20,34 C12,34 6,28 6,20 C6,12 12,6 20,6 Z";

const LEFT_LOBE = "inset(0 50px 0 0)";
const RIGHT_LOBE = "inset(0 0 0 50px)";

const THEME_COLOR: Record<Theme, string> = { day: "#ffffff", night: "#0b0b0c" };

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function paintBrowserChrome(theme: Theme) {
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute("content", THEME_COLOR[theme]));
}

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "night" ? "night" : "day";
}

function storeTheme(theme: Theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

function commitTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  paintBrowserChrome(theme);
}

export default function ThemeSwitch() {
  const [night, setNight] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const gooRef = useRef<SVGSVGElement>(null);
  // The theme the visitor asked for last. The page catches up to it one transition at a time.
  const themeRef = useRef<Theme>("day");
  const animateRef = useRef(true);
  const transitionRef = useRef<ViewTransition | null>(null);
  const targetRef = useRef<Theme | null>(null);
  const discRef = useRef<Animation | null>(null);
  const gooAnimationRef = useRef<Animation | null>(null);
  const toggleRef = useRef<(animate: boolean) => void>(() => {});

  useEffect(() => {
    const theme = currentTheme();
    themeRef.current = theme;
    setNight(theme === "night");
    paintBrowserChrome(theme);

    // While a view transition runs, the browser hit-tests its picture of the page, so every tap lands
    // on <html>. A tap on the switch still toggles. A tap anywhere else ends the disc at once and is
    // passed on to the link or button under it, so it is never swallowed.
    let forward = false;
    const overSwitch = (event: MouseEvent) => {
      const box = buttonRef.current?.getBoundingClientRect();
      return (
        !!box &&
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom
      );
    };
    const onRootPointerDown = (event: PointerEvent) => {
      const running = transitionRef.current;
      if (!running || event.target !== document.documentElement || overSwitch(event)) return;
      forward = true;
      animateRef.current = false;
      running.skipTransition();
    };
    const onRootClick = (event: MouseEvent) => {
      if (event.target !== document.documentElement) return;
      if (transitionRef.current && overSwitch(event)) {
        toggleRef.current(event.detail > 0 && !prefersReducedMotion());
        return;
      }
      if (!forward) return;
      forward = false;
      const control = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>("a[href], button, summary, label, input, select, textarea");
      control?.click();
    };
    document.addEventListener("pointerdown", onRootPointerDown, true);
    document.addEventListener("click", onRootClick);
    return () => {
      document.removeEventListener("pointerdown", onRootPointerDown, true);
      document.removeEventListener("click", onRootClick);
    };
  }, []);

  function moveKnob(next: Theme, animate: boolean) {
    const button = buttonRef.current;
    const goo = gooRef.current;
    gooAnimationRef.current?.cancel();
    gooAnimationRef.current = null;
    if (!button || !goo) return;
    if (!animate) {
      delete button.dataset.moving;
      return;
    }
    button.dataset.moving = "";
    const lobes = next === "night" ? [LEFT_LOBE, RIGHT_LOBE] : [RIGHT_LOBE, LEFT_LOBE];
    const animation = goo.animate(
      [
        { clipPath: lobes[0], opacity: 1 },
        { clipPath: "inset(0 0 0 0)", opacity: 1, offset: 0.5 },
        { clipPath: lobes[1], opacity: 1 },
      ],
      { duration: 300, easing: "cubic-bezier(0.77, 0, 0.175, 1)" },
    );
    gooAnimationRef.current = animation;
    const settle = () => {
      if (gooAnimationRef.current !== animation) return;
      gooAnimationRef.current = null;
      delete button.dataset.moving;
    };
    animation.finished.then(settle, settle);
  }

  /** Bring the page to the wanted theme. A running disc is never cut short or skipped to its end. */
  function catchUp() {
    const root = document.documentElement;
    const next = themeRef.current;
    if (transitionRef.current || currentTheme() === next) return;
    if (!animateRef.current || typeof document.startViewTransition !== "function") {
      commitTheme(next);
      return;
    }
    const growing = next === "night";
    const origin = buttonRef.current?.getBoundingClientRect();
    const x = origin ? origin.left + origin.width / 2 : window.innerWidth;
    const y = origin ? origin.top + origin.height / 2 : 0;
    root.dataset.themeShift = growing ? "grow" : "shrink";
    const transition = document.startViewTransition(() => commitTheme(next));
    transitionRef.current = transition;
    targetRef.current = next;
    transition.ready
      .then(() => {
        if (transitionRef.current !== transition) return;
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        const disc = [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`];
        discRef.current = root.animate(
          { clipPath: growing ? disc : disc.reverse() },
          {
            duration: 450,
            easing: "cubic-bezier(0.23, 1, 0.32, 1)",
            fill: "forwards",
            pseudoElement: growing ? "::view-transition-new(root)" : "::view-transition-old(root)",
          },
        );
        // The visitor already changed their mind: finish this disc quickly, then run the next one.
        if (themeRef.current !== next) discRef.current.updatePlaybackRate(3);
      })
      .catch(() => {});
    const settle = () => {
      if (transitionRef.current !== transition) return;
      transitionRef.current = null;
      targetRef.current = null;
      discRef.current?.cancel();
      discRef.current = null;
      delete root.dataset.themeShift;
      catchUp();
    };
    transition.finished.then(settle, settle);
  }

  function toggle(animate: boolean) {
    const next: Theme = themeRef.current === "night" ? "day" : "night";
    themeRef.current = next;
    animateRef.current = animate;
    setNight(next === "night");
    storeTheme(next);
    moveKnob(next, animate);
    const running = transitionRef.current;
    if (!running) {
      catchUp();
    } else if (!animate) {
      // Keyboard and reduced motion switch at once, even over a running disc.
      running.skipTransition();
    } else if (targetRef.current !== next) {
      discRef.current?.updatePlaybackRate(3);
    }
  }
  toggleRef.current = toggle;

  return (
    <button
      ref={buttonRef}
      type="button"
      // Keyboard presses (detail 0) and reduced motion swap at once.
      onClick={(event) => toggle(event.detail > 0 && !prefersReducedMotion())}
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
