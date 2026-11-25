import type { Metadata } from "next";
import { Bricolage_Grotesque, Press_Start_2P } from "next/font/google";
import "./lab.css";

// The 8-bit pieces and TextPressure each fetch a font from Google at runtime as shipped; here both are
// self-hosted like the rest of the site. Bricolage loads its width axis too, which TextPressure squeezes.
const retro = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-retro" });
const wide = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz", "wdth"], variable: "--font-wide" });

export const metadata: Metadata = {
  title: "Flare lab",
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${retro.variable} ${wide.variable}`}>{children}</div>;
}
