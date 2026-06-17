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
  demo?: "pos" | "dashboard" | "reader" | "chess";
  caseStudy: {
    problem: string;
    process: string;
    result: string;
  };
  link?: { label: string; href: string };
  /** Optional SEO overrides for the case-study page (title/description/keywords). */
  seo?: { title?: string; description?: string; keywords?: string[] };
};

export const projects: Project[] = [
  {
    slug: "chess-trainer-app",
    title: "Chess Trainer — Coaching App",
    year: "2026",
    role: "Mobile App Development",
    summary:
      "An offline chess training app for Android and iOS that plays, analyzes, and teaches. Its coaching brain — Stockfish 18 running on-device — shows the five best moves for any position, each with an evaluation, opening-book or sideline label, principal variation, and a plain-language note on the idea behind it. For coaches, students, and players who want to train, play, and improve.",
    tags: ["Flutter", "Android", "iOS", "Stockfish", "Chess"],
    hue: 190,
    cover: "/work/chess-trainer-app.svg",
    featured: true,
    demo: "chess",
    caseStudy: {
      problem:
        "Most chess apps either play against you or hand you a single 'best move' with a number — neither really teaches. A student wants to understand why a move is good, how it compares to the alternatives, and whether they've left known theory. And it should all work offline on a phone, with a brain strong enough to trust. The goal was a training studio in your pocket: play, analyze, and learn from a master that explains itself.",
      process:
        "I built it in Flutter for Android and iOS, with Stockfish 18 compiled into the app and run natively via FFI — fully offline, no server. The centerpiece is a coaching analysis window driven by the engine's MultiPV mode: it surfaces the five best candidate moves at once, drawn as ranked arrows on the board, each with its evaluation, a Book / Mainline / Sideline label from a built-in opening book, its principal variation, and a rule-based coach's note explaining the idea. A move classifier grades play from brilliant to blunder using win-probability swings. Around the analysis core sit a play-vs-engine mode with adjustable Elo, a tactics trainer, and a coach-and-student mode where a coach sets a position and the student learns from the engine's reasoning.",
      result:
        "A pocket coach that doesn't just tell you the move — it shows you the five best ideas and teaches you why. The preview below is a faithful, in-browser recreation of the coaching analysis: move the pieces and watch the five best lines, evaluations, and coach's notes update live. The shipped app runs the full Stockfish 18 engine on-device.",
    },
    seo: {
      title: "Chess Trainer — Free Offline Chess Coaching App (Stockfish 18)",
      description:
        "Learn chess with a pocket coach. Chess Trainer shows the 5 best moves with evaluations and plain-language coaching, powered by Stockfish 18 — fully offline. Play the engine, solve tactics puzzles, and train openings (Italian, Ruy Lopez & more). Free download + live in-browser demo.",
      keywords: [
        "learn chess",
        "chess trainer",
        "chess coach app",
        "chess app",
        "Stockfish 18",
        "offline chess app",
        "chess analysis",
        "best moves",
        "chess openings",
        "chess tactics puzzles",
        "play chess vs engine",
        "free chess app",
        "Android chess app",
      ],
    },
  },
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
    slug: "reader-app",
    title: "Reader — eBook App",
    year: "2026",
    role: "Mobile App Development",
    summary:
      "A warm, offline reading app for Android that opens any book you own — EPUB, PDF, Word, and plain text — in one elegant library. Adjustable themes and typography, bookmarks, highlights, table of contents, and in-book search, all on-device with no accounts.",
    tags: ["Flutter", "Android", "Mobile App", "Reading"],
    hue: 232,
    cover: "/work/reader-app.svg",
    featured: true,
    demo: "reader",
    caseStudy: {
      problem:
        "Your books are scattered across formats and apps — an EPUB here, a PDF lecture there, a Word manuscript, a plain-text draft — and most readers lock you into a single store or a single file type. I wanted one calm, beautiful place to read all of them, that works on a phone, offline, and never asks you to sign in.",
      process:
        "I built it with Flutter for Android, around two rendering engines behind a shared interface: a reflowable engine for EPUB, Word, and text that reflows to your font, size, spacing, and Light/Sepia/Dark theme, and a fixed-layout engine for PDFs with page tracking and search. Word files are converted to clean chapters, headings become a table of contents, and a tap-to-highlight layer adds bookmarks and notes. The whole reading surface is set in a literary serif with the fonts bundled in, so it renders identically with no network. Reading position is saved per book, so every title resumes exactly where you left off.",
      result:
        "One reader for everything you read — import a file and it lands in a tidy shelf with a generated cover, opens in a distraction-free page, and remembers where you were. The interactive demo below is a faithful preview of the app: browse the library, open a book, switch themes, and resize the type right in your browser.",
    },
  },  {
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
