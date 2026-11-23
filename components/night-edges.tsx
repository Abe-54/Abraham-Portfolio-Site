"use client";

import { useEffect, useRef } from "react";
import { animate, reducedMotion, spring, step, type Feel } from "@/lib/goo";

/*
 * Night is the other liquid. Put this inside a full-width night band marked .liquid: its top edge
 * becomes a surface that sloshes as the page scrolls, and its bottom edge hangs a few drips that stretch
 * with the scroll and spring back when it stops. A hard flick lets a drip go of a bead.
 *
 * Both edges reach into the day bands next door, so they only show while those are day: in night theme
 * the neighbours are the same black and the edges stay hidden and asleep. No filter: every edge is a
 * computed path, and nothing runs while the band is off screen or the page is still.
 */

const SLOSH: Feel = { stiffness: 90, damping: 7 };
const STRETCH: Feel = { stiffness: 140, damping: 11 };
// Where the drips hang (share of the width), how long they rest, and their bulb.
const DRIPS = [
  { at: 0.11, rest: 10, r: 6 },
  { at: 0.27, rest: 22, r: 8 },
  { at: 0.52, rest: 8, r: 5 },
  { at: 0.69, rest: 30, r: 10 },
  { at: 0.88, rest: 16, r: 7 },
];
// The top surface's box; the surface rests a little below its middle.
const EDGE = 90;

function dripPath(x: number, length: number, r: number) {
  const a = r * 1.9;
  const l = Math.max(length, r * 1.2);
  return `M${x - a},0 C${x - a * 0.4},0 ${x - r},${l - r * 2.4} ${x - r},${l - r} A${r},${r} 0 0 0 ${x + r},${l - r} C${x + r},${l - r * 2.4} ${x + a * 0.4},0 ${x + a},0 Z`;
}

export default function NightEdges() {
  const topRef = useRef<SVGPathElement>(null);
  const dripsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const top = topRef.current;
    const drips = dripsRef.current;
    const band = top?.closest<HTMLElement>(".liquid");
    if (!top || !drips || !band) return;
    const still = reducedMotion();
    const paths = Array.from(drips.querySelectorAll<SVGPathElement>("path"));
    const beads = Array.from(drips.querySelectorAll<SVGCircleElement>("circle"));
    const modes = [spring(), spring(), spring()];
    const lengths = DRIPS.map((d) => spring(d.rest));
    const falling = DRIPS.map(() => ({ y: 0, v: 0, on: false }));
    let width = band.clientWidth;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let speed = 0;
    // The scroll speed the liquid feels: it catches up fast and lets go slowly, so a quick flick keeps
    // pulling for a moment after the page stops, like a weight that has to settle.
    let drive = 0;
    let stop: (() => void) | null = null;
    let visible = false;
    let quiet = 0;

    const draw = () => {
      const w = width;
      const n = 48;
      let d = `M0,${EDGE}`;
      for (let i = 0; i <= n; i++) {
        const x = (i / n) * w;
        const u = x / Math.max(1, w);
        // A resting meniscus, plus three slosh modes the scroll kicks.
        const rest = Math.sin(u * Math.PI * 2.2 + 0.6) * 5 + Math.sin(u * Math.PI * 5.1) * 2;
        const slosh =
          modes[0].value * Math.sin(u * Math.PI * 1.5 + 0.3) +
          modes[1].value * Math.sin(u * Math.PI * 3.3 + 1.1) +
          modes[2].value * Math.sin(u * Math.PI * 6.2 + 2.0) * 0.6;
        // Kept inside its box, so a hard slosh never dips below the band it sits on.
        const y = Math.min(EDGE - 2, Math.max(8, EDGE - 22 + rest + slosh));
        d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
      }
      top.setAttribute("d", `${d} L${w},${EDGE} Z`);
      DRIPS.forEach((drip, index) => {
        paths[index].setAttribute("d", dripPath(drip.at * w, lengths[index].value, drip.r));
        const bead = falling[index];
        beads[index].setAttribute("cx", (drip.at * w).toFixed(1));
        beads[index].setAttribute("cy", bead.y.toFixed(1));
        beads[index].setAttribute("r", bead.on ? String(drip.r * 0.8) : "0");
      });
    };

    const tick = (dt: number) => {
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
      DRIPS.forEach((drip, index) => {
        // Scrolling down drags the drips long; scrolling up squashes them.
        const pull = Math.max(-drip.rest * 0.6, Math.min(90, kick * 0.035 * (0.6 + drip.r / 10)));
        step(lengths[index], drip.rest + pull, STRETCH, dt);
        const bead = falling[index];
        if (!bead.on && lengths[index].value > drip.rest + 38) {
          bead.on = true;
          bead.y = lengths[index].value;
          bead.v = Math.max(80, lengths[index].velocity);
          lengths[index].value = drip.rest * 0.5;
          lengths[index].velocity = 0;
        }
        if (bead.on) {
          bead.v += 1400 * dt;
          bead.y += bead.v * dt;
          if (bead.y > 220) bead.on = false;
        }
      });
      draw();
      const calm =
        Math.abs(speed) < 4 &&
        Math.abs(drive) < 4 &&
        modes.every((m) => Math.abs(m.value) < 0.05 && Math.abs(m.velocity) < 0.5) &&
        lengths.every((l, i) => Math.abs(l.value - DRIPS[i].rest) < 0.1 && Math.abs(l.velocity) < 0.5) &&
        falling.every((b) => !b.on);
      quiet = calm ? quiet + dt : 0;
      if (quiet > 0.3 || !visible) {
        stop = null;
        return false;
      }
      return true;
    };

    const wake = () => {
      if (still || !visible || stop || document.documentElement.dataset.theme === "night") return;
      lastY = window.scrollY;
      lastT = performance.now();
      speed = 0;
      drive = 0;
      quiet = 0;
      stop = animate(tick);
    };

    const resize = new ResizeObserver(() => {
      width = band.clientWidth;
      draw();
    });
    resize.observe(band);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) wake();
      },
      // Both edges reach past the band, so wake a little before it arrives.
      { rootMargin: "260px 0px" },
    );
    observer.observe(band);
    window.addEventListener("scroll", wake, { passive: true });
    draw();
    return () => {
      stop?.();
      resize.disconnect();
      observer.disconnect();
      window.removeEventListener("scroll", wake);
    };
  }, []);

  return (
    <>
      <svg className="liquid-top" aria-hidden="true" preserveAspectRatio="none">
        <path ref={topRef} />
      </svg>
      <svg className="liquid-bottom" aria-hidden="true">
        <g ref={dripsRef}>
          <rect x="0" y="-2" width="100%" height="3" />
          {DRIPS.map((_, index) => (
            <path key={index} />
          ))}
          {DRIPS.map((_, index) => (
            <circle key={index} r="0" />
          ))}
        </g>
      </svg>
    </>
  );
}
