"use client";

import { useEffect, useRef } from "react";
import { animate, reducedMotion, spring, step, type Feel, type Spring } from "@/lib/goo";
import { surfaceBelow, type Surface } from "@/lib/rain";

/*
 * Night is the other liquid. Put this inside a full-width night band marked .liquid.
 *
 * Its bottom edge drips. Each drip slowly fills and swells, pinches at the neck, lets go of a drop and
 * springs back up to start again, every few seconds on its own clock, so the band rains whether or not
 * the page moves. They hang unevenly, bunched in places and far apart in others, different on every
 * band. The drips are thick, like syrup: they sway on their own and stretch, then settle without
 * bouncing. Scrolling tugs at them but never tears a drop off. A mouse pointer that comes near draws
 * them: they lean after it and reach down toward it, and brushing through one flicks it. A pointer on a
 * drip, or just under it, holds it: it stops filling and lets go only once the pointer moves off. A drop
 * wobbles as it falls, at a gentle pace and behind everything on the page: behind the words of the
 * sections it passes and hidden behind the next night band, until it reaches the footer (lib/rain.ts),
 * whose lava it becomes (components/goo-pool.tsx).
 *
 * Its top edge sloshes as the page scrolls.
 *
 * Both edges reach into the day bands next door. In night theme those are the same black, so the liquid
 * shows as the blue goo instead: blue drips and drops hanging from a thin rim along the band's bottom
 * (styles/goo.css). No filter: every edge is a computed path. It runs only while an edge is near the
 * screen or a drop is still falling, and never with reduced motion, which gets the edges at rest.
 */

const SLOSH: Feel = { stiffness: 90, damping: 7 };
// The drips are thick, like syrup rather than jelly: their length, swing and the squash of the bulb
// all ease back to rest with at most a small overshoot.
const LENGTH: Feel = { stiffness: 45, damping: 9 };
const SWING: Feel = { stiffness: 20, damping: 5 };
const SQUASH: Feel = { stiffness: 200, damping: 18 };
// A falling drop rounds out from the pinch that let it go, without wobbling on the way down.
const WOBBLE: Feel = { stiffness: 260, damping: 18 };
// How a drop falls: it speeds up to a gentle top speed, goo through air rather than a stone.
const FALL_GRAVITY = 950;
const FALL_TOP = 560;
// The most drips a band has, and how close two may hang, in pixels.
const MAX_DRIPS = 8;
const DRIP_GAP = 30;
// Seconds a drip takes to fill and let go: a range, so the drips never fall in step.
const FILL: [number, number] = [3.2, 7.5];
// How far a mouse pointer draws a drip: across, and below its tip.
const REACH_X = 130;
const REACH_Y = 220;
// How far past its grown length a well-filled drip must be pulled before it lets go. Scrolling alone
// never pulls this far.
const PLUCK = 56;
// The top surface's box, where in it the surface rests, and how far apart its points are drawn.
const EDGE = 90;
const LEVEL = EDGE - 24;
const COLUMN = 10;
// Drops in the air at once: enough for the long fall to the footer.
const FALLS = 16;

const between = ([low, high]: [number, number]) => low + Math.random() * (high - low);
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const ease = (from: number, to: number, x: number) => {
  const t = clamp((x - from) / (to - from), 0, 1);
  return t * t * (3 - 2 * t);
};
const n = (value: number) => value.toFixed(1);

/** The resting meniscus, at share u of the width. */
const meniscus = (u: number) => Math.sin(u * Math.PI * 2.2 + 0.6) * 5 + Math.sin(u * Math.PI * 5.1) * 2;

/**
 * A drip hanging from the edge at x with its tip `length` down. Its bulb of radius r is swung `swing`
 * aside and squashed by `squash` (wide when positive, tall when negative); `pinch` narrows the neck as
 * it lets go. The neck leaves the edge straight down and bends over to the bulb, so a swing curves it.
 */
