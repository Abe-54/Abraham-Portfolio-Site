import About from "@/components/about";
import Contact from "@/components/contact";
import Experience from "@/components/experience";
import Intro from "@/components/intro";
import Play from "@/components/play";
import Projects from "@/components/projects";

export default function Home() {
  return (
    <main className="flex flex-col items-center px-4">
      <Intro />
      <About />
      <Experience />
      <Projects />
      <Play />
      <Contact />
    </main>
  );
}
