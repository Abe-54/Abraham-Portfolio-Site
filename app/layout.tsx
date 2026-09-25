import Dock from "@/components/dock";
import EasterEggs from "@/components/easter-eggs";
import Footer from "@/components/footer";
import ActiveSectionContextProvider from "@/context/active-section-context";
import ThemeContextProvider from "@/context/theme-context";
import WindowContextProvider from "@/context/window-context";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { JetBrains_Mono, Lexend } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const lexend = Lexend({ subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://abraham-r.vercel.app"),
  title: "Abraham Rubio · Software Engineer",
  description:
    "Abraham Rubio is a software engineer in Newark, NJ focused on frontend and interactive UI, with a background in game development and a NASA internship.",
  openGraph: {
    title: "Abraham Rubio · Software Engineer",
    description:
      "Frontend and interactive UI, built with a game developer's eye for feel.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${mono.variable}`}>
      <body
        suppressHydrationWarning={true}
        className={`${lexend.className} relative overflow-x-hidden`}
      >
        <div aria-hidden className="bg-grid pointer-events-none fixed inset-0 -z-20" />
        <div className="absolute -top-24 right-44 -z-10 h-101 w-101 rounded-full bg-[#e2fbf8] blur-[10rem] sm:w-275 dark:bg-[#3d4f73]" />
        <div className="absolute -left-140 -top-4 -z-10 h-101 w-120 rounded-full bg-[#dbd7fb] blur-[10rem] sm:w-275 md:-left-132 lg:-left-112 xl:-left-60 2xl:-left-20 dark:bg-[#45406e]" />

        <ThemeContextProvider>
          <ActiveSectionContextProvider>
            <WindowContextProvider>
              {children}
              <Footer />
              <Dock />
              <EasterEggs />
              <Analytics />
              <Toaster position="top-center" />
            </WindowContextProvider>
          </ActiveSectionContextProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}
