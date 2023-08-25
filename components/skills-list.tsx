"use client";

import { skillsData } from "@/lib/data";
import { motion } from "framer-motion";
import React from "react";

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

type SkillsCategory =
  | typeof skillsData.technologies
  | typeof skillsData.tools
  | typeof skillsData.learning;

type SkillsListProps = { skills: SkillsCategory; title: string };

const SkillsList = ({ skills, title }: SkillsListProps) => {
  return (
    <div className="flex flex-col items-center gap-y-4 bg-lightMode-secondary/80 dark:bg-darkMode-secondary/80  max-w-md p-4 rounded-lg">
      <h3 className="text-2xl max-w-max font-normal dark:text-white relative">
        {title}
        <div className="-z-10 absolute top-5 bg-lightMode-accent dark:bg-darkMode-accent w-full h-3 rounded-lg" />
      </h3>
      <ul className="flex flex-wrap justify-center gap-2 text-lg text-white">
        {skills.map((skill, index) => (
          <motion.li
            className="flex justify-center gap-4 items-center bg-lightMode-accent/[0.7] dark:bg-darkMode-accent/[0.7] border border-black/[0.1] rounded-xl px-5 py-2  dark:text-white/80"
            key={index}
            variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            custom={index}
          >
            <span className="text-2xl">{skill.icon}</span>
            <span className="">{skill.name}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default SkillsList;
