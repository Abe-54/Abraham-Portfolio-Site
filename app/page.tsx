import Link from "next/link";
import EmailCopy from "@/components/email-copy";
import GooInk from "@/components/goo-ink";
import Hero from "@/components/hero";
import History from "@/components/history";
import NoteRow from "@/components/note-row";
import ProjectRow from "@/components/project-row";
import { contact, focus, notes, projects, proudOf, sideLabel, toolkit, type Side } from "@/lib/content";

const glance = [
  { label: "Now", value: "Software Engineer, NJ Dept. of Community Affairs" },
  { label: "Education", value: "B.S. CS & Game Programming, 2025" },
];

function WorkSection({
  side,
  id,
  title,
  children,
}: {
  side: Side;
  id: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-nav="projects"
      data-side={side}
      aria-labelledby={`${id}-title`}
      className="shell flex scroll-mt-4 flex-col pt-20 pb-16 lg:pt-[120px] lg:pb-28"
    >
      <div className="flex flex-col gap-3 border-b-[1.5px] border-rule pb-6">
        <p className="t-label t-tag">{sideLabel[side].long}</p>
        <h2 id={`${id}-title`} className="t-section">
          {title}
        </h2>
      </div>
      <div className="pt-2">
        {projects
          .filter((project) => project.side === side)
          .map((project) => (
            <ProjectRow key={project.slug} project={project} />
          ))}
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  return (
    <main id="main" tabIndex={-1}>
      <Hero />

      {/* The portrait goo spills over this strip: the words it covers turn white, the buttons stay on top. */}
      <section aria-label="At a glance" className="shell flex flex-col gap-6 border-b-[1.5px] border-rule py-8 lg:flex-row lg:items-center lg:gap-14">
        <GooInk className="lg:flex-1">
          <dl className="flex flex-col gap-5 md:flex-row md:gap-10 lg:gap-14">
            {glance.map((item) => (
              <div key={item.label} className="flex flex-col gap-1.5 last:flex-1 last:whitespace-nowrap">
                <dt className="t-label text-[12px]">{item.label}</dt>
                <dd className="text-[17px] leading-[22px] font-semibold lg:text-[18px]">{item.value}</dd>
              </div>
            ))}
          </dl>
        </GooInk>
        <div className="relative z-[2] flex flex-wrap gap-2.5">
          <EmailCopy email={contact.email} label="Email me" />
          <a href={contact.resume} target="_blank" rel="noopener" className="btn btn-outline press">
            Résumé ↓
          </a>
        </div>
      </section>

      <section id="about" data-nav="about" className="shell flex scroll-mt-4 flex-col gap-12 pt-20 pb-8 lg:py-28 xl:flex-row xl:items-start xl:gap-24">
        <div className="flex max-w-[720px] flex-col gap-7 xl:w-[720px] xl:shrink-0">
          <h2 className="t-label">Hi, I&apos;m Abraham</h2>
          <p className="t-statement">
            By day I write software for New Jersey: tools that help towns plan affordable housing, and an
            AI workspace for state staff. <span className="text-link">By night I make games.</span>
          </p>
          <p className="t-lede">
            I studied computer science and game programming at Bloomfield College, where I ran the games club for
            three years and led a team of five to ship Market Dash. I care about clean code and clear UX, and I like
            to ship.
          </p>
        </div>
        <ol className="flex flex-col xl:flex-1 xl:pt-11">
          {focus.map((item, index) => (
            <li
              key={item.title}
              data-reveal
              style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}
              className="flex gap-6 border-t border-hairline py-6 first:border-rule last:border-b"
            >
              <span className="w-8 shrink-0 font-mono text-[13px] leading-8 font-medium tracking-[0.08em] text-link">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="t-item">{item.title}</h3>
                <p className="text-[17px] leading-[26px] text-muted">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <WorkSection side="day" id="work" title={"Built for New\u00A0Jersey."}>
        <div className="flex flex-col gap-4 pt-8">
          <p className="t-label">Toolkit</p>
          <p className="font-display text-[22px] leading-[1.35] font-semibold tracking-[-0.02em] lg:text-[28px]">
            {toolkit.map((group, index) => (
              <span key={group[0]}>
                {index > 0 ? <span className="text-[#A3A3A8]"> / </span> : null}
                {group.join(", ")}
              </span>
            ))}
          </p>
        </div>
      </WorkSection>
      <WorkSection side="night" id="games" title="Worlds, after hours." />

      <section id="notes" aria-labelledby="notes-title" data-nav="notes" className="shell flex scroll-mt-4 flex-col gap-10 py-20 lg:gap-12 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <p className="t-label">Notes</p>
            <h2 id="notes-title" className="t-section">
              Things I figured out.
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

      <History />

      <section aria-labelledby="off-title" data-nav="history" className="shell flex flex-col gap-14 pt-20 pb-20 lg:gap-[72px] lg:pt-[120px] lg:pb-24">
        <div className="flex max-w-[860px] flex-col gap-4">
          <h2 id="off-title" className="t-label">
            Off the clock
          </h2>
          <p className="t-statement">
            Outside work I make and play games, watch anime, and tinker with small creative projects.
          </p>
        </div>
        <div className="flex flex-col gap-8 border-t border-rule pt-8 lg:flex-row lg:gap-12">
          <h3 className="t-label w-[200px] shrink-0 lg:leading-8">Proud of</h3>
          {proudOf.map((item, index) => (
            <div
              key={item.title}
              data-reveal
              style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}
              className="flex flex-1 flex-col gap-1.5"
            >
              <p className="t-item">{item.title}</p>
              <p className="text-[17px] leading-[26px] text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
