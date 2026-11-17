import type { CSSProperties } from "react";
import type { DrawnCoverId } from "@/lib/content";

const VIEW_BOX = "40 0 720 420";

function NjHomes() {
  return (
    <svg viewBox={VIEW_BOX} className="drawn-cover" aria-hidden="true">
      <rect x="170" y="186" width="190" height="140" rx="22" fill="#FFFFFF" />
      <path d="M150,202 L265,102 L380,202 Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="28" strokeLinejoin="round" />
      <path d="M242,326 L242,273 A23,23 0 0 1 288,273 L288,326 Z" fill="#3366FF" />
      <path
        d="M392,292 C450,322 494,316 528,282"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="3 20"
      />
      <ellipse className="pin-shadow" cx="580" cy="340" rx="30" ry="8" fill="#FFFFFF" opacity="0.4" />
      <g className="pin-bob">
        <path
          d="M580,320 C544,276 506,242 506,186 C506,144 540,110 580,110 C620,110 654,144 654,186 C654,242 616,276 580,320 Z"
          fill="#FFFFFF"
        />
        <circle cx="580" cy="186" r="34" fill="#3366FF" />
        <circle cx="580" cy="186" r="13" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

const PACKETS = [
  { delay: "0s", path: "top" },
  { delay: "0.6s", path: "middle" },
  { delay: "1.2s", path: "bottom" },
];

function DcAi() {
  return (
    <svg viewBox={VIEW_BOX} className="drawn-cover" aria-hidden="true">
      <g fill="none" stroke="#FFFFFF" strokeWidth="22" strokeLinecap="round">
        <path d="M160,110 C310,110 340,180 440,195" />
        <path d="M160,210 L440,210" />
        <path d="M160,310 C310,310 340,240 440,225" />
      </g>
      {PACKETS.map((packet, index) => (
        <circle
          key={packet.path}
          className={`dcai-packet dcai-packet-${packet.path}`}
          cx="160"
          cy={110 + index * 100}
          r="22"
          fill="#FFFFFF"
          style={{ animationDelay: packet.delay }}
        />
      ))}
      <circle cx="160" cy="110" r="38" fill="#FFFFFF" />
      <circle cx="160" cy="210" r="38" fill="#FFFFFF" />
      <circle cx="160" cy="310" r="38" fill="#FFFFFF" />
      <path
        d="M536,88 C612,82 668,142 664,212 C660,290 600,342 524,336 C450,332 398,276 404,204 C408,138 462,92 536,88 Z"
        fill="#FFFFFF"
      />
      <circle cx="534" cy="212" r="46" fill="#3366FF" />
      <circle cx="534" cy="212" r="17" fill="#FFFFFF" />
    </svg>
  );
}

const ORBITERS = [
  { r: 20, delay: "-5.73s" },
  { r: 26, delay: "-2.47s" },
];

function ClimateGame() {
  return (
    <svg viewBox={VIEW_BOX} className="drawn-cover" aria-hidden="true">
      <ellipse
        cx="384"
        cy="212"
        rx="300"
        ry="96"
        fill="none"
        stroke="#7C9CFF"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="3 20"
      />
      <path
        d="M388,84 C466,78 520,140 516,212 C512,290 452,344 376,338 C302,334 250,276 256,204 C260,138 314,90 388,84 Z"
        fill="#3366FF"
      />
      <circle cx="386" cy="212" r="46" fill="#FFFFFF" />
      <circle cx="386" cy="212" r="17" fill="#3366FF" />
      {ORBITERS.map((orbiter) => (
        <g key={orbiter.r} className="orbit-x" style={{ "--orbit-delay": orbiter.delay } as CSSProperties}>
          <g className="orbit-y">
            <circle cx="384" cy="212" r={orbiter.r} fill="#3366FF" />
          </g>
        </g>
      ))}
    </svg>
  );
}

export const drawnCovers: Record<DrawnCoverId, { background: string; Art: () => React.JSX.Element }> = {
  "nj-homes": { background: "#3366FF", Art: NjHomes },
  "dc-ai": { background: "#3366FF", Art: DcAi },
  "climate-game": { background: "var(--slot)", Art: ClimateGame },
};
