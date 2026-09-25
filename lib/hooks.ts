import { useActiveSectionContext } from "@/context/active-section-context";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import type { SectionName } from "./types";

// A section is active while it crosses the vertical middle of the viewport,
// which works for sections of any height.
export function useSectionInView(sectionName: SectionName) {
  const { ref, inView } = useInView({ rootMargin: "-50% 0px -50% 0px" });
  const { setActiveSection, timeOfLastClick } = useActiveSectionContext();

  useEffect(() => {
    if (inView && Date.now() - timeOfLastClick > 1000) {
      setActiveSection(sectionName);
    }
  }, [inView, setActiveSection, timeOfLastClick, sectionName]);

  return { ref };
}
