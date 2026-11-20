"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { contact } from "@/lib/content";
import ThemeSwitch from "./theme-switch";

const links = [
  { label: "Projects", href: "/projects", page: true },
  { label: "Notes", href: "/notes", page: true },
  { label: "About", href: "/#about", page: false },
  { label: "Contact", href: "/#contact", page: false },
];

// Route changes started from the keyboard move the active fill at once; pointer navigation stretches it.
let lastInput: "pointer" | "keyboard" = "pointer";

/**
 * The active link always carries its own fill, so it reads on every frame, with or without JS. On a
 * pointer route change between two page links a ghost pill stretches from the old link to the new one
 * and disappears into the new link's fill.
 */
function useStretchPill(activeIndex: number) {
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const previousIndex = useRef(activeIndex);

  useLayoutEffect(() => {
    const fromIndex = previousIndex.current;
    previousIndex.current = activeIndex;
    const pill = pillRef.current;
    const list = listRef.current;
    if (!pill || !list || fromIndex === activeIndex || fromIndex < 0 || activeIndex < 0) return;
    if (lastInput === "keyboard" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const from = list.children[fromIndex] as HTMLElement | undefined;
    const to = list.children[activeIndex] as HTMLElement | undefined;
    // The desktop list is display:none below the lg breakpoint, so it measures 0 there.
    if (!from || !to || to.offsetWidth === 0) return;
    const next = { left: to.offsetLeft, width: to.offsetWidth };
    const spanLeft = Math.min(from.offsetLeft, next.left);
    const spanRight = Math.max(from.offsetLeft + from.offsetWidth, next.left + next.width);
    pill.style.left = `${next.left}px`;
    pill.style.width = `${next.width}px`;
    pill.getAnimations().forEach((animation) => animation.cancel());
    pill.animate(
      [
        { opacity: 1, transform: `translateX(${from.offsetLeft - next.left}px) scaleX(${from.offsetWidth / next.width})` },
        {
          opacity: 1,
          transform: `translateX(${spanLeft - next.left}px) scaleX(${(spanRight - spanLeft) / next.width})`,
          offset: 0.45,
        },
        { opacity: 1, transform: "none" },
      ],
      { duration: 300, easing: "cubic-bezier(0.77, 0, 0.175, 1)" },
    );
  }, [activeIndex]);

  return { listRef, pillRef };
}

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeIndex = links.findIndex((link) => link.page && pathname.startsWith(link.href));
  const { listRef, pillRef } = useStretchPill(activeIndex);

  useEffect(() => setMenuOpen(false), [pathname]);

  // The page keeps a set space at the top for the nav (--nav-space). Enlarged text can wrap the nav
  // onto a second row, so the space grows to fit whatever the nav measures.
  useEffect(() => {
    const row = headerRef.current?.querySelector<HTMLElement>(".nav-row");
    if (!row) return;
    const root = document.documentElement;
    const fit = () => {
      root.style.removeProperty("--nav-space");
      const preset = parseFloat(getComputedStyle(root).getPropertyValue("--nav-space"));
      const needed = Math.ceil(row.getBoundingClientRect().bottom + 12);
      if (needed > preset) root.style.setProperty("--nav-space", `${needed}px`);
    };
    const observer = new ResizeObserver(fit);
    observer.observe(row);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--nav-space");
    };
  }, []);

  useEffect(() => {
    const onPointer = () => (lastInput = "pointer");
    const onKey = () => (lastInput = "keyboard");
    window.addEventListener("pointerdown", onPointer, { capture: true, passive: true });
    window.addEventListener("keydown", onKey, { capture: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", onPointer, { capture: true });
      window.removeEventListener("keydown", onKey, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Focus leaves the menu before it turns inert, so it lands on the button that opened it.
      menuButtonRef.current?.focus();
      setMenuOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || menuButtonRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  function closeOnFocusLeave(event: React.FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget as Node | null;
    if (!next || event.currentTarget.contains(next) || menuButtonRef.current?.contains(next)) return;
    setMenuOpen(false);
  }

  return (
    // The header holds the nav's place at the top of the page; the nav itself floats over the page
    // and stays on screen. The home hero slides up under it (hero.css).
    <header ref={headerRef} className="site-nav">
      <div aria-hidden="true" data-open={menuOpen || undefined} className="menu-scrim lg:hidden" />
      <nav aria-label="Main" className="nav-row">
        <Link href="/" className="nav-chip nav-name">
          Abraham Rubio
        </Link>

        <div className="nav-chip nav-links">
          <div className="relative">
            <span ref={pillRef} aria-hidden="true" className="nav-pill" />
            <ul ref={listRef} className="flex items-center gap-0.5">
              {links.map((link, index) => (
                <li key={link.href} className="flex">
                  <Link
                    href={link.href}
                    aria-current={index === activeIndex ? "page" : undefined}
                    className="nav-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="nav-chip nav-tools">
          <ThemeSwitch />
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="menu-toggle press lg:hidden"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {/* Without JS the menu cannot open, so every width gets the link chip, on its own row on a phone. */}
      <noscript
        dangerouslySetInnerHTML={{
          __html:
            "<style>.nav-tools{display:none}.nav-links{display:flex}:root{--nav-space:144px}" +
            "@media (min-width:64rem){:root{--nav-space:96px}}</style>",
        }}
      />

      <div
        ref={menuRef}
        id="mobile-menu"
        data-open={menuOpen || undefined}
        inert={!menuOpen}
        onBlur={closeOnFocusLeave}
        className="mobile-menu lg:hidden"
      >
        <ul className="flex flex-col">
          {links.map((link, index) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={index === activeIndex ? "page" : undefined}
                className="mobile-menu-link"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <a href={contact.resume} target="_blank" rel="noopener" className="mobile-menu-link">
              Résumé ↓
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
