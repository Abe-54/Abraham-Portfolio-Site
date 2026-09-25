"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWindows } from "@/context/window-context";
import { projectsData, type Project } from "@/lib/data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import AppWindow from "./app-window";

const Projects = () => {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const { viewedProjects, markProjectViewed } = useWindows();
  const openProject = projectsData.find((p) => p.slug === openSlug);

  return (
    <AppWindow
      id="projects"
      section="Projects"
      title="projects/"
      index="04"
      heading="Selected work"
    >
      <div className="space-y-6">
        {projectsData.map((project, index) => (
          <ProjectCard
            key={project.slug}
            project={project}
            flipped={index % 2 === 1}
            viewed={viewedProjects.has(project.slug)}
            onOpen={() => {
              setOpenSlug(project.slug);
              markProjectViewed(project.slug);
            }}
          />
        ))}
      </div>

      <Dialog
        open={openProject !== undefined}
        onOpenChange={(open) => !open && setOpenSlug(null)}
      >
        {openProject && <CaseStudy project={openProject} />}
      </Dialog>
    </AppWindow>
  );
};

type ProjectCardProps = {
  project: Project;
  flipped: boolean;
  viewed: boolean;
  onOpen: () => void;
};

const ProjectCard = ({ project, flipped, viewed, onOpen }: ProjectCardProps) => (
  <motion.article
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ type: "spring", stiffness: 200, damping: 24 }}
    className="group grid overflow-hidden rounded-2xl border border-border bg-background/60 transition hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 md:grid-cols-2"
  >
    <div
      className={cn(
        "relative aspect-[16/10] overflow-hidden bg-secondary md:aspect-auto md:min-h-72",
        flipped && "md:order-last"
      )}
    >
      <ProjectMedia project={project} />
      <div className="absolute left-4 top-4 rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-white backdrop-blur">
        <p className="text-xl font-bold leading-none">{project.metric.value}</p>
        <p className="mt-1 text-[11px] text-white/75">{project.metric.label}</p>
      </div>
    </div>

    <div className="flex flex-col p-6 sm:p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">
        {project.kind}
      </p>
      <h3 className="mt-2 text-2xl font-bold">{project.title}</h3>
      <p className="mt-1 text-sm text-foreground/60">
        {project.role} · {project.date}
      </p>
      <p className="mt-4 leading-relaxed text-foreground/80">{project.summary}</p>
      <ul className="mt-5 flex flex-wrap gap-1.5">
        {project.stack.map((tech) => (
          <li
            key={tech}
            className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
          >
            {tech}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:scale-105 active:scale-100"
        >
          {viewed && <Check className="size-4" aria-hidden />}
          Open case study
        </button>
        {project.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            {link.label}
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
        ))}
      </div>
    </div>
  </motion.article>
);

const ProjectMedia = ({ project }: { project: Project }) =>
  project.image ? (
    <Image
      src={project.image}
      alt={`Screenshot of ${project.title}`}
      fill
      sizes="(min-width: 768px) 480px, 100vw"
      className="object-cover transition duration-500 group-hover:scale-105"
    />
  ) : (
    <DiscordMock />
  );

// A stylized mock of the bot in action, standing in for a screenshot.
const DiscordMock = () => (
  <div className="flex size-full flex-col justify-end gap-3 bg-[#313338] p-5 pt-20 font-sans text-sm text-[#dbdee1]">
    <div className="flex gap-3">
      <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-primary to-violet-500" />
      <div>
        <p className="font-medium text-white">
          abraham <span className="text-xs font-normal text-[#949ba4]">Today at 9:02 AM</span>
        </p>
        <p className="mt-0.5">
          <span className="rounded bg-[#5865f2]/30 px-1 text-[#c9cdfb]">/schedule</span>{" "}
          image: <span className="text-[#00a8fc]">week_42.jpg</span>
        </p>
      </div>
    </div>
    <div className="flex gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#5865f2] text-xs font-bold text-white">
        SR
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-white">
          Schedule Reader{" "}
          <span className="rounded bg-[#5865f2] px-1 text-[10px] font-semibold text-white">APP</span>
        </p>
        <div className="mt-1 rounded border-l-4 border-emerald-500 bg-[#2b2d31] p-3 transition duration-500 group-hover:-translate-y-0.5">
          <p className="font-semibold text-white">Added 5 shifts to your calendar</p>
          <p className="mt-1 font-mono text-xs text-[#b5bac1]">
            Mon 9–5 · Tue 12–8 · Thu 9–5 · Fri 9–3 · Sat 10–6
          </p>
        </div>
      </div>
    </div>
  </div>
);

const CaseStudy = ({ project }: { project: Project }) => (
  <DialogContent className="max-h-[90svh] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-2xl">
    <div className="sticky top-0 z-10 flex h-11 items-center border-b border-border bg-background/90 px-4 backdrop-blur">
      <span className="flex-1 text-center font-mono text-xs text-foreground/50">
        projects/{project.slug}.md
      </span>
    </div>
    <div className="relative aspect-[16/8] overflow-hidden bg-secondary">
      <ProjectMedia project={project} />
    </div>
    <div className="p-6 sm:p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">
        {project.kind}
      </p>
      <DialogTitle className="mt-2 text-3xl font-bold">{project.title}</DialogTitle>
      <DialogDescription className="mt-2 text-base">
        {project.role} · {project.date}
      </DialogDescription>

      <dl className="mt-6 grid gap-6">
        <div>
          <dt className="font-mono text-xs uppercase tracking-widest text-foreground/50">
            The problem
          </dt>
          <dd className="mt-2 leading-relaxed">{project.problem}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-widest text-foreground/50">
            What I built
          </dt>
          <dd className="mt-2">
            <ul className="space-y-2">
              {project.built.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed">
                  <span aria-hidden className="mt-3 h-px w-3 shrink-0 bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
          <dt className="font-mono text-xs uppercase tracking-widest text-primary">
            Result
          </dt>
          <dd className="mt-2 leading-relaxed">
            <span className="font-bold">
              {project.metric.value} {project.metric.label}.
            </span>{" "}
            {project.result}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        {project.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:scale-105"
          >
            {link.label}
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
        ))}
      </div>
    </div>
  </DialogContent>
);

export default Projects;
