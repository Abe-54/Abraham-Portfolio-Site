"use client";

import { useRef } from "react";
import MetaBalls from "@/components/MetaBalls";
import { useInView, useReducedMotion } from "./goo";

/*
 * The page ends where the goo settles: a slow lava pool in the night half of the footer, the same
 * metaballs as the portrait, rising and sinking in lanes. It sleeps whenever it is off screen.
 */
export function GooPool({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, "100px");
  const reduced = useReducedMotion();

  return (
    <div ref={ref} data-tone="night" className="lab-pool">
      <div className="lab-pool-goo" aria-hidden="true">
        {reduced ? (
          <div className="lab-pool-still" />
        ) : (
          <MetaBalls
            color="#3366FF"
            cursorBallColor="#3366FF"
            enableTransparency
            enableMouseInteraction={false}
            clickBurst={false}
            motion="lava"
            paused={!inView}
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
        )}
      </div>
      <div className="lab-pool-content">{children}</div>
    </div>
  );
}
