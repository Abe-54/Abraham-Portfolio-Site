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

type Span = { left: number; width: number };

function useStretchPill(activeIndex: number) {
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const previous = useRef<Span | null>(null);

  useLayoutEffect(() => {
    const pill = pillRef.current;
    const target = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    if (!pill) return;
    if (activeIndex < 0 || !target) {
      pill.style.opacity = "0";
      previous.current = null;
      return;
    }
    const next = { left: target.offsetLeft, width: target.offsetWidth };
    pill.style.left = `${next.left}px`;
    pill.style.width = `${next.width}px`;
    pill.style.opacity = "1";
    const from = previous.current;
    previous.current = next;
    if (!from || from.left === next.left) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const spanLeft = Math.min(from.left, next.left);
    const spanRight = Math.max(from.left + from.width, next.left + next.width);
    pill.animate(
      [
        { transform: `translateX(${from.left - next.left}px) scaleX(${from.width / next.width})` },
        {
          transform: `translateX(${spanLeft - next.left}px) scaleX(${(spanRight - spanLeft) / next.width})`,
          offset: 0.45,
        },
        { transform: "none" },
      ],
      { duration: 300, easing: "cubic-bezier(0.77, 0, 0.175, 1)" },
    );
  }, [activeIndex]);

  return { listRef, pillRef };
}

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeIndex = links.findIndex((link) => link.page && pathname.startsWith(link.href));
  const { listRef, pillRef } = useStretchPill(activeIndex);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="relative z-30 border-b border-hairline bg-ground">
      <nav aria-label="Main" className="shell flex h-[72px] items-center justify-between lg:h-24">
        <Link
          href="/"
          className="font-display text-[20px] leading-7 font-extrabold tracking-[-0.02em] lg:text-[22px]"
        >
          Abraham Rubio
        </Link>

        <div className="flex items-center gap-3 lg:gap-6">
          <div className="relative hidden lg:block">
            <span ref={pillRef} aria-hidden="true" className="nav-pill" />
            <ul ref={listRef} className="flex items-center gap-2">
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
          <a href={contact.resume} target="_blank" rel="noopener" className="btn btn-outline press hidden min-h-11 py-2.5 lg:inline-flex">
            Résumé ↓
          </a>
          <ThemeSwitch />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="btn btn-outline press min-h-11 px-4 py-2 lg:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      <div id="mobile-menu" data-open={menuOpen || undefined} inert={!menuOpen} className="mobile-menu lg:hidden">
        <ul className="shell flex flex-col pt-2 pb-6">
          {links.map((link, index) => (
            <li key={link.href} className="border-b border-hairline">
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
