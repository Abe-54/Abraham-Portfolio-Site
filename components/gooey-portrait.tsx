"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import portrait from "@/public/abraham_professional.jpg";
import MetaBalls from "./MetaBalls";

/** The photo with liquid metaballs (React Bits) orbiting behind it and reaching for the pointer. */
export default function GooeyPortrait() {
  const [still, setStill] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(query.matches);
    sync();
    query.addEventListener("change", sync);
    // The goo holds still while the day/night sweep crosses the page.
    const onSweep = (event: Event) => setHeld((event as CustomEvent<boolean>).detail);
    window.addEventListener("theme-sweep", onSweep);
    // The goo tracks pointer moves only. After a scroll the pointer is over a different part of
    // the page without having moved, so tell the goo where it is now.
    let last: { x: number; y: number } | null = null;
    const onMove = (event: PointerEvent) => {
      if (event.isTrusted && event.pointerType === "mouse") last = { x: event.clientX, y: event.clientY };
    };
    // A finger that has lifted, or a mouse that has left the window, is nowhere.
    const forget = () => {
      last = null;
    };
    const forgetTouch = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") forget();
    };
    const onScroll = () => {
      if (last) window.dispatchEvent(new PointerEvent("pointermove", { clientX: last.x, clientY: last.y }));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerup", forgetTouch);
    window.addEventListener("pointercancel", forget);
    document.documentElement.addEventListener("pointerleave", forget);
    return () => {
      query.removeEventListener("change", sync);
      window.removeEventListener("theme-sweep", onSweep);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerup", forgetTouch);
      window.removeEventListener("pointercancel", forget);
      document.documentElement.removeEventListener("pointerleave", forget);
    };
  }, []);

  return (
    <div className="portrait">
      <div className="portrait-goo" aria-hidden="true">
        {!still && (
          <MetaBalls
            color="#3366FF"
            cursorBallColor="#3366FF"
            enableTransparency
            paused={held}
            ballCount={40}
            clumpFactor={0.95}
            cursorBallSize={1.8}
            animationSize={38}
            speed={0.3}
            hoverSmoothness={0.08}
            gooeyness={0.7}
            stickiness={0.45}
            stretch={0.6}
            wobble={0.55}
          />
        )}
      </div>
      <div className="portrait-mask">
        <Image
          src={portrait}
          alt="Abraham Rubio smiling in a light blue shirt in front of a brick wall"
          fill
          priority
          placeholder="blur"
          sizes="(min-width: 1024px) 280px, 190px"
          className="object-cover object-[50%_22%]"
        />
      </div>
    </div>
  );
}
