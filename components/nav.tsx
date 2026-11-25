"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { showNotes } from "@/lib/content";
import { NavGoo, type GooBox } from "./nav-goo";
import ThemeSwitch from "./theme-switch";

// In page order. On the home page every link glides to its section (`hash`); elsewhere Projects and
// Notes open their own pages. `section` matches the data-nav marks on the home page's sections.
const links = [
  { label: "About", section: "about", hash: "#about" },
  { label: "Projects", section: "projects", hash: "#work", page: "/projects" },
  ...(showNotes ? [{ label: "Notes", section: "notes", hash: "#notes", page: "/notes" }] : []),
  { label: "History", section: "history", hash: "#history" },
  { label: "Contact", section: "contact", hash: "#contact" },
];

/**
 * The section of the home page being read with the page scrolled to `y`: the last mark whose top has
 * passed 40% of the window. At the very bottom the last marks can never get that high, so the last one
 * on screen counts instead.
 */
function sectionAt(y: number): string | null {
  const marks = Array.from(document.querySelectorAll<HTMLElement>("[data-nav]"));
  const shift = y - window.scrollY;
  const line = window.innerHeight * 0.4;
  let current: string | null = null;
  for (const mark of marks) {
    if (mark.getBoundingClientRect().top - shift <= line) current = mark.dataset.nav ?? null;
  }
  const last = marks[marks.length - 1];
  const bottom = y + window.innerHeight >= document.documentElement.scrollHeight - 2;
  if (last && bottom && last.getBoundingClientRect().top - shift < window.innerHeight) current = last.dataset.nav ?? null;
  return current;
}

/** Where a click scrolls the page to, when it follows a link to a spot on the page already open. */
function glideTarget(event: MouseEvent): number | null {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!(link instanceof HTMLAnchorElement) || link.hasAttribute("download")) return null;
  if (link.target && link.target !== "_self") return null;
  const url = new URL(link.href);
  const here = window.location;
  if (url.origin !== here.origin || url.pathname !== here.pathname || url.search !== here.search) return null;
  if (!url.hash) return 0;
  const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!target) return null;
  const root = document.documentElement;
  const gap = (parseFloat(getComputedStyle(root).scrollPaddingTop) || 0) + (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
  const top = target.getBoundingClientRect().top + window.scrollY - gap;
  return Math.min(Math.max(0, top), root.scrollHeight - root.clientHeight);
}

/**
 * The home page's section in view, or undefined until it has been measured (and off the home page).
 * A click on a link to a spot on the page (a nav link, the name, the hero's button) settles the section
 * at once, from where the page will stop, and holds it until the glide ends: the goo goes straight
 * there instead of stopping at every section the page passes on the way.
 */
function useSectionInView(enabled: boolean) {
  const [section, setSection] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    if (!enabled) {
      setSection(undefined);
      return;
    }
    // Measured on the next frame, after the router has scrolled to a #section it was sent to.
    let frame = 0;
    let holding = false;
    let idle = 0;
    const measure = () => {
      frame = 0;
      setSection(sectionAt(window.scrollY));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const release = () => {
      holding = false;
      schedule();
    };
    const onScroll = () => {
      if (!holding) return schedule();
      window.clearTimeout(idle);
      idle = window.setTimeout(release, 150);
    };
    // Capture sees the click before the router or the same-page handler in route-scroll.tsx acts on it.
    const onClick = (event: MouseEvent) => {
      const y = glideTarget(event);
      if (y === null) return;
      holding = true;
      cancelAnimationFrame(frame);
      frame = 0;
      setSection(sectionAt(y));
      // Long enough for the glide to start; each scroll event then extends it.
      window.clearTimeout(idle);
      idle = window.setTimeout(release, 400);
    };
    schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, [enabled]);
  return section;
}

/** A link's box in the row's padding box, where the goo layers sit. */
function boxOf(row: HTMLElement, link: Element | undefined): GooBox | null {
  if (!(link instanceof HTMLElement)) return null;
  const r = row.getBoundingClientRect();
  const l = link.getBoundingClientRect();
  if (l.width === 0) return null;
  return {
    cx: l.left + l.width / 2 - r.left - row.clientLeft,
    cy: l.top + l.height / 2 - r.top - row.clientTop,
    w: l.width,
    h: l.height,
  };
}

