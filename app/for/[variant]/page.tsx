import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GooFlood from "@/components/goo-flood";
import History from "@/components/history";
import WorkSection from "@/components/work-section";
import { contact } from "@/lib/content";
import { findVariant, variants } from "@/lib/variants";

type Props = { params: Promise<{ variant: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return variants.map((variant) => ({ variant: variant.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const variant = findVariant((await params).variant);
  if (!variant) return {};
  return {
    title: variant.title,
    description: variant.description,
    // Each landing page is its own original. If a second domain serves one later, point this there.
    alternates: { canonical: `/for/${variant.slug}` },
  };
}

export default async function VariantPage({ params }: Props) {
  const variant = findVariant((await params).variant);
  if (!variant) notFound();
  const trail = variant.lead === "day" ? "night" : "day";

  return (
    <main id="main" tabIndex={-1}>
      <section aria-labelledby="variant-title" className="shell flex flex-col gap-8 pt-10 pb-16 lg:pt-20 lg:pb-24">
        <div className="flex max-w-[860px] flex-col gap-4">
          <p className="t-label">{variant.eyebrow}</p>
          <h1 id="variant-title" className="t-hero hero-title">
            {variant.headline}
          </h1>
          <p className="hero-text">{variant.subline}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <a
            href={variant.cta.href}
            {...(variant.cta.external ? { target: "_blank", rel: "noopener" } : {})}
            className="btn btn-solid hero-btn press"
          >
            <GooFlood id="flood-variant" />
            {variant.cta.label}
          </a>
          <a href={contact.resume} target="_blank" rel="noopener" className="btn btn-outline hero-btn press">
            <GooFlood id="flood-variant-resume" />
            Résumé ↓
          </a>
        </div>
      </section>

      <WorkSection side={variant.lead} toolkit={variant.toolkit} />
      <WorkSection side={trail} lede={variant.counterpart} />
      <History />
    </main>
  );
}
