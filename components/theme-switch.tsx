"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "day" | "night";

// The knob travels 44px between the sun and the moon.
const TRAVEL = 44;
const SWAP_MS = 560;
// How long the page takes to fade to the new theme once the knob has landed.
const FADE_MS = 480;
// The knob lands on the far icon this far into the swap. The page sweep starts on that beat.
const IMPACT = 0.72;
const SEGMENT_EASE = "cubic-bezier(0.45, 0, 0.55, 1)";
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

function at(x: number, scaleX = 1, scaleY = 1) {
  return `translateX(${x.toFixed(2)}px) scale(${scaleX}, ${scaleY})`;
}

/**
 * Squash and stretch for the swap. The knob leans back, stretches as it travels, overshoots,
 * squashes on landing and settles. Two smaller blobs leave late and catch up, and the goo filter
 * on the group melts them into a tail that snaps back into the knob.
 */
function swapFrames(from: number, to: number, fromRest: boolean): Keyframe[][] {
  const d = to - from;
  const knob: Keyframe[] = [
    { transform: at(from), offset: 0 },
    // The lean-back only plays from rest. A knob turned round mid-travel just goes.
    { transform: fromRest ? at(from - 0.06 * d, 0.88, 1.1) : at(from + 0.1 * d, 1.1, 0.94), offset: 0.14 },
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
  // The theme the visitor asked for last.
  const themeRef = useRef<Theme>("day");
  const transitionRef = useRef<ViewTransition | null>(null);
  const discRef = useRef<Animation | null>(null);
  const gooAnimationsRef = useRef<Animation[]>([]);
  // The frame loop that waits for the knob to land.
  const landingRef = useRef(0);
  // A click on the switch during the sweep. It plays once the sweep ends.
  const queuedRef = useRef(false);
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
      running.skipTransition();
    };
    const onRootClick = (event: MouseEvent) => {
      if (event.target !== document.documentElement) return;
      if (transitionRef.current && overSwitch(event)) {
        toggleRef.current(!prefersReducedMotion());
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
      cancelAnimationFrame(landingRef.current);
    };
  }, []);

  /**
   * The knob has landed: change the page. The new theme fades in over the old one, switch
   * included, so everything changes together.
   */
  function sweep(next: Theme, animate: boolean) {
    const root = document.documentElement;
    const button = buttonRef.current;
    const commit = () => {
      commitTheme(next);
      if (button) button.dataset.lit = next;
    };
    if (!animate || currentTheme() === next || typeof document.startViewTransition !== "function") {
      commit();
      return;
    }
    // Anything that redraws every frame (the portrait goo) holds still for the sweep, so the
    // browser is not re-capturing the page on each frame of it.
    window.dispatchEvent(new CustomEvent("theme-sweep", { detail: true }));
    const transition = document.startViewTransition(commit);
    transitionRef.current = transition;
    // Scrolling ends the sweep at once, so the page is never shown at two scroll positions.
    const endOnScroll = (event: Event) => {
      if (event instanceof KeyboardEvent) {
        if (!SCROLL_KEYS.has(event.key)) return;
        // Space on a focused button presses it; it does not scroll.
        if (event.key === " " && event.target instanceof HTMLElement && event.target.closest("button, a, input, textarea, select")) return;
      }
      transition.skipTransition();
    };
    const scrollEvents = ["wheel", "touchmove", "keydown"] as const;
    scrollEvents.forEach((type) => window.addEventListener(type, endOnScroll, { passive: true }));
    transition.ready
      .then(() => {
        if (transitionRef.current !== transition) return;
        // The whole page fades to the new theme together. A hard-edged shape crossing the screen
        // made the header and the bands under the hero flip one after another, which read as
        // separate parts flashing, because the hero itself looks the same in both themes.
        discRef.current = root.animate(
          { opacity: [0, 1] },
          {
            duration: FADE_MS,
            easing: "cubic-bezier(0.45, 0, 0.55, 1)",
            fill: "both",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});
    const settle = () => {
      scrollEvents.forEach((type) => window.removeEventListener(type, endOnScroll));
      if (transitionRef.current !== transition) return;
      transitionRef.current = null;
      window.dispatchEvent(new CustomEvent("theme-sweep", { detail: false }));
      discRef.current?.cancel();
      discRef.current = null;
      if (queuedRef.current) {
        queuedRef.current = false;
        toggle(!prefersReducedMotion());
      }
    };
    transition.finished.then(settle, settle);
  }

  /** Move the knob. With motion, the page changes when the knob lands; without, at once. */
  function moveKnob(next: Theme, animate: boolean) {
    const button = buttonRef.current;
    const goo = gooRef.current;
    cancelAnimationFrame(landingRef.current);
    landingRef.current = 0;
    if (!button || !goo) {
      commitTheme(next);
      return;
    }
    const blobs = Array.from(goo.querySelectorAll<SVGCircleElement>(".gs-move"));
    // Start from wherever the knob is now, so a change of mind mid-swap never jumps.
    const from = blobs[0] ? new DOMMatrix(getComputedStyle(blobs[0]).transform).m41 : 0;
    const to = next === "night" ? TRAVEL : 0;
    gooAnimationsRef.current.forEach((animation) => animation.cancel());
    gooAnimationsRef.current = [];
    button.dataset.knob = next;
    if (!animate || Math.abs(to - from) < 1) {
      sweep(next, animate);
      return;
    }
    const fromRest = Math.abs(Math.abs(to - from) - TRAVEL) < 1;
    const animations = swapFrames(from, to, fromRest).map((frames, index) =>
      blobs[index].animate(frames, { duration: SWAP_MS, easing: "linear" }),
    );
    gooAnimationsRef.current = animations;
    // One clock for everything: the knob animation itself. The icon it leaves dims once the knob
    // is off it, and the page changes on the frame the knob lands.
    const knob = animations[0];
    let left = false;
    const watch = () => {
      const time = Number(knob.currentTime ?? 0);
      // Only a knob that set off from rest is leaving an icon. One turned round is heading home.
      if (!left && fromRest && time >= SWAP_MS * 0.5) {
        left = true;
        button.dataset.lit = "";
      }
      if (time >= SWAP_MS * IMPACT || knob.playState === "finished") {
        landingRef.current = 0;
        sweep(next, true);
        return;
      }
      landingRef.current = requestAnimationFrame(watch);
    };
    landingRef.current = requestAnimationFrame(watch);
  }

  function toggle(animate: boolean) {
    const running = transitionRef.current;
    if (running) {
      if (animate) {
        // Mid-sweep: remember the click and play it when the sweep ends. Two clicks cancel out.
        queuedRef.current = !queuedRef.current;
        return;
      }
      queuedRef.current = false;
      running.skipTransition();
    }
    const next: Theme = themeRef.current === "night" ? "day" : "night";
    themeRef.current = next;
    setNight(next === "night");
    storeTheme(next);
    moveKnob(next, animate);
  }
  toggleRef.current = toggle;

  return (
    <button
      ref={buttonRef}
      type="button"
      // Only reduced motion swaps at once. Keyboard presses get the same motion as clicks.
      onClick={() => toggle(!prefersReducedMotion())}
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
