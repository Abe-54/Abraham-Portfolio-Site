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
    <header className="z-[99] relative">
      <motion.div
        className="fixed top-0 left-1/2 -translate-x-1/2 h-[4.5rem] w-full rounded-none border
      border-lightMode-background border-opacity-40 bg-lightMode-secondary/50 bg-opacity-80 shadow-lg shadow-black/[0.3] backdrop-blur-[0.5rem] sm:top-6 sm:h-[3.25rem] sm:w-[32rem] sm:rounded-full dark:bg-darkMode-secondary dark:border-darkMode-secondary/40 dark:bg-opacity-75"
        initial={{ y: -100, x: "-50%", opacity: 0 }}
        animate={{ y: 0, x: "-50%", opacity: 1 }}
      />
      <nav className="flex fixed top-[0.15rem] left-1/2 h-12 -translate-x-1/2 py-2 sm:top-[1.7rem] sm:h-[initial] sm:py-0">
        <ul
          className="flex w-[22rem] flex-wrap items-center justify-center 
            gap-y-1 text-[0.9rem] font-medium text-lightMode-text/50 sm:w-[initial] sm:flex-nowrap sm:gap-5"
        >
          {links.map((link) => (
            <motion.li
              key={link.hash}
              className="h-3/4 flex items-center justify-center relative"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Link
                className={clsx(
                  "flex w-full items-center justify-center px-3 py-3 hover:text-lightMode-text transition dark:text-gray-500 dark:hover:text-gray-300",
                  {
                    "text-lightMode-text dark:text-[#d1d5db]":
                      activeSection === link.name,
                  }
                )}
                href={link.hash}
                onClick={() => {
                  setActiveSection(link.name);
                  setTimeOfLastClick(Date.now());
                }}
              >
                {link.name}
                {link.name === activeSection && (
                  <motion.span
                    className="bg-[#b4d3e1] rounded-full absolute inset-0 -z-10 dark:bg-primary/5"
                    layoutId="activeSection"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
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
