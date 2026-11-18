"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Next.js focuses the new page's <main> after a navigation. <main> is focusable for the skip link, and
 * focusing it scrolls its top edge, under the header, to the top of the viewport. A new page should
 * open at the very top with the header in view, so this puts the scroll back before the frame paints.
 * Back and Forward keep the position the browser restores, and links to a #section keep their jump.
 * It renders after the page in the layout, so its layout effect runs after the router's focus.
 */
export default function RouteScroll() {
  const pathname = usePathname();
  const firstRender = useRef(true);
  // The path a Back or Forward traversal is heading to.
  const traversal = useRef<string | null>(null);

  useEffect(() => {
    const onPopState = () => (traversal.current = window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useLayoutEffect(() => {
    const restoring = traversal.current === pathname;
    traversal.current = null;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (restoring || window.location.hash) return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
