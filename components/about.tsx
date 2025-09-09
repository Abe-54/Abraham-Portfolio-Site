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
      className="mb-32 max-w-180 text-center leading-8 sm:mb-40 scroll-mt-28"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.175 }}
      id="about"
    >
      <SectionHeading>About Me</SectionHeading>

      <p className="mb-3">
        I’m a <span className="font-medium">Front-End Developer</span> and{" "}
        <span className="font-medium">Game Programmer</span> passionate about
        crafting clean, engaging, and user-friendly digital experiences. I
        recently graduated from{" "}
        <span className="font-medium">
          Bloomfield College of Montclair State University
        </span>{" "}
        with a degree in <span className="font-medium">Computer Science</span>{" "}
        and <span className="font-medium">Game Programming</span>. In 2024, I
        interned at <span className="font-medium">NASA</span> as a{" "}
        <span className="font-medium">Climate Game Developer</span>, where I
        combined design, interactivity, and technology to bring complex ideas to
        life.
      </p>

      <p>
        My current focus is building{" "}
        <span className="font-medium">responsive front-end applications</span>{" "}
        with modern tools like React, TypeScript, and Next.js, while continuing
        to grow as a developer who values both performance and creativity.{" "}
        <span className="italic">Outside of coding</span>, you’ll probably find
        me designing or playing video games, watching anime, and experimenting
        with new creative projects.
      </p>
    </motion.section>
  );
};

export default About;
