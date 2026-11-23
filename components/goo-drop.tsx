"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { reducedMotion } from "@/lib/goo";
import { entrancesSeen } from "./reveal-observer";

type State = "rest" | "armed" | "fall" | "done";

/**
 * The full stop at the end of a heading, as a drop of the goo. The first time the heading scrolls into
 * view the drop falls in, splats on the baseline and settles; pointing at the heading makes it wobble.
 * It is a real full stop, so it stays crisp, selectable and read aloud. Like the other entrances it
 * plays once per page per visit, and never for a heading that is already on screen.
 */
export default function Drop() {
  const ref = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<State>("rest");

  // Before paint, so the drop never shows at rest and then vanishes to fall.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion() || typeof IntersectionObserver !== "function") return;
    if (entrancesSeen(window.location.pathname)) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    setState("armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("fall");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className="drop"
      data-state={state}
      onAnimationEnd={(event) => {
        if (event.animationName === "drop-fall") setState("done");
      }}
    >
      .
    </span>
  );
}
