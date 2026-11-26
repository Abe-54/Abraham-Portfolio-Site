import { marketDashUrl, type Side } from "@/lib/content";

/**
 * One landing page per audience, at /for/<slug>. Each lists the same projects as the home page and
 * changes only what comes first: the hero, which side's work leads, and the toolkit's order. A second
 * domain can later serve one of these at its root without new pages.
 */
export type Variant = {
  slug: "frontend" | "games";
  /** The browser tab title, before the site's " · Abraham Rubio". */
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  subline: string;
  cta: { label: string; href: string; external?: boolean };
  /** The side whose projects and toolkit come right after the hero. The other side follows. */
  lead: Side;
  /** One sentence that opens the other side's section, so the second half reads as a footnote. */
  counterpart: string;
  toolkit: string[][];
};

export const variants: Variant[] = [
  {
    slug: "frontend",
    title: "Frontend engineer",
    description: "I'm Abraham Rubio, a software engineer at NJ DCA. I build React, TypeScript, and Next.js apps focused on performance and accessibility, including NJ HOMES.",
    eyebrow: "Frontend engineer",
    headline: "I build fast, accessible web apps.",
    subline: "At NJ DCA I ship React, TypeScript, and Next.js software, including NJ HOMES, which helps New Jersey towns plan affordable housing.",
    cta: { label: "See my projects", href: "#work" },
    lead: "day",
    counterpart: "By night I make games in Unity and C#, including Market Dash, a grocery-store platformer I shipped with four teammates.",
    toolkit: [
      ["TypeScript", "React", "Next.js", "CSS", "JavaScript"],
      ["Prisma", "MapLibre", "AWS"],
      ["C#", "Unity"],
    ],
  },
  {
    slug: "games",
    title: "Gameplay and UI programmer",
    description: "I'm Abraham Rubio, a Unity and C# game programmer. I built movement, UI, and editor tools for Market Dash, plus a multiplayer climate game as a NASA intern.",
    eyebrow: "Game programmer",
    headline: "Games and interactive UI in Unity.",
    subline: "As lead programmer, I worked with four teammates over nine months to ship Market Dash in Unity and C#, playable on itch.io.",
    cta: { label: "Play Market Dash", href: marketDashUrl, external: true },
    lead: "night",
    counterpart: "By day I ship production React and Next.js software for New Jersey, including NJ HOMES and an AI workspace for state staff.",
    toolkit: [
      ["Unity", "C#", "Photoshop"],
      ["TypeScript", "React", "Next.js", "CSS"],
      ["Java", "Python"],
    ],
  },
];

export function findVariant(slug: string) {
  return variants.find((variant) => variant.slug === slug);
}
