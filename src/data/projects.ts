export type ProjectKind = "web" | "game" | "ai" | "infra" | "bot" | "app";

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  title: string;
  kind: ProjectKind;
  /** one-line hook */
  blurb: string;
  description: string;
  role: string;
  period: string;
  tags: string[];
  links: ProjectLink[];
  /** path under /public, or null for a generated placeholder card */
  image: string | null;
  /** content for the generated card when there is no image */
  placeholder?: { line: string; note: string };
  featured?: boolean;
}

// Professional work (current role at NJDCA)
export const work: Project[] = [
  {
    title: "DCA AI Assistant",
    kind: "ai",
    blurb:
      "Internal AI chat tool for document retrieval using Retrieval-Augmented Generation (RAG), with admin approval and role-based access.",
    description:
      "Built full-stack features for the DCA AI Assistant — an internal AI chat tool, piloted by department users, that retrieves answers from administrator-approved documents using Retrieval-Augmented Generation (RAG). The system includes role-based authentication, document ingestion/chunking, OTP authentication, administrator approval workflows, and user-facing status handling for long-running or stalled AI operations.",
    role: "Software Engineer",
    period: "NJDCA · 2026",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "RAG", "Authentication", "AWS"],
    links: [],
    image: null,
    placeholder: { line: "/ask", note: "✓ grounded in approved docs" },
    featured: true,
  },
  {
    title: "NJ Eviction Guide — Next.js Rewrite",
    kind: "web",
    blurb:
      "Modernized a constituent-facing government app by rewriting it in Next.js with accessibility-first practices.",
    description:
      "Contributed to the NJ Eviction Guide rewrite to Next.js, helping modernize a constituent-facing government application with accessibility-first development practices. The rewrite improved maintainability, user experience, and data collection/tracking for public-facing workflows.",
    role: "Software Engineer",
    period: "NJDCA · 2026",
    tags: ["Next.js", "TypeScript", "Accessibility", "axe", "AWS", "PostgreSQL"],
    links: [],
    image: null,
    placeholder: { line: "next build", note: "✓ accessibility-first" },
    featured: true,
  },
];

// Personal / side projects
export const projects: Project[] = [
  {
    title: "Schedule Reader",
    kind: "bot",
    blurb:
      "AI-powered Discord bot that extracts employee schedules from images and automates calendar updates.",
    description:
      "Built a Discord bot using Python, discord.py, and Google Gemini to extract employee schedules from images and automate calendar updates from a single command. The bot uses image processing, slash commands, asynchronous workflows, loading states, and error handling to reduce manual schedule entry.",
    role: "Sole Developer",
    period: "Jul 2025 — Oct 2025",
    tags: ["Python", "discord.py", "Google Gemini", "Image Processing", "Automation"],
    links: [
      { label: "Source", href: "https://github.com/Abe-54/ScheduleDiscordBot" },
    ],
    image: null,
    placeholder: { line: "/schedule read", note: "✓ calendar updated" },
  },
  {
    title: "Market Dash",
    kind: "game",
    blurb: "A browser platformer shipped with a team of five in nine months.",
    description:
      "A third-person platformer built in Unity. As lead programmer I owned player movement, the game UI, and level design, and built custom Unity editor tools in C# that cut level-creation time by ~30%.",
    role: "Lead Programmer",
    period: "2024 — 2025",
    tags: ["Unity", "C#", "Game Design", "Editor Tools"],
    links: [{ label: "Play on itch.io", href: "https://abe-54.itch.io/market-dash" }],
    image: "/market_dash.png",
  },
  {
    title: "Service Journal",
    kind: "app",
    blurb:
      "Mobile app prototype for a landscaping business to streamline service tracking and client journal entries.",
    description:
      "Developed a mobile app prototype for a landscaping business using TypeScript, JavaScript, Firebase Authentication, Express.js, MySQL, and REST APIs. Built multi-stage journal entry forms and incorporated user feedback to improve client-specific service tracking workflows.",
    role: "Sole App Developer",
    period: "May 2023 — Sept 2023",
    tags: ["TypeScript", "JavaScript", "Firebase", "Express.js", "MySQL", "REST APIs"],
    links: [
      { label: "Source", href: "https://github.com/Abe-54/Service-Journal-App" },
    ],
    image: "/service_journal.png",
  },
];
