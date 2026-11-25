import Link from "next/link";
import { formatMonth, sideLabel, type Note } from "@/lib/content";

export default function NoteRow({
  note,
  index,
  headingLevel = 3,
}: {
  note: Note;
  index: number;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article
      data-reveal
      className="note-row"
      style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}
    >
      <p className="note-date t-label">{formatMonth(note.date)}</p>
      <div className="note-main">
        <Heading className="note-title">
          <Link href={`/notes/${note.slug}`} className="note-link">
            {note.title}
          </Link>
        </Heading>
        <p className="text-[17px] leading-[26px] text-muted lg:text-[18px]">{note.summary}</p>
      </div>
      <div className="note-meta">
        <p className="t-label" data-note-side={note.side}>
          {sideLabel[note.side].short} · {note.minutes} min
        </p>
        {note.sample ? <span className="sample-tag">Sample</span> : null}
      </div>
    </article>
  );
}
