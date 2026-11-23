import { contact } from "@/lib/content";
import EmailCopy from "./email-copy";
import FooterPuddle from "./footer-puddle";
import GooInk from "./goo-ink";
import GooPool from "./goo-pool";
import GooWire from "./goo-wire";
import withDrop from "./with-drop";

export default function Footer() {
  return (
    <footer id="contact" data-nav="contact" className="footer relative isolate grid scroll-mt-4 lg:grid-cols-2">
      <GooPool />
      <FooterPuddle />
      <div data-tone="day" className="flex flex-col gap-5 border-t-[1.5px] border-rule pr-[var(--gutter)] pl-[var(--shell-pad-half)] py-14 lg:py-[72px] lg:pr-14">
        <GooInk source="pool">
          <h2 className="font-display text-[40px] leading-[1.04] font-extrabold tracking-[-0.035em] lg:text-[56px]">
            {withDrop("Say hi, any shift.")}
          </h2>
        </GooInk>
        <GooInk source="pool">
          <EmailCopy email={contact.email} />
        </GooInk>
      </div>
      <div data-tone="night" className="footer-night flex flex-col gap-3 pr-[var(--shell-pad-half)] pl-[var(--gutter)] py-12 lg:items-end lg:justify-end lg:py-[72px]">
        <GooWire id="footer-links" shape="bar">
          <GooInk source="pool">
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
                    data-wire-item
                    className="footer-link inline-flex min-h-11 items-center"
                  >
                    <span data-wire-over>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </GooInk>
        </GooWire>
        <GooInk source="pool">
          <p className="t-label">© 2026 Abraham Rubio</p>
        </GooInk>
      </div>
    </footer>
  );
}
