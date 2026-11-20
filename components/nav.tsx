"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavGoo, type GooBox } from "./nav-goo";
import ThemeSwitch from "./theme-switch";

// `section` matches the data-nav marks on the home page's sections.
const links = [
  { label: "Projects", href: "/projects", section: "projects" },
  { label: "Notes", href: "/notes", section: "notes" },
  { label: "About", href: "/#about", section: "about" },
  { label: "Contact", href: "/#contact", section: "contact" },
];

/**
 * The section of the home page being read: the last mark whose top has passed 40% of the window. At
 * the very bottom the last marks can never get that high, so the last one on screen counts instead.
 */
function sectionInView(): string | null {
  const marks = Array.from(document.querySelectorAll<HTMLElement>("[data-nav]"));
  const line = window.innerHeight * 0.4;
  let current: string | null = null;
  for (const mark of marks) {
    if (mark.getBoundingClientRect().top <= line) current = mark.dataset.nav ?? null;
  }
  const root = document.documentElement;
  const last = marks[marks.length - 1];
  if (last && window.scrollY + window.innerHeight >= root.scrollHeight - 2 && last.getBoundingClientRect().top < window.innerHeight) {
    current = last.dataset.nav ?? null;
  }
  return current;
}

/** The home page's section in view, or undefined until it has been measured (and off the home page). */
function useSectionInView(enabled: boolean) {
  const [section, setSection] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    if (!enabled) {
      setSection(undefined);
      return;
    }
    // Measured on the next frame, after the router has scrolled to a #section it was sent to.
    let frame = 0;
    const measure = () => {
      frame = 0;
      setSection(sectionInView());
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled]);
  return section;
}

/** A link's box in the chip's padding box, where the goo layers sit. */
function boxOf(chip: HTMLElement, link: Element | undefined): GooBox | null {
  if (!(link instanceof HTMLElement)) return null;
  const c = chip.getBoundingClientRect();
  const l = link.getBoundingClientRect();
  if (l.width === 0) return null;
  return {
    cx: l.left + l.width / 2 - c.left - chip.clientLeft,
    cy: l.top + l.height / 2 - c.top - chip.clientTop,
    w: l.width,
    h: l.height,
  };
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
  const chipRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const gooRef = useRef<NavGoo | null>(null);
  const placedRef = useRef(false);
  // The link the goo marks, or -1, for the resize observer below.
  const currentIndex = useRef(-1);

  const pageIndex = links.findIndex((link) => !link.href.includes("#") && pathname.startsWith(link.href));
  const home = pathname === "/";
  const section = useSectionInView(home);
  // On the home page the goo follows the section being read; elsewhere it marks the page. While the
  // section is still unmeasured the goo stays where it is.
  const gooIndex = home ? (section === undefined ? undefined : links.findIndex((link) => link.section === section)) : pageIndex;

  // The goo replaces the CSS fill of the current page's link (the fill shows without JS).
  useLayoutEffect(() => {
    const chip = chipRef.current;
    if (!chip) return;
    const layers = Array.from(chip.querySelectorAll(".nav-goo"));
    const parts = [0, 1, 2].map((part) => layers.map((layer) => layer.querySelectorAll<SVGRectElement>(".nav-blob")[part]));
    const goo = new NavGoo(parts);
    gooRef.current = goo;
    chip.dataset.goo = "";
    const target = () => {
      const index = currentIndex.current;
      return index >= 0 ? boxOf(chip, listRef.current?.children[index]?.firstElementChild ?? undefined) : null;
    };
    // Fonts arriving or the window resizing move the links; the goo follows them. The chip's height is
    // also the space anchor jumps leave at the top (nav.css).
    const observer = new ResizeObserver(() => {
      goo.refit(target());
      document.documentElement.style.setProperty("--chip-h", `${chip.offsetHeight}px`);
    });
    observer.observe(chip);
    if (listRef.current) observer.observe(listRef.current);
    return () => {
      observer.disconnect();
      goo.stop();
      gooRef.current = null;
      delete chip.dataset.goo;
      document.documentElement.style.removeProperty("--chip-h");
    };
  }, []);

  useLayoutEffect(() => {
    const chip = chipRef.current;
    const goo = gooRef.current;
    if (gooIndex === undefined || !chip || !goo) return;
    currentIndex.current = gooIndex;
    const box = gooIndex >= 0 ? boxOf(chip, listRef.current?.children[gooIndex]?.firstElementChild ?? undefined) : null;
    // The first mark is simply there, matching the fill it replaces.
    const animate = placedRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    placedRef.current = true;
    goo.set(box, animate);
  }, [gooIndex]);

  return (
    <>
      <header className="site-head">
        <div className="shell site-head-row">
          <Link href="/" className="site-name">
            Abraham Rubio
          </Link>
          <ThemeSwitch />
        </div>
      </header>

      {/* The links float on their own and stay on screen: in the header row on wide screens, under it
          on phones. */}
      <nav aria-label="Main" className="nav-float">
        <div ref={chipRef} className="nav-chip">
          <ul ref={listRef} className="nav-list">
            {links.map((link, index) => (
              <li key={link.href} className="flex">
                <Link href={link.href} aria-current={index === pageIndex ? "page" : undefined} className="nav-link">
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
                  <li key={link.href} className="flex">
                    <span className="nav-link">{link.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
