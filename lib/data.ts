import gemHunterImg from "@/public/gem_hunter.png";
import marketDashImg from "@/public/market_dash.png";
import serviceJournalImg from "@/public/service_journal.png";
import type { StaticImageData } from "next/image";

export const links = [
  { name: "Home", hash: "#home", key: "1" },
  { name: "About", hash: "#about", key: "2" },
  { name: "Experience", hash: "#experience", key: "3" },
  { name: "Projects", hash: "#projects", key: "4" },
  { name: "Play", hash: "#play", key: "5" },
  { name: "Contact", hash: "#contact", key: "6" },
] as const;

export const profile = {
  name: "Abraham Rubio",
  role: "Software Engineer",
  focus: "Frontend & interactive UI",
  location: "Newark, NJ",
  email: "a.rubio1224@gmail.com",
  linkedin: "https://www.linkedin.com/in/abraham-rubio/",
  github: "https://github.com/abe-54",
  itch: "https://abe-54.itch.io",
  // TODO(Abraham): set to your employer, e.g. "Acme Corp". Leave null to hide it.
  currentCompany: null as string | null,
};

export const heroStats = [
  { value: "NASA", label: "Climate game intern" },
  { value: "B.S.", label: "CS & Game Programming" },
  { value: "2", label: "Games on itch.io" },
] as const;

export const skillGroups = [
  {
    title: "Frontend",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    title: "Backend & Data",
    skills: ["Node / Express", "Python", "REST APIs", "WebSockets", "MySQL", "Prisma"],
  },
  {
    title: "Games & Interactive",
    skills: ["Unity", "C#", "Editor tooling", "Game feel", "Level design"],
  },
  {
    title: "Workflow",
    skills: ["Git", "Figma", "Agile", "Playtesting", "Java"],
  },
] as const;

export type ExperienceItem = {
  title: string;
  org: string;
  date: string;
  points: string[];
};

export const experienceData: ExperienceItem[] = [
  // TODO(Abraham): add your current role first. This is the strongest signal on the page.
  // {
  //   title: "Software Engineer",
  //   org: "Company",
  //   date: "2025 – Present",
  //   points: ["What you shipped, with a number if you have one."],
  // },
  {
    title: "Climate Game Intern",
    org: "NASA",
    date: "Jun – Aug 2024",
    points: [
      "Selected from 600+ applicants to work on a multiplayer, turn-based climate strategy game for classrooms.",
      "Restructured backend WebSocket code in C# and Python so scientific data reached the Unity client UI accurately.",
      "Wired real simulation equations into in-game resources, working alongside NASA scientists.",
    ],
  },
  {
    title: "President, Games Club",
    org: "Bloomfield College of Montclair State",
    date: "2022 – 2025",
    points: [
      "Ran the campus games club while finishing a B.S. in Computer Science & Game Programming.",
    ],
  },
];

export type Project = {
  slug: string;
  title: string;
  kind: string;
  role: string;
  date: string;
  summary: string;
  metric: { value: string; label: string };
  problem: string;
  built: string[];
  result: string;
  stack: string[];
  image: StaticImageData | null;
  links: { label: string; href: string }[];
};

export const projectsData: Project[] = [
  {
    slug: "schedule-reader",
    title: "Schedule Reader",
    kind: "Discord bot · AI",
    role: "Sole developer",
    date: "2025 – Present",
    summary:
      "Snap a photo of a work schedule, run one slash command, and every shift lands on your calendar.",
    metric: { value: "2h+", label: "saved every month" },
    problem:
      "Copying shifts from a photographed schedule into a calendar by hand was slow and error-prone.",
    built: [
      "Slash command that accepts an image and hands it to Google Gemini to extract structured shifts.",
      "Async pipeline with live loading states, so the bot stays responsive while the model works.",
      "Error handling that tells the user what went wrong instead of failing silently.",
    ],
    result: "Replaced a manual monthly chore with a single command.",
    stack: ["Python", "discord.py", "Gemini API", "asyncio"],
    image: null,
    links: [{ label: "Source", href: "https://github.com/Abe-54/ScheduleDiscordBot" }],
  },
  {
    slug: "market-dash",
    title: "Market Dash",
    kind: "Browser game · Team of 5",
    role: "Lead programmer",
    date: "2024 – 2025",
    summary:
      "A third-person platformer built and shipped in nine months with a five-person team.",
    metric: { value: "30%", label: "faster level iteration" },
    problem:
      "Five people needed to design, build, and ship a playable browser game within one school year.",
    built: [
      "Player movement, game UI, and level design.",
      "Custom Unity editor tools in C# so designers could build levels without waiting on code.",
      "A playtesting loop that turned tester feedback into shipped feature changes.",
    ],
    result: "Launched on itch.io and playable in the browser today.",
    stack: ["Unity", "C#", "Editor tooling", "Photoshop"],
    image: marketDashImg,
    links: [{ label: "Play it", href: "https://abe-54.itch.io/market-dash" }],
  },
  {
    slug: "service-journal",
    title: "Service Journal",
    kind: "Mobile app · Full-stack",
    role: "Sole developer",
    date: "2023",
    summary:
      "A service-tracking app for a landscaping business, from login to database.",
    metric: { value: "Full", label: "stack, solo" },
    problem:
      "A landscaping business tracked jobs and their status for customers on paper.",
    built: [
      "React Native client with multi-step forms for journal entries.",
      "Express REST API backed by MySQL through Prisma, with Firebase authentication.",
      "Features prioritized directly from the owner's feedback.",
    ],
    result: "A working prototype the business could test against its real workflow.",
    stack: ["React Native", "TypeScript", "Express", "Prisma", "MySQL"],
    image: serviceJournalImg,
    links: [{ label: "Source", href: "https://github.com/Abe-54/Service-Journal-App" }],
  },
];

export const gamesData = [
  {
    title: "Market Dash",
    blurb: "3D platformer. Lead programmer on a team of five.",
    image: marketDashImg,
    href: "https://abe-54.itch.io/market-dash",
  },
  {
    title: "Gem Hunter",
    blurb: "2D pixel-art platformer, made solo in one month.",
    image: gemHunterImg,
    href: "https://abe-54.itch.io/gem-hunter",
  },
] as const;
