"use client";

import { skillsData, technlogiesData } from "@/lib/data";
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
      className="mb-28 max-w-[53rem] scroll-mt-28 text-center sm:mb-40 h-full"
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

      {/* <div className="rounded-lg overflow-hidden w-[32rem] h-max bg-lightMode-secondary/80 dark:bg-darkMode-secondary/80">
        <h3 className="text-3xl px-2 py-3 font-semibold dark:text-white ">
          Technlogies
        </h3>
        <ul className="flex flex-wrap justify-center gap-2 text-xl">
          {technlogiesData.map((skill, index) => (
            <motion.li
              className="px-5 py-3 dark:text-white/80 inline-block"
              key={index}
              variants={fadeInAnimationVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              custom={index}
            >
              <div className="text-4xl"> {skill.icon}</div>

              {skill.name}
            </motion.li>
          ))}
        </ul>
      </div> */}
    </section>
  );
};

export default Skills;
