"use client";

import { Button } from "@/components/ui/button";
import { useActiveSectionContext } from "@/context/active-section-context";
import { useSectionInView } from "@/lib/hooks";
import profilePic from "@/public/abraham_professional.jpg";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BsArrowRight, BsLinkedin } from "react-icons/bs";
import { FaGithubSquare } from "react-icons/fa";
import { HiDownload } from "react-icons/hi";
import { TfiAngleDown } from "react-icons/tfi";
import DownButton from "./down-btn";

const Intro = () => {
  const { ref } = useSectionInView("Home", 0.5);
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();
  const [isHovering, setIsHovering] = useState(false);
  const [hasWaved, setHasWaved] = useState(false);

  return (
    <section
      ref={ref}
      id="home"
      className="min-h-screen flex flex-col justify-center max-w-280 relative"
    >
      <div className="flex flex-col w-full lg:flex-row items-center gap-5 md:gap-28 mb-10 lg:text-start">
        <motion.h1
          className="mt-4 px-4 text-2xl font-medium leading-normal! sm:text-4xl"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="font-medium text-lg sm:text-2xl text-cyan-600 dark:text-primary/90">
            Hi, my name is
          </div>
          <div className="font-bold my-2">Abraham Rubio.</div>
          <div className="text-lg sm:text-xl leading-relaxed">
            <span className="underline decoration-[var(--color-primary)] decoration-2 underline-offset-4">
              By day
            </span>
            , I’m a
            <span className="mx-1 font-semibold text-[var(--color-primary)]">
              full‑stack developer
            </span>
            building
            <span className="mx-1 underline decoration-[var(--color-primary)] decoration-2 underline-offset-4">
              user‑focused software
            </span>
            that ships.
            <span className="block mt-3">
              <span className="underline decoration-[var(--color-primary)] decoration-2 underline-offset-4">
                By night
              </span>
              , I’m an
              <span className="mx-1 font-medium text-[var(--color-primary)]">
                indie game developer
              </span>
              building playful worlds where code and creativity meet.
            </span>
            <span className="block mt-3">
              I bring{" "}
              <span className="font-semibold text-[var(--color-primary)]">
                precision
              </span>
              , passion, and attention to detail to every build.
            </span>
          </div>
          <motion.div
            className="flex flex-col sm:flex-row items-start justify-center gap-4 md:px-4 font-medium mt-5"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1,
            }}
          >
            <Button
              asChild
              size="wide"
              svgSize="sm"
              className="group flex items-center gap-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] outline-none focus:scale-110 hover:scale-110 active:scale-105 transition h-10 px-4 text-sm sm:h-14 sm:px-7 sm:text-lg"
            >
              <Link
                href="#projects"
                onClick={() => {
                  setActiveSection("Projects");
                  setTimeOfLastClick(Date.now());
                }}
              >
                Look at my work{" "}
                <BsArrowRight className="opacity-80 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <div className="flex items-center gap-3 sm:contents">
              <Button
                asChild
                size="wide"
                variant="secondary"
                svgSize="sm"
                className="group border border-dark-mode-background/10 bg-[var(--color-light-mode-secondary)] text-[var(--color-light-mode-accent)] outline-none focus:scale-110 hover:scale-110 active:scale-105 transition h-10 px-4 text-sm sm:h-14 sm:px-7 sm:text-lg dark:bg-[var(--color-dark-mode-secondary)] dark:text-white/60"
              >
                <a href="/resume.pdf" download>
                  Download Resume{" "}
                  <HiDownload className="opacity-80 transition-transform group-hover:translate-y-0.5 text-xl sm:text-2xl" />
                </a>
              </Button>

              <div className="flex gap-3 sm:gap-2">
                <Button
                  asChild
                  variant="secondary"
                  className="group rounded-full size-10 sm:size-14 p-0 flex items-center justify-center border border-dark-mode-background/10 bg-[var(--color-light-mode-secondary)] text-[var(--color-light-mode-text)] focus:scale-[1.15] hover:scale-[1.15] active:scale-105 transition dark:bg-[var(--color-dark-mode-secondary)] dark:text-white/60"
                >
                  <a
                    href="https://www.linkedin.com/in/abraham-rubio/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <BsLinkedin className="text-lg sm:text-2xl group-hover:text-blue-500" />
                  </a>
                </Button>

                <Button
                  asChild
                  variant="secondary"
                  className="group rounded-full size-10 sm:size-14 p-0 flex items-center justify-center border border-dark-mode-background/10 bg-[var(--color-light-mode-secondary)] text-[var(--color-light-mode-text)] focus:scale-[1.15] hover:scale-[1.15] active:scale-105 transition dark:bg-[var(--color-dark-mode-secondary)] dark:text-white/60"
                >
                  <a
                    href="https://github.com/abe-54"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <FaGithubSquare className="text-xl sm:text-3xl group-hover:text-purple-900/80 dark:group-hover:text-purple-400/80" />
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.h1>
        <div className="flex items-center justify-center">
          <div
            className="relative"
            onMouseEnter={() => {
              if (!hasWaved) {
                setIsHovering(true);
                setHasWaved(true);
              }
            }}
            onMouseLeave={() => {
              setIsHovering(false);
              setHasWaved(false);
            }}
          >
            <motion.div
              className="w-72 aspect-square rounded-full border-[0.35rem] border-white shadow-xl overflow-hidden"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              // whileHover={{ scale: 1.05 }}
              transition={{
                type: "spring",
                duration: 0.2,
              }}
            >
              <Image src={profilePic} alt="Abraham Portrait" priority />
            </motion.div>
            <motion.span
              className="absolute bottom-3 right-3 text-5xl pointer-events-none"
              style={{ transformOrigin: "70% 70%" }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: isHovering ? [0, 14, -8, 14, -4, 10, 0] : 0,
              }}
              transition={{
                type: isHovering ? "keyframes" : "spring",
                stiffness: 125,
                delay: isHovering ? 0 : 0.1,
                duration: isHovering ? 0.6 : 0.7,
              }}
            >
              👋
            </motion.span>
          </div>
        </div>
      </div>
      <DownButton />
    </section>
  );
};

export default Intro;
