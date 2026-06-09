// ── PLACEHOLDER CONTENT ──────────────────────────────────────────────
// Replace with your real experience and education, and drop your real
// resume PDF at /public/resume.pdf (the download button points there).

export type ResumeEntry = {
  title: string;
  org: string;
  period: string;
  points: string[];
};

export const experience: ResumeEntry[] = [
  {
    title: "Freelance Creative Developer",
    org: "Self-employed",
    period: "2024 — Present",
    points: [
      "Designed and built websites, dashboards, and motion graphics for clients and personal ventures.",
      "Delivered end-to-end projects: concept, design, development, and deployment.",
    ],
  },
  {
    title: "[Placeholder] Previous Role",
    org: "[Company name]",
    period: "20XX — 20XX",
    points: [
      "[Replace with a real accomplishment — what you did and the result it produced.]",
      "[One more bullet keeps each role scannable.]",
    ],
  },
];

export const education: ResumeEntry[] = [
  {
    title: "[Placeholder] Degree / Program",
    org: "[School or university]",
    period: "20XX — 20XX",
    points: ["[Honors, relevant coursework, or activities — or delete this line.]"],
  },
];

export const toolset = [
  "TypeScript",
  "React / Next.js",
  "Tailwind CSS",
  "Framer Motion",
  "Remotion",
  "Python",
  "Excel / Data Analysis",
  "Video Editing",
  "Figma",
] as const;
