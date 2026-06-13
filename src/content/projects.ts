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
  demo?: "pos" | "dashboard";
  caseStudy: {
    problem: string;
    process: string;
    result: string;
  };
  link?: { label: string; href: string };
};

export const projects: Project[] = [
  {
    slug: "cost-estimate-app",
    title: "Cost & Estimate App",
    year: "2026",
    role: "Full-Stack Development",
    summary:
      "A construction cost-and-estimate web app for the Philippines, built for both civil engineers and ordinary people. Enter simple measurements and it computes materials, labor, and a full contract price — then exports a client-ready proposal PDF. Regional prices, material brands and rebar grades, all editable; runs offline with no accounts.",
    tags: ["Construction Tech", "React", "TypeScript", "PWA"],
    hue: 24,
    cover: "/work/cost-estimate-app.svg",
    featured: true,
    caseStudy: {
      problem:
        "Construction estimating is locked behind expensive, engineer-only software, and nothing localizes to Philippine practice. An ordinary person planning a house can't answer a basic question — how many bags of cement, how many blocks, how much will it cost? The goal was one friendly app that serves both a homeowner and a civil engineer, grounded in the NSCP, Fajardo's estimating methods, and real local prices.",
      process:
        "I built a pure TypeScript calculation engine (Fajardo coefficients, every value unit-tested) and layered a friendly UI on top: ten residential estimators, a no-project Quick Estimate, and a detailed takeoff workspace. Prices are region-aware (Luzon/NCR, Visayas, Mindanao) on a delivered-retail basis, with cement brands and rebar Grade 40/60, and labor anchored to the regional minimum wage. A finance layer adds labor, contingency, contractor markup and VAT to reach a total contract price, and a pdfmake exporter produces a branded proposal. Everything persists on-device (IndexedDB), works offline, and installs as a PWA.",
      result:
        "A genuinely usable estimator that takes a measurement and returns what to buy and what it costs — whole purchasable units, a consolidated bill of materials, and a one-tap client proposal PDF. The live demo is the real app running in your browser.",
    },
    link: { label: "Open the live app", href: "https://cost-estimate-demo.vercel.app" },
  },
  {
    slug: "data-analyst-dashboard",
    title: "Data Analyst Dashboard",
    year: "2026",
    role: "Full-Stack Development",
    summary:
      "A desktop and web app that turns any Excel or CSV file into a beautiful, interactive dashboard — automatically. Drop in a file and it cleans the data, detects the sector, analyzes it, builds charts, and writes plain-language insights and recommendations, all running locally with no setup.",
    tags: ["Data Analytics", "Electron", "DuckDB", "AI Insights"],
    hue: 250,
    cover: "/work/data-analyst-dashboard.svg",
    featured: true,
    demo: "dashboard",
    caseStudy: {
      problem:
        "Most people sit on spreadsheets full of answers they can't see. Real analysis means hours of cleaning, pivoting, charting, and interpreting in Excel — skills and time most don't have. The goal was an app where a simple import does all of it automatically, for any field: sales, finance, health, surveys, anything.",
      process:
        "I built an analytics engine around DuckDB that runs entirely on the user's machine. A file flows through a pipeline: import → scan and identify the sector → auto-clean (with an undoable report) → analyze every variable combination → build an adaptive dashboard → write grounded insights. A flexible Explore tab adds any-variable charts, Excel-style pivots, and formulas that show their working. Numbers are always computed first; the AI only narrates them, so figures are never invented.",
      result:
        "A complete, installable analytics tool — drop a spreadsheet, get a cleaned dataset, a dense interactive dashboard, reporting indices, and actionable recommendations in seconds. The live demo below is the real app running in your browser: try a sample dataset and watch it work end to end.",
    },
  },
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
