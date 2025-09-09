import Footer from "@/components/footer";
import Header from "@/components/header";
import ThemeSwitch from "@/components/theme-switch";
import ActiveSectionContextProvider from "@/context/active-section-context";
import ThemeContextProvider from "@/context/theme-context";
import { Analytics } from "@vercel/analytics/react";
import { Inter, Lexend } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const lexend = Lexend({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Abraham | Personal Portfolio",
  description: "Abraham is a full-stack developer based in Newark, NJ.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/devicon.min.css"
        />
      </head>

      <html lang="en" className="scroll-smooth">
        <body
          suppressHydrationWarning={true}
          className={`${lexend.className} bg-gray-50 text-light-mode-accent relative pt-10 sm:pt-0 dark:bg-dark-mode-background dark:text-gray-50 dark:text-opacity-90 transition-all`}
        >
          <div className="bg-[#e2fbf8] absolute -top-24 -z-10 right-44 h-101 w-101 rounded-full blur-[10rem] sm:w-275 dark:bg-[#627194]" />
          <div className="bg-[#dbd7fb] absolute -top-4 -z-10 -left-140 h-101 w-120 rounded-full blur-[10rem] sm:w-275 md:-left-132 lg:-left-112 xl:-left-60 2xl:-left-20 dark:bg-[#676394]" />

          <ThemeContextProvider>
            <ActiveSectionContextProvider>
              <Header />
              {children}
              <Analytics />
              <Toaster position="top-right" />
              <Footer />
              <ThemeSwitch aria-pressed="false" aria-label="Toggle theme" />
            </ActiveSectionContextProvider>
          </ThemeContextProvider>
        </body>
      </html>
    </>
  );
}
