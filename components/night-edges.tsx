"use client";

import { useEffect, useRef } from "react";
import { animate, reducedMotion, spring, step, type Feel } from "@/lib/goo";
import { GRAVITY, Puddle, addSurface, surfaceBelow, type Surface } from "@/lib/rain";

/*
 * Night is the other liquid. Put this inside a full-width night band marked .liquid.
 *
 * Its bottom edge drips. Each drip slowly fills and swells, pinches at the neck, lets go of a drop and
 * snaps back to start again, every few seconds on its own clock, so the band rains whether or not the
 * page moves. Scrolling drags the drips long, and a hard flick tears a drop off early. A drop falls until
 * it reaches the next liquid surface below (lib/rain.ts): the top of the next night band, or the footer.
 *
 * Its top edge is such a surface. It sloshes as the page scrolls, and takes the drops from the band
 * above like a puddle takes rain.
 *
 * Both edges reach into the day bands next door, so they only show while those are day: in night theme
 * the neighbours are the same black and the edges stay hidden and asleep. No filter: every edge is a
 * computed path. It runs only while an edge is near the screen or a drop is still falling, and never
 * with reduced motion, which gets the edges at rest.
 */

const SLOSH: Feel = { stiffness: 90, damping: 7 };
const STRETCH: Feel = { stiffness: 140, damping: 11 };
// Where the drips hang (share of the width), how long they hang at rest, and their bulb.
const DRIPS = [
  { at: 0.11, rest: 10, r: 6 },
  { at: 0.27, rest: 22, r: 8 },
  { at: 0.52, rest: 8, r: 5 },
  { at: 0.69, rest: 30, r: 10 },
  { at: 0.88, rest: 16, r: 7 },
];
// Seconds a drip takes to fill and let go: a range, so the drips never fall in step.
const FILL: [number, number] = [3.2, 7.5];
// The top surface's box, and where in it the surface rests.
const EDGE = 90;
const LEVEL = EDGE - 24;
// Drops and beads drawn at once.
const FALLS = 12;
const BEADS = 9;

const between = ([low, high]: [number, number]) => low + Math.random() * (high - low);
const ease = (from: number, to: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - from) / (to - from)));
  return t * t * (3 - 2 * t);
};

/** The resting meniscus, at share u of the width. */
const meniscus = (u: number) => Math.sin(u * Math.PI * 2.2 + 0.6) * 5 + Math.sin(u * Math.PI * 5.1) * 2;

/** A drip hanging `length` from the edge with a bulb of radius r; `pinch` narrows its neck as it lets go. */
function dripPath(x: number, length: number, r: number, pinch: number) {
  const a = r * 1.9;
  const l = Math.max(length, r * 1.2);
  const neck = r * (1 - 0.6 * pinch);
  return `M${x - a},0 C${x - a * 0.4},0 ${x - neck},${l - r * 2.3} ${x - r},${l - r} A${r},${r} 0 0 0 ${x + r},${l - r} C${x + neck},${l - r * 2.3} ${x + a * 0.4},0 ${x + a},0 Z`;
}

type Fall = { x: number; y: number; vy: number; r: number; wait: number; floor: number; surface: Surface | null };