/**
 * When the links outgrow the chip (phones) their strip scrolls sideways. This scrolls it just enough to
 * show the link, with the edge of the next one, so it is clear the strip goes on.
 */
function reveal(track: HTMLElement, link: Element | undefined, smooth: boolean) {
  if (!(link instanceof HTMLElement) || track.scrollWidth <= track.clientWidth + 1) return;
  const margin = 32;
  const fromLeft = link.offsetLeft - margin;
  const fromRight = link.offsetLeft + link.offsetWidth + margin - track.clientWidth;
  const left = Math.min(Math.max(track.scrollLeft, fromRight), fromLeft);
  if (Math.abs(left - track.scrollLeft) < 1) return;
  track.scrollTo({ left, behavior: smooth ? "smooth" : "instant" });
}

/** Marks which ends of the strip have links scrolled out of view, for the fade there (nav.css). */
function markEdges(track: HTMLElement) {
  const max = track.scrollWidth - track.clientWidth;
  const start = max > 1 && track.scrollLeft > 1;
  const end = max > 1 && track.scrollLeft < max - 1;
  const fade = start && end ? "both" : start ? "start" : end ? "end" : "";
  if ((track.dataset.fade ?? "") === fade) return;
  if (fade) track.dataset.fade = fade;
  else delete track.dataset.fade;
}

