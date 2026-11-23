/*
 * The history stops for the lab, from lib/content.ts with the repeats inside the section taken out:
 * NASA's "picked from 600+ applicants" appeared on the org line and as a detail, and the games club
 * appeared both as its own stop and as a detail of the degree. No new facts.
 */
export type LabStop = { level: number; label: string; title: string; org: string; details: string[] };

export const labHistory: LabStop[] = [
  {
    level: 4,
    label: "Now playing",
    title: "Software Engineer",
    org: "NJ Department of Community Affairs",
    details: ["NJ HOMES: tools that help towns plan affordable housing.", "DC AI: an AI workspace for state staff."],
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
    details: ["Built a multiplayer climate strategy game for classrooms.", "One of three interns picked from 600+ applicants."],
  },
  {
    level: 1,
    label: "2022",
    title: "Games Club President",
    org: "Bloomfield College, through 2025",
    details: ["President for three years, 2022 to 2025."],
  },
];
