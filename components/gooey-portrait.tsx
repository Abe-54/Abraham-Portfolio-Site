"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import portrait from "@/public/abraham_professional.jpg";
import MetaBalls from "./MetaBalls";

/** The photo with liquid metaballs (React Bits) orbiting behind it and reaching for the pointer. */
export default function GooeyPortrait() {
  const [still, setStill] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    <div className="portrait">
      <div className="portrait-goo" aria-hidden="true">
        {!still && (
          <MetaBalls
            color="#3366FF"
            cursorBallColor="#3366FF"
            enableTransparency
            ballCount={30}
            clumpFactor={1.02}
            cursorBallSize={1.8}
            animationSize={30}
            speed={0.3}
            hoverSmoothness={0.08}
            gooeyness={0.62}
            stickiness={0.65}
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
