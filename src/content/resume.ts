// Experience, education, toolset, and certifications shown on /resume.
// The download button on that page serves /public/resume.pdf.

export type ResumeEntry = {
  title: string;
  org: string;
  period: string;
  points: string[];
};

/** One-paragraph professional summary, shown at the top of the resume page. */
export const summary =
  "Detail-oriented and versatile remote professional with 4 years of Quality Control experience at San Miguel Corporation, one of the Philippines' largest F&B conglomerates. Skilled in data analysis (SQL, Power BI, Tableau, Advanced Excel), process automation (Google Apps Script, Google Sheets), and AI-assisted productivity (Claude, ChatGPT, Gemini) — and an independent graphic novelist and digital content creator. Open to remote roles in Quality Control, Data Analytics, Virtual Assistance, Creative Writing, and English/Math tutoring.";

export const experience: ResumeEntry[] = [
  {
    title: "Quality Control Inspector",
    org: "San Miguel Corporation — Integrated Farm Specialist (SMC IFSI), Mega Production Plant, Davao",
    period: "2022 — 2026",
    points: [
      "Conducted systematic quality inspections at a high-volume F&B production facility, producing detailed compliance reports and ensuring full adherence to HACCP, GMP, and Food Safety standards across every inspection cycle.",
      "Prepared technical summaries, data reports, and management presentations in Excel, Word, and PowerPoint — using AI tools (Claude, ChatGPT) to automate repetitive reporting and cut document turnaround time.",
      "Built Google Sheets / Apps Script automation tools for internal workflows, including a POS & inventory system, cashier automation, and attendance tracking.",
      "Maintained engineering records and regulatory compliance documentation across departments, and served two years on the Crisis Management Team coordinating emergency response under high-pressure conditions.",
    ],
  },
  {
    title: "Independent Graphic Novelist & Content Creator",
    org: "Self-published — YouTube, TikTok, Facebook",
    period: "Ongoing",
    points: [
      "Write, illustrate, and publish an ongoing series of original graphic novels and short illustrated stories.",
      "Own the full pipeline — storytelling, scriptwriting, visual design, and consistent independent publishing across social platforms.",
    ],
  },
];

export const education: ResumeEntry[] = [
  {
    title: "Bachelor of Science in Civil Engineering",
    org: "University of Southeastern Philippines · Davao City",
    period: "2013 — 2018",
    points: [
      "Completed five years of coursework.",
      "Undergraduate thesis — Flood Control & Water Resource Analysis: a data-driven hydrological study of the Davao City river system, analyzing flood-risk patterns and infrastructure capacity to produce evidence-based recommendations.",
    ],
  },
];

export const toolset = [
  "SQL",
  "Power BI",
  "Tableau",
  "Advanced Excel",
  "Google Sheets",
  "Google Apps Script",
  "Data Cleaning & Reporting",
  "AI Tools (Claude · ChatGPT · Gemini)",
  "Prompt Engineering",
  "Canva",
  "Adobe Photoshop",
  "HACCP & Food Safety",
] as const;

export const certifications = [
  "Data Analysis Certificate — Coursera",
  "HACCP: Hazard Analysis and Critical Control Points",
  "Good Manufacturing Practices (GMP) Seminar",
  "Food Safety and Food Defence Training",
  "Quality Control and Quality Assurance Training",
  "Warehouse and Inventory Management Training",
  "Crisis Management Training (2-Year Active Team Member)",
  "Material Testing Seminar",
  "Animal Health and Welfare Training",
  "AI Tools Proficiency — Self-Directed (Claude, ChatGPT, Gemini, Prompt Engineering)",
] as const;
