"use client";

import { experienceData } from "@/lib/data";
import { motion } from "framer-motion";
import AppWindow from "./app-window";

const Experience = () => {
  return (
    <AppWindow
      id="experience"
      section="Experience"
      title="experience.log"
      index="03"
      heading="Experience"
    >
      <ol className="relative space-y-10 border-l border-border pl-6 sm:pl-8">
        {experienceData.map((item, index) => (
          <motion.li
            key={`${item.org}-${item.title}`}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="relative"
          >
            <span
              aria-hidden
              className="absolute -left-[31px] top-1.5 size-3 rounded-full border-2 border-background bg-primary ring-4 ring-primary/20 sm:-left-[39px]"
            />
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-xl font-semibold">
                {item.title}{" "}
                <span className="text-foreground/60">· {item.org}</span>
              </h3>
              <span className="font-mono text-xs text-foreground/50">
                {item.date}
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-foreground/75">
              {item.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-primary" />
                  {point}
                </li>
              ))}
            </ul>
          </motion.li>
        ))}
      </ol>
    </AppWindow>
  );
};

export default Experience;
