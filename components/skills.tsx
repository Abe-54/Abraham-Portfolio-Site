"use client";

import { skillsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import { motion } from "framer-motion";
import React from "react";
import SectionHeading from "./section-heading";
import SkillsList from "./skills-list";

const Skills = () => {
  const { ref } = useSectionInView("Skills");

  return (
    <section
      ref={ref}
      id="skills"
      className="mb-28 max-w-[60rem] scroll-mt-28 text-center sm:mb-40 h-full"
    >
      <SectionHeading>Skills</SectionHeading>
      <div className="flex gap-4 flex-wrap justify-center">
        <SkillsList skills={skillsData.technologies} title="Technologies" />
        <SkillsList skills={skillsData.tools} title="Tools" />
        <SkillsList skills={skillsData.learning} title="Currently Learning" />
      </div>

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
