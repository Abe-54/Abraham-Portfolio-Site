"use client";

import { useSectionInView } from "@/lib/hooks";
import { motion } from "framer-motion";
import React from "react";
import SectionHeading from "./section-heading";

const About = () => {
  const { ref } = useSectionInView("About", 1);

  return (
    <motion.section
      ref={ref}
      className="mb-32 max-w-180 leading-8 sm:mb-40 scroll-mt-28"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.175 }}
      id="about"
    >
      <SectionHeading>About Me</SectionHeading>

      <p className="mb-3">
        I’m a{" "}
        <span className="font-medium text-[var(--color-primary)]">
          full‑stack developer
        </span>{" "}
        who builds{" "}
        <span className="underline decoration-[var(--color-primary)] decoration-2 underline-offset-4">
          user‑focused software
        </span>{" "}
        and thoughtful experiences. I graduated from{" "}
        <span className="font-medium">
          Bloomfield College of Montclair State University
        </span>{" "}
        with a degree in <span className="font-medium">Computer Science</span>{" "}
        and <span className="font-medium">Game Programming</span>, grounding my
        work in both solid engineering and creative design.
      </p>

      <p className="mb-3">
        In 2024, I interned at <span className="font-medium">NASA</span> as a{" "}
        <span className="underline decoration-[var(--color-primary)] decoration-2 underline-offset-4">
          Climate Game Developer
        </span>
        , blending interactivity, design, and code to translate complex climate
        concepts into engaging, playable experiences.
      </p>

      <p className="mb-3">
        These days I’m focused on building fast, accessible{" "}
        <span className="underline decoration-[var(--color-primary)] decoration-2 underline-offset-4">
          front‑end applications
        </span>{" "}
        with{" "}
        <span className="font-medium text-[var(--color-primary)]">React</span>,{" "}
        <span className="font-medium text-[var(--color-primary)]">
          TypeScript
        </span>
        , and{" "}
        <span className="font-medium text-[var(--color-primary)]">Next.js</span>
        , while continuing to grow across the{" "}
        <span className="font-medium">full stack</span>. I care about{" "}
        <span className="font-medium text-[var(--color-primary)]">
          clean, scalable code
        </span>
        ,{" "}
        <span className="font-medium text-[var(--color-primary)]">
          clear UX
        </span>
        , and shipping reliably.
      </p>

      <p>
        Outside of work, you’ll find me{" "}
        <span className="font-medium">designing or playing games</span>,{" "}
        <span className="font-medium">watching anime</span>, and{" "}
        <span className="font-medium">
          tinkering with small creative projects
        </span>{" "}
        that fuel my curiosity.
      </p>
    </motion.section>
  );
};

export default About;
