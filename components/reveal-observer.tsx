"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Entrances play once per path per visit, so Back and Forward show content as it was left.
const SEEN_KEY = "entrances-seen";

function readSeen(): string[] {
  try {
    const seen = JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? "[]");
    return Array.isArray(seen) ? seen : [];
  } catch {
    return [];
  }
}

/** True once this path's entrances have played in this visit; then they stay put. */
export function entrancesSeen(path: string) {
  return readSeen().includes(path);
}

function markSeen(path: string) {
  try {
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...readSeen(), path]));
  } catch {}
}

/** Show every waiting entrance inside `root` now, for content that moves into view without scrolling. */
export function revealAll(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-entrance="pending"]').forEach((element) => {
    element.dataset.entrance = "shown";
  });
}

/**
 * Server HTML is fully visible. Only once this observer runs does it hide items that sit below the
 * fold, and it shows each one as it scrolls in. Items already on screen are never hidden.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver !== "function" || readSeen().includes(pathname)) return;
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!elements.length) return;
    const reported = new WeakSet<Element>();
    let marked = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!marked) {
          marked = true;
          markSeen(pathname);
        }
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (!reported.has(element)) {
            reported.add(element);
            if (entry.boundingClientRect.top >= window.innerHeight) {
              element.dataset.entrance = "pending";
              continue;
            }
            observer.unobserve(element);
            continue;
          }
          if (entry.isIntersecting) {
            element.dataset.entrance = "shown";
            observer.unobserve(element);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      elements.forEach((element) => {
        if (element.dataset.entrance === "pending") element.dataset.entrance = "shown";
      });
    };
  }, [pathname]);

  return null;
}
