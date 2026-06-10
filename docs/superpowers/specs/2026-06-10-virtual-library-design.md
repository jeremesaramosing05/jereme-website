# Virtual Library — Design Spec
**Date:** 2026-06-10
**Status:** Approved

## Context

Jereme loves books and learning. This feature adds a personal virtual library to his portfolio site that:
- Showcases his own authored works (ESL ebook, motion graphics guide) in a "Written by Me" shelf, linked to their `/work` case studies
- Reflects his identity as a reader and learner across the whole site
- Grows naturally over time by editing a single data file

The overall effect: visitors understand that books and learning are part of who Jereme is, not just a page on his site.

---

## New file: `src/content/library.ts`

Single source of truth for all book data.

```ts
type Book = {
  slug: string;          // unique, URL-safe identifier
  title: string;
  author: string;
  year: string;
  shelf: ShelfId;        // which category shelf it belongs to
  summary: string;       // Jereme's one-line note — why he loves it / what it's about
  hue: number;           // 0–360, tints the typographic cover placeholder
  cover?: string;        // optional: "/library/<slug>.jpg" once real cover is added
  isMine?: true;         // marks books authored by Jereme — triggers "by me" badge
  link?: string;         // external URL or internal "/work/<slug>" for own works
  featured?: true;       // appears in the homepage teaser row (max 3)
};
```

**Four shelves** (`ShelfId`):
| ID | Display name |
|---|---|
| `mine` | Written by Me |
| `design` | Design & Motion |
| `language` | Language & Learning |
| `wonders` | Shelf of Wonders |

Shelf names are defined in a `shelves` array alongside the books, so renaming is one edit.

**Seeded placeholder books:**
- `mine`: ESL Ebook (`isMine`, links to `/work/esl-ebook`, `featured`), Motion Graphics Reel (`isMine`, links to `/work/motion-graphics-reel`, `featured`)
- `design`: *The Design of Everyday Things* (Norman), *Thinking with Type* (Lupton), *Motion Design* (Curran)
- `language`: *The Elements of Style* (Strunk & White), *Bird by Bird* (Lamott), *Dreyer's English* (Dreyer)
- `wonders`: *Steal Like an Artist* (Kleon, `featured`), *Atomic Habits* (Clear), *The Art of Learning* (Waitzkin)

---

## New route: `/library`

### Page structure
```
<header>
  h1: "My Library"
  tagline: "Books I've written, books that shaped me, books I keep returning to."

<section> × 4 shelves (in order: mine, design, language, wonders)
  shelf label: "{Shelf Name}  ·  {count} books"
  horizontal scroll row of BookCard components

<BookDetailPanel> (portal, slide-up from bottom, closes on backdrop click or Esc)
```

### `BookCard` component (`src/components/ui/BookCard.tsx`)
- Size: ~180px wide × ~240px tall (3:4 ratio)
- Cover: if `cover` is set → `next/image`; otherwise typographic placeholder (first letter of title, tinted by `hue`, same system as `ProjectCard`)
- Badge: amber "by me" pill if `isMine`
- Hover: card lifts `translateY(-4px)`, author + truncated summary fade in over cover
- Click: opens `BookDetailPanel`

### `BookDetailPanel` component (`src/components/ui/BookDetailPanel.tsx`)
- Slide up from bottom on mobile, centered modal on desktop
- Shows: cover, title, author, year, shelf name, full summary, and — if `link` is set — a CTA button ("Read my work →" for own books, "Learn more →" for others)
- Animated via Framer Motion (`AnimatePresence` + `motion.div`), respects `prefers-reduced-motion`
- Focus-trapped while open; Esc key closes

### Horizontal scroll shelf
- `overflow-x: auto`, `scroll-snap-type: x mandatory` on the row
- Each card: `scroll-snap-align: start`
- Subtle fade-out gradient at the right edge signals more content
- No custom scrollbar on mobile (native momentum scrolling)

### Metadata
```ts
export const metadata = {
  title: "Library",
  description: "Books I've written and books I love — design, language, creativity, and curiosity.",
};
```

---

## Homepage changes (`src/app/page.tsx`)

### 1. Literary quote block
- Position: between Hero and About sections
- Markup: `<blockquote>` with the quote text + `<cite>` for author
- Driven by `profile.literaryQuote: { text: string; author: string }` in `src/content/profile.ts`
- Placeholder: *"A reader lives a thousand lives before he dies."* — George R.R. Martin
- Styling: large italic Fraunces text, centered or left-aligned, muted color, thin left border accent

### 2. "From my library" teaser
- Position: between Selected Work and Contact CTA sections
- Shows the 3 books where `featured: true` as a horizontal row of `BookCard` components (same component, no duplication)
- Section header: `"From my library"` + `"Browse all →"` link to `/library`
- Wrapped in `Reveal` scroll animation (consistent with the rest of the page)

---

## Nav change (`src/components/ui/Nav.tsx`)

Add `{ href: "/library", label: "Library" }` after `Work`:
```
Work · Library · Resume · Links · Contact
```

---

## Sitemap update (`src/app/sitemap.ts`)

Add `/library` as a static route. No per-book URLs (no detail pages).

---

## What is NOT included
- No `/library/[slug]` individual book pages (detail panel is sufficient; YAGNI)
- No search or filtering (too few books to need it)
- No external API (Goodreads, Open Library) — just the data file
- No user-facing "reading status" tracking

---

## Verification
1. `npm run build` — all pages statically generated, zero errors
2. Dev server: visit `/library`, confirm all four shelves render with cards; click a card, confirm panel opens and closes (Esc + backdrop); click "by me" card, confirm CTA links to `/work/esl-ebook`
3. Mobile (375px): horizontal shelf scrolls smoothly, panel slides up correctly
4. Homepage: quote block visible, library teaser row shows 3 featured books, "Browse all →" links to `/library`
5. Nav: "Library" link appears in correct position on desktop and mobile menu
