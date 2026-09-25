"use client";

import { useWindows, type WindowId } from "@/context/window-context";
import { projectsData, profile } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import type { SectionName } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type AppWindowProps = {
  id: WindowId;
  section: SectionName;
  title: string;
  index: string;
  heading: string;
  children: React.ReactNode;
};

const AppWindow = ({
  id,
  section,
  title,
  index,
  heading,
  children,
}: AppWindowProps) => {
  const { ref } = useSectionInView(section);
  const { states, closeCounts, setWindowState, countClose, viewedProjects } =
    useWindows();
  const [wide, setWide] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const state = states[id];
  const unseenProjects = projectsData.length - viewedProjects.size;

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(timeout);
  }, [notice]);

  const handleClose = () => {
    const count = countClose(id);

    if (id === "experience" && count < 3) {
      setShakeKey((k) => k + 1);
      setNotice(
        count === 1
          ? "Permission denied: work history is read-only."
          : "Still read-only. One more try and I'll use sudo."
      );
      return;
    }

    if (id === "projects" && unseenProjects > 0 && !confirming) {
      setConfirming(true);
      return;
    }

    setConfirming(false);
    setWindowState(id, "closed");
  };

  const toggleMinimized = () =>
    setWindowState(id, state === "minimized" ? "open" : "minimized");

  return (
    <section
      ref={ref}
      id={section.toLowerCase()}
      className={cn(
        "mb-14 w-full scroll-mt-10 transition-[max-width] duration-500 sm:mb-20",
        wide ? "max-w-7xl" : "max-w-5xl"
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "closed" ? (
          <ClosedStub
            key="closed"
            id={id}
            title={title}
            closeCount={closeCounts[id]}
            unseenProjects={unseenProjects}
            onReopen={() => setWindowState(id, "open")}
          />
        ) : (
          <motion.div
            key="window"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 30, filter: "blur(6px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <motion.div
              key={shakeKey}
              animate={shakeKey > 0 ? { x: [0, -10, 10, -7, 7, -3, 0] } : {}}
              transition={{ duration: 0.45 }}
              className="relative rounded-2xl border border-border bg-card/70 shadow-2xl shadow-black/10 backdrop-blur-xl dark:shadow-black/40"
            >
              <div
                className="flex h-11 select-none items-center gap-3 border-b border-border px-4"
                onDoubleClick={toggleMinimized}
              >
                <div className="group/lights flex gap-2">
                  <TrafficLight
                    color="bg-[#ff5f57]"
                    glyph="×"
                    label={`Close ${title}`}
                    onClick={handleClose}
                  />
                  <TrafficLight
                    color="bg-[#febc2e]"
                    glyph="−"
                    label={
                      state === "minimized"
                        ? `Restore ${title}`
                        : `Minimize ${title}`
                    }
                    onClick={toggleMinimized}
                  />
                  <TrafficLight
                    color="bg-[#28c840]"
                    glyph="+"
                    label={wide ? `Shrink ${title}` : `Expand ${title}`}
                    onClick={() => setWide((w) => !w)}
                    className="hidden lg:flex"
                  />
                </div>
                <button
                  type="button"
                  onClick={state === "minimized" ? toggleMinimized : undefined}
                  className={cn(
                    "flex-1 truncate text-center font-mono text-xs text-foreground/50",
                    state === "minimized"
                      ? "cursor-pointer hover:text-foreground"
                      : "cursor-default"
                  )}
                  tabIndex={state === "minimized" ? 0 : -1}
                >
                  {title}
                  {state === "minimized" && "  ·  click to restore"}
                </button>
                <span className="w-[52px] text-right font-mono text-[10px] text-foreground/30">
                  {index}
                </span>
              </div>

              <AnimatePresence initial={false}>
                {state === "open" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 sm:p-10">
                      <h2 className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl">
                        {heading}
                      </h2>
                      {children}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {notice && (
                  <motion.p
                    role="status"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-4 top-14 z-10 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-600 backdrop-blur dark:text-red-300"
                  >
                    {notice}
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {confirming && (
                  <motion.div
                    role="alertdialog"
                    aria-label="Close projects?"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="absolute left-0 right-0 top-11 z-10 mx-auto w-[min(90%,24rem)] rounded-b-xl border border-t-0 border-border bg-background/95 p-5 text-center shadow-xl backdrop-blur"
                  >
                    <p className="font-semibold">Unsaved progress</p>
                    <p className="mt-1 text-sm text-foreground/70">
                      You haven&apos;t opened {unseenProjects} of{" "}
                      {projectsData.length} case studies. Close anyway?
                    </p>
                    <div className="mt-4 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirming(false)}
                        className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white"
                        autoFocus
                      >
                        Keep looking
                      </button>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg border border-border px-4 py-1.5 text-sm"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

type TrafficLightProps = {
  color: string;
  glyph: string;
  label: string;
  onClick: () => void;
  className?: string;
};

const TrafficLight = ({
  color,
  glyph,
  label,
  onClick,
  className,
}: TrafficLightProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className={cn(
      "flex size-3.5 items-center justify-center rounded-full text-[10px] font-bold leading-none text-black/60 ring-1 ring-black/10 transition active:scale-90",
      color,
      className
    )}
  >
    <span className="opacity-0 transition group-focus-within/lights:opacity-100 group-hover/lights:opacity-100">
      {glyph}
    </span>
  </button>
);

type ClosedStubProps = {
  id: WindowId;
  title: string;
  closeCount: number;
  unseenProjects: number;
  onReopen: () => void;
};

const ClosedStub = ({
  id,
  title,
  closeCount,
  unseenProjects,
  onReopen,
}: ClosedStubProps) => {
  let message: React.ReactNode;
  let action = `Reopen ${title}`;

  switch (id) {
    case "about":
      message =
        closeCount > 1
          ? "Closed it again. Fine, the short version: software engineer who builds UI with a game developer's eye for feel."
          : `${title} closed. Abraham is still here, though.`;
      break;
    case "experience":
      message = "sudo granted. experience.log archived. HR kept a copy.";
      break;
    case "projects":
      message =
        unseenProjects > 0
          ? "projects/ closed. The case studies will wait for you."
          : "You opened every case study before closing. Respect.";
      break;
    case "play":
      return <GameOver onContinue={onReopen} />;
    case "contact":
      message = (
        <>
          Closing contact.sh… nice try. You can still reach me at{" "}
          <button
            type="button"
            className="underline decoration-primary underline-offset-4"
            onClick={() => {
              navigator.clipboard.writeText(profile.email);
              toast.success("Email copied");
            }}
          >
            {profile.email}
          </button>
          .
        </>
      );
      action = "Reopen the form";
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-foreground/20 px-6 py-10 text-center"
    >
      <p className="max-w-md font-mono text-sm text-foreground/70">{message}</p>
      <button
        type="button"
        onClick={onReopen}
        className="rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-medium transition hover:scale-105"
      >
        {action}
      </button>
    </motion.div>
  );
};

const GameOver = ({ onContinue }: { onContinue: () => void }) => {
  const [seconds, setSeconds] = useState(9);

  useEffect(() => {
    if (seconds === 0) return;
    const timeout = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timeout);
  }, [seconds]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-3 rounded-2xl bg-black px-6 py-12 text-center font-mono text-white"
    >
      <p className="text-3xl font-bold tracking-[0.3em] text-red-500">
        GAME OVER
      </p>
      <p className="text-sm text-white/70" aria-live="polite">
        {seconds > 0 ? `Continue? ${seconds}` : "Thanks for playing."}
      </p>
      <button
        type="button"
        onClick={onContinue}
        className="mt-2 animate-pulse rounded border border-white/40 px-4 py-1.5 text-xs uppercase tracking-widest hover:bg-white hover:text-black"
      >
        {seconds > 0 ? "Continue" : "Insert coin"}
      </button>
    </motion.div>
  );
};

export default AppWindow;
