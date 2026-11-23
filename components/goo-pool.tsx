"use client";

import { useEffect, useRef, useState } from "react";
import MetaBalls from "./MetaBalls";

/*
 * The page ends where the goo settles: a slow lava pool under the footer's night half, the same
 * metaballs as the portrait, rising and sinking in lanes. It keeps clear of the words (styles/goo.css).
 *
 * It starts only once the footer comes near, so it costs nothing while the page loads, and it sleeps
 * whenever it is off screen or the day/night sweep is crossing the page. Reduced motion gets a still
 * pool instead.
 */
export default function GooPool({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [still, setStill] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(query.matches);
    sync();
    query.addEventListener("change", sync);
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(element);
    const onSweep = (event: Event) => setHeld((event as CustomEvent<boolean>).detail);
    window.addEventListener("theme-sweep", onSweep);
    return () => {
      query.removeEventListener("change", sync);
      observer.disconnect();
      window.removeEventListener("theme-sweep", onSweep);
    };
  }, []);

  return (
    <div ref={ref} data-tone="night" className={`pool ${className ?? ""}`}>
      <div className="pool-goo" aria-hidden="true">
        {still ? (
          <div className="pool-still" />
        ) : near ? (
          <MetaBalls
            color="#3366FF"
            cursorBallColor="#3366FF"
            enableTransparency
            enableMouseInteraction={false}
            clickBurst={false}
            motion="lava"
            paused={!inView || held}
            ballCount={12}
            clumpFactor={1}
            cursorBallSize={0}
            animationSize={15}
            speed={0.18}
            gooeyness={0.75}
            stickiness={0.5}
            stretch={0.5}
            wobble={0.5}
          />
        ) : null}
      </div>
      {children}
    </div>
  );
}
