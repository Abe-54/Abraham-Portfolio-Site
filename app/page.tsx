import Link from "next/link";
import EmailCopy from "@/components/email-copy";
import GooFlood from "@/components/goo-flood";
import GooInk from "@/components/goo-ink";
import GooWire from "@/components/goo-wire";
import Hero from "@/components/hero";
import History from "@/components/history";
import NoteRow from "@/components/note-row";
import withDrop from "@/components/with-drop";
import WorkSection from "@/components/work-section";
import { contact, focus, notes, showNotes, toolkit } from "@/lib/content";

const glance = [
  { label: "Now", value: "Software Engineer, NJ Dept. of Community Affairs" },
  { label: "Education", value: "B.S. CS & Game Programming, 2025" },
];

export default function Home() {
  return (
    <main id="main" tabIndex={-1}>
      <Hero />

      {/* The portrait goo spills over this strip: the words it covers turn white, the buttons stay on top. */}
      <section aria-label="At a glance" className="shell flex flex-col gap-6 border-b-[1.5px] border-rule py-8 lg:flex-row lg:items-center lg:gap-14">
        <GooInk className="lg:flex-1">
          <dl className="flex flex-col gap-5 md:flex-row md:gap-10 lg:gap-14">
            {glance.map((item) => (
              <div key={item.label} className="flex flex-col gap-1.5 last:flex-1 min-[20em]:last:whitespace-nowrap">
                <dt className="t-label text-[12px]">{item.label}</dt>
                <dd className="text-[17px] leading-[22px] font-semibold lg:text-[18px]">{item.value}</dd>
              </div>
            ))}
          </dl>
        </GooInk>
        <div className="relative z-[2] flex flex-wrap gap-2.5">
          <EmailCopy email={contact.email} label="Email me" />
          <a href={contact.resume} target="_blank" rel="noopener" className="btn btn-outline press">
            <GooFlood id="flood-resume" />
            Résumé ↓
          </a>
        </div>
      </section>

      {/* Proof first: the projects come before the introduction. */}
      <WorkSection side="day" toolkit={toolkit} />
      <WorkSection side="night" />

      <section id="about" data-nav="about" className="shell flex scroll-mt-4 flex-col gap-12 pt-20 pb-8 lg:py-28 xl:flex-row xl:items-start xl:gap-24">
        <div className="flex max-w-[720px] flex-col gap-7 xl:w-[720px] xl:shrink-0">
          <h2 className="t-label">Hi, I&apos;m Abraham</h2>
          <p className="t-statement">
            By day I build an AI workspace for state staff, and tools that help New Jersey towns plan affordable
            housing. <span className="text-link">By night I make games.</span>
          </p>
          <p className="t-lede">
            I studied computer science and game programming at Bloomfield College and led a team of five to ship
            Market Dash. I also built Schedule Reader, a Discord bot using Google Gemini to read schedule photos and
            update a calendar. It saves me over 2 hours a month.
          </p>
        </div>
        <GooWire id="focus" shape="bead" className="xl:flex-1 xl:pt-11">
          <ol className="flex flex-col">
            {focus.map((item, index) => (
              <li
                key={item.title}
                data-reveal
                data-wire-item
                style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}
                className="flex gap-6 border-t border-hairline py-6 first:border-rule last:border-b"
              >
                <span
                  data-wire-over
                  className="grid size-8 shrink-0 place-items-center font-mono text-[13px] font-medium tracking-[0.08em] text-link"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="t-item">{item.title}</h3>
                  <p className="text-[17px] leading-[26px] text-muted">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </GooWire>
      </section>


      {showNotes ? (
        <section id="notes" aria-labelledby="notes-title" data-nav="notes" className="shell flex scroll-mt-4 flex-col gap-10 py-20 lg:gap-12 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-3">
              <p className="t-label">Notes</p>
              <h2 id="notes-title" className="t-section">
                {withDrop("Things I figured out.")}
              </h2>
            </div>
            {notes.length > 0 ? (
              <Link href="/notes" className="t-link inline-flex min-h-11 items-center text-[17px]">
                All notes →
              </Link>
          ) : null}
        </div>
        {notes.length > 0 ? (
          <div className="note-list">
            {notes.slice(0, 3).map((note, index) => (
              <NoteRow key={note.slug} note={note} index={index} />
            ))}
          </div>
        ) : (
          <p className="notes-empty">No notes yet.</p>
        )}
      </section>
      ) : null}

      <History />

      <section aria-labelledby="off-title" data-nav="history" className="shell flex flex-col pt-20 pb-20 lg:pt-[120px] lg:pb-24">
        <div className="flex max-w-[860px] flex-col gap-4">
          <h2 id="off-title" className="t-label">
            Off the clock
          </h2>
          <p className="t-statement">
            Outside work I make and play games, watch anime, and tinker with small creative projects.
          </p>
        </div>
      </section>
    </main>
  );
}
