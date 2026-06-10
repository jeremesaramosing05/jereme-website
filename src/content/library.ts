// ── PLACEHOLDER CONTENT ──────────────────────────────────────────────
// Edit this file to add, remove, or rename shelves and books.
// Add a real cover image by dropping a file in /public/library/<slug>.jpg
// and setting `cover: "/library/<slug>.jpg"` on the book entry.

export type ShelfId = "mine" | "design" | "language" | "wonders";

export type Shelf = {
  id: ShelfId;
  label: string;
};

export type Book = {
  slug: string;
  title: string;
  author: string;
  year: string;
  shelf: ShelfId;
  /** Jereme's one-line note — why he loves it / what it is about */
  summary: string;
  /** 0–360, tints the typographic placeholder cover */
  hue: number;
  /** "/library/<slug>.jpg" once a real cover is available */
  cover?: string;
  /** Marks books authored by Jereme — shows a "by me" badge */
  isMine?: true;
  /** Internal "/work/<slug>" or external URL */
  link?: string;
  /** Shows in the homepage library teaser (keep to 3 max) */
  featured?: true;
};

export const shelves: Shelf[] = [
  { id: "mine",     label: "Written by Me" },
  { id: "design",   label: "Design & Motion" },
  { id: "language", label: "Language & Learning" },
  { id: "wonders",  label: "Shelf of Wonders" },
];

export const books: Book[] = [
  // ── Written by Me ────────────────────────────────────────────────
  {
    slug: "esl-ebook",
    title: "ESL Learning Ebook",
    author: "Jereme Saramosing",
    year: "2026",
    shelf: "mine",
    summary: "A beautifully typeset guide that makes English learning approachable for beginners.",
    hue: 210,
    isMine: true,
    link: "/work/esl-ebook",
    featured: true,
  },
  {
    slug: "motion-graphics-reel",
    title: "Motion Graphics Reel",
    author: "Jereme Saramosing",
    year: "2026",
    shelf: "mine",
    summary: "Programmatic animations and intro videos built with Remotion — motion written as code.",
    hue: 28,
    isMine: true,
    link: "/work/motion-graphics-reel",
  },
  // ── Design & Motion ──────────────────────────────────────────────
  {
    slug: "design-everyday-things",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    year: "2013",
    shelf: "design",
    summary: "The book that taught me why bad design is never the user's fault.",
    hue: 162,
  },
  {
    slug: "thinking-with-type",
    title: "Thinking with Type",
    author: "Ellen Lupton",
    year: "2010",
    shelf: "design",
    summary: "Typography as a design system — essential reading for anyone who works with text.",
    hue: 200,
  },
  {
    slug: "logo-design-love",
    title: "Logo Design Love",
    author: "David Airey",
    year: "2010",
    shelf: "design",
    summary: "Simple, clear, and timeless — how to design marks that last.",
    hue: 330,
  },
  // ── Language & Learning ──────────────────────────────────────────
  {
    slug: "elements-of-style",
    title: "The Elements of Style",
    author: "Strunk & White",
    year: "1959",
    shelf: "language",
    summary: "The thinnest book with the loudest voice on writing clearly.",
    hue: 46,
  },
  {
    slug: "bird-by-bird",
    title: "Bird by Bird",
    author: "Anne Lamott",
    year: "1994",
    shelf: "language",
    summary: "Permission to write badly, then fix it — the most freeing writing book I know.",
    hue: 18,
  },
  {
    slug: "dreyers-english",
    title: "Dreyer's English",
    author: "Benjamin Dreyer",
    year: "2019",
    shelf: "language",
    summary: "The copy editor's eye for language, told with warmth and wit.",
    hue: 240,
  },
  // ── Shelf of Wonders ─────────────────────────────────────────────
  {
    slug: "steal-like-an-artist",
    title: "Steal Like an Artist",
    author: "Austin Kleon",
    year: "2012",
    shelf: "wonders",
    summary: "A tiny book that gave me permission to be creatively influenced by everything around me.",
    hue: 280,
    featured: true,
  },
  {
    slug: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    year: "2018",
    shelf: "wonders",
    summary: "Systems over goals — how tiny changes compound into identity.",
    hue: 120,
  },
  {
    slug: "art-of-learning",
    title: "The Art of Learning",
    author: "Josh Waitzkin",
    year: "2007",
    shelf: "wonders",
    summary: "A chess prodigy and martial arts champion on how deep learning actually works.",
    hue: 350,
    featured: true,
  },
];

export const featuredBooks = books.filter((b) => b.featured);

export function getShelfBooks(id: ShelfId) {
  return books.filter((b) => b.shelf === id);
}
