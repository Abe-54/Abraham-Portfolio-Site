"use client";

import { useActiveSectionContext } from "@/context/active-section-context";
import { links } from "@/lib/data";
import clsx from "clsx";
import { motion } from "framer-motion";
import Link from "next/link";

const Header = () => {
  const { activeSection, setActiveSection, setTimeOfLastClick } =
    useActiveSectionContext();

  return (
    <header className="relative z-[99]">
      {/* background bar */}
      <motion.div
        className="fixed top-0 left-1/2 h-[4.5rem] w-full
                   -translate-x-1/2  
                   border border-light-mode-background/40 
                   bg-light-mode-secondary/70 
                   shadow-lg shadow-black/20 backdrop-blur-md 
                   sm:top-6 sm:h-[3.25rem] sm:w-[32rem] sm:rounded-full 
                   dark:bg-dark-mode-secondary/80 
                   dark:border-dark-mode-secondary/40"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      />

      {/* nav links */}
      <nav className="flex fixed top-[0.15rem] left-1/2 h-12 -translate-x-1/2 py-2 sm:top-[1.7rem] sm:h-[initial] sm:py-0">
        <ul className="flex w-[22rem] flex-wrap items-center justify-center gap-y-1 text-[0.9rem] font-medium text-lightMode-text/50 sm:w-[initial] sm:flex-nowrap sm:gap-5">
          {links.map((link) => (
            <motion.li
              key={link.hash}
              className="h-3/4 flex items-center justify-center relative"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Link
                href={link.hash}
                onClick={() => {
                  setActiveSection(link.name);
                  setTimeOfLastClick(Date.now());
                }}
                className={clsx(
                  "flex w-full items-center justify-center px-3 py-3 hover:text-lightMode-text transition dark:text-gray-500 dark:hover:text-gray-300",
                  {
                    "text-lightMode-text dark:text-[#d1d5db]":
                      activeSection === link.name,
                  }
                )}
              >
                {link.name}
                {link.name === activeSection && (
                  <motion.span
                    className="absolute inset-0 -z-10 rounded-full bg-light-mode-accent/20 dark:bg-dark-mode-accent/25"
                    layoutId="activeSection"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
