"use client";

import { useActiveSectionContext } from "@/context/active-section-context";
import { useWindows, windowIds, type WindowId } from "@/context/window-context";
import { links, profile } from "@/lib/data";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { scrollToSection } from "./dock";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

const EasterEggs = () => {
  const { states, setWindowState, restoreAll } = useWindows();
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();
  const [exitPrompt, setExitPrompt] = useState(false);
  const [clearedIn, setClearedIn] = useState<string | null>(null);
  const konamiIndex = useRef(0);

  // Number keys jump between sections; the Konami code toggles retro mode.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      konamiIndex.current =
        key === KONAMI[konamiIndex.current]
          ? konamiIndex.current + 1
          : key === KONAMI[0]
            ? 1
            : 0;
      if (konamiIndex.current === KONAMI.length) {
        konamiIndex.current = 0;
        const on = document.documentElement.classList.toggle("retro");
        toast(on ? "Retro mode unlocked. ↑↑↓↓←→←→BA to exit." : "Back to 2026.", {
          icon: "👾",
        });
        return;
      }

      const link = links.find((l) => l.key === e.key);
      if (!link) return;
      const id = link.name.toLowerCase() as WindowId;
      if (link.name !== "Home" && states[id] !== "open") {
        setWindowState(id, "open");
      }
      setActiveSection(link.name);
      setTimeOfLastClick(Date.now());
      requestAnimationFrame(() => scrollToSection(link.name));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [states, setWindowState, setActiveSection, setTimeOfLastClick]);

  // Leaving the tab pauses the game.
  useEffect(() => {
    const original = document.title;
    let timeout: ReturnType<typeof setTimeout>;
    const onVisibility = () => {
      clearTimeout(timeout);
      if (document.hidden) {
        document.title = "⏸ Paused · come back soon";
      } else {
        document.title = "▶ Resumed";
        timeout = setTimeout(() => (document.title = original), 1500);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Once per visit, after some time on the page, catch the cursor heading for the tab bar.
  useEffect(() => {
    const armedAt = Date.now() + 15000;
    const onMouseOut = (e: MouseEvent) => {
      if (e.relatedTarget || e.clientY > 10 || Date.now() < armedAt) return;
      if (sessionStorage.getItem("exit-prompt")) return;
      sessionStorage.setItem("exit-prompt", "1");
      setExitPrompt(true);
    };
    document.addEventListener("mouseout", onMouseOut);
    return () => document.removeEventListener("mouseout", onMouseOut);
  }, []);

  // Closing every window is its own little speedrun.
  const allClosed = windowIds.every((id) => states[id] === "closed");
  useEffect(() => {
    if (!allClosed) {
      setClearedIn(null);
      return;
    }
    const total = Math.round(performance.now() / 1000);
    setClearedIn(
      `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`
    );
  }, [allClosed]);

  return (
    <AnimatePresence>
      {clearedIn && (
        <Toastlike key="cleared" onDismiss={() => setClearedIn(null)}>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Desktop cleared
          </p>
          <p className="mt-1 text-sm">
            Every window closed in{" "}
            <span className="font-mono font-semibold">{clearedIn}</span>. The
            speedrun is logged. Want the good ending?
          </p>
          <button
            type="button"
            onClick={restoreAll}
            className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white"
          >
            Restore everything
          </button>
        </Toastlike>
      )}
      {exitPrompt && !clearedIn && (
        <Toastlike key="exit" onDismiss={() => setExitPrompt(false)}>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Save before quitting?
          </p>
          <p className="mt-1 text-sm">
            Take the resume with you, or grab my email for later.
          </p>
          <div className="mt-3 flex gap-2">
            <a
              href="/resume.pdf"
              download
              onClick={() => setExitPrompt(false)}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white"
            >
              Save resume
            </a>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(profile.email);
                toast.success("Email copied");
                setExitPrompt(false);
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm"
            >
              Copy email
            </button>
          </div>
        </Toastlike>
      )}
    </AnimatePresence>
  );
};

const Toastlike = ({
  children,
  onDismiss,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
}) => (
  <motion.div
    role="dialog"
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.95 }}
    transition={{ type: "spring", stiffness: 300, damping: 26 }}
    className="fixed inset-x-0 bottom-24 z-50 mx-auto w-[min(92vw,22rem)] rounded-2xl border border-border bg-background/90 p-4 pr-10 shadow-2xl backdrop-blur-xl"
  >
    {children}
    <button
      type="button"
      aria-label="Dismiss"
      onClick={onDismiss}
      className="absolute right-3 top-3 text-foreground/40 hover:text-foreground"
    >
      ×
    </button>
  </motion.div>
);

export default EasterEggs;
