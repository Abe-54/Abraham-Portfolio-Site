"use client";

import { useEffect, useRef, useState } from "react";

const DROPLETS = [
  { cx: 40, cy: 60, r: 9 },
  { cx: 270, cy: 52, r: 7 },
  { cx: 276, cy: 176, r: 11 },
  { cx: 34, cy: 170, r: 6 },
];

const HOLD = 1360;
const FADE = 240;

// "in" pops the tick, "out" fades it while it stays in place, "idle" resets it unseen.
type Phase = "idle" | "in" | "out";

export default function EmailCopy({ email, label }: { email: string; label?: string }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.location.href = `mailto:${email}`;
      return;
    }
    // A repeat copy keeps the pop where it is and only restarts the hold.
    timers.current.forEach((timer) => window.clearTimeout(timer));
    setPhase("in");
    timers.current = [
      window.setTimeout(() => setPhase("out"), HOLD),
      window.setTimeout(() => setPhase("idle"), HOLD + FADE),
    ];
  }

  return (
    <div className={label ? "relative" : "relative self-start"}>
      <button type="button" onClick={copy} className={label ? "btn btn-solid press" : "email-copy press"}>
        {label ? (
          <>
            {label}
            <span className="sr-only"> (copy address)</span>
          </>
        ) : (
          <>
            <span className="sr-only">Copy email address </span>
            {email}
          </>
        )}
      </button>
      <svg
        data-phase={phase}
        className={label ? "email-pop email-pop-over" : "email-pop"}
        viewBox="0 0 300 220"
        aria-hidden="true"
      >
        <g className="email-pop-blob">
          <path
            d="M152,34 C208,30 250,72 246,124 C242,176 200,208 146,204 C96,200 60,162 64,112 C68,68 104,38 152,34 Z"
            fill="#3366FF"
          />
          <circle cx="154" cy="120" r="50" fill="#FFFFFF" />
          <path
            d="M130,121 L147,138 L180,102"
            fill="none"
            stroke="#3366FF"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        {DROPLETS.map((drop) => (
          <circle
            key={drop.cx}
            className="email-pop-drop"
            cx={drop.cx}
            cy={drop.cy}
            r={drop.r}
            fill="#3366FF"
            style={
              {
                "--from-x": `${(154 - drop.cx) * 0.7}px`,
                "--from-y": `${(120 - drop.cy) * 0.7}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </svg>
      <span role="status" className="sr-only">
        {phase === "idle" ? "" : "Copied"}
      </span>
    </div>
  );
}
