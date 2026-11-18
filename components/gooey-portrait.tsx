"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import portrait from "@/public/abraham_professional.jpg";

const REACH = 240;
const MAX_PULL = 28;
const STIFFNESS = 200;
const DAMPING = 21;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function GooeyPortrait() {
  const rootRef = useRef<HTMLDivElement>(null);
  const gooRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    const goo = gooRef.current;
    if (!root || !goo || prefersReducedMotion()) return;

    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let targetX = 0;
    let targetY = 0;
    let frame = 0;
    let last = 0;

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      vx += (STIFFNESS * (targetX - x) - DAMPING * vx) * dt;
      vy += (STIFFNESS * (targetY - y) - DAMPING * vy) * dt;
      x += vx * dt;
      y += vy * dt;
      goo.style.transform = `translate(${x}px, ${y}px)`;
      const settled = Math.abs(targetX - x) + Math.abs(targetY - y) + Math.abs(vx) + Math.abs(vy) < 0.05;
      frame = settled ? 0 : requestAnimationFrame(step);
    };

    const follow = (event: PointerEvent) => {
      const box = root.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      const distance = Math.hypot(dx, dy);
      const pull = distance > box.width / 2 + REACH ? 0 : Math.min(distance * 0.12, MAX_PULL) / (distance || 1);
      targetX = dx * pull;
      targetY = dy * pull;
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(step);
      }
    };
    window.addEventListener("pointermove", follow, { passive: true });
    return () => {
      window.removeEventListener("pointermove", follow);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="portrait">
      <svg ref={gooRef} className="portrait-goo" viewBox="0 0 380 380" aria-hidden="true">
        <g className="goo-breathe">
          <path
            d="M196,22 C262,16 330,52 352,118 C372,176 362,236 334,286 C304,338 246,366 186,360 C126,354 70,326 44,272 C20,222 22,160 48,110 C76,58 130,28 196,22 Z"
            fill="#3366FF"
          />
          <circle cx="352" cy="318" r="13" fill="#3366FF" />
          <circle cx="372" cy="350" r="6" fill="#3366FF" />
        </g>
      </svg>
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