function dripPath(x: number, length: number, r: number, pinch: number, swing: number, squash: number) {
  const a = r * 1.9;
  const rx = r * (1 + squash);
  const ry = r * (1 - squash * 0.8);
  const l = Math.max(length, ry * 1.2 + 1);
  const bx = x + swing;
  const by = l - ry;
  const neck = rx * (1 - 0.6 * pinch);
  const back = clamp(swing * 0.45, -neck * 0.9, neck * 0.9);
  const top = by - ry * 1.3;
  return `M${n(x - a)},0 C${n(x - a * 0.4)},0 ${n(bx - neck - back)},${n(top)} ${n(bx - rx)},${n(by)} A${n(rx)},${n(ry)} 0 0 0 ${n(bx + rx)},${n(by)} C${n(bx + neck - back)},${n(top)} ${n(x + a * 0.4)},0 ${n(x + a)},0 Z`;
}

/**
 * Where a band's drips hang (share of the width), how long they hang at rest, and their bulb. Dropped
 * at random along the edge, so they bunch in places and leave gaps in others, a few more on a wide band;
 * drawn again while one stretch of the edge is left bare for more than about a third of it.
 */
function layout(width: number) {
  const count = clamp(Math.round(width / 240), 3, MAX_DRIPS - 1) + (Math.random() < 0.5 ? 1 : 0);
  const gap = DRIP_GAP / Math.max(1, width);
  const bare = Math.max(0.3, 1.6 / (count + 1));
  let spots: number[] = [];
  for (let attempt = 0; attempt < 20; attempt++) {
    spots = [];
    for (let tries = 0; spots.length < count && tries < 200; tries++) {
      const at = 0.04 + Math.random() * 0.92;
      if (spots.every((spot) => Math.abs(spot - at) >= gap)) spots.push(at);
    }
    spots.sort((a, b) => a - b);
    const ends = [0, ...spots, 1];
    if (ends.every((at, i) => i === 0 || at - ends[i - 1] <= bare)) break;
  }
  return spots.map((at) => ({ at, rest: 6 + Math.random() * 26, r: 4.5 + Math.random() * 5.5 }));
}

type Drip = ReturnType<typeof layout>[number] & {
  length: Spring;
  swing: Spring;
  squash: Spring;
  fill: number;
  period: number;
  phase: number;
};

type Fall = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  wait: number;
  floor: number;
  surface: Surface | null;
  wobble: Spring;
};

/** How long a drip hangs once it has filled this far, and its bulb. */
const grownOf = (drip: Drip) => drip.rest + drip.fill * drip.fill * (14 + drip.r * 1.6);
const bulbOf = (drip: Drip) => drip.r * (0.7 + 0.5 * drip.fill * drip.fill);

