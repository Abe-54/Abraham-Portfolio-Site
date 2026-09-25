"use client";

import { useActiveSectionContext } from "@/context/active-section-context";
import { heroStats, profile } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import profilePic from "@/public/abraham_professional.jpg";
import { motion, useAnimationControls } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { BsArrowRight } from "react-icons/bs";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiDownload } from "react-icons/hi";
import { scrollToSection } from "./dock";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 180, damping: 22, delay },
});

const Intro = () => {
  const { ref } = useSectionInView("Home");
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();
  const waveControls = useAnimationControls();
  const [waves, setWaves] = useState(0);

  const wave = () => {
    const next = waves + 1;
    setWaves(next);
    waveControls.start({
      rotate: [0, 14, -8, 14, -4, 10, 0],
      scale: next % 5 === 0 ? [1, 1.6, 1] : 1,
      transition: { duration: 0.6 },
    });
  };

  return (
    <section
      ref={ref}
      id="home"
      className="flex min-h-[100svh] w-full max-w-5xl flex-col justify-center py-24"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
        <div>
          <motion.p
            {...rise(0)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-xs text-foreground/70 backdrop-blur"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            {profile.currentCompany
              ? `${profile.role} at ${profile.currentCompany}`
              : `${profile.role} · ${profile.location}`}
          </motion.p>

          <motion.h1
            {...rise(0.05)}
            className="mt-6 text-5xl font-bold tracking-tight sm:text-7xl"
          >
            {profile.name}
          </motion.h1>

          <motion.p
            {...rise(0.1)}
            className="mt-3 text-xl font-medium text-primary sm:text-2xl"
          >
            {profile.role} · {profile.focus}
          </motion.p>

          <motion.p
            {...rise(0.15)}
            className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/75"
          >
            I build interfaces that feel as good as they work. My background is
            in game development, so I sweat the same things games do:
            responsiveness, feedback, and polish.
          </motion.p>

          <motion.div
            {...rise(0.2)}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection("Projects");
                setTimeOfLastClick(Date.now());
                scrollToSection("Projects");
              }}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-medium text-white shadow-lg shadow-primary/30 transition hover:scale-105 hover:bg-primary-hover active:scale-100"
            >
              See my work
              <BsArrowRight className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="/resume.pdf"
              download
              className="group inline-flex h-12 items-center gap-2 rounded-full border border-border bg-background/60 px-6 font-medium backdrop-blur transition hover:scale-105 active:scale-100"
            >
              Resume
              <HiDownload className="transition-transform group-hover:translate-y-0.5" />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn"
              className="inline-flex size-12 items-center justify-center rounded-full border border-border bg-background/60 text-xl backdrop-blur transition hover:scale-110 hover:text-[#0a66c2]"
            >
              <FaLinkedin />
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="inline-flex size-12 items-center justify-center rounded-full border border-border bg-background/60 text-xl backdrop-blur transition hover:scale-110"
            >
              <FaGithub />
            </a>
          </motion.div>

          <motion.dl
            {...rise(0.25)}
            className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6"
          >
            {heroStats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="text-xs text-foreground/60 sm:text-sm">
                  {stat.label}
                </dt>
                <dd className="text-2xl font-bold">{stat.value}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.1 }}
          className="relative mx-auto order-first lg:order-last"
        >
          <div className="absolute -inset-3 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/40 via-transparent to-violet-400/30 blur-2xl" />
          <div className="size-56 overflow-hidden rounded-[2rem] border border-border shadow-2xl sm:size-72">
            <Image
              src={profilePic}
              alt="Portrait of Abraham Rubio"
              priority
              className="size-full object-cover"
            />
          </div>
          <motion.button
            type="button"
            aria-label="Wave back"
            onClick={wave}
            onHoverStart={wave}
            animate={waveControls}
            style={{ transformOrigin: "70% 70%" }}
            className="absolute -bottom-3 -right-3 flex size-14 items-center justify-center rounded-2xl border border-border bg-background text-3xl shadow-xl"
          >
            👋
          </motion.button>
        </motion.div>
      </div>

      <p className="mt-16 hidden font-mono text-xs text-foreground/40 lg:block">
        Tip: press <kbd className="rounded border border-border px-1">1</kbd>–
        <kbd className="rounded border border-border px-1">6</kbd> to jump
        around. Every window has a close button. Go ahead and try it.
      </p>
    </section>
  );
};

export default Intro;
