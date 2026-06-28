export interface SocialLink {
  label: string;
  href: string;
  handle: string;
}

export interface NavLink {
  label: string;
  href: string;
  /** matching section id used for scroll-spy */
  id: string;
}

export const site = {
  name: "Abraham Rubio",
  shortName: "Abraham",
  initials: "AR",
  role: "Full-Stack Software Engineer",
  location: "Newark, NJ",
  email: "a.rubio1224@gmail.com",
  resume: "/resume.pdf",
  url: "https://abraham-r.vercel.app",
  /** short, scannable hero line */
  headline: "Full-stack software engineer building modern web apps.",
  /** longer hero sub-copy */
  intro:
    "I build production web applications with Next.js, TypeScript, PostgreSQL, and AWS at the New Jersey Department of Community Affairs - across frontend, backend, accessibility, and deployment. I still make games for fun on the side.",
  description:
    "Abraham Rubio is a full-stack software engineer building modern TypeScript web applications, with experience in accessibility, cloud deployment, and production systems.",
} as const;

export const socials: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/abe-54",
    handle: "abe-54",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/abraham-rubio/",
    handle: "abraham-rubio",
  },
  {
    label: "itch.io",
    href: "https://abe-54.itch.io/",
    handle: "abe-54",
  },
];

export const navLinks: NavLink[] = [
  { label: "Home", href: "#home", id: "home" },
  { label: "About", href: "#about", id: "about" },
  { label: "Timeline", href: "#timeline", id: "timeline" },
  { label: "Skills", href: "#skills", id: "skills" },
  { label: "Work", href: "#work", id: "work" },
  { label: "Projects", href: "#projects", id: "projects" },
  { label: "Contact", href: "#contact", id: "contact" },
];
