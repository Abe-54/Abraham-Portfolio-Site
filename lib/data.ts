import gemHunterImg from "@/public/gem_hunter.png";
import marketDash from "@/public/market_dash.png";
import serviceJournalImg from "@/public/service_journal.png";
import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuFramer, LuGraduationCap } from "react-icons/lu";

export const links = [
  {
    name: "Home",
    hash: "#home",
  },
  {
    name: "About",
    hash: "#about",
  },
  {
    name: "Skills",
    hash: "#skills",
  },
  {
    name: "Projects",
    hash: "#projects",
  },

  {
    name: "Contact",
    hash: "#contact",
  },
] as const;

export const personalAdjectives = [
  "Fullstack Developer^1000",
  "Software Engineer^1000",
  "Mobile Developer^1000",
  "Game Programmer^1000",
  "Designer^1000",
];

export const skillsData = {
  technologies: [
    {
      name: "Java",
      icon: React.createElement("i", { className: "devicon-java-plain" }),
    },
    {
      name: "C#",
      icon: React.createElement("i", { className: "devicon-csharp-plain" }),
    },
    {
      name: "Python",
      icon: React.createElement("i", { className: "devicon-python-plain" }),
    },
    {
      name: "JavaScript",
      icon: React.createElement("i", { className: "devicon-javascript-plain" }),
    },
    {
      name: "TypeScript",
      icon: React.createElement("i", { className: "devicon-typescript-plain" }),
    },
    {
      name: "CSS",
      icon: React.createElement("i", { className: "devicon-css3-plain" }),
    },
  ] as const,
  tools: [
    {
      name: "Unity",
      icon: React.createElement("i", { className: "devicon-unity-original" }),
    },
    {
      name: "VS Code",
      icon: React.createElement("i", { className: "devicon-vscode-plain" }),
    },
    {
      name: "Github",
      icon: React.createElement("i", { className: "devicon-github-original" }),
    },
    {
      name: "Android Studio",
      icon: React.createElement("i", {
        className: "devicon-androidstudio-plain",
      }),
    },
  ] as const,
  learning: [
    {
      name: "Next.js",
      icon: React.createElement("i", { className: "devicon-nextjs-plain" }),
    },
    {
      name: "My SQL",
      icon: React.createElement("i", { className: "devicon-mysql-plain" }),
    },
    {
      name: "Framer Motion",
      icon: React.createElement(LuFramer),
    },
  ] as const,
} as const;

export const projectsData = [
  // {
  //   title: "Schedule Reader (Discord Bot)",
  //   description:
  //     "A Discord bot that uses Google Gemini AI to extract employee schedules from images and automatically update calendars from a single command.",
  //   tags: ["Python", "Google Gemini AI", "Image Processing"],
  //   imageUrl: null, // replace with your screenshot path
  //   siteUrl: "https://github.com/Abe-54/ScheduleDiscordBot", // replace with your repo link
  // },
  {
    title: "Market Dash",
    description:
      "I worked on a team of 5 to create a Third-Person Platformer in Unity. I was the lead programmer and was responsible for the player movement, game ui, and the level design.",
    tags: ["Unity", "C#", "Photoshop", "Game Design"],
    imageUrl: marketDash,
    siteUrl: "https://abe-54.itch.io/market-dash",
  },
  {
    title: "Service Journal",
    description:
      "I built a prototype app that allows users to track their services and it's current status for their customers. I used React, React Native, Express, Prisma, and MySQL.",
    tags: ["React", "React Native", "Express", "Prisma", "MySQL", "TypeScript"],
    imageUrl: serviceJournalImg,
    siteUrl: "https://github.com/Abe-54/Service-Journal-App",
  },
] as const;
