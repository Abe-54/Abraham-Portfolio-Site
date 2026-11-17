"use client";

import { useEffect, useRef, useState } from "react";

const DROPLETS = [
  { cx: 40, cy: 60, r: 9 },
  { cx: 270, cy: 52, r: 7 },
  { cx: 276, cy: 176, r: 11 },
  { cx: 34, cy: 170, r: 6 },
];

export default function EmailCopy({ email }: { email: string }) {
  const [popKey, setPopKey] = useState(0);
  const hideTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.location.href = `mailto:${email}`;
      return;
    }
    setPopKey(Date.now());
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setPopKey(0), 1600);
  }

  return (
    <div className="relative self-start">
      <button type="button" onClick={copy} className="email-copy press">
        <span className="sr-only">Copy email address </span>
        {email}
      </button>
      {popKey ? (
        <svg key={popKey} className="email-pop" viewBox="0 0 300 220" aria-hidden="true">
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
      ) : null}
      <span role="status" className="sr-only">
        {popKey ? "Copied" : ""}
      </span>
    </div>
  );
}
