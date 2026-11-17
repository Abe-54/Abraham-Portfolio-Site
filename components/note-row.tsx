import Link from "next/link";
import { formatMonth, sideLabel, type Note } from "@/lib/content";

export default function NoteRow({ note, index }: { note: Note; index: number }) {
  return (
    <article
      data-reveal
      className="note-row"
      style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}
    >
      <p className="note-date t-label">{formatMonth(note.date)}</p>
      <div className="note-main">
        <h3 className="note-title">
          <Link href={`/notes/${note.slug}`} className="note-link">
            {note.title}
          </Link>
        </h3>
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
