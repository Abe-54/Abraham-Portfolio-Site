"use client";

import { Card, CardContent } from "@/components/ui/card";
import { projectsData } from "@/lib/data";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { FaDiscord } from "react-icons/fa";

type ProjectProps = (typeof projectsData)[number];

const Project = ({
  title,
  description,
  tags,
  imageUrl,
  siteUrl,
}: ProjectProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.33 1"],
  });

  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityProgress = useTransform(scrollYProgress, [0, 1], [0.6, 1]);

  return (
    <motion.div
      ref={ref}
      style={{
        scale: scaleProgress,
        opacity: opacityProgress,
      }}
      className="group mb-3 sm:mb-8 last:mb-0 cursor-pointer"
      onClick={() => {
        siteUrl.length > 0 ? window.open(siteUrl, "_blank") : null;
      }}
    >
      <Card
        ref={ref}
        className="max-w-2xl overflow-hidden sm:pr-8 relative sm:h-max-[30rem] sm:group-even:pl-8"
      >
        <CardContent className="py-4 pb-7 px-5 sm:pl-10 sm:pr-2 sm:pt-10 sm:max-w-[50%] flex flex-col h-full sm:group-even:ml-72">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <p className="mt-2 leading-relaxed text-gray-700 dark:text-white/70">
            {description}
          </p>
          <ul className="flex flex-wrap mt-4 gap-2">
            {tags.map((tag, index) => (
              <li
                className="bg-light-mode-accent/[0.7] dark:bg-dark-mode-accent/[0.7] px-3 py-1 text-[0.7rem] uppercase tracking-wider text-white rounded-full dark:text-white/70"
                key={index}
              >
                {tag}
              </li>
            ))}
          </ul>
        </CardContent>

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Project I worked on"
            className="absolute hidden sm:block top-8 -right-5 w-85 rounded-lg shadow-2xl 
        transition group-hover:scale-[1.04] group-hover:-translate-x-3 group-hover:translate-y-3 group-hover:-rotate-2 group-even:group-hover:translate-x-3 group-even:group-hover:translate-y-3 group-even:group-hover:rotate-2 group-even:right-[initial] group-even:-left-5"
          />
        ) : (
          <div className="absolute sm:block top-8 -right-5 w-85 h-52 rounded-lg shadow-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 border border-slate-300 dark:border-slate-600 transition group-hover:scale-[1.04] group-hover:-translate-x-3 group-hover:translate-y-3 group-hover:-rotate-2 group-even:group-hover:translate-x-3 group-even:group-hover:translate-y-3 group-even:group-hover:rotate-2 group-even:right-[initial] group-even:-left-5 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-4xl mb-3 opacity-60">
                <FaDiscord />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Discord Bot
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                AI-Powered Schedule Reader
              </p>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default Project;
