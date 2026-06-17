// ── PLACEHOLDER CONTENT ──────────────────────────────────────────────
// Edit this file to add, remove, or rename shelves and books.
// Add a real cover image by dropping a file in /public/library/<slug>.jpg
// and setting `cover: "/library/<slug>.jpg"` on the book entry.

export type ShelfId = "comics" | "design" | "language" | "wonders";

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
  { id: "comics",   label: "Original Comics" },
  { id: "design",   label: "Design & Motion" },
  { id: "language", label: "Language & Learning" },
  { id: "wonders",  label: "Shelf of Wonders" },
];

export const books: Book[] = [
  // ── Original Comics ──────────────────────────────────────────────
  {
    slug: "lifetime-in-a-heartbeat",
    title: "A Lifetime in a Heartbeat",
    author: "Jereme Saramosing",
    year: "2026",
    shelf: "comics",
    summary:
      "A man, a puppy, and the kind of love that needs no lessons — we spend our lives learning how to love; dogs are born knowing.",
    hue: 25,
    cover: "/library/lifetime-in-a-heartbeat.jpg",
    isMine: true,
    link: "/comics/lifetime-in-a-heartbeat.pdf",
    featured: true,
  },
  {
    slug: "the-bloom-within",
    title: "The Bloom Within",
    author: "Jereme Saramosing",
    year: "2026",
    shelf: "comics",
    summary:
      "A quiet girl who feels invisible in a loud world discovers the color she was searching for was inside her all along.",
    hue: 280,
    cover: "/library/the-bloom-within.jpg",
    isMine: true,
    link: "/comics/the-bloom-within.pdf",
  },
  {
    slug: "i-believed-in-you",
    title: "I Believed in You",
    author: "Jereme Saramosing",
    year: "2026",
    shelf: "comics",
    summary:
      "Shattering the mold to find the beautiful soul beneath — a story about becoming who you already are.",
    hue: 150,
    cover: "/library/i-believed-in-you.jpg",
    isMine: true,
    link: "/comics/i-believed-in-you.pdf",
  },
  {
    slug: "thank-you-for-the-cake",
    title: "Thank You for the Cake",
    author: "Jereme Saramosing",
    year: "2026",
    shelf: "comics",
    summary:
      "The good Samaritans hiding in everyday life — a story about the currency of kindness.",
    hue: 40,
    cover: "/library/thank-you-for-the-cake.jpg",
    isMine: true,
    link: "/comics/thank-you-for-the-cake.pdf",
  },
  {
    slug: "the-bigger-heart",
    title: "The Bigger Heart",
    author: "Jereme Saramosing",
    year: "2026",
    shelf: "comics",
    summary:
      "When a heart cracks, it can mend wider than before — a gentle story about growing through hurt.",
    hue: 300,
    cover: "/library/the-bigger-heart.jpg",
    isMine: true,
    link: "/comics/the-bigger-heart.pdf",
  },
  {
    slug: "the-calm-mind",
    title: "The Calm Mind",
    author: "Jereme Saramosing",
    year: "2026",
    shelf: "comics",
    summary:
      "A graphic-novel journey into the present moment — learning to anchor a racing mind in the now.",
    hue: 140,
    cover: "/library/the-calm-mind.jpg",
    isMine: true,
    link: "/comics/the-calm-mind.pdf",
  },
  {
    slug: "wider-than-the-sky",
    title: "Wider Than the Sky",
    author: "Jereme Saramosing",
    year: "2026",
    shelf: "comics",
    summary:
      "A boy, his dog, and the worlds that books open — because the mind is wider than the sky.",
    hue: 260,
    cover: "/library/wider-than-the-sky.jpg",
    isMine: true,
    link: "/comics/wider-than-the-sky.pdf",
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
