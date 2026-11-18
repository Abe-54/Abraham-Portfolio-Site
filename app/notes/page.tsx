import type { Metadata } from "next";
import NoteRow from "@/components/note-row";
import { notes } from "@/lib/content";

export const metadata: Metadata = {
  title: "Notes",
  description: "Short write-ups on things I figured out, at the day job and on game projects.",
};

export default function NotesPage() {
  return (
    <main id="main" tabIndex={-1} className="shell pb-20 lg:pb-[120px]">
      <div className="flex flex-col gap-6 pt-16 pb-10 md:flex-row md:items-end md:justify-between lg:pt-24 lg:pb-14">
        <h1 className="t-hero text-[64px] leading-[0.95] md:text-[88px] lg:text-[112px] lg:leading-[104px]">Notes</h1>
        <p className="t-lede md:w-[400px] md:shrink-0">
          Short write-ups on things I figured out, at the day job and on game projects.
        </p>
      </div>
      <div className="note-list">
        {notes.map((note, index) => (
          <NoteRow key={note.slug} note={note} index={index} headingLevel={2} />
        ))}
      </div>
    </main>
  );
}