export default function NightEdges() {
  const topRef = useRef<SVGSVGElement>(null);
  const surfaceRef = useRef<SVGPathElement>(null);
  const bottomRef = useRef<SVGSVGElement>(null);
  const dripsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const topSvg = topRef.current;
    const surfacePath = surfaceRef.current;
    const bottomSvg = bottomRef.current;
    const dripLayer = dripsRef.current;
    const band = topSvg?.closest<HTMLElement>(".liquid");
    if (!topSvg || !surfacePath || !bottomSvg || !dripLayer || !band) return;
    const still = reducedMotion();
    const paths = Array.from(dripLayer.querySelectorAll<SVGPathElement>(".liquid-drip"));
    const fallEls = Array.from(dripLayer.querySelectorAll<SVGEllipseElement>(".liquid-fall"));
    const beadEls = Array.from(topSvg.querySelectorAll<SVGCircleElement>(".liquid-bead"));
    const modes = [spring(), spring(), spring()];
    const drips = DRIPS.map((drip) => ({
      ...drip,
      length: spring(drip.rest),
      // Each starts part-filled, so they never all fall together.
      fill: still ? 0.4 : Math.random(),
      period: between(FILL),
      phase: Math.random() * Math.PI * 2,
    }));
    const falls: Fall[] = [];
    const puddle = new Puddle();
    let width = band.clientWidth;
    puddle.resize(width);
    let clock = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let speed = 0;
    // The scroll speed the liquid feels: it catches up fast and lets go slowly, so a quick flick keeps
    // pulling for a moment after the page stops, like a weight that has to settle.
    let drive = 0;
    let stop: (() => void) | null = null;
    let topOn = false;
    let bottomOn = false;
    let quiet = 0;
    const night = () => document.documentElement.dataset.theme === "night";

    const slosh = (u: number) =>
      modes[0].value * Math.sin(u * Math.PI * 1.5 + 0.3) +
      modes[1].value * Math.sin(u * Math.PI * 3.3 + 1.1) +
      modes[2].value * Math.sin(u * Math.PI * 6.2 + 2.0) * 0.6;

    const draw = () => {
      const w = width;
      // The top: the meniscus, the scroll's slosh, and the rings of any drop that went in.
      let d = `M0,${EDGE}`;
      for (let i = 0; i < puddle.h.length; i++) {
        const x = Math.min(w, i * puddle.dx);
        const u = x / Math.max(1, w);
        // Kept inside its box, so a hard slosh never dips below the band it sits on.
        const y = Math.min(EDGE - 1, Math.max(6, LEVEL + meniscus(u) + slosh(u) + puddle.h[i]));
        d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
      }
      surfacePath.setAttribute("d", `${d} L${w},${EDGE} Z`);
      beadEls.forEach((el, i) => {
        const bead = puddle.beads[i];
        if (!bead || bead.wait > 0) return el.setAttribute("r", "0");
        const u = bead.x / Math.max(1, w);
        el.setAttribute("cx", bead.x.toFixed(1));
        el.setAttribute("cy", (LEVEL + meniscus(u) + slosh(u) + bead.y).toFixed(1));
        el.setAttribute("r", bead.r.toFixed(2));
      });
      // The bottom: each drip swells as it fills and its neck narrows just before it lets go.
      drips.forEach((drip, i) => {
        const swell = drip.fill * drip.fill;
        const bulb = drip.r * (0.7 + 0.5 * swell) * (1 + 0.04 * Math.sin(clock * 2.3 + drip.phase));
        const sway = Math.sin(clock * 1.3 + drip.phase) * (0.4 + swell);
        paths[i].setAttribute("d", dripPath(drip.at * w + sway, drip.length.value, bulb, ease(0.7, 1, drip.fill)));
      });
      fallEls.forEach((el, i) => {
        const fall = falls[i];
        if (!fall || fall.wait > 0) return el.setAttribute("rx", "0");
        // A falling drop stretches with its speed.
        const s = Math.min(1, fall.vy / 1200);
        el.setAttribute("cx", fall.x.toFixed(1));
        el.setAttribute("cy", fall.y.toFixed(1));
        el.setAttribute("rx", (fall.r * (1 - 0.2 * s)).toFixed(2));
        el.setAttribute("ry", (fall.r * (1 + 0.45 * s)).toFixed(2));
      });
    };

    // A drop leaves a drip: find what it will land on, measured once in the window, where scrolling
    // moves both ends together.
    const release = (x: number, y: number, r: number, vy: number, wait = 0) => {
      if (falls.length >= FALLS) return;
      const box = bottomSvg.getBoundingClientRect();
      const below = surfaceBelow(box.left + x, box.top + y);
      falls.push({ x, y, vy, r, wait, floor: below ? below.line - box.top : Infinity, surface: below?.surface ?? null });
    };

    const tick = (dt: number) => {
      if (night()) {
        falls.length = 0;
        puddle.beads.length = 0;
        stop = null;
        return false;
      }
      clock += dt;
      // Scroll speed once per frame from real time; the spring steps within a frame share it.
      const now = performance.now();
      if (now - lastT > 4) {
        const y = window.scrollY;
        const raw = (y - lastY) / ((now - lastT) / 1000);
        lastY = y;
        lastT = now;
        speed += (raw - speed) * 0.35;
        drive += (speed - drive) * (Math.abs(speed) > Math.abs(drive) ? 0.5 : 0.07);
      }
      // The surface lags the page: scrolling tilts the slosh modes, alternating sign, and when the
      // pull lets go they swing back past rest a few times.
      const kick = Math.max(-2400, Math.min(2400, drive));
      step(modes[0], kick * 0.02, SLOSH, dt);
      step(modes[1], -kick * 0.013, SLOSH, dt);
      step(modes[2], kick * 0.009, SLOSH, dt);
      for (const drip of drips) {
        // Filling only while the drips are near the screen; the rain is for someone to see.
        if (bottomOn) drip.fill = Math.min(1, drip.fill + dt / drip.period);
        const swell = drip.fill * drip.fill;
        const grown = drip.rest + swell * (14 + drip.r * 1.6);
        // Scrolling down drags the drips long; scrolling up squashes them.
        const pull = Math.max(-drip.rest * 0.6, Math.min(90, kick * 0.035 * (0.6 + drip.r / 10)));
        step(drip.length, grown + pull, STRETCH, dt);
        if (drip.fill >= 1 || drip.length.value - grown > 34) {
          const bulb = drip.r * (0.7 + 0.5 * swell);
          const x = drip.at * width + Math.sin(clock * 1.3 + drip.phase) * (0.4 + swell);
          release(x, drip.length.value - bulb, bulb * 0.92, Math.max(40, drip.length.velocity * 0.6));
          // A speck from the neck follows it down a moment later.
          release(x, drip.length.value - bulb * 2.3, bulb * 0.3, 20, 0.06);
          // The drip snaps back up and wobbles, then starts to fill again.
          drip.length.value = drip.rest * 0.5;
          drip.length.velocity = -60;
          drip.fill = 0;
          drip.period = between(FILL);
        }
      }
      for (const fall of falls) {
        if (fall.wait > 0) {
          fall.wait -= dt;
          continue;
        }
        fall.vy += GRAVITY * dt;
        fall.y += fall.vy * dt;
        // In once its lower half reaches the surface.
        if (fall.y + fall.r * 0.6 >= fall.floor) {
          const box = bottomSvg.getBoundingClientRect();
          fall.surface?.hit(box.left + fall.x, fall.r, fall.vy);
          fall.wait = -1;
        } else if (fall.floor === Infinity && fall.y > 2400) fall.wait = -1;
      }
      for (let i = falls.length - 1; i >= 0; i--) if (falls[i].wait === -1) falls.splice(i, 1);
      puddle.step(dt);
      draw();
      const calm =
        Math.abs(speed) < 4 &&
        Math.abs(drive) < 4 &&
        modes.every((m) => Math.abs(m.value) < 0.05 && Math.abs(m.velocity) < 0.5) &&
        drips.every((drip) => Math.abs(drip.length.velocity) < 0.5) &&
        falls.length === 0 &&
        puddle.calm;
      quiet = calm ? quiet + dt : 0;
      // While the drips are near the screen it keeps raining; otherwise it sleeps once all is still.
      if (!bottomOn && (quiet > 0.3 || !topOn)) {
        if (falls.length === 0 && puddle.calm) {
          stop = null;
          return false;
        }
      }
      return true;
    };

    const wake = () => {
      if (still || stop || night() || !(topOn || bottomOn || falls.length || !puddle.calm)) return;
      lastY = window.scrollY;
      lastT = performance.now();
      speed = 0;
      drive = 0;
      quiet = 0;
      stop = animate(tick);
    };

    // The top edge takes the drops from the band above.
    const removeSurface = still
      ? () => {}
      : addSurface({
          lineAt: (x) => {
            const box = band.getBoundingClientRect();
            if (x < box.left || x > box.right) return null;
            return box.top + 1 - EDGE + LEVEL + meniscus((x - box.left) / Math.max(1, box.width));
          },
          hit: (x, r, fallSpeed) => {
            if (night()) return;
            puddle.hit(x - band.getBoundingClientRect().left, r, fallSpeed);
            wake();
          },
        });

    const resize = new ResizeObserver(() => {
      width = band.clientWidth;
      puddle.resize(width);
      draw();
    });
    resize.observe(band);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === topSvg) topOn = entry.isIntersecting;
          else bottomOn = entry.isIntersecting;
        }
        wake();
      },
      // Both edges reach past the band, so wake a little before they arrive.
      { rootMargin: "200px 0px" },
    );
    observer.observe(topSvg);
    observer.observe(bottomSvg);
    // Back from night theme: start again.
    const theme = new MutationObserver(wake);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("scroll", wake, { passive: true });
    draw();
    return () => {
      stop?.();
      removeSurface();
      resize.disconnect();
      observer.disconnect();
      theme.disconnect();
      window.removeEventListener("scroll", wake);
    };
  }, []);

  return (
    <>
      <svg ref={topRef} className="liquid-top" aria-hidden="true" preserveAspectRatio="none">
        <path ref={surfaceRef} />
        {Array.from({ length: BEADS }, (_, index) => (
          <circle key={index} className="liquid-bead" r="0" />
        ))}
      </svg>
      <svg ref={bottomRef} className="liquid-bottom" aria-hidden="true">
        <g ref={dripsRef}>
          <rect x="0" y="-2" width="100%" height="3" />
          {DRIPS.map((_, index) => (
            <path key={index} className="liquid-drip" />
          ))}
          {Array.from({ length: FALLS }, (_, index) => (
            <ellipse key={index} className="liquid-fall" rx="0" ry="0" />
          ))}
        </g>
      </svg>
    </>
  );
}
