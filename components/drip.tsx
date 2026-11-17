"use client";

import { useEffect, useState } from "react";

const DONE_KEY = "drip-done";

export default function Drip() {
  const [dripping, setDripping] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.scrollY > 0) return;
    try {
      if (sessionStorage.getItem(DONE_KEY)) return;
    } catch {}
    setDripping(true);
    const stop = () => {
      setDripping(false);
      try {
        sessionStorage.setItem(DONE_KEY, "1");
      } catch {}
    };
    window.addEventListener("scroll", stop, { once: true, passive: true });
    return () => window.removeEventListener("scroll", stop);
  }, []);

  if (!dripping) return null;

  return (
    <svg className="drip" viewBox="150 70 116 150" aria-hidden="true">
      <path
        className="drip-bulge"
        d="M150,70 C176,70 186,74 190,100 C194,128 186,150 208,152 C230,150 222,128 226,100 C230,74 240,70 266,70 Z"
      />
      <circle className="drip-drop" cx="208" cy="140" r="11" />
    </svg>
  );
}
