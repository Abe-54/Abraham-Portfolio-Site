import { useId } from "react";
import type { DrawnCoverId } from "@/lib/content";

const VIEW_BOX = "40 0 720 420";

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

const GLOBE = "M404,38 C504,34 576,116 572,214 C568,314 490,388 392,384 C294,380 224,304 228,206 C232,114 308,42 404,38 Z";

const LANDS = [
  "M222,118 C268,92 336,90 368,120 C394,146 380,182 348,198 C318,214 300,246 266,254 C236,260 216,236 220,204 Z",
  "M436,250 C478,226 542,236 574,270 C594,302 562,352 520,374 C484,392 438,374 422,340 C408,306 406,266 436,250 Z",
  "M454,102 C476,90 506,98 510,122 C514,144 490,156 468,152 C446,148 438,116 454,102 Z",
];

function ClimateGame() {
  const globeClip = useId();
  return (
    <svg viewBox={VIEW_BOX} className="drawn-cover" aria-hidden="true">
      <clipPath id={globeClip}>
        <path d={GLOBE} />
      </clipPath>
      <path d={GLOBE} fill="#3366FF" />
      <g clipPath={`url(#${globeClip})`} fill="#7C9CFF">
        {LANDS.map((land) => (
          <path key={land} d={land} />
        ))}
      </g>
      <path
        d="M318,170 C372,192 420,236 470,284"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="3 20"
      />
      <path
        d="M296,124 C314,124 312,145 320,162 C327,174 339,176 339,184 C339,191 332,193 296,193 C260,193 253,191 253,184 C253,176 265,174 272,162 C280,145 278,124 296,124 Z"
        fill="#FFFFFF"
      />
      <circle cx="296" cy="112" r="23" fill="#FFFFFF" />
      <circle cx="488" cy="300" r="34" fill="#FFFFFF" />
      <circle cx="488" cy="300" r="13" fill="#3366FF" />
    </svg>
  );
}

export const drawnCovers: Record<DrawnCoverId, { background: string; Art: () => React.JSX.Element }> = {
  "dc-ai": { background: "#3366FF", Art: DcAi },
  "climate-game": { background: "var(--slot)", Art: ClimateGame },
};
