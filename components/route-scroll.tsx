"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Next.js focuses the new page's <main> after a navigation. <main> is focusable for the skip link, and
 * focusing it scrolls its top edge, under the header, to the top of the viewport. A new page should
 * open at the very top with the header in view, so this puts the scroll back before the frame paints.
 * Back and Forward keep the position the browser restores, and links to a #section keep their jump.
 * It renders after the page in the layout, so its layout effect runs after the router's focus.
 *
 * A link to the page already open keeps the same path, so that effect cannot see it. Such a click goes
 * straight to the top here instead of through the router, with focus on <main> as the router would put it.
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

  useEffect(() => {
    // Capture on document runs before React's handlers, so the Link sees the click already handled.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.hasAttribute("download")) return;
      if (link.target && link.target !== "_self") return;
      const url = new URL(link.href);
      const here = window.location;
      if (url.origin !== here.origin || url.pathname !== here.pathname || url.search !== here.search || url.hash) return;
      event.preventDefault();
      if (here.hash) window.history.pushState(null, "", url.pathname + url.search);
      window.scrollTo(0, 0);
      document.getElementById("main")?.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
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
