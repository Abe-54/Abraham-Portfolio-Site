"use client";

import { skillsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import { motion } from "framer-motion";
import React from "react";
import SectionHeading from "./section-heading";

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * index,
    },
  }),
};

const Skills = () => {
  const { ref } = useSectionInView("Skills");

  return (
    <section
      ref={ref}
      id="skills"
      className="mb-28 max-w-[53rem] scroll-mt-28 text-center sm:mb-40"
    >
      <SectionHeading>Skills</SectionHeading>
      <ul className="flex flex-wrap justify-center gap-2 text-lg text-white">
        {skillsData.map((skill, index) => (
          <motion.li
            className="bg-lightMode-accent/[0.7] dark:bg-darkMode-accent/[0.7] border border-black/[0.1] rounded-xl px-5 py-3  dark:text-white/80"
            key={index}
            variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            custom={index}
          >
            {skill}
          </motion.li>
        ))}
      </ul>
    </section>
  );
};

export default Skills;
