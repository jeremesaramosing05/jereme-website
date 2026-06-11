// ── PLACEHOLDER CONTENT ──────────────────────────────────────────────
// These entries are seeded from real projects found on your machine.
// Rewrite the copy in your own words and add cover images when ready:
// drop an image in /public/work/<slug>.jpg and set `cover` accordingly.

export type Project = {
  slug: string;
  title: string;
  year: string;
  role: string;
  summary: string;
  tags: string[];
  /** Hue (0-360) used for the typographic cover until a real image is added */
  hue: number;
  cover?: string;
  featured: boolean;
  /** Renders a live interactive demo on the case-study page when set */
  demo?: "pos";
  caseStudy: {
    problem: string;
    process: string;
    result: string;
  };
  link?: { label: string; href: string };
};

export const projects: Project[] = [
  {
    slug: "pos-inventory-system",
    title: "POS & Inventory System",
    year: "2026",
    role: "Full-Stack Development",
    summary:
      "A complete point-of-sale and inventory app — product management, real-time stock control, cart, discounts, checkout, and printable receipts — built on Google Apps Script with a live spreadsheet as its database.",
    tags: ["Full-Stack", "Apps Script", "UI Design", "Inventory"],
    hue: 162,
    cover: "/work/pos-inventory-system.svg",
    featured: true,
    demo: "pos",
    caseStudy: {
      problem:
        "Small shops rarely need expensive POS hardware — they need something simple, free, and reliable that runs on tools they already have. The challenge was to build a real sales-and-inventory system on top of an ordinary Google Sheet, with no servers to maintain and no software to install.",
      process:
        "I designed a Google Sheet as the database (Products, Transactions, Settings) and wrote the application layer in Apps Script. The server handles the business logic — auto-generating product IDs, detecting duplicates, validating stock before every sale, deducting inventory, and logging each transaction with a unique ID. The cashier interface is a clean dialog: pick products, build a cart, apply a discount, complete the sale, and print a receipt.",
      result:
        "A working POS that turns a blank spreadsheet into a functioning store — tracking inventory, preventing overselling, and producing receipts, all for free. The live demo below is a faithful browser recreation you can try right now.",
    },
  },
  {
    slug: "motion-graphics-reel",
    title: "Motion Graphics Reel",
    year: "2026",
    role: "Motion Design",
    summary:
      "Programmatic motion graphics and intro videos built with Remotion — animation written as code.",
    tags: ["Remotion", "Motion Design", "Video"],
    hue: 28,
    featured: true,
    caseStudy: {
      problem:
        "Traditional video editing makes revisions slow and repetitive. Each new version of an intro meant re-editing by hand.",
      process:
        "Built the animations in Remotion, where every scene is a React component — timing, easing, and copy are all variables that can be changed instantly.",
      result:
        "A reusable motion system that renders polished intro videos on demand, including the ESL course intro series.",
    },
  },
  {
    slug: "esl-ebook",
    title: "ESL Learning Ebook",
    year: "2026",
    role: "Design & Writing",
    summary:
      "A beautifully typeset ebook that makes English learning approachable for beginners.",
    tags: ["Editorial Design", "Education", "Typography"],
    hue: 210,
    featured: true,
    caseStudy: {
      problem:
        "Most ESL materials feel dense and intimidating. Learners needed something that felt friendly from the first page.",
      process:
        "Designed a calm, generous layout with a clear typographic rhythm, paired with plain-language lessons and visual examples.",
      result:
        "An ebook learners actually enjoy opening — approachable, scannable, and easy to follow.",
    },
  },
  {
    slug: "vhs-timeline",
    title: "VHS Timeline",
    year: "2026",
    role: "Creative Development",
    summary:
      "A nostalgic, retro-styled interactive timeline experience inspired by VHS-era aesthetics.",
    tags: ["Creative Coding", "Interaction", "Web"],
    hue: 330,
    featured: false,
    caseStudy: {
      problem:
        "Timelines are usually flat lists. This experiment asked: what if browsing history felt like rewinding a tape?",
      process:
        "Layered scanline textures, tracking glitches, and tactile scrubbing interactions on top of a clean data-driven timeline structure.",
      result:
        "A memorable interactive piece that shows how far a strong aesthetic concept can elevate a simple component.",
    },
  },
  {
    slug: "comment-explosion",
    title: "Comment Explosion",
    year: "2026",
    role: "Creative Development",
    summary:
      "A playful web experiment that visualizes live comments as bursts of kinetic typography.",
    tags: ["Creative Coding", "Animation", "Web"],
    hue: 262,
    featured: false,
    caseStudy: {
      problem:
        "Comment sections are visually dead. The idea: make audience reactions feel like fireworks.",
      process:
        "Prototyped particle-style text animation, tuned physics and easing until the motion felt celebratory rather than chaotic.",
      result:
        "A fun, shareable interaction concept ready to drop into streams, events, or landing pages.",
    },
  },
  {
    slug: "qms-dashboard",
    title: "QMS Web Dashboard",
    year: "2026",
    role: "Design & Development",
    summary:
      "A lightweight quality-management dashboard delivered as a single fast-loading web page.",
    tags: ["Web App", "Dashboard", "UI Design"],
    hue: 200,
    featured: false,
    caseStudy: {
      problem:
        "The team needed visibility into quality metrics without installing or paying for heavyweight software.",
      process:
        "Built a self-contained HTML dashboard with clear status indicators and zero dependencies, so it runs anywhere a browser does.",
      result:
        "An instant-loading tool the whole team can open from a shared file or link — no setup required.",
    },
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
