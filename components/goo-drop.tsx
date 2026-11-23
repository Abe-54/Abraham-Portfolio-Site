"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { reducedMotion } from "@/lib/goo";

type State = "rest" | "armed" | "fall" | "rise";

/**
 * The full stop at the end of a heading, as a drop of the goo. Each time the heading comes into view the
 * drop lands on it: scrolling down, it falls in from above and splats on the baseline; scrolling back
 * up, it does the same in reverse, coming up from below. Once the heading has left the screen entirely
 * the drop is lifted off again, ready for the next pass. Pointing at the heading makes it wobble.
 * It is a real full stop, so it stays crisp, selectable and read aloud, and it never moves for a reader
 * who prefers reduced motion.
 */
export default function Drop() {
  const ref = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<State>("rest");

  // Before paint, so a heading below the fold never shows its drop and then loses it to fall.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion() || typeof IntersectionObserver !== "function") return;
    const rect = element.getBoundingClientRect();
    let armed = rect.bottom <= 0 || rect.top >= window.innerHeight;
    // Which side of the screen the heading waits on: below it comes back scrolling down, above it
    // scrolling up.
    let below = rect.top >= window.innerHeight;
    if (armed) setState("armed");
    // Off the screen altogether: lift the drop so it can land again.
    const gone = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) return;
      armed = true;
      below = entry.boundingClientRect.top > 0;
      setState("armed");
    });
    // Well inside the screen: land, from the side the heading came back from.
    const landing = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || !armed) return;
        armed = false;
        setState(below ? "fall" : "rise");
      },
      { rootMargin: "-15% 0px -15% 0px" },
    );
    gone.observe(element);
    landing.observe(element);
    return () => {
      gone.disconnect();
      landing.disconnect();
    };
  }, []);

  return (
    <span
      ref={ref}
      className="drop"
      data-state={state}
      onAnimationEnd={(event) => {
        if (event.animationName === "drop-fall" || event.animationName === "drop-rise") setState("rest");
      }}
    >
      .
    </span>
  );
}
