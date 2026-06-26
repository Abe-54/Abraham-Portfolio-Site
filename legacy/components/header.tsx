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
  const { activeSection } = useActiveSectionContext();

  return (
    <header className="relative z-[99]">
      <motion.div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full hidden sm:block sm:top-6 sm:w-[32rem] sm:h-[3.5rem]"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* background bar that fills the container height */}
        <div
          aria-hidden
          className="absolute py-5 inset-0 -z-10 border border-border bg-secondary/70 shadow-lg shadow-black/20 backdrop-blur-md sm:rounded-full"
        />

        {/* nav links */}
        <nav className="flex items-center justify-center py-2 sm:py-0">
          <NavigationMenu>
            <NavigationMenuList className="flex w-full max-w-[22rem] flex-wrap items-center justify-center gap-y-1 px-2 text-[0.9rem] font-medium sm:w-[initial] sm:max-w-none sm:flex-nowrap sm:gap-5 sm:px-0">
              {links.map((link) => (
                <NavigationMenuItem key={link.hash}>
                  <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    <NavigationMenuLink asChild>
                      <Link
                        href={link.hash}
                        onClick={(e) => {
                          if (link.name === "Home") {
                            e.preventDefault();
                            // Smooth scroll to absolute top and clear any hash from the URL
                            window.scrollTo({ top: 0, behavior: "smooth" });
                            const newUrl = `${window.location.pathname}${window.location.search}`;
                            window.history.replaceState(null, "", newUrl);
                          }
                        }}
                        className={clsx(
                          "relative inline-flex items-center justify-center px-3 py-3 mt-1 rounded-full transition",
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
      </motion.div>
    </header>
  );
};

export default Header;
