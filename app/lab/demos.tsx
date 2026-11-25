"use client";

import { useRef } from "react";
import ClickSpark from "@/components/ClickSpark";
import PixelTransition from "@/components/PixelTransition";
import TextPressure from "@/components/TextPressure";
import TiltedCard from "@/components/TiltedCard";
import DinoRunner from "@/components/games/dino-runner";
import { Button as BitButton } from "@/components/ui/8bit/button";
import Dialogue from "@/components/ui/8bit/blocks/dialogue";
import GameOver from "@/components/ui/8bit/blocks/game-over";
import XpBar from "@/components/ui/8bit/xp-bar";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { HyperText } from "@/components/ui/hyper-text";
import { NumberTicker } from "@/components/ui/number-ticker";
import { AnimatedSpan, Terminal, TypingAnimation } from "@/components/ui/terminal";
import { coinCollectSound } from "@/lib/coin-collect";
import { playSound } from "@/lib/sound-engine";

type Cost = "none" | "motion" | "font";

function Demo({
  library,
  name,
  cost,
  where,
  children,
  wide = false,
}: {
  library: string;
  name: string;
  cost: Cost[];
  where: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <article className={`lab-card ${wide ? "md:col-span-2" : ""}`}>
      <div className="flex flex-col gap-2">
        <div className="lab-meta">
          <span className="lab-chip">{library}</span>
          {cost.map((c) => (
            <span key={c} className="lab-chip" data-cost={c}>
              {c === "none" ? "No new packages" : c === "motion" ? "Adds motion (~50 kB)" : "Adds a pixel font"}
            </span>
          ))}
        </div>
        <h3 className="t-item">{name}</h3>
        <p className="text-[15px] leading-[22px] text-muted">{where}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </article>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function ScheduleBeam() {
  const box = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const model = useRef<HTMLDivElement>(null);
  const calendar = useRef<HTMLDivElement>(null);
  const nodes = [
    { ref: photo, label: "Schedule photo", d: "M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8" },
    { ref: model, label: "Gemini", d: "M12 3c.6 4.8 4.2 8.4 9 9-4.8.6-8.4 4.2-9 9-.6-4.8-4.2-8.4-9-9 4.8-.6 8.4-4.2 9-9" },
    { ref: calendar, label: "Calendar", d: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" },
  ];
  return (
    <div ref={box} className="relative flex items-start justify-between px-2 py-6">
      {nodes.map((node) => (
        <div key={node.label} className="flex w-20 flex-col items-center gap-2 text-center">
          <div ref={node.ref} className="lab-beam-node">
            <Icon d={node.d} />
          </div>
          <span className="font-mono text-[11px] tracking-[0.06em] text-muted uppercase">{node.label}</span>
        </div>
      ))}
      <AnimatedBeam containerRef={box} fromRef={photo} toRef={model} gradientStartColor="#3366ff" gradientStopColor="#7c9cff" endYOffset={-12} startYOffset={-12} />
      <AnimatedBeam containerRef={box} fromRef={model} toRef={calendar} gradientStartColor="#3366ff" gradientStopColor="#7c9cff" endYOffset={-12} startYOffset={-12} delay={1} />
    </div>
  );
}

const stats = [
  { value: 5, suffix: "", label: "people on the Market Dash team" },
  { value: 9, suffix: "", label: "months to ship Market Dash" },
  { value: 3, suffix: "", label: "years running the games club" },
  { value: 2, suffix: "+", label: "hours a month Schedule Reader saves" },
];

export default function Demos() {
  return (
    <ClickSpark sparkColor="#3366ff" sparkCount={10} sparkRadius={22}>
      <main id="main" tabIndex={-1}>
        <section className="shell flex flex-col gap-4 pt-16 pb-10 lg:pt-24">
          <p className="t-label">Flare lab · not linked from the site</p>
          <h1 className="t-section">Component candidates</h1>
          <p className="t-lede max-w-[720px]">
            Each piece installs with the shadcn CLI and lives in this repo as source we can edit. Day holds ideas for the AI
            side, Night for the games side. Click anywhere for the spark.
          </p>
        </section>

        <section data-side="day" aria-labelledby="lab-day" className="shell flex flex-col gap-6 pb-16">
          <div className="flex flex-col gap-2 border-b-[1.5px] border-rule pb-5">
            <p className="t-label">By day</p>
            <h2 id="lab-day" className="t-item">AI software engineer</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Demo library="Magic UI" name="Hyper text" cost={["motion"]} where="Hero day title or labels: the letters scramble like a model thinking, then settle. Ships monospace and uppercase so letters keep their width. Hover replays it.">
              <HyperText className="font-display text-[44px] leading-[1] font-extrabold tracking-[-0.03em] md:text-[56px]" duration={900}>
                AI software engineer.
              </HyperText>
            </Demo>
            <Demo library="React Bits" name="Text pressure" cost={["none"]} where="A big word on the About band: each letter swells and widens under the pointer.">
              <div className="h-[150px]">
                <TextPressure text="Build" fontFamily="var(--font-wide)" fontUrl="" textColor="var(--ink)" minFontSize={48} italic={false} scale />
              </div>
            </Demo>
            <Demo library="Magic UI" name="Terminal" cost={["motion"]} where="A Schedule Reader row: the bot's flow typed out. Demo text, not a real transcript.">
              <Terminal className="max-w-none">
                <TypingAnimation>&gt; /schedule + photo</TypingAnimation>
                <AnimatedSpan className="text-muted">Reading the photo with Gemini…</AnimatedSpan>
                <AnimatedSpan className="text-link">✔ Shifts found</AnimatedSpan>
                <AnimatedSpan className="text-link">✔ Calendar updated</AnimatedSpan>
                <TypingAnimation className="text-muted">Saves me over 2 hours a month.</TypingAnimation>
              </Terminal>
            </Demo>
            <Demo library="Magic UI" name="Animated beam" cost={["motion"]} where="The same flow as a diagram: a beam runs from the photo through Gemini to the calendar.">
              <ScheduleBeam />
            </Demo>
            <Demo library="Magic UI" name="Number ticker" cost={["motion"]} where="The glance strip or History: real numbers count up when they come on screen." wide>
              <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1">
                    <dt className="order-2 text-[14px] leading-[20px] text-muted">{stat.label}</dt>
                    <dd className="font-display text-[48px] leading-none font-extrabold tracking-[-0.03em]">
                      <NumberTicker value={stat.value} className="text-ink" />
                      {stat.suffix}
                    </dd>
                  </div>
                ))}
              </dl>
            </Demo>
            <Demo library="React Bits" name="Tilted card" cost={["none"]} where="Project covers lean toward the pointer, with the caption floating above. Hover only on a mouse." wide>
              <TiltedCard
                imageSrc="/nj_homes.webp"
                altText="NJ HOMES home page"
                captionText="NJ HOMES"
                containerHeight="300px"
                imageHeight="300px"
                imageWidth="100%"
                rotateAmplitude={10}
                scaleOnHover={1.04}
              />
            </Demo>
          </div>
        </section>

        <section data-side="night" aria-labelledby="lab-night" className="bg-ground text-ink">
          <div className="shell flex flex-col gap-6 py-16">
            <div className="flex flex-col gap-2 border-b-[1.5px] border-rule pb-5">
              <p className="t-label t-tag">By night</p>
              <h2 id="lab-night" className="t-item">Game developer</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Demo library="8bitcn + soundcn" name="8-bit button with a coin sound" cost={["font"]} where="Play Market Dash as a pixel button; the coin plays on click only, never on its own.">
                <BitButton onClick={() => void playSound(coinCollectSound.dataUri, { volume: 0.5 })}>Play Market Dash ▸</BitButton>
              </Demo>
              <Demo library="8bitcn" name="XP bar" cost={["font"]} where="History levels: each carries a bar; a finished level reads LEVEL UP.">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-[12px] tracking-[0.06em] text-muted uppercase">Lv 4 · Software Engineer, NJ DCA</span>
                    <XpBar value={60} variant="retro" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-[12px] tracking-[0.06em] text-muted uppercase">Lv 3 · B.S. CS &amp; Game Programming</span>
                    <XpBar value={100} variant="retro" />
                  </div>
                </div>
              </Demo>
              <Demo library="8bitcn" name="Dialogue" cost={["font"]} where="An RPG text box for the night intro or a note's pull quote.">
                <Dialogue avatarSrc="/abraham_professional.jpg" avatarFallback="AR" title="Abraham" description="By night I make games." />
              </Demo>
              <Demo library="React Bits" name="Pixel transition" cost={["none"]} where="The Market Dash cover breaks into pixels and rebuilds as its credits. Hover or tap.">
                <PixelTransition
                  firstContent={
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src="/market_dash.png" alt="Market Dash title screen" className="h-full w-full object-cover" />
                  }
                  secondContent={
                    <div className="grid h-full w-full place-items-center bg-[#3366ff] p-6 text-center text-white">
                      <p className="font-display text-[22px] leading-[28px] font-bold">
                        Lead programmer
                        <br />
                        Team of five · Nine months
                      </p>
                    </div>
                  }
                  gridSize={12}
                  pixelColor="#3366ff"
                  aspectRatio="56.25%"
                  style={{ width: "100%" }}
                />
              </Demo>
              <Demo library="8bitcn" name="Game over" cost={["font"]} where="The 404 page, which already says Game over. with a Continue link." wide>
                <GameOver headingAs="h3" />
              </Demo>
              <Demo library="gamekitui" name="Dino runner" cost={["none"]} where="Also for the 404: a small game to play before going home. Space or tap to jump." wide>
                <div className="shadcn-vars">
                  <DinoRunner captureGlobalKeys={false} persistHighScore={false} width={640} />
                </div>
              </Demo>
            </div>
          </div>
        </section>
      </main>
    </ClickSpark>
  );
}
