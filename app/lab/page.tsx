import type { Metadata } from "next";
import { contact, focus, proudOf } from "@/lib/content";
import { GooButton } from "./button";
import { GooCover } from "./cover";
import { Drop, DropHeadingDemo } from "./drop";
import { HistoryLevels } from "./history-levels";
import { HistoryStrand } from "./history-strand";
import { GooPool } from "./pool";
import { LiquidSeam } from "./seam";
import { Wire } from "./wire";
import "./lab.css";

export const metadata: Metadata = {
  title: "Goo lab",
  robots: { index: false, follow: false },
};

function Specimen({
  n,
  job,
  title,
  body,
  children,
  bleed,
}: {
  n: string;
  job: string;
  title: string;
  body: string;
  children: React.ReactNode;
  bleed?: boolean;
}) {
  return (
    <section className="lab-specimen">
      <div className="shell lab-spec-head">
        <p className="t-label">
          <span className="t-tag">{n}</span> · {job}
        </p>
        <h2 className="lab-spec-title">{title}</h2>
        <p className="lab-spec-body">{body}</p>
      </div>
      <div className={bleed ? "lab-spec-demo" : "shell lab-spec-demo"}>{children}</div>
    </section>
  );
}

export default function Lab() {
  return (
    <main id="main" tabIndex={-1} className="lab">
      <section className="shell lab-intro">
        <p className="t-label t-tag">Goo lab · a sketchbook, not linked from the site</p>
        <h1 className="t-section drop-heading">
          One drop of blue<Drop />
        </h1>
        <p className="lab-lede">
          Right now the goo lives in the hero and the nav, and everything between is flat, so it reads as a
          trick. The idea here: the goo is one material with one habit. It gathers where you are. It arrives
          as a drop, leaves by pinching off, and rests still. Rules are wires, and goo runs along them.
        </p>
        <dl className="lab-jobs">
          <div>
            <dt>Mark</dt>
            <dd>The drop is the signature. It ends every heading.</dd>
          </div>
          <div>
            <dt>Follow</dt>
            <dd>Goo gathers on whatever you point at: links, list items, covers, buttons.</dd>
          </div>
          <div>
            <dt>Carry</dt>
            <dd>Goo moves you between states: day and night, your progress, the end of the page.</dd>
          </div>
        </dl>
      </section>

      <Specimen
        n="01"
        job="Mark"
        title="The drop"
        body="Every heading on the site already ends with a full stop. Make it a drop of the goo: it falls in the first time the heading comes into view, splats and settles. Point at a heading and it wobbles. The mark is everywhere without adding a single new element."
      >
        <DropHeadingDemo />
      </Specimen>

      <Specimen
        n="02"
        job="Follow"
        title="Goo on the wire"
        body="Point at a list item and the goo comes to it. Down a numbered list it is a bead that drips from number to number, so it never crosses the words; along a row it is a bar that slides on the rule. It is the nav's blob, so the nav stops being the only place it lives. Touch: tap an item."
      >
        <div data-tone="day" className="lab-wire-panel">
          <Wire id="focus" shape="bead">
            <ol className="flex flex-col">
              {focus.map((item, index) => (
                <li
                  key={item.title}
                  data-wire-item
                  tabIndex={0}
                  className="flex gap-6 border-t border-hairline py-6 outline-none first:border-rule last:border-b"
                >
                  <span
                    data-wire-over
                    className="grid size-8 shrink-0 place-items-center font-mono text-[13px] font-medium tracking-[0.08em] text-link"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 data-wire-title className="t-item self-start">
                      {item.title}
                    </h3>
                    <p className="text-[17px] leading-[26px] text-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Wire>
          <Wire id="proud" className="lab-proud">
            <div data-wire-rule className="flex flex-col gap-8 border-t border-rule pt-8 md:flex-row md:gap-12">
              {proudOf.map((item) => (
                <div key={item.title} data-wire-item tabIndex={0} className="flex flex-1 flex-col gap-1.5 outline-none">
                  <p data-wire-over data-wire-title className="t-item self-start">
                    {item.title}
                  </p>
                  <p className="text-[17px] leading-[26px] text-muted">{item.body}</p>
                </div>
              ))}
            </div>
          </Wire>
        </div>
      </Specimen>

      <Specimen
        n="03"
        job="Follow"
        title="Covers pour out of the goo"
        body="The first time a project cover comes into view it pours out of a drop of goo and fuses into the picture. The goo stays behind it, as it sits behind the portrait, and leans toward the pointer. The portrait stops being a one-off: every picture on the site is held by the goo."
      >
        <div data-tone="day" className="lab-panel-wide">
          <GooCover />
        </div>
      </Specimen>

      <Specimen
        n="04"
        job="Follow"
        title="Buttons flood"
        body="Point at a button and goo floods it from the side you came in, then drains out the side you leave. The same knob, tail and drop as the nav, so it pulls a neck behind it. Pressing still squeezes the button."
      >
        <div className="lab-pair">
          <div data-tone="day" className="lab-panel lab-buttons">
            <GooButton id="b1" href="#" className="btn btn-solid">
              See my work →
            </GooButton>
            <GooButton id="b2" href="#" className="btn btn-outline">
              Résumé ↓
            </GooButton>
          </div>
          <div data-tone="night" className="lab-panel lab-buttons">
            <GooButton id="b3" href="#" className="btn btn-outline">
              Play Market Dash ▸
            </GooButton>
          </div>
        </div>
      </Specimen>

      <Specimen
        n="05"
        job="Carry"
        title="Night is liquid"
        body="The black sections are the other liquid. Their top edge is a surface that sloshes as the page scrolls; their bottom edge hangs drips that stretch with the scroll and pull back when it stops. Flick hard and a drip lets go of a bead. Scroll past this one."
        bleed
      >
        <div data-tone="day" className="lab-seam-stage">
          <LiquidSeam>
            <div className="shell flex flex-col gap-3">
              <p className="t-label t-tag">By night</p>
              <p className="t-section">Worlds, after hours.</p>
            </div>
          </LiquidSeam>
        </div>
      </Specimen>

      <Specimen
        n="06"
        job="Carry"
        title="The pool at the end"
        body="The page ends where the goo settles: a slow lava pool in the night half of the footer, the same metaballs as the portrait, rising and sinking. The hero is where the goo starts; this is where it ends up. It sleeps whenever it is off screen."
        bleed
      >
        <div className="lab-footer">
          <div data-tone="day" className="lab-footer-day">
            <p className="font-display text-[40px] leading-[1.04] font-extrabold tracking-[-0.035em] lg:text-[56px]">
              Say hi, any shift<Drop />
            </p>
            <p className="t-link text-[18px]">{contact.email}</p>
          </div>
          <GooPool>
            <p className="font-medium">LinkedIn · GitHub · itch.io · Résumé</p>
            <p className="t-label">© 2026 Abraham Rubio</p>
          </GooPool>
        </div>
      </Specimen>

      <section className="shell lab-intro lab-history-intro">
        <p className="t-label t-tag">History, two directions</p>
        <p className="lab-lede">
          What the current section gets wrong: details vanish once you scroll past them, so nobody can see all four
          stops at once; it is mostly empty space; the marker is a rigid target, not goo; and it repeats itself
          (NASA&apos;s 600+ applicants twice, the games club twice). Both directions below show every detail, cut the
          repeats, and make the goo do the storytelling.
        </p>
      </section>

      <Specimen
        n="A"
        job="Carry"
        title="The strand"
        body="A thread of goo runs down beside the stops, with a bead for each. A drop rides the thread at reading height as you scroll, pulls away from each bead with a neck, and feeds every bead it reaches: the bead swells and stays full. Calm, readable, and closest to what is there now."
        bleed
      >
        <HistoryStrand />
      </Specimen>

      <Specimen
        n="B"
        job="Carry"
        title="Level select"
        body="Lean into the levels: the stops become a game map, oldest on the left. A goo player sits on the level you pick and travels the path to the next, swallowing the dots it passes. The first time you see it, it walks from Level 1 to Level 4: how I got here, in two seconds. One screen tall instead of three. Click a level, or use the arrow keys."
        bleed
      >
        <HistoryLevels />
      </Specimen>
    </main>
  );
}
