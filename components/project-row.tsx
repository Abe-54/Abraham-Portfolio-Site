import Image from "next/image";
import { sideLabel, type Cover, type Project } from "@/lib/content";
import { drawnCovers } from "./drawn-covers";

function ProjectCover({ cover, priority }: { cover: Cover; priority?: boolean }) {
  if (cover.kind === "image") {
    const contain = cover.fit === "contain";
    return (
      <div className="cover-wipe absolute inset-0">
        {contain && cover.src.blurDataURL ? (
          <div
            aria-hidden="true"
            className="cover-backdrop"
            style={{ backgroundImage: `url(${cover.src.blurDataURL})` }}
          />
        ) : null}
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          placeholder="blur"
          priority={priority}
          sizes="(min-width: 768px) 280px, calc(100vw - 40px)"
          style={{ objectFit: contain ? "contain" : "cover" }}
        />
      </div>
    );
  }
  const { background, Art } = drawnCovers[cover.id];
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background }}>
      <Art />
    </div>
  );
}

export default function ProjectRow({
  project,
  headingLevel = 3,
  hidden,
  priority,
}: {
  project: Project;
  headingLevel?: 2 | 3;
  hidden?: boolean;
  /** Load the cover eagerly when the row starts above the fold. */
  priority?: boolean;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const facts = [
    { label: "Role", value: [project.role] },
    { label: "Built", value: project.built },
    { label: project.stackLabel, value: [project.stack] },
  ];

  return (
    <article data-side={project.side} data-reveal hidden={hidden} className="project-row">
      <p className="row-meta t-label t-tag">
        {sideLabel[project.side].short} · {project.year}
      </p>
      <div className="row-main">
        <Heading className="t-section">{project.name}</Heading>
        <p className="t-lede">{project.summary}</p>
        {project.link?.href ? (
          <a href={project.link.href} target="_blank" rel="noopener" className="t-link -my-2.5 inline-flex min-h-11 items-center self-start text-[17px] leading-6">
            {project.link.label} ↗
          </a>
        ) : project.link ? (
          <p className="text-[17px] leading-6 text-muted">{project.link.label}</p>
        ) : null}
      </div>
      <dl className="row-facts">
        {facts.map((fact) => (
          <div key={fact.label} className="flex gap-6">
            <dt className="t-label w-[72px] shrink-0 leading-[26px]">{fact.label}</dt>
            <dd className="text-[17px] leading-[26px] lg:text-[18px]">
              {fact.value.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <div className="cover-frame">
        <div className="cover-card">
          <ProjectCover cover={project.cover} priority={priority} />
        </div>
      </div>
    </article>
  );
}
