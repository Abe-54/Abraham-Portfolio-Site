"use client";

import { skillGroups } from "@/lib/data";
import { motion } from "framer-motion";
import AppWindow from "./app-window";

const About = () => {
  return (
    <AppWindow
      id="about"
      section="About"
      title="about.md"
      index="02"
      heading="About"
    >
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4 text-lg leading-relaxed text-foreground/80">
          <p>
            I&apos;m a software engineer who leans toward the frontend: the
            part of the product people actually touch. I studied{" "}
            <strong className="font-semibold text-foreground">
              Computer Science &amp; Game Programming
            </strong>{" "}
            at Bloomfield College of Montclair State, then spent a summer at{" "}
            <strong className="font-semibold text-foreground">NASA</strong>{" "}
            turning climate science into a playable strategy game.
          </p>
          <p>
            Games taught me that small details decide whether something feels
            good: input latency, clear feedback, and states that never leave you
            guessing. I bring that into web work with React, TypeScript, and
            Next.js, and I&apos;m comfortable going down the stack when a
            feature needs it.
          </p>
          <p>
            Off the clock I&apos;m playing or designing games, watching anime,
            or building small tools that fix my own annoyances.
          </p>
        </div>

        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-foreground/50">
            Loadout
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {skillGroups.map((group, groupIndex) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: groupIndex * 0.06 }}
                className="rounded-xl border border-border bg-background/50 p-4"
              >
                <h3 className="mb-3 text-sm font-semibold">{group.title}</h3>
                <ul className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppWindow>
  );
};

export default About;
