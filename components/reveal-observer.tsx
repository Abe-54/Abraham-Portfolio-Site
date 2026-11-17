"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const REVEAL_LINE = 0.92;

export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    let pending = Array.from(document.querySelectorAll("[data-reveal]:not([data-shown])"));
    let frame = 0;

    const reveal = () => {
      frame = 0;
      const line = window.innerHeight * REVEAL_LINE;
      pending = pending.filter((element) => {
        if (element.getBoundingClientRect().top > line) return true;
        element.setAttribute("data-shown", "");
        return false;
      });
      if (!pending.length) window.removeEventListener("scroll", schedule);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(reveal);
    };

    reveal();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  return null;
}
