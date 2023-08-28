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

      <html lang="en" className="!scroll-smooth">
        <body
          className={`${lexend.className}
      bg-gray-50 text-lightMode-accent relative pt-5 sm:pt-0 dark:bg-darkMode-background dark:text-gray-50 dark:text-opacity-90 transition-all`}
        >
          <div className="bg-[#e2fbf8] absolute top-[-6rem] -z-10 right-[11rem] h-[25.25rem] w-[25.25rem] rounded-full blur-[10rem] sm:w-[68.75rem] dark:bg-[#627194]" />
          <div className="bg-[#dbd7fb] absolute top-[-1rem] -z-10 left-[-35rem] h-[25.25rem] w-[30rem] rounded-full blur-[10rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem] dark:bg-[#676394]" />

          <ThemeContextProvider>
            <ActiveSectionContextProvider>
              <Header />
              {children}
              <Analytics />
              <Toaster position="top-right" />
              <Footer />
              <ThemeSwitch />
            </ActiveSectionContextProvider>
          </ThemeContextProvider>
        </body>
      </html>
    </>
  );
}
