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
      className="mb-32 max-w-[45rem] text-center leading-8 sm:mb-40 scroll-mt-28"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.175 }}
      id="about"
    >
      <SectionHeading>About Me</SectionHeading>

      <p className="mb-3">
        I am a <span className="font-medium">Full Stack Developer</span> with a
        passion for <span className="font-medium">coding</span> and its ability
        to bring ideas to life. I am currently a{" "}
        <span className="font-medium">Junior</span> at{" "}
        <span className="font-medium">
          <span className="font-medium">
            Bloomfield College of Montclair State University
          </span>
        </span>
        , double majoring in{" "}
        <span className="font-medium">Computer Science</span> and{" "}
        <span className="font-medium">Game Programming</span>. As the{" "}
        <span className="font-medium">president</span> of the Video Game Club at
        my college, I actively foster a collaborative environment for fellow
        students interested in{" "}
        <span className="font-medium">game development</span>. Additionally, I
        am working towards securing a{" "}
        <span className="font-medium">tech internship</span> by next summer to
        further enhance my practical skills and knowledge in the field.
      </p>
      <p>
        <span className="italic">When I'm not coding</span>, I spend most of my
        free time creating and playing video games, watching anime, and reading
        manga. I also enjoy playing with my dog and learning new things.
      </p>
    </motion.section>
  );
};

export default About;
