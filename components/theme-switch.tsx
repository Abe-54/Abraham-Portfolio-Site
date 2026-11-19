"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "day" | "night";

// The knob travels 44px between the sun and the moon.
const TRAVEL = 44;
const SWAP_MS = 560;
// The knob lands on the far icon this far into the swap. The page sweep starts on that beat.
const IMPACT = 0.72;
const SEGMENT_EASE = "cubic-bezier(0.45, 0, 0.55, 1)";

function at(x: number, scaleX = 1, scaleY = 1) {
  return `translateX(${x.toFixed(2)}px) scale(${scaleX}, ${scaleY})`;
}

/**
 * Squash and stretch for the swap. The knob leans back, stretches as it travels, overshoots,
 * squashes on landing and settles. Two smaller blobs leave late and catch up, and the goo filter
 * on the group melts them into a tail that snaps back into the knob.
 */
function swapFrames(from: number, to: number): Keyframe[][] {
  const d = to - from;
  const knob: Keyframe[] = [
    { transform: at(from), offset: 0 },
    { transform: at(from - 0.06 * d, 0.88, 1.1), offset: 0.14 },
    { transform: at(from + 0.55 * d, 1.4, 0.74), offset: 0.5 },
    { transform: at(to + 0.07 * d, 0.84, 1.14), offset: 0.72 },
    { transform: at(to - 0.02 * d, 1.06, 0.95), offset: 0.86 },
    { transform: at(to), offset: 1 },
  ];
  const tail: Keyframe[] = [
    { transform: at(from), offset: 0 },
    { transform: at(from), offset: 0.22 },
    { transform: at(from + 0.3 * d, 1.25, 0.8), offset: 0.55 },
    { transform: at(to, 0.8, 0.8), offset: 0.84 },
    { transform: at(to, 0.6, 0.6), offset: 1 },
  ];
  const drop: Keyframe[] = [
    { transform: at(from), offset: 0 },
    { transform: at(from), offset: 0.36 },
    { transform: at(from + 0.45 * d, 1.2, 0.85), offset: 0.7 },
    { transform: at(to, 0.7, 0.7), offset: 0.94 },
    { transform: at(to, 0.6, 0.6), offset: 1 },
  ];
  return [knob, tail, drop].map((frames) => frames.map((frame) => ({ ...frame, easing: SEGMENT_EASE })));
}

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
  const root = document.documentElement;
  // Hover colour transitions must not fade the swap; colours change with the theme in one step.
  root.dataset.themeSwap = "";
  root.dataset.theme = theme;
  void document.body.offsetWidth;
  delete root.dataset.themeSwap;
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
  const gooAnimationsRef = useRef<Animation[]>([]);
  const litTimerRef = useRef(0);
  // When the knob lands (performance.now() time). The sweep waits for it.
  const impactAtRef = useRef(0);
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
      // A copy of the click, not .click(), so Ctrl, Cmd or Shift still open a link in a new tab or window.
      const { detail, screenX, screenY, clientX, clientY, ctrlKey, shiftKey, altKey, metaKey, button, buttons } = event;
      control?.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          composed: true,
          view: window,
          detail,
          screenX,
          screenY,
          clientX,
          clientY,
          ctrlKey,
          shiftKey,
          altKey,
          metaKey,
          button,
          buttons,
        }),
      );
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
    if (!button || !goo) return;
    const blobs = Array.from(goo.querySelectorAll<SVGCircleElement>(".gs-move"));
    // Start from wherever the knob is now, so a change of mind mid-swap never jumps.
    const from = blobs[0] ? new DOMMatrix(getComputedStyle(blobs[0]).transform).m41 : 0;
    const to = next === "night" ? TRAVEL : 0;
    gooAnimationsRef.current.forEach((animation) => animation.cancel());
    gooAnimationsRef.current = [];
    window.clearTimeout(litTimerRef.current);
    button.dataset.knob = next;
    if (!animate || Math.abs(to - from) < 1) {
      button.dataset.lit = next;
      button.dataset.face = next;
      impactAtRef.current = performance.now();
      return;
    }
    // The icon being left dims at once. On landing, the icon reached lights up and the switch
    // takes the new theme's colours, on the same beat as the page sweep starting.
    button.dataset.lit = "";
    button.dataset.face ??= next === "night" ? "day" : "night";
    impactAtRef.current = performance.now() + SWAP_MS * IMPACT;
    litTimerRef.current = window.setTimeout(() => {
      button.dataset.lit = next;
      button.dataset.face = next;
    }, SWAP_MS * IMPACT);
    gooAnimationsRef.current = swapFrames(from, to).map((frames, index) =>
      blobs[index].animate(frames, { duration: SWAP_MS, easing: "linear" }),
    );
  }

  /** Bring the page to the wanted theme. A running disc is never cut short or skipped to its end. */
  function catchUp() {
    const root = document.documentElement;
    const next = themeRef.current;
    if (transitionRef.current || currentTheme() === next) return;
    if (!animateRef.current) {
      commitTheme(next);
      return;
    }
    const wait = () => Math.max(0, impactAtRef.current - performance.now());
    if (typeof document.startViewTransition !== "function") {
      // No sweep in this browser: the page still changes as the knob lands.
      window.setTimeout(() => commitTheme(themeRef.current), wait());
      return;
    }
    // The new theme grows out of the knob from where it lands.
    const box = buttonRef.current?.getBoundingClientRect();
    const x = box ? box.left + (box.width * (next === "night" ? 64 : 20)) / 84 : window.innerWidth;
    const y = box ? box.top + box.height / 2 : 0;
    const transition = document.startViewTransition(() => commitTheme(next));
    transitionRef.current = transition;
    targetRef.current = next;
    transition.ready
      .then(() => {
        if (transitionRef.current !== transition) return;
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        discRef.current = root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          {
            // Held shut until the knob lands, then it opens.
            delay: wait(),
            duration: 520,
            easing: "cubic-bezier(0.23, 1, 0.32, 1)",
            fill: "both",
            pseudoElement: "::view-transition-new(root)",
          },
        );
        // The visitor already changed their mind: finish this sweep quickly, then run the next one.
        if (themeRef.current !== next) discRef.current.updatePlaybackRate(3);
      })
      .catch(() => {});
    const settle = () => {
      if (transitionRef.current !== transition) return;
      transitionRef.current = null;
      targetRef.current = null;
      discRef.current?.cancel();
      discRef.current = null;
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
      </svg>
      <svg ref={gooRef} className="gs-goo" viewBox="0 0 84 40" aria-hidden="true">
        <defs>
          <filter id="gs-goo-filter" filterUnits="userSpaceOnUse" x="-12" y="-12" width="108" height="64">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
          </filter>
        </defs>
        <g filter="url(#gs-goo-filter)">
          <circle className="gs-move" cx="20" cy="20" r="14" />
          <circle className="gs-move" cx="20" cy="20" r="10" />
          <circle className="gs-move" cx="20" cy="20" r="6" />
        </g>
      </svg>
      <svg viewBox="0 0 84 40" aria-hidden="true">
        {/* Lucide "sun" and "moon", 14px, centred on each end of the track. */}
        <svg className="gs-icon gs-sun" x="13" y="13" width="14" height="14" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
        <svg className="gs-icon gs-moon" x="57" y="13" width="14" height="14" viewBox="0 0 24 24">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </svg>
    </button>
  );
}
