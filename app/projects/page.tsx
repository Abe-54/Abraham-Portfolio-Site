import type { Metadata } from "next";
import ProjectFilter from "@/components/project-filter";

export const metadata: Metadata = {
  title: "Projects",
  description: "Public-service software by day, games by night.",
};

export default function ProjectsPage() {
  return (
    <main id="main" tabIndex={-1}>
      <ProjectFilter />
    </main>
  );
}
