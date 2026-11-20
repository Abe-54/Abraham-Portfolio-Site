import { contact } from "@/lib/content";
import EmailCopy from "./email-copy";

export default function Footer() {
  return (
    <footer id="contact" data-nav="contact" className="grid scroll-mt-4 lg:grid-cols-2">
      <div data-tone="day" className="flex flex-col gap-5 border-t-[1.5px] border-rule pr-[var(--gutter)] pl-[var(--shell-pad-half)] py-14 lg:py-[72px] lg:pr-14">
        <h2 className="font-display text-[40px] leading-[1.04] font-extrabold tracking-[-0.035em] lg:text-[56px]">
          Say hi, any shift.
        </h2>
        <EmailCopy email={contact.email} />
      </div>
      <div
        data-tone="night"
        className="flex flex-col justify-end gap-3 pr-[var(--shell-pad-half)] pl-[var(--gutter)] py-12 lg:items-end lg:py-[72px]"
      >
        <ul className="flex flex-wrap items-center font-medium">
          {contact.links.map((link, index) => (
            <li key={link.label} className="flex items-center">
              {index > 0 ? (
                <span aria-hidden="true" className="px-2 text-muted">
                  ·
                </span>
              ) : null}
              <a
                href={link.href}
                target="_blank"
                rel="noopener"
                className="footer-link inline-flex min-h-11 items-center"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="t-label">© 2026 Abraham Rubio</p>
      </div>
    </footer>
  );
}
