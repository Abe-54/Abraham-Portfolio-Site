"use client";

import { useActiveSectionContext } from "@/context/active-section-context";
import { useTheme } from "@/context/theme-context";
import { useWindows, type WindowId } from "@/context/window-context";
import { links, profile } from "@/lib/data";
import type { SectionName } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  Briefcase,
  FileText,
  FolderKanban,
  Gamepad2,
  House,
  Mail,
  Moon,
  Sun,
  User,
  type LucideIcon,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const sectionIcons: Record<SectionName, LucideIcon> = {
  Home: House,
  About: User,
  Experience: Briefcase,
  Projects: FolderKanban,
  Play: Gamepad2,
  Contact: Mail,
};

export function scrollToSection(name: SectionName) {
  if (name === "Home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", window.location.pathname);
    return;
  }
  document
    .getElementById(name.toLowerCase())
    ?.scrollIntoView({ behavior: "smooth" });
  history.replaceState(null, "", `#${name.toLowerCase()}`);
}

const Dock = () => {
  const mouseX = useMotionValue(Infinity);
  const { activeSection, setActiveSection, setTimeOfLastClick } =
    useActiveSectionContext();
  const { states, setWindowState } = useWindows();
  const { theme, toggleTheme } = useTheme();

  const goTo = (name: SectionName) => {
    const id = name.toLowerCase() as WindowId;
    if (name !== "Home" && states[id] !== "open") setWindowState(id, "open");
    setActiveSection(name);
    setTimeOfLastClick(Date.now());
    // Let a restored window render before measuring its position.
    requestAnimationFrame(() => scrollToSection(name));
  };

  return (
    <motion.nav
      aria-label="Site"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.3 }}
      className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-max max-w-[calc(100vw-1rem)] items-end gap-1 rounded-2xl border border-border bg-background/60 px-2 pb-2 pt-2 shadow-2xl shadow-black/20 backdrop-blur-xl sm:gap-2 sm:px-3"
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      {links.map((link) => {
        const windowState =
          link.name === "Home"
            ? "open"
            : states[link.name.toLowerCase() as WindowId];
        return (
          <DockItem
            key={link.name}
            mouseX={mouseX}
            label={link.name}
            hint={link.key}
            active={activeSection === link.name}
            dimmed={windowState === "closed"}
            onClick={() => goTo(link.name)}
          >
            {React.createElement(sectionIcons[link.name], {
              className: "size-[45%]",
              "aria-hidden": true,
            })}
          </DockItem>
        );
      })}

      <span aria-hidden className="mx-1 mb-2 h-8 w-px self-end bg-border" />

      <DockItem
        mouseX={mouseX}
        label="Resume"
        href="/resume.pdf"
        className="hidden sm:flex"
      >
        <FileText className="size-[45%]" aria-hidden />
      </DockItem>
      <DockItem
        mouseX={mouseX}
        label="GitHub"
        href={profile.github}
        className="hidden sm:flex"
      >
        <FaGithub className="size-[45%]" aria-hidden />
      </DockItem>
      <DockItem
        mouseX={mouseX}
        label="LinkedIn"
        href={profile.linkedin}
        className="hidden sm:flex"
      >
        <FaLinkedin className="size-[45%]" aria-hidden />
      </DockItem>
      <DockItem
        mouseX={mouseX}
        label={theme === "dark" ? "Light mode" : "Dark mode"}
        onClick={toggleTheme}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            className="flex size-full items-center justify-center"
          >
            {theme === "dark" ? (
              <Moon className="size-[45%]" aria-hidden />
            ) : (
              <Sun className="size-[45%]" aria-hidden />
            )}
          </motion.span>
        </AnimatePresence>
      </DockItem>
    </motion.nav>
  );
};

type DockItemProps = {
  mouseX: MotionValue<number>;
  label: string;
  hint?: string;
  active?: boolean;
  dimmed?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
};

const DockItem = ({
  mouseX,
  label,
  hint,
  active,
  dimmed,
  href,
  onClick,
  className,
  children,
}: DockItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (x) => {
    const bounds = ref.current?.getBoundingClientRect();
    return bounds ? x - bounds.left - bounds.width / 2 : Infinity;
  });
  const size = useSpring(useTransform(distance, [-120, 0, 120], [40, 58, 40]), {
    stiffness: 400,
    damping: 28,
  });

  const itemClass = cn(
    "flex size-full items-center justify-center rounded-xl border border-border bg-secondary/80 text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary",
    active && "bg-primary/20 text-foreground",
    dimmed && "opacity-40"
  );

  const content = href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className={itemClass}
    >
      {children}
    </a>
  ) : (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "true" : undefined}
      className={itemClass}
    >
      {children}
    </button>
  );

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      className={cn("relative flex aspect-square shrink-0", className)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, y: 4, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 2, x: "-50%" }}
            className="pointer-events-none absolute -top-9 left-1/2 whitespace-nowrap rounded-md border border-border bg-background/90 px-2 py-1 text-xs font-medium shadow-md backdrop-blur"
          >
            {label}
            {hint && (
              <kbd className="ml-2 hidden rounded border border-border px-1 font-mono text-[10px] text-foreground/50 sm:inline">
                {hint}
              </kbd>
            )}
          </motion.span>
        )}
      </AnimatePresence>
      {content}
      {active && (
        <motion.span
          layoutId="dock-active"
          className="absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary"
        />
      )}
    </motion.div>
  );
};

export default Dock;
