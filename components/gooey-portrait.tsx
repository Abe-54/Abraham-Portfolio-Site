"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import portrait from "@/public/abraham_professional.jpg";

// Everything below is in the SVG's own units (viewBox 380). The photo is a circle of radius ~157
// centred on (CX, CY); the goo is a ring of blobs just outside it.
const CX = 179;
const CY = 177;
const VIEW = 380;

const LOBE_REST = 118; // lobe centre at rest, hidden inside the ring
const LOBE_MAX_STRETCH = 85;
const SNAP_OUT = 340; // pointer farther than this from the centre: the goo lets go
const SNAP_IN = 300; // pointer closer than this: the goo grabs on again
const STIFFNESS = 170;
const DAMPING = 14; // under-damped on purpose, so the goo overshoots and settles

const DROPLETS = [
  { radius: 13, speed: 620, spread: 0 },
  { radius: 9, speed: 500, spread: 0.26 },
  { radius: 6, speed: 400, spread: -0.34 },
];
const DROPLET_PULL = 2.5;
const DROPLET_DRAG = 1.6;
const ABSORB_AT = 160;

/** A closed, wobbly loop around the origin: mean radius `radius`, `bumps` soft lobes of height `amplitude`. */
function blobPath(radius: number, amplitude: number, bumps: number, phase: number) {
  const count = 24;
  const points = Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const r = radius + amplitude * Math.sin(bumps * angle + phase) + amplitude * 0.4 * Math.sin((bumps + 1) * angle - phase);
    return [r * Math.cos(angle), r * Math.sin(angle)];
  });
  const at = (index: number) => points[(index + count) % count];
  let d = `M${at(0)[0].toFixed(1)},${at(0)[1].toFixed(1)}`;
  for (let index = 0; index < count; index += 1) {
    const [p0, p1, p2, p3] = [at(index - 1), at(index), at(index + 1), at(index + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

// Three loops turning at different speeds. Where they overlap changes all the time, so the rim
// flows around the whole photo.
const RING = [blobPath(170, 9, 3, 0.4), blobPath(168, 11, 4, 2.1), blobPath(171, 8, 5, 4.0)];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function GooeyPortrait() {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const ringRef = useRef<SVGGElement>(null);
  const lobeRef = useRef<SVGCircleElement>(null);
  const dropRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    const ring = ringRef.current;
    const lobe = lobeRef.current;
    if (!root || !svg || !ring || !lobe) return;

    // The ring only turns while the hero is on screen.
    const visibility = new IntersectionObserver(([entry]) => {
      root.toggleAttribute("data-paused", !entry.isIntersecting);
    });
    visibility.observe(root);

    if (prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return () => visibility.disconnect();
    }

    // Lobe: a spring towards a point on the pointer's side of the ring.
    let x = 0;
    let y = -LOBE_REST;
    let vx = 0;
    let vy = 0;
    let dirX = 0;
    let dirY = -1;
    let stretch = 0;
    let engaged = false;
    // Recoil: the whole ring flinches when the goo lets go, then settles.
    let recoil = 0;
    let recoilV = 0;
    const drops = DROPLETS.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, age: 0, live: false }));
    let frame = 0;
    let last = 0;

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      const reach = LOBE_REST + stretch;
      vx += (STIFFNESS * (dirX * reach - x) - DAMPING * vx) * dt;
      vy += (STIFFNESS * (dirY * reach - y) - DAMPING * vy) * dt;
      x += vx * dt;
      y += vy * dt;
      // Stretch along the way out, squash across it.
      const out = Math.max(0, Math.hypot(x, y) - LOBE_REST) / LOBE_MAX_STRETCH;
      const angle = Math.atan2(y, x);
      lobe.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${angle.toFixed(3)}rad) scale(${(1 + 0.3 * out).toFixed(3)}, ${(1 - 0.12 * out).toFixed(3)})`;

      recoilV += (-140 * recoil - 11 * recoilV) * dt;
      recoil += recoilV * dt;
      ring.style.transform = `scale(${(1 + 0.03 * recoil).toFixed(4)})`;

      let dropsLive = false;
      drops.forEach((drop, index) => {
        const node = dropRefs.current[index];
        if (!node || !drop.live) return;
        drop.age += dt;
        drop.vx += (-DROPLET_PULL * drop.x - DROPLET_DRAG * drop.vx) * dt;
        drop.vy += (-DROPLET_PULL * drop.y - DROPLET_DRAG * drop.vy) * dt;
        drop.x += drop.vx * dt;
        drop.y += drop.vy * dt;
        const distance = Math.hypot(drop.x, drop.y);
        const inward = drop.x * drop.vx + drop.y * drop.vy < 0;
        if ((inward && distance < ABSORB_AT) || drop.age > 3) {
          drop.live = false;
          node.style.transform = "scale(0)";
          // Swallowing a droplet nudges the ring.
          recoilV += 1.5;
          return;
        }
        dropsLive = true;
        const speed = Math.hypot(drop.vx, drop.vy);
        const heading = Math.atan2(drop.vy, drop.vx);
        node.style.transform = `translate(${drop.x.toFixed(2)}px, ${drop.y.toFixed(2)}px) rotate(${heading.toFixed(3)}rad) scale(${(1 + speed / 1400).toFixed(3)}, ${(1 - speed / 2600).toFixed(3)})`;
      });

      const moving =
        Math.abs(dirX * reach - x) + Math.abs(dirY * reach - y) + Math.abs(vx) + Math.abs(vy) > 0.05 ||
        Math.abs(recoil) + Math.abs(recoilV) > 0.002;
      frame = moving || dropsLive ? requestAnimationFrame(step) : 0;
    };

    const wake = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };

    // The pointer went too far: the stretched goo snaps, throws droplets the way it was pulled,
    // and springs back.
    const letGo = () => {
      if (!engaged) return;
      engaged = false;
      const tipX = x + dirX * 30;
      const tipY = y + dirY * 30;
      DROPLETS.forEach((droplet, index) => {
        const cos = Math.cos(droplet.spread);
        const sin = Math.sin(droplet.spread);
        const drop = drops[index];
        drop.x = tipX;
        drop.y = tipY;
        drop.vx = (dirX * cos - dirY * sin) * droplet.speed;
        drop.vy = (dirX * sin + dirY * cos) * droplet.speed;
        drop.age = 0;
        drop.live = true;
      });
      stretch = 0;
      recoilV = -9;
      wake();
    };

    const follow = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = svg.getBoundingClientRect();
      const unit = VIEW / box.width;
      const dx = (event.clientX - box.left) * unit - CX;
      const dy = (event.clientY - box.top) * unit - CY;
      const distance = Math.hypot(dx, dy);
      if (distance > SNAP_OUT) {
        letGo();
        return;
      }
      if (!engaged && distance > SNAP_IN) return;
      engaged = true;
      if (distance > 1) {
        dirX = dx / distance;
        dirY = dy / distance;
      }
      stretch = Math.min(Math.max((distance - 110) * 0.42, 0), LOBE_MAX_STRETCH);
      wake();
    };

    window.addEventListener("pointermove", follow, { passive: true });
    document.documentElement.addEventListener("pointerleave", letGo);
    return () => {
      visibility.disconnect();
      window.removeEventListener("pointermove", follow);
      document.documentElement.removeEventListener("pointerleave", letGo);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="portrait">
      <svg ref={svgRef} className="portrait-goo" viewBox={`0 0 ${VIEW} ${VIEW}`} aria-hidden="true">
        <defs>
          <filter id="portrait-goo-filter" filterUnits="userSpaceOnUse" x="-420" y="-420" width="840" height="840">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
          </filter>
        </defs>
        <g transform={`translate(${CX} ${CY})`}>
          <g className="portrait-goo-melt" fill="#3366FF">
            <g ref={ringRef} className="portrait-goo-part">
              {RING.map((d, index) => (
                <path key={d} className={`portrait-goo-part goo-turn goo-turn-${index + 1}`} d={d} />
              ))}
            </g>
            <circle ref={lobeRef} className="portrait-goo-part goo-lobe" r="46" />
            {DROPLETS.map((droplet, index) => (
              <circle
                key={droplet.radius}
                ref={(node) => {
                  dropRefs.current[index] = node;
                }}
                className="portrait-goo-part goo-droplet"
                r={droplet.radius}
              />
            ))}
          </g>
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
