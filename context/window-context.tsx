"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

export type WindowId = "about" | "experience" | "projects" | "play" | "contact";
export type WindowState = "open" | "minimized" | "closed";

export const windowIds: WindowId[] = [
  "about",
  "experience",
  "projects",
  "play",
  "contact",
];

type WindowContextType = {
  states: Record<WindowId, WindowState>;
  closeCounts: Record<WindowId, number>;
  setWindowState: (id: WindowId, state: WindowState) => void;
  countClose: (id: WindowId) => number;
  restoreAll: () => void;
  viewedProjects: Set<string>;
  markProjectViewed: (slug: string) => void;
};

const WindowContext = createContext<WindowContextType | null>(null);

const allOpen = () =>
  Object.fromEntries(windowIds.map((id) => [id, "open"])) as Record<
    WindowId,
    WindowState
  >;

const WindowContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [states, setStates] = useState(allOpen);
  const [closeCounts, setCloseCounts] = useState(
    () =>
      Object.fromEntries(windowIds.map((id) => [id, 0])) as Record<
        WindowId,
        number
      >
  );
  const [viewedProjects, setViewedProjects] = useState<Set<string>>(
    () => new Set()
  );

  const setWindowState = useCallback((id: WindowId, state: WindowState) => {
    setStates((prev) => ({ ...prev, [id]: state }));
  }, []);

  const countClose = useCallback(
    (id: WindowId) => {
      const next = closeCounts[id] + 1;
      setCloseCounts((prev) => ({ ...prev, [id]: next }));
      return next;
    },
    [closeCounts]
  );

  const restoreAll = useCallback(() => setStates(allOpen()), []);

  const markProjectViewed = useCallback((slug: string) => {
    setViewedProjects((prev) => new Set(prev).add(slug));
  }, []);

  return (
    <WindowContext.Provider
      value={{
        states,
        closeCounts,
        setWindowState,
        countClose,
        restoreAll,
        viewedProjects,
        markProjectViewed,
      }}
    >
      {children}
    </WindowContext.Provider>
  );
};

export default WindowContextProvider;

export function useWindows() {
  const context = useContext(WindowContext);
  if (context === null) {
    throw new Error("useWindows must be used within a WindowContextProvider");
  }
  return context;
}
