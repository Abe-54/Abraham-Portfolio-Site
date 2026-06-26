"use client";

import { Badge } from "@/components/ui/badge";
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
    <div className="flex flex-col items-center gap-y-4 bg-light-mode-secondary/80 dark:bg-dark-mode-secondary/80  max-w-md p-4 rounded-lg">
      <h3 className="text-2xl max-w-max font-normal dark:text-white relative">
        {title}
        <div className="-z-10 absolute top-5 bg-light-mode-accent dark:bg-dark-mode-accent w-full h-3 rounded-lg" />
      </h3>
      <ul className="flex flex-wrap justify-center gap-2 text-lg">
        {skills.map((skill, index) => (
          <motion.li
            className=""
            key={index}
            variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            custom={index}
          >
            <Badge
              variant="secondary"
              className="flex items-center gap-3 rounded-xl px-5 py-2 text-base"
            >
              <span className="text-2xl">{skill.icon}</span>
              <span>{skill.name}</span>
            </Badge>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default SkillsList;
