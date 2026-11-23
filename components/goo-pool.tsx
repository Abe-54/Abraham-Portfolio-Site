"use client";

import { useEffect, useRef, useState } from "react";
import type { Rain } from "./footer-puddle";
import { clearInk, paintPoolInk } from "./goo-ink";
import MetaBalls, { type Pour } from "./MetaBalls";

/*
 * The page ends where the rain settles: a slow lava pool behind the whole footer, both halves, the same
 * metaballs as the portrait rising and sinking in lanes, and made of the rain. It starts part-full. Each
 * drop that falls into the footer (components/footer-puddle.tsx) comes through the edge where it landed
 * and falls on down into the goo, slowing as it goes, turning from the colour it fell in to the goo's
 * blue. While the pool is not yet full, it stays as a new blob and swells to full size; after that it
 * pours into the first blob it meets, which swells for a moment.
 *
 * No blob of its own follows the pointer: the blob nearest it reaches toward it, and goes back to its
 * place in the lava once another is nearer. The lava flows behind the words, and where it passes under them
 * they are drawn again in white (components/goo-ink.tsx), so every line stays readable on the blue. Soft
 * walls keep every blob whole: nothing is cut by an edge, except a drop the moment it comes through.
 *
 * Put it first inside the footer, which must isolate. It starts only once the footer comes near, so it
 * costs nothing while the page loads, and it sleeps whenever it is off screen or the day/night sweep is
 * crossing the page. Reduced motion draws nothing here: the night half shows a still blob instead
 * (styles/goo.css).
 */

const WIDE = "(min-width: 1024px)";
// Pixels per unit of the goo's world, so the blobs keep their size whatever the footer's height.
const SCALE = { wide: 13, narrow: 11 };
// Enough blobs to spread over both halves: side by side on a wide screen, stacked on a phone.
const BALLS = { wide: 18, narrow: 15 };
// How many of them are there before it rains.
const BASE = { wide: 8, narrow: 7 };
// Smaller than any drop a drip lets go of and larger than the speck that follows it down
// (components/night-edges.tsx): a speck only ever joins a blob.
const SPECK = 3.65;
// The colour the rain falls in: the night bands' ground in the day theme (app/globals.css), the goo's
// own blue at night.
const DROP = { day: "#0b0b0c", night: "#3366FF" };
// Room kept between the lava and the footer's edges, in pixels.
const EDGE = 14;

type Area = { left: number; right: number; top: number; bottom: number };

/** The footer less a thin margin, as shares of its size: where the lava keeps to. */
function measureArea(pool: HTMLElement): Area {
  const x = EDGE / Math.max(1, pool.clientWidth);
  const y = EDGE / Math.max(1, pool.clientHeight);
  return { left: x, right: 1 - x, top: y, bottom: 1 - y };
}

export default function GooPool() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [still, setStill] = useState(false);
  const [held, setHeld] = useState(false);
  const [wide, setWide] = useState(false);
  const [height, setHeight] = useState(300);
  const [area, setArea] = useState<Area | null>(null);
  const [night, setNight] = useState(false);
  // Drops that fell into the footer before the lava started: it starts with a blob for each.
  const [caught, setCaught] = useState(0);
  const pourRef = useRef<Pour | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const width = window.matchMedia(WIDE);
    const fit = () => {
      setHeight(Math.max(1, element.clientHeight));
      setArea(measureArea(element));
    };
    const sync = () => {
      setStill(motion.matches);
      setWide(width.matches);
      fit();
    };
    sync();
    motion.addEventListener("change", sync);
    width.addEventListener("change", sync);
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(element);
    const resize = new ResizeObserver(fit);
    resize.observe(element);
    const onSweep = (event: Event) => setHeld((event as CustomEvent<boolean>).detail);
    window.addEventListener("theme-sweep", onSweep);
    const footer = element.closest("footer");
    const onRain = (event: Event) => {
      const { x, y, r, speed } = (event as CustomEvent<Rain>).detail;
      const join = r < SPECK;
      if (pourRef.current) pourRef.current(x, y, r, speed, join);
      else if (!join) setCaught((count) => count + 1);
    };
    footer?.addEventListener("goo-rain", onRain);
    const readTheme = () => setNight(document.documentElement.dataset.theme === "night");
    readTheme();
    const theme = new MutationObserver(readTheme);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      motion.removeEventListener("change", sync);
      width.removeEventListener("change", sync);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("theme-sweep", onSweep);
      footer?.removeEventListener("goo-rain", onRain);
      theme.disconnect();
    };
  }, []);

  // Without the goo, the white copies of the words it covered must go too.
  useEffect(() => () => clearInk("pool"), [still]);

  const size = wide ? "wide" : "narrow";
  return (
    <div ref={ref} className="pool-goo" aria-hidden="true">
      {!still && near && area ? (
        <MetaBalls
          color="#3366FF"
          enableTransparency
          clickBurst={false}
          motion="lava"
          area={area}
          pointerReach
          paused={!inView || held}
          ballCount={BALLS[size]}
          fill={Math.min(BALLS[size], BASE[size] + caught)}
          pourRef={pourRef}
          dropColor={night ? DROP.night : DROP.day}
          clumpFactor={1}
          animationSize={height / SCALE[size]}
          speed={0.18}
          gooeyness={0.75}
          stickiness={0.5}
          stretch={0.5}
          wobble={0.5}
          onDraw={paintPoolInk}
        />
      ) : null}
    </div>
  );
}
