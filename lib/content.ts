import type { StaticImageData } from "next/image";
import marketDashImage from "@/public/market_dash.png";
import njHomesImage from "@/public/nj_homes.webp";

export type Side = "day" | "night";

export type Cover = {
  src: StaticImageData;
  alt: string;
  /** "contain" shows the whole image over a blurred copy of itself instead of cropping it. */
  fit?: "cover" | "contain";
};

export type Project = {
  slug: string;
  name: string;
  side: Side;
  year: number;
  summary: string;
  role: string;
  built: string[];
  stackLabel: "Stack" | "Team";
  stack: string;
  link?: { label: string; href?: string };
  cover: Cover;
};

export type Stop = {
  level: number;
  label: string;
  title: string;
  org: string;
  details: string[];
};

export type Note = {
  slug: string;
  date: string;
  title: string;
  summary: string;
  side: Side;
  minutes: number;
  project?: string;
  sample: true;
};

export type NoteBlock =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "code"; code: string };

export const sideLabel: Record<Side, { short: string; long: string }> = {
  day: { short: "Day", long: "By day" },
  night: { short: "Night", long: "By night" },
};

export const contact = {
  email: "a.rubio1224@gmail.com",
  resume: "/resume.pdf",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/abraham-rubio/" },
    { label: "GitHub", href: "https://github.com/abe-54" },
    { label: "itch.io", href: "https://abe-54.itch.io" },
    { label: "Résumé", href: "/resume.pdf" },
  ],
};

export const marketDashUrl = "https://abe-54.itch.io/market-dash";

export const projects: Project[] = [
  {
    slug: "nj-homes",
    name: "NJ HOMES",
    side: "day",
    year: 2026,
    summary: "Tools that help New Jersey towns plan affordable housing.",
    role: "Full-stack engineer",
    built: ["Sign-in and admin tools"],
    stackLabel: "Stack",
    stack: "Next.js · Prisma · MapLibre",
    link: { label: "njhomes.dca.nj.gov", href: "https://njhomes.dca.nj.gov" },
    cover: {
      src: njHomesImage,
      alt: "NJ HOMES home page: the headline “Every municipality’s affordable housing record, in one place.” beside a sample municipality record",
    },
  },
  {
    slug: "market-dash",
    name: "Market Dash",
    side: "night",
    year: 2025,
    summary: "A third-person platformer set in a grocery store, built by a team of five.",
    role: "Lead programmer",
    built: ["Player movement and game UI", "Level design", "Unity editor tools"],
    stackLabel: "Stack",
    stack: "Unity · C# · Photoshop",
    link: { label: "Play it on itch.io", href: marketDashUrl },
    cover: {
      src: marketDashImage,
      alt: "Market Dash title screen: a grocery store aisle with Play and Settings buttons",
      fit: "contain",
    },
  },
];

export const history: Stop[] = [
  {
    level: 4,
    label: "Now playing",
    title: "Software Engineer",
    org: "NJ Department of Community Affairs",
    details: [
      "NJ HOMES: tools that help towns plan affordable housing.",
      "DC AI: an AI workspace for state staff.",
    ],
  },
  {
    level: 3,
    label: "2025",
    title: "B.S. CS & Game Programming",
    org: "Bloomfield College of Montclair State",
    details: ["Led a team of five for nine months to ship Market Dash."],
  },
  {
    level: 2,
    label: "2024",
    title: "Climate Game Intern",
    org: "NASA",
    details: ["Built a multiplayer climate strategy game for classrooms."],
  },
  {
    level: 1,
    label: "2022",
    title: "Games Club President",
    org: "Bloomfield College, through 2025",
    details: ["President for three years, 2022 to 2025."],
  },
];

export const notes: Note[] = [];

// Notes stay out of the nav and off the home page until there is one to read. Set to true to show
// the section (with its "No notes yet." line) regardless.
export const showNotes = notes.length > 0;

export const sampleNoteBody: NoteBlock[] = [
  {
    kind: "p",
    text: "Sample body text. The opening paragraph states the problem in two or three sentences, so someone skimming knows whether to keep reading.",
  },
  { kind: "h2", text: "A section heading" },
  {
    kind: "p",
    text: "Sample body text. Each section covers one idea, then shows the code or the picture that proves it.",
  },
  { kind: "code", code: "// sample code block\nconst stream = resume(lastEventId)" },
];

export const focus = [
  { title: "Public services", body: "Housing and staff tools for the state of New Jersey." },
  { title: "Full-stack products", body: "Database to UI, with Next.js, Prisma and AWS." },
  { title: "Games", body: "Gameplay, UI and editor tools in Unity." },
];

export const toolkit = [
  ["TypeScript", "JavaScript", "Java", "Python", "C#", "CSS"],
  ["Unity", "Android Studio"],
];

export function formatMonth(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
