export type EntryKind = "work" | "education" | "milestone";

export interface TimelineEntry {
  id: string;
  kind: EntryKind;
  role: string;
  org: string;
  location?: string;
  /** short display range, e.g. "2026 — Present" */
  period: string;
  /** sort key: higher = more recent (used to order desc) */
  order: number;
  current?: boolean;
  summary: string;
  bullets: string[];
  tags: string[];
  link?: { label: string; href: string };
}

export const timeline: TimelineEntry[] = [
  {
    id: "njdca",
    kind: "work",
    role: "Software Engineer",
    org: "New Jersey Department of Community Affairs",
    location: "New Jersey",
    period: "Feb 2026 — Present",
    order: 100,
    current: true,
    summary:
      "Building production web applications for internal and constituent-facing government tools — across frontend, backend, accessibility, deployment, and AI-assisted workflows, within a three-engineer team.",
    bullets: [
      "Develop and ship production web apps with Next.js, TypeScript, Tailwind, shadcn/ui, PostgreSQL, and AWS — owning features from implementation through deployment within a three-engineer team.",
      "Built full-stack features for the DCA AI Assistant — an internal AI chat tool piloted by department users — that retrieves administrator-approved documents using Retrieval-Augmented Generation (RAG): role-based auth, admin approval workflows, document ingestion/chunking, OTP auth, and status handling for long-running or stalled AI operations.",
      "Contributed to the NJ Eviction Guide rewrite to Next.js, modernizing a constituent-facing app with accessibility-first practices (axe) and improved data tracking.",
      "Supported the migration of production applications from AWS App Runner to AWS Amplify.",
      "Collaborate using Linear, Git, peer code reviews, and automated AI-assisted PR review workflows.",
    ],
    tags: ["Next.js", "TypeScript", "PostgreSQL", "AWS", "RAG / AI"],
  },
  {
    id: "education",
    kind: "education",
    role: "B.S. Computer Science & Game Programming",
    org: "Bloomfield College of Montclair State University",
    location: "Bloomfield, NJ",
    period: "Graduated May 2025",
    order: 80,
    summary:
      "Grounded my work in both solid engineering and creative design. President of the Games Club for three years.",
    bullets: [
      "Dual focus on computer science fundamentals and game programming.",
      "President, Games Club (2022 — 2025). CodePath: Android App Development & Interview Prep (2022).",
    ],
    tags: ["Computer Science", "Game Programming", "Leadership"],
  },
  {
    id: "nasa",
    kind: "work",
    role: "Climate Game Intern",
    org: "NASA",
    period: "Jun 2024 — Aug 2024",
    order: 60,
    summary:
      "Selected from 600+ applicants to help build an educational, multiplayer turn-based strategy simulation for classrooms.",
    bullets: [
      "Handpicked from 600+ applicants for Unity and collaboration skills to improve a large-scale, multiplayer turn-based strategy simulation game.",
      "Built an educational game for high-school and college classrooms with a team of 3 interns and NASA scientists, using Git for version control.",
      "Integrated scientific simulation equations for in-game resources in Python and C# to ground gameplay in real data.",
      "Restructured backend WebSocket code in C# and Python for accurate data transmission between the server and Unity client UIs.",
    ],
    tags: ["Unity", "C#", "Python", "WebSockets", "Game Dev"],
  },
  {
    id: "indie",
    kind: "milestone",
    role: "Started shipping real software",
    org: "Self-directed",
    period: "2023",
    order: 40,
    summary:
      "Began building and releasing real software — from a client mobile app to small games for fun.",
    bullets: [
      "Shipped Service Journal, a service-tracking mobile app built for a landscaping business.",
      "Kept making games for fun — the overlap of code and creativity that still drives me.",
    ],
    tags: ["React Native", "Firebase", "Indie Games"],
  },
];