export default function NightEdges() {
  const topRef = useRef<SVGSVGElement>(null);
  const surfaceRef = useRef<SVGPathElement>(null);
  const bottomRef = useRef<SVGSVGElement>(null);
  const dripsRef = useRef<SVGGElement>(null);
  const rainRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const topSvg = topRef.current;
    const surfacePath = surfaceRef.current;
    const bottomSvg = bottomRef.current;
    const dripLayer = dripsRef.current;
    const rainSvg = rainRef.current;
    const band = topSvg?.closest<HTMLElement>(".liquid");
    if (!topSvg || !surfacePath || !bottomSvg || !dripLayer || !rainSvg || !band) return;
    const still = reducedMotion();
    const paths = Array.from(dripLayer.querySelectorAll<SVGPathElement>(".liquid-drip"));
    const fallEls = Array.from(rainSvg.querySelectorAll<SVGEllipseElement>(".liquid-fall"));
    const modes = [spring(), spring(), spring()];
    const drips: Drip[] = layout(band.clientWidth).map((drip) => ({
      ...drip,
      length: spring(drip.rest),
      swing: spring(),
      squash: spring(),
      // Each starts part-filled, so they never all fall together.
      fill: still ? 0.4 : Math.random(),
      period: between(FILL),
      phase: Math.random() * Math.PI * 2,
    }));
    const falls: Fall[] = [];
    let width = band.clientWidth;
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

    // A mouse pointer, in the window, with its speed in px/s. Fine pointers only: touch gets no hover.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, t: 0, on: false };
    // The same pointer in the drips' own space, read once a frame before anything is drawn.
    const local = { x: 0, y: 0, near: false, readAt: 0 };

    const slosh = (u: number) =>
      modes[0].value * Math.sin(u * Math.PI * 1.5 + 0.3) +
      modes[1].value * Math.sin(u * Math.PI * 3.3 + 1.1) +
      modes[2].value * Math.sin(u * Math.PI * 6.2 + 2.0) * 0.6;

    // The top surface at share u of the width: the meniscus and the scroll's slosh, kept inside its box
    // so a hard slosh never dips below the band it sits on.
    const surfaceAt = (u: number) => Math.min(EDGE - 1, Math.max(6, LEVEL + meniscus(u) + slosh(u)));

    const draw = () => {
      const w = width;
      const columns = Math.max(8, Math.min(240, Math.round(w / COLUMN) + 1));
      let d = `M0,${EDGE}`;
      for (let i = 0; i < columns; i++) {
        const u = i / (columns - 1);
        d += ` L${n(u * w)},${n(surfaceAt(u))}`;
      }
      surfacePath.setAttribute("d", `${d} L${w},${EDGE} Z`);
      // The bottom: each drip swells as it fills, and its neck narrows just before it lets go, or as it
      // is pulled long.
      drips.forEach((drip, i) => {
        const bulb = bulbOf(drip) * (1 + 0.02 * Math.sin(clock * 2.3 + drip.phase));
        const pinch = Math.max(ease(0.7, 1, drip.fill), 0.8 * ease(0, PLUCK, drip.length.value - grownOf(drip)));
        paths[i].setAttribute(
          "d",
          dripPath(drip.at * w, drip.length.value, bulb, pinch, drip.swing.value, drip.squash.value),
        );
      });
      fallEls.forEach((el, i) => {
        const fall = falls[i];
        if (!fall || fall.wait > 0) return el.setAttribute("rx", "0");
        // A falling drop stretches along its path with its speed, and wobbles from the pinch.
        const s = Math.min(1, Math.hypot(fall.vx, fall.vy) / 900);
        const wobble = fall.wobble.value;
        const angle = (-Math.atan2(fall.vx, Math.max(1, fall.vy)) * 180) / Math.PI;
        el.setAttribute("cx", n(fall.x));
        el.setAttribute("cy", n(fall.y));
        el.setAttribute("rx", (fall.r * (1 + wobble - 0.15 * s)).toFixed(2));
        el.setAttribute("ry", (fall.r * (1 - wobble * 0.8 + 0.35 * s)).toFixed(2));
        el.setAttribute("transform", `rotate(${n(angle)} ${n(fall.x)} ${n(fall.y)})`);
      });
    };

    // A drop leaves a drip: find what it will land on, measured once in the window, where scrolling
    // moves both ends together.
    const drop = (x: number, y: number, r: number, vx: number, vy: number, wait = 0) => {
      if (falls.length >= FALLS) return;
      const box = bottomSvg.getBoundingClientRect();
      const below = surfaceBelow(box.left + x, box.top + y);
      falls.push({
        x,
        y,
        vx,
        vy,
        r,
        wait,
        floor: below ? below.line - box.top : Infinity,
        surface: below?.surface ?? null,
        // Pinched off tall, it rounds out and overshoots a few times on the way down.
        wobble: { value: -0.22, velocity: 0 },
      });
    };

    const letGo = (drip: Drip) => {
      const bulb = bulbOf(drip);
      const x = drip.at * width + drip.swing.value;
      const y = drip.length.value - bulb * (1 - drip.squash.value * 0.8);
      // It leaves with the drip's own swing and a little of its stretch, never the page's scroll speed.
      drop(x, y, bulb * 0.92, drip.swing.velocity * 0.5, clamp(drip.length.velocity * 0.3, 20, 160));
      // A speck from the neck follows it down a moment later.
      drop(x - drip.swing.value * 0.3, y - bulb * 1.4, bulb * 0.3, drip.swing.velocity * 0.3, 10, 0.07);
      // The drip draws back up, a little squat and wide, and starts to fill again.
      drip.length.value = drip.rest * 0.55;
      drip.length.velocity = -40;
      drip.squash.velocity += 3;
      drip.fill = 0;
      drip.period = between(FILL);
    };

    const tick = (dt: number) => {
      clock += dt;
      // Once a frame, from real time: the scroll speed, and where the pointer is among the drips. The
      // spring steps within a frame share them, and the pointer is read before this frame draws.
      const now = performance.now();
      if (now - lastT > 4) {
        const y = window.scrollY;
        const raw = (y - lastY) / ((now - lastT) / 1000);
        lastY = y;
        lastT = now;
        speed += (raw - speed) * 0.35;
        drive += (speed - drive) * (Math.abs(speed) > Math.abs(drive) ? 0.5 : 0.07);
      }
      if (now - local.readAt > 2) {
        local.readAt = now;
        local.near = false;
        if (pointer.on && bottomOn && fine.matches) {
          const box = bottomSvg.getBoundingClientRect();
          local.x = pointer.x - box.left;
          local.y = pointer.y - box.top;
          local.near = local.y > -10 && local.y < box.height;
        }
      }
      // Without new moves the pointer is still.
      pointer.vx *= Math.exp(-dt * 8);
      pointer.vy *= Math.exp(-dt * 8);
      // The surface lags the page: scrolling tilts the slosh modes, alternating sign, and when the
      // pull lets go they swing back past rest a few times.
      const kick = clamp(drive, -2400, 2400);
      step(modes[0], kick * 0.02, SLOSH, dt);
      step(modes[1], -kick * 0.013, SLOSH, dt);
      step(modes[2], kick * 0.009, SLOSH, dt);
      for (const drip of drips) {
        const x = drip.at * width;
        const bulb = bulbOf(drip);
        // Where the pointer is from the drip. On the drip or just under it, the pointer holds it.
        const dx = local.x - (x + drip.swing.value);
        const below = local.y - drip.length.value;
        const held = local.near && Math.abs(dx) < bulb + 22 && below < bulb + 34;
        // Filling only while the drips are near the screen (the rain is for someone to see), and not
        // while held.
        if (bottomOn && !held) drip.fill = Math.min(1, drip.fill + dt / drip.period);
        const swell = drip.fill * drip.fill;
        const grown = grownOf(drip);
        // Scrolling down tugs the drips longer and scrolling up squashes them, never enough to tear.
        const tug = clamp(kick * 0.018 * (0.6 + drip.r / 10), -drip.rest * 0.5, 30);
        // A breeze of its own, so no two drips ever hang alike, stronger as it fills.
        let lean = (Math.sin(clock * 0.9 + drip.phase) * 2.6 + Math.sin(clock * 2.1 + drip.phase * 1.7) * 1.2) * (0.6 + swell);
        let reach = 0;
        if (local.near) {
          const pull = (1 - Math.min(1, Math.abs(dx) / REACH_X)) ** 1.5 * (1 - Math.min(1, Math.max(0, below) / REACH_Y));
          if (pull > 0) {
            // It leans after the pointer and, the fuller it is, reaches down toward it.
            lean += clamp(dx * 0.8, -40, 40) * pull;
            if (below > 0) reach = Math.min(100, below * 0.8) * pull * (0.5 + 0.5 * swell);
          }
          // Brushing through the bulb flicks it the way the pointer was going.
          if (Math.hypot(dx, local.y - (drip.length.value - bulb)) < bulb + 16) {
            const blend = Math.min(1, dt * 25);
            drip.swing.velocity += (clamp(pointer.vx * 0.5, -380, 380) - drip.swing.velocity) * blend;
            drip.squash.velocity += Math.min(6, Math.hypot(pointer.vx, pointer.vy) * 0.004) * blend;
          }
        }
        step(drip.swing, lean, SWING, dt);
        step(drip.length, grown + tug + reach, LENGTH, dt);
        // Stretching makes the bulb tall and narrow; springing back up makes it squat and wide.
        step(drip.squash, clamp(-drip.length.velocity / 520, -0.3, 0.3) + 0.03 * Math.sin(clock * 2.3 + drip.phase), SQUASH, dt);
        drip.squash.value = clamp(drip.squash.value, -0.4, 0.4);
        // Full, or pulled well past its length, it lets go; never while the pointer holds it.
        if (!held && (drip.fill >= 1 || (drip.length.value - grown > PLUCK && drip.fill > 0.45))) letGo(drip);
      }
      for (const fall of falls) {
        if (fall.wait > 0) {
          fall.wait -= dt;
          continue;
        }
        const drag = fall.vy > 0 ? (fall.vy / FALL_TOP) ** 2 : 0;
        fall.vy += FALL_GRAVITY * (1 - drag) * dt;
        fall.vx *= Math.exp(-dt * 1.2);
        fall.x += fall.vx * dt;
        fall.y += fall.vy * dt;
        step(fall.wobble, 0, WOBBLE, dt);
        // In once its lower half reaches the surface.
        if (fall.y + fall.r * 0.6 >= fall.floor) {
          const box = bottomSvg.getBoundingClientRect();
          fall.surface?.hit(box.left + fall.x, fall.r, fall.vy);
          fall.wait = -1;
        } else if (fall.floor === Infinity && fall.y > 2400) fall.wait = -1;
      }
      for (let i = falls.length - 1; i >= 0; i--) if (falls[i].wait === -1) falls.splice(i, 1);
      draw();
      const calm =
        Math.abs(speed) < 4 &&
        Math.abs(drive) < 4 &&
        modes.every((m) => Math.abs(m.value) < 0.05 && Math.abs(m.velocity) < 0.5) &&
        drips.every((drip) => Math.abs(drip.length.velocity) < 0.5) &&
        falls.length === 0;
      quiet = calm ? quiet + dt : 0;
      // While the drips are near the screen it keeps raining; otherwise it sleeps once all is still.
      if (!bottomOn && (quiet > 0.3 || !topOn)) {
        if (falls.length === 0) {
          stop = null;
          return false;
        }
      }
      return true;
    };

    const wake = () => {
      if (still || stop || !(topOn || bottomOn || falls.length)) return;
      lastY = window.scrollY;
      lastT = performance.now();
      speed = 0;
      drive = 0;
      quiet = 0;
      stop = animate(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const gap = (event.timeStamp - pointer.t) / 1000;
      if (pointer.on && gap > 0 && gap < 0.1) {
        pointer.vx += ((event.clientX - pointer.x) / gap - pointer.vx) * 0.4;
        pointer.vy += ((event.clientY - pointer.y) / gap - pointer.vy) * 0.4;
      } else {
        pointer.vx = 0;
        pointer.vy = 0;
      }
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.t = event.timeStamp;
      pointer.on = true;
    };
    const onOut = (event: PointerEvent) => {
      if (!event.relatedTarget) pointer.on = false;
    };

    const resize = new ResizeObserver(() => {
      width = band.clientWidth;
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
    // A new theme recolours the liquid.
    const theme = new MutationObserver(() => {
      draw();
      wake();
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("scroll", wake, { passive: true });
    if (!still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerout", onOut);
    }
    draw();
    return () => {
      stop?.();
      resize.disconnect();
      observer.disconnect();
      theme.disconnect();
      window.removeEventListener("scroll", wake);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onOut);
    };
  }, []);

  return (
    <>
      <svg ref={topRef} className="liquid-top" aria-hidden="true" preserveAspectRatio="none">
        <path ref={surfaceRef} />
      </svg>
      <svg ref={bottomRef} className="liquid-bottom" aria-hidden="true">
        <g ref={dripsRef}>
          {/* The seam where the drips meet the band; in night theme, a thin rim of goo they hang from. */}
          <rect className="liquid-seam" x="0" y="-2" width="100%" height="3" />
          <rect className="liquid-rim" x="0" y="-0.25" width="100%" height="1.5" />
          {Array.from({ length: MAX_DRIPS }, (_, index) => (
            <path key={index} className="liquid-drip" />
          ))}
        </g>
      </svg>
      {/* The falling drops, in the same place as the drips but behind everything on the page. */}
      <svg ref={rainRef} className="liquid-rain" aria-hidden="true">
        {Array.from({ length: FALLS }, (_, index) => (
          <ellipse key={index} className="liquid-fall" rx="0" ry="0" />
        ))}
      </svg>
    </>
  );
}
