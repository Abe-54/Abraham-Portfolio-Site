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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeIndex = links.findIndex((link) => link.page && pathname.startsWith(link.href));
  const { listRef, pillRef } = useStretchPill(activeIndex);

  useEffect(() => setMenuOpen(false), [pathname]);

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
    <header className="relative z-30 border-b border-hairline bg-ground">
      <div aria-hidden="true" data-open={menuOpen || undefined} className="menu-scrim lg:hidden" />
      {/* The brand takes the free width and wraps before it can touch the controls. When even its
          longest word does not fit (large text), the controls move to their own line instead. */}
      <nav
        aria-label="Main"
        className="shell relative flex min-h-[72px] flex-wrap items-center gap-x-3 gap-y-1 bg-ground py-2 lg:min-h-24"
      >
        <div className="flex-[1_1_0%]">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center font-display text-[18px] leading-7 font-extrabold tracking-[-0.02em] min-[375px]:text-[20px] lg:text-[22px]"
          >
            Abraham Rubio
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3 lg:gap-6">
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
            ref={menuButtonRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="menu-toggle btn btn-outline press min-h-11 px-4 py-2 lg:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {/* Without JS the menu cannot open, so phones get the same links in the header flow. */}
      <noscript
        dangerouslySetInnerHTML={{
          __html:
            "<style>.menu-toggle,.goo-switch{display:none}</style>" +
            `<ul class="nojs-menu shell">${links
              .concat({ label: "Résumé ↓", href: contact.resume, page: false })
              .map((link) => `<li><a href="${link.href}">${link.label}</a></li>`)
              .join("")}</ul>`,
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
