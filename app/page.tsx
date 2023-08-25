import About from "@/components/about";
import Contact from "@/components/contact";
import DownButton from "@/components/down-btn";
import Intro from "@/components/intro";
import Projects from "@/components/projects";
import SectionDivider from "@/components/section-divider";
import Skills from "@/components/skills";

export default function Home() {
  return (
    <main className="flex flex-col items-center px-4">
      <Intro />

      <DownButton />

      {/* <SectionDivider /> */}
      <About />
      <Projects />
      <Skills />
      <Contact />
    </main>
  );
}