"use client";

import { Button } from "@/components/ui/button";
import { useActiveSectionContext } from "@/context/active-section-context";
import { personalAdjectives } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import profilePic from "@/public/abraham_professional.jpg";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { BsArrowRight, BsLinkedin } from "react-icons/bs";
import { FaGithubSquare } from "react-icons/fa";
import { HiDownload } from "react-icons/hi";
import { TfiAngleDown } from "react-icons/tfi";
import Typed from "typed.js";

const Intro = () => {
  const { ref } = useSectionInView("Home", 0.5);
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();

  const typingAnim = useRef(null);

  useEffect(() => {
    const typed = new Typed(typingAnim.current, {
      strings: personalAdjectives,
      typeSpeed: 100,
      backSpeed: 50,
      loop: true,
      cursorChar: "|",
      backDelay: 600,
      showCursor: true,
      smartBackspace: true,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <section
      ref={ref}
      id="home"
      className="h-screen flex flex-col justify-center mb-28 max-w-280 sm:mb-0 scroll-mt-400 relative"
    >
      <div className="flex flex-col w-full lg:flex-row items-center gap-5 sm:gap-32 mb-10 text-center lg:text-start">
        <motion.h1
          className="mt-4 px-4 text-2xl font-medium leading-normal! sm:text-4xl"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="font-bold">Hello, I'm Abraham.</span>
          <div>
            I'm a{" "}
            <span
              ref={typingAnim}
              className="bg-linear-to-r from-primary to-light-mode-accent dark:from-sky-400 dark:to-sky-200 bg-clip-text font-bold text-transparent"
            />{" "}
          </div>
          <>
            I enjoy creating{" "}
            <span className="italic">sites, apps, & games</span>.
          </>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 font-medium mt-5"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1,
            }}
          >
            <Button
              asChild
              size="wide"
              className="group flex items-center gap-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] outline-none focus:scale-110 hover:scale-110 active:scale-105 transition text-lg"
            >
              <Link
                href="#contact"
                onClick={() => {
                  setActiveSection("Contact");
                  setTimeOfLastClick(Date.now());
                }}
              >
                Contact me here{" "}
                <BsArrowRight className="opacity-80 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              size="wide"
              variant="secondary"
              className="group border border-dark-mode-background/10 bg-[var(--color-light-mode-secondary)] text-[var(--color-light-mode-accent)] outline-none focus:scale-110 hover:scale-110 active:scale-105 transition text-lg  dark:bg-[var(--color-dark-mode-secondary)] dark:text-white/60"
            >
              <a href="/resume.pdf" download>
                Download Resume{" "}
                <HiDownload className="opacity-80 transition-transform group-hover:translate-y-0.5 text-xl sm:text-2xl" />
              </a>
            </Button>

            <div className="flex gap-4 sm:gap-2">
              <Button
                asChild
                variant="secondary"
                className="rounded-full size-14 sm:size-16 p-0 flex items-center justify-center border border-dark-mode-background/10 bg-[var(--color-light-mode-secondary)] text-[var(--color-light-mode-text)] focus:scale-[1.15] hover:scale-[1.15] active:scale-105 transition dark:bg-[var(--color-dark-mode-secondary)] dark:text-white/60"
              >
                <a
                  href="https://www.linkedin.com/in/abraham-rubio/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <BsLinkedin className="text-2xl sm:text-3xl" />
                </a>
              </Button>

              <Button
                asChild
                variant="secondary"
                className="rounded-full size-14 sm:size-16 p-0 flex items-center justify-center border border-dark-mode-background/10 bg-[var(--color-light-mode-secondary)] text-[var(--color-light-mode-text)] focus:scale-[1.15] hover:scale-[1.15] active:scale-105 transition dark:bg-[var(--color-dark-mode-secondary)] dark:text-white/60"
              >
                <a
                  href="https://github.com/abe-54"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <FaGithubSquare className="text-3xl sm:text-4xl" />
                </a>
              </Button>
            </div>
          </motion.div>
        </motion.h1>
        <div className="flex items-center justify-center">
          <div className="relative">
            <motion.div
              className="w-72 aspect-square rounded-full border-[0.35rem] border-white shadow-xl overflow-hidden"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                duration: 0.2,
              }}
            >
              <Image src={profilePic} alt="Abraham Portrait" priority />
            </motion.div>
            <motion.span
              className="absolute bottom-3 right-3 text-5xl"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 125,
                delay: 0.1,
                duration: 0.7,
              }}
            >
              👋
            </motion.span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Intro;
