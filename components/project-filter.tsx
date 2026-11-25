"use client";

import { useRef, useState } from "react";
import { projects, sideLabel, type Side } from "@/lib/content";
import ProjectRow from "./project-row";
import { revealAll } from "./reveal-observer";

const filters: { value: Side | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "day", label: sideLabel.day.long },
  { value: "night", label: sideLabel.night.long },
];

export default function ProjectFilter() {
  const [shown, setShown] = useState<Side | "all">("all");
  const listRef = useRef<HTMLDivElement>(null);

  function choose(value: Side | "all") {
    setShown(value);
    // Filtering moves rows into view without a scroll, so none of them may wait on an entrance.
    if (listRef.current) revealAll(listRef.current);
  }

  return (
    <>
      <div className="shell flex flex-col gap-8 pt-16 pb-10 md:flex-row md:items-end md:justify-between lg:pt-24 lg:pb-14">
        <h1 className="t-hero text-[64px] leading-[0.95] md:text-[88px] lg:text-[112px] lg:leading-[100px]">
          {/* The soft hyphen only shows when enlarged text makes the word wider than a phone. */}
          Proj&shy;ects
        </h1>
        <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2.5">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={shown === filter.value}
              onClick={() => choose(filter.value)}
              className="filter-pill btn press"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={listRef} className="project-page-list">
        {projects.map((project, index) => (
          <ProjectRow
            key={project.slug}
            project={project}
            priority={index === 0}
            headingLevel={2}
            hidden={shown !== "all" && shown !== project.side}
          />
        ))}
      </div>
    </>
  );
}
