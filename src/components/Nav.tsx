import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { Menu, MoonStar, Sun, X } from "lucide-react";

import { navLinks } from "@/data/site";
import { cn } from "@/lib/utils";

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggle = useCallback(
    (event?: MouseEvent<HTMLButtonElement>) => {
      const next = theme === "dark" ? "light" : "dark";
      const root = document.documentElement;
      const motionSafe = !window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const button = event?.currentTarget;
      const rect = button?.getBoundingClientRect();
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 36;
      const y = rect ? rect.top + rect.height / 2 : 24;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      const applyTheme = () => {
      root.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem("theme", next);
      } catch {
        /* ignore */
      }
        setTheme(next);
      };
      const doc = document as Document & {
        startViewTransition?: (callback: () => void) => {
          ready: Promise<void>;
        };
      };

      if (!motionSafe || !doc.startViewTransition) {
        applyTheme();
        return;
      }

      const transition = doc.startViewTransition(applyTheme);
      transition.ready.then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 540,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    },
    [theme]
  );

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

  // crisp sliding workspace indicator (snappy, terminal-like — not gooey)
  const spring = { stiffness: 520, damping: 40, mass: 0.7 };
  const x = useSpring(0, spring);
  const width = useSpring(0, spring);
  const firstMeasure = useRef(true);

  const measure = useCallback(
    (index: number) => {
      const el = itemRefs.current[index];
      const list = listRef.current;
      if (!el || !list) return;
      const elRect = el.getBoundingClientRect();
      const left = elRect.left - list.getBoundingClientRect().left;
      if (firstMeasure.current || reduce) {
        x.jump(left);
        width.jump(elRect.width);
        firstMeasure.current = false;
      } else {
        x.set(left);
        width.set(elRect.width);
      }
      setReady(true);
    },
    [x, width, reduce]
  );

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

  const go = useCallback(
    (index: number, id: string) => {
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
    },
    [reduce]
  );

  // number-key shortcuts (1..n) jump to workspaces — an OS touch
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= navLinks.length) {
        e.preventDefault();
        const link = navLinks[n - 1];
        go(n - 1, link.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--topbar-h)] border-b border-border bg-card/85 backdrop-blur-xl">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-full max-w-7xl items-center gap-3 px-3 sm:px-5"
      >
        {/* host / brand */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            go(0, "home");
          }}
          className="group flex shrink-0 items-center gap-2.5 rounded-md py-1 pr-1 text-sm"
          aria-label="Home"
        >
          <span className="dots" aria-hidden="true">
            <i></i>
            <i></i>
            <i></i>
          </span>
          <span className="hidden text-muted-foreground transition-colors group-hover:text-foreground md:inline">
            <span className="tok-green">abraham</span>
            <span className="tok-muted">@</span>
            <span className="tok-blue">portfolio</span>
            <span className="tok-muted">:~</span>
          </span>
        </a>

        {/* desktop workspaces + sliding indicator */}
        <ul
          ref={listRef}
          className="relative ml-auto hidden items-center gap-0.5 sm:flex"
        >
          {ready && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute top-1/2 z-0 h-8 rounded-md border border-primary/40 bg-primary/15"
              style={{ x, width, y: "-50%" }}
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
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[0.82rem] transition-colors duration-200",
                  active === i
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={active === i ? "page" : undefined}
              >
                <span
                  className={cn(
                    "tabular text-[0.72rem]",
                    active === i ? "tok-amber" : "text-muted-foreground/60"
                  )}
                >
                  {i + 1}
                </span>
                <span>{link.label.toLowerCase()}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* right cluster */}
        <motion.div layout className="ml-auto flex shrink-0 items-center gap-1.5 sm:ml-3">
          <button
            type="button"
            onClick={(event) => toggle(event)}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="keycap flex size-9 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <MoonStar className="size-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="keycap flex size-9 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground hover:text-foreground sm:hidden"
          >
            <span className="relative flex size-4 items-center justify-center">
              <AnimatePresence initial={false} mode="wait">
                {open ? (
                  <motion.span
                    key="close"
                    className="absolute"
                    initial={reduce ? false : { opacity: 0, rotate: -45, scale: 0.85 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0, rotate: 45, scale: 0.85 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <X className="size-4" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    className="absolute"
                    initial={reduce ? false : { opacity: 0, rotate: 45, scale: 0.85 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0, rotate: -45, scale: 0.85 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Menu className="size-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>
        </motion.div>
      </nav>

      {/* mobile dropdown */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={
              reduce
                ? false
                : { opacity: 0, y: -10, scale: 0.98, filter: "blur(3px)" }
            }
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: -8, scale: 0.98, filter: "blur(3px)" }
            }
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-3 top-[calc(var(--topbar-h)+0.5rem)] z-40 grid origin-top gap-0.5 rounded-lg border border-border bg-popover/97 p-2 shadow-xl backdrop-blur-xl sm:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.li
                key={link.id}
                initial={reduce ? false : { opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.18,
                  delay: reduce ? 0 : 0.03 + i * 0.018,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(i, link.id);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                    active === i
                      ? "bg-primary/15 text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  aria-current={active === i ? "page" : undefined}
                >
                  <span className="tabular tok-amber text-xs">{i + 1}</span>
                  <span className="tok-green">~/</span>
                  {link.label.toLowerCase()}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
