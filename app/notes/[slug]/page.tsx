import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMonth, notes, sampleNoteBody, sideLabel } from "@/lib/content";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return notes.map((note) => ({ slug: note.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const note = notes.find((entry) => entry.slug === slug);
  return note ? { title: note.title, description: note.summary } : {};
}

function Code({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-night px-6 py-6 font-mono text-[14px] leading-[26px] font-medium text-white md:px-8 md:py-7 md:text-[15px]">
      <code>
        {code.split(/\b(const|let|return)\b/).map((part, index) =>
          index % 2 ? (
            <span key={index} className="text-[#7C9CFF]">
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </code>
    </pre>
  );
}

export default async function NotePage({ params }: { params: Params }) {
  const { slug } = await params;
  const index = notes.findIndex((note) => note.slug === slug);
  if (index < 0) notFound();
  const note = notes[index];
  const next = notes[(index + 1) % notes.length];
  const meta = [
    formatMonth(note.date),
    `${note.minutes} min read`,
    [sideLabel[note.side].long, note.project].filter(Boolean).join(" · "),
  ];

  return (
    <main id="main" tabIndex={-1}>
      <article className="shell flex flex-col gap-10 pt-12 pb-20 lg:flex-row lg:gap-20 lg:pt-24 lg:pb-[120px]">
        <aside className="flex flex-col gap-3.5 lg:w-[240px] lg:shrink-0 lg:pt-3.5">
          <Link href="/notes" className="inline-flex min-h-11 items-center self-start text-[17px] font-semibold underline decoration-1 underline-offset-auto lg:-my-2.5">
            ← All notes
          </Link>
          <p className="t-label leading-[22px]">
            {meta.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
          {note.sample ? <span className="sample-tag self-start">Sample</span> : null}
        </aside>
        <div className="flex max-w-[760px] min-w-0 flex-col gap-8">
          <h1 className="t-section">{note.title}</h1>
          <p className="text-[20px] leading-[30px] text-muted lg:text-[24px] lg:leading-[34px]">{note.summary}</p>
          {sampleNoteBody.map((block, blockIndex) =>
            block.kind === "h2" ? (
              <h2 key={blockIndex} className="font-display text-[28px] leading-[34px] font-bold tracking-[-0.025em] lg:text-[34px] lg:leading-10">
                {block.text}
              </h2>
            ) : block.kind === "code" ? (
              <Code key={blockIndex} code={block.code} />
            ) : (
              <p key={blockIndex} className="text-[18px] leading-[30px] lg:text-[19px]">
                {block.text}
              </p>
            ),
          )}
        </div>
      </article>
      <Link href={`/notes/${next.slug}`} data-tone="night" className="next-note shell flex items-center justify-between gap-6 py-12 lg:py-14">
        <span className="flex flex-col gap-2.5">
          <span className="t-label t-tag">Next · {sideLabel[next.side].long.toLowerCase()}</span>
          <span className="next-note-title font-display text-[28px] leading-[1.1] font-extrabold tracking-[-0.03em] lg:text-[44px]">
            {next.title}
          </span>
        </span>
        <span aria-hidden="true" className="next-note-arrow text-[32px] leading-10 font-semibold text-link">
          →
        </span>
      </Link>
    </main>
  );
}
