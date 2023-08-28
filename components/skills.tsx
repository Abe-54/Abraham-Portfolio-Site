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
    </section>
  );
};

export default Skills;
