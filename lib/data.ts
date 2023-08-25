import goldRushImg from "@/public/gold_rush.png";
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
    name: "Projects",
    hash: "#projects",
  },
  {
    name: "Skills",
    hash: "#skills",
  },
  {
    name: "Contact",
    hash: "#contact",
  },
] as const;

export const personalData = [
  "Fullstack Developer^1000",
  "Software Engineer^1000",
  "Mobile Developer^1000",
  "Game Programmer^1000",
  "Designer^1000",
];

export const projectsData = [
  {
    title: "Gold Rush",
    description:
      "I worked on a team of 3 to create a 2D minigame dungeon crawler in Unity. I was the lead programmer and was responsible for the player movement, game ui, and the level design.",
    tags: ["Unity", "C#", "Photoshop", "Game Design"],
    imageUrl: goldRushImg,
    siteUrl: "https://abe-54.itch.io/gold-rush",
  },
  {
    title: "Service Journal",
    description:
      "I built a prototype app that allows users to track their services and it's current status for their customers. I used React, React Native, Express, Prisma, and MySQL.",
    tags: ["React", "React Native", "Express", "Prisma", "MySQL", "TypeScript"],
    imageUrl: serviceJournalImg,
    siteUrl: "",
  },
] as const;

export const skillsData = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Git",
  "Tailwind",
  "Prisma",
  "Express",
  "MySQL",
  "Python",
  "Framer Motion",
] as const;

export const technlogiesData = [
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
] as const;

export const toolsData = [
  {
    name: "Unity",
    icon: React.createElement("i", { className: "devicon-unity-original" }),
  },
  {
    name: "VS Code",
    icon: React.createElement("i", { className: "devicon-vscode-plain" }),
  },
  {
    name: "Python",
    icon: React.createElement("i", { className: "devicon-python-plain" }),
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
] as const;

export const learningData = [
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
] as const;
