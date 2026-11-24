import NightEdges from "@/components/night-edges";
import ProjectRow from "@/components/project-row";
import withDrop from "@/components/with-drop";
import { projects, sideLabel, type Side } from "@/lib/content";

const sections: Record<Side, { id: string; title: string }> = {
  day: { id: "work", title: "Built for New Jersey." },
  night: { id: "games", title: "Worlds, after hours." },
};

/** One side's projects, under its heading. `lede` opens the section; `toolkit` closes it. */
export default function WorkSection({ side, lede, toolkit }: { side: Side; lede?: string; toolkit?: string[][] }) {
  const { id, title } = sections[side];
  return (
    <section
      id={id}
      data-nav="projects"
      data-side={side}
      aria-labelledby={`${id}-title`}
      className={`shell flex scroll-mt-4 flex-col pt-20 pb-16 lg:pt-[120px] lg:pb-28 ${side === "night" ? "liquid" : ""}`}
    >
      {side === "night" ? <NightEdges /> : null}
      <div className="flex flex-col gap-3 border-b-[1.5px] border-rule pb-6">
        <p className="t-label t-tag">{sideLabel[side].long}</p>
        <h2 id={`${id}-title`} className="t-section">
          {withDrop(title)}
        </h2>
        {lede ? <p className="t-lede max-w-[720px] pt-2">{lede}</p> : null}
      </div>
      <div className="pt-2">
        {projects
          .filter((project) => project.side === side)
          .map((project) => (
            <ProjectRow key={project.slug} project={project} />
          ))}
      </div>
      {toolkit ? (
        <div className="flex flex-col gap-4 pt-8">
          <p className="t-label">Toolkit</p>
          <p className="font-display text-[22px] leading-[1.35] font-semibold tracking-[-0.02em] lg:text-[28px]">
            {toolkit.map((group, index) => (
              <span key={group[0]}>
                {index > 0 ? <span className="text-muted"> / </span> : null}
                {group.join(", ")}
              </span>
            ))}
          </p>
        </div>
      ) : null}
    </section>
  );
}
