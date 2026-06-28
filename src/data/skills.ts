export interface SkillGroup {
  /** short pixel-HUD label shown above the group */
  label: string;
  heading: string;
  blurb?: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    label: "LANG",
    heading: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "Java", "C#", "SQL"],
  },
  {
    label: "UI",
    heading: "Frontend",
    items: ["Next.js", "React", "Tailwind CSS", "shadcn/ui", "HTML", "CSS"],
  },
  {
    label: "API",
    heading: "Backend / Systems",
    items: [
      "Node.js",
      "Express.js",
      "REST APIs",
      "RAG Systems",
      "Authentication",
      "Document Processing",
    ],
  },
  {
    label: "CLOUD",
    heading: "Cloud / Databases",
    items: [
      "AWS",
      "AWS Amplify",
      "PostgreSQL",
      "Azure Database for PostgreSQL",
      "Firebase",
    ],
  },
  {
    label: "TOOLS",
    heading: "Developer Tools",
    items: ["Git", "GitHub", "Linear", "Figma", "axe", "Unity"],
  },
];
