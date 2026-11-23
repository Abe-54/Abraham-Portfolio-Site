"use client";

import { useEffect, useRef, useState } from "react";
import { clearInk, paintPoolInk } from "./goo-ink";
import MetaBalls from "./MetaBalls";

/*
 * The page ends where the goo settles: a slow lava pool behind the whole footer, both halves, the same
 * metaballs as the portrait rising and sinking in lanes. One blob follows the pointer anywhere in the
 * footer; let go, it drifts on with the lava from wherever it was left instead of going home. The lava
 * flows behind the words, and where it passes under them they are drawn again in white
 * (components/goo-ink.tsx), so every line stays readable on the blue. Soft walls keep every blob whole:
 * nothing is cut by an edge.
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
    return () => {
      motion.removeEventListener("change", sync);
      width.removeEventListener("change", sync);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("theme-sweep", onSweep);
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
          cursorBallColor="#3366FF"
          enableTransparency
          clickBurst={false}
          motion="lava"
          area={area}
          cursorRoams
          paused={!inView || held}
          ballCount={BALLS[size]}
          clumpFactor={1}
          cursorBallSize={1.5}
          hoverSmoothness={0.07}
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