function GooLayer({ filter }: { filter?: boolean }) {
  return (
    <svg className="nav-goo" aria-hidden="true">
      {filter ? (
        <defs>
          <filter id="nav-goo-filter" x="-50%" y="-100%" width="200%" height="300%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 12 -5.5" />
          </filter>
        </defs>
      ) : null}
      <g filter="url(#nav-goo-filter)">
        <rect className="nav-blob" width="0" height="0" />
        <rect className="nav-blob" width="0" height="0" />
        <rect className="nav-blob" width="0" height="0" />
      </g>
    </svg>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const nameRef = useRef<HTMLAnchorElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const gooRef = useRef<NavGoo | null>(null);
  const placedRef = useRef(false);
  // The link the goo marks, or -1, for the resize observer below.
  const currentIndex = useRef(-1);

  const pageIndex = links.findIndex((link) => link.page && pathname.startsWith(link.page));
  const home = pathname === "/";
  const section = useSectionInView(home);
  // On the home page the goo follows the section being read; elsewhere it marks the page. While the
  // section is still unmeasured the goo stays where it is.
  const gooIndex = home ? (section === undefined ? undefined : links.findIndex((link) => link.section === section)) : pageIndex;

  // Once the name has scrolled out of view its initials dock in the chip, so the way home stays on
  // screen (nav.css). They leave again as the name comes back.
  useEffect(() => {
    const name = nameRef.current;
    const chip = chipRef.current;
    if (!name || !chip || typeof IntersectionObserver !== "function") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) delete chip.dataset.docked;
      else chip.dataset.docked = "";
    });
    observer.observe(name);
    return () => {
      observer.disconnect();
      delete chip.dataset.docked;
    };
  }, []);

  // Reading down the page, the chip and the switch tuck away above the window so they never sit over
  // the words; scrolling back up or tabbing into them brings them back. Only a scroll the visitor drives
  // tucks them, so a glide to a section after a click keeps the goo in view.
  useEffect(() => {
    const float = floatRef.current;
    const name = nameRef.current;
    if (!float || !name) return;
    let lastY = window.scrollY;
    let drivenAt = -Infinity;
    const driven = () => (drivenAt = performance.now());
    const show = () => delete float.dataset.tucked;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      if (Math.abs(dy) < 6) return;
      lastY = y;
      if (dy < 0 || name.getBoundingClientRect().bottom > 0) show();
      else if (performance.now() - drivenAt < 500 && !float.contains(document.activeElement)) float.dataset.tucked = "";
    };
    const inputs = ["wheel", "touchmove", "keydown"] as const;
    inputs.forEach((type) => window.addEventListener(type, driven, { passive: true }));
    window.addEventListener("scroll", onScroll, { passive: true });
    float.addEventListener("focusin", show);
    return () => {
      inputs.forEach((type) => window.removeEventListener(type, driven));
      window.removeEventListener("scroll", onScroll);
      float.removeEventListener("focusin", show);
      show();
    };
  }, []);

  // The goo replaces the CSS fill of the current page's link (the fill shows without JS).
  useLayoutEffect(() => {
    const chip = chipRef.current;
    const track = trackRef.current;
    const row = rowRef.current;
    if (!chip || !track || !row) return;
    const layers = Array.from(row.querySelectorAll(".nav-goo"));
    const parts = [0, 1, 2].map((part) => layers.map((layer) => layer.querySelectorAll<SVGRectElement>(".nav-blob")[part]));
    const goo = new NavGoo(parts);
    gooRef.current = goo;
    chip.dataset.goo = "";
    const linkAt = (index: number) => listRef.current?.children[index]?.firstElementChild ?? undefined;
    // Fonts arriving or the window resizing move the links; the goo follows them. When the strip
    // narrows (the initials docking on a phone) the marked link stays in view. The chip's height is
    // also the space anchor jumps leave at the top (nav.css); only a new height is written, since the
    // root's style changing restyles the whole page.
    let chipHeight = 0;
    const observer = new ResizeObserver(() => {
      const index = currentIndex.current;
      goo.refit(index >= 0 ? boxOf(row, linkAt(index)) : null);
      if (index >= 0) reveal(track, linkAt(index), false);
      markEdges(track);
      if (chip.offsetHeight === chipHeight) return;
      chipHeight = chip.offsetHeight;
      document.documentElement.style.setProperty("--chip-h", `${chipHeight}px`);
    });
    for (const element of [chip, track, row]) observer.observe(element);
    const onScroll = () => markEdges(track);
    // A link reached with Tab comes fully into view; browsers leave one at the cut edge half hidden.
    const onFocus = (event: FocusEvent) => {
      reveal(track, event.target as Element, !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    track.addEventListener("focusin", onFocus);
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("focusin", onFocus);
      goo.stop();
      gooRef.current = null;
      delete chip.dataset.goo;
      document.documentElement.style.removeProperty("--chip-h");
    };
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const row = rowRef.current;
    const goo = gooRef.current;
    if (gooIndex === undefined || !track || !row || !goo) return;
    currentIndex.current = gooIndex;
    const link = gooIndex >= 0 ? (listRef.current?.children[gooIndex]?.firstElementChild ?? undefined) : undefined;
    // The first mark is simply there, matching the fill it replaces.
    const animate = placedRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    placedRef.current = true;
    goo.set(link ? boxOf(row, link) : null, animate);
    reveal(track, link, animate);
  }, [gooIndex]);

  return (
    <>
      <header className="site-head">
        <div className="shell site-head-row">
          <Link ref={nameRef} href="/" className="site-name">
            Abraham Rubio
          </Link>
        </div>
      </header>

      {/* The links and the theme switch float on their own and stay on screen: in the header row on
          wide screens, the switch at its end; under it on phones, side by side. */}
      <div ref={floatRef} className="nav-float">
        <nav ref={chipRef} aria-label="Main" className="nav-chip">
          <Link href="/" aria-label="Abraham Rubio" className="nav-home">
            <span aria-hidden="true">A</span>
            <span aria-hidden="true">R</span>
          </Link>
          {/* On a phone the links can outgrow the chip; their strip then scrolls sideways in it. */}
          <div ref={trackRef} className="nav-track">
            <div ref={rowRef} className="nav-row">
              <ul ref={listRef} className="nav-list">
                {links.map((link, index) => (
                  <li key={link.label} className="flex">
                    <Link
                      href={home || !link.page ? `/${link.hash}` : link.page}
                      aria-current={index === pageIndex ? (pathname === link.page ? "page" : "true") : undefined}
                      className="nav-link"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* The blue goo covers the link it marks; the white copy of the labels shows only inside it. */}
              <GooLayer filter />
              <div className="nav-ink" aria-hidden="true" inert>
                <GooLayer />
                <div className="nav-ink-text">
                  <ul className="nav-list">
                    {links.map((link) => (
                      <li key={link.label} className="flex">
                        <span className="nav-link">{link.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="nav-switch">
          <ThemeSwitch />
        </div>
      </div>
    </>
  );
}
