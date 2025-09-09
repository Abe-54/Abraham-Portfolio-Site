"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
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
        className="fixed top-0 left-1/2 h-[4.5rem] w-full -translate-x-1/2 border border-border bg-secondary/70 shadow-lg shadow-black/20 backdrop-blur-md sm:top-6 sm:h-[3.25rem] sm:w-[32rem] sm:rounded-full"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      />

      {/* nav links */}
      <nav className="flex fixed top-[0.15rem] left-1/2 h-12 -translate-x-1/2 py-2 sm:top-[1.7rem] sm:h-[initial] sm:py-0">
        <NavigationMenu>
          <NavigationMenuList className="flex w-[22rem] flex-wrap items-center justify-center gap-y-1 text-[0.9rem] font-medium sm:w-[initial] sm:flex-nowrap sm:gap-5">
            {links.map((link) => (
              <NavigationMenuItem key={link.hash}>
                <motion.div
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <NavigationMenuLink asChild>
                    <Link
                      href={link.hash}
                      onClick={() => {
                        setActiveSection(link.name);
                        setTimeOfLastClick(Date.now());
                      }}
                      className={clsx(
                        "relative inline-flex items-center justify-center px-3 py-3 rounded-full transition",
                        activeSection === link.name
                          ? "text-foreground"
                          : "text-foreground/60 hover:text-foreground"
                      )}
                    >
                      {link.name}
                      {link.name === activeSection && (
                        <motion.span
                          className="absolute inset-0 -z-10 rounded-full bg-accent/20"
                          layoutId="activeSection"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  </NavigationMenuLink>
                </motion.div>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
    </header>
  );
};

export default Header;
