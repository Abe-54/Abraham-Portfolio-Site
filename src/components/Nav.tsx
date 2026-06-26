import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { Menu, MoonStar, Sun, X } from "lucide-react";

import { navLinks, site } from "@/data/site";
import { cn } from "@/lib/utils";

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      const root = document.documentElement;
      root.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem("theme", next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}

export default function Nav() {
  const { theme, toggle } = useTheme();
  const reduce = useReducedMotion();

  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const lockUntil = useRef(0);

  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  // single liquid blob driven by springs (one shape, never two)
  const blobX = useMotionValue(0);
  const blobW = useMotionValue(0);
  const spring = { stiffness: 420, damping: 34, mass: 0.9 };
  const x = useSpring(blobX, spring);
  const width = useSpring(blobW, spring);
  // horizontal squash/stretch based on travel speed for a gooey feel
  const xVelocity = useVelocity(x);
  const scaleX = useTransform(
    xVelocity,
    (v) => 1 + Math.min(Math.abs(v) / 2800, 0.32)
  );
  const firstMeasure = useRef(true);

  const measure = useCallback(
    (index: number) => {
      const el = itemRefs.current[index];
      const list = listRef.current;
      if (!el || !list) return;
      // rect-based so it's correct regardless of each item's offsetParent
      const elRect = el.getBoundingClientRect();
      const left = elRect.left - list.getBoundingClientRect().left;
      blobX.set(left);
      blobW.set(elRect.width);
      // first paint (and reduced motion) should snap, not animate in
      if (firstMeasure.current || reduce) {
        x.jump(left);
        width.jump(elRect.width);
        firstMeasure.current = false;
      }
      setReady(true);
    },
    [blobX, blobW, x, width, reduce]
  );

  // measure on mount + resize, track the active item
  useEffect(() => {
    measure(active);
    const onResize = () => measure(active);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, measure]);

  // scroll-spy
  useEffect(() => {
    const sections = navLinks
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockUntil.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = navLinks.findIndex((l) => l.id === visible.target.id);
        if (idx >= 0) setActive(idx);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1, 0.25, 0.5, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const go = (index: number, id: string) => {
    setActive(index);
    setOpen(false);
    lockUntil.current = Date.now() + 800;
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-6">
      <nav
        aria-label="Primary"
        className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-border/80 bg-card/70 p-1.5 shadow-lg shadow-black/5 backdrop-blur-xl sm:gap-3"
      >
        {/* brand */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            go(0, "home");
          }}
          className="keycap ml-1.5 hidden size-9 shrink-0 select-none items-center justify-center rounded-full bg-secondary font-pixel text-[0.7rem] text-foreground sm:flex"
          aria-label="Home"
        >
          {site.initials}
        </a>

        {/* desktop links + single liquid blob */}
        <ul
          ref={listRef}
          className="relative hidden flex-1 items-center justify-between px-1 sm:flex"
        >
          {ready && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute left-0 top-1/2 z-0 h-9 rounded-full bg-accent"
              style={{ x, width, y: "-50%", scaleX: reduce ? 1 : scaleX }}
            />
          )}

          {navLinks.map((link, i) => (
            <li key={link.id} className="relative z-10">
              <a
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  go(i, link.id);
                }}
                className={cn(
                  "relative block rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-300",
                  active === i
                    ? // delay the dark-on-amber color until the blob has travelled here,
                      // so the label never flashes dark text on the dark bar mid-transition
                      "text-accent-foreground [transition-delay:140ms]"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={active === i ? "page" : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* mobile brand */}
        <span className="ml-2 font-pixel text-[0.7rem] text-foreground sm:hidden">
          {site.initials}
        </span>

        <div className="flex items-center gap-1.5">
          {/* theme toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="keycap flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <MoonStar className="size-4" />
            )}
          </button>

          {/* mobile menu button */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="keycap flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:text-foreground sm:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {/* mobile dropdown panel */}
      {open && (
        <motion.ul
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto absolute inset-x-4 top-[4.5rem] z-40 grid gap-1 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-xl backdrop-blur-xl sm:hidden"
        >
          {navLinks.map((link, i) => (
            <li key={link.id}>
              <a
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  go(i, link.id);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
                  active === i
                    ? "bg-accent/15 text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                aria-current={active === i ? "page" : undefined}
              >
                <span className="font-pixel text-[0.6rem] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {link.label}
              </a>
            </li>
          ))}
        </motion.ul>
      )}
    </header>
  );
}
