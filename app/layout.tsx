import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist_Mono, Inter_Tight } from "next/font/google";
import Footer from "@/components/footer";
import Nav from "@/components/nav";
import RevealObserver from "@/components/reveal-observer";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz"], variable: "--font-bricolage" });
const body = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: { default: "Abraham Rubio", template: "%s · Abraham Rubio" },
  description: "Full-stack developer by day, indie game dev by night. Newark, NJ.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

const themeScript = `document.documentElement.classList.add("js");try{var t=localStorage.getItem("theme");if(t!=="day"&&t!=="night")t=matchMedia("(prefers-color-scheme: dark)").matches?"night":"day";document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Nav />
        {children}
        <Footer />
        <RevealObserver />
        <Analytics />
      </body>
    </html>
  );
}
