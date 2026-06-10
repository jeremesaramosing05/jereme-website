# Virtual Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/library` page with four themed bookshelves, a click-to-open detail panel, and subtle book-lover touches woven into the homepage and nav.

**Architecture:** A new `src/content/library.ts` data file drives everything. `BookCard` and `BookDetailPanel` are new reusable UI components. The `/library` page is split into a Server Component (for metadata) and a `LibraryClient` Client Component (for selectedBook state). Three small edits touch the existing site: `profile.ts` (add `literaryQuote`), `page.tsx` (quote block + teaser section), and `Nav.tsx` (Library link).

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Framer Motion 12, `next/image`

---

## File map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/content/library.ts` | All book data — shelves array + books array |
| Create | `src/components/ui/BookCard.tsx` | Single book card (cover, badge, hover, click) |
| Create | `src/components/ui/BookDetailPanel.tsx` | Slide-up detail panel (Framer Motion, Esc, backdrop) |
| Create | `src/app/library/page.tsx` | Server Component — exports metadata, renders LibraryClient |
| Create | `src/app/library/LibraryClient.tsx` | Client Component — state, shelf rows, panel |
| Modify | `src/content/profile.ts` | Add `literaryQuote` field |
| Modify | `src/app/page.tsx` | Add quote block + library teaser section |
| Modify | `src/components/ui/Nav.tsx` | Add Library nav link |
| Modify | `src/app/sitemap.ts` | Add `/library` static route |

---

## Task 1: Content data file

**Files:**
- Create: `src/content/library.ts`

- [ ] **Step 1: Create `src/content/library.ts`**

```ts
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors related to `library.ts`

- [ ] **Step 3: Commit**

```bash
git add src/content/library.ts
git commit -m "feat: add library content data file"
```

---

## Task 2: BookCard component

**Files:**
- Create: `src/components/ui/BookCard.tsx`

- [ ] **Step 1: Create `src/components/ui/BookCard.tsx`**

```tsx
"use client";

import Image from "next/image";
import type { Book } from "@/content/library";

type Props = {
  book: Book;
  onSelect: (book: Book) => void;
};

function BookCover({ book }: { book: Book }) {
  if (book.cover) {
    return (
      <Image
        src={book.cover}
        alt={`${book.title} cover`}
        fill
        sizes="180px"
        className="object-cover"
      />
    );
  }

  return (
    <div
      className="flex h-full w-full items-end p-4"
      style={{
        background: `linear-gradient(160deg, hsl(${book.hue} 32% 90%), hsl(${book.hue} 24% 80%))`,
      }}
    >
      <span
        className="font-display text-5xl leading-none opacity-25"
        style={{ color: `hsl(${book.hue} 30% 25%)` }}
        aria-hidden
      >
        {book.title.charAt(0)}
      </span>
    </div>
  );
}

export function BookCard({ book, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(book)}
      className="group relative shrink-0 scroll-snap-align-start text-left focus-visible:outline-accent"
      style={{ width: 180 }}
      aria-label={`${book.title} by ${book.author}`}
    >
      {/* Cover */}
      <div
        className="relative overflow-hidden rounded-lg border border-line bg-surface transition-transform duration-300 group-hover:-translate-y-1"
        style={{ height: 240 }}
      >
        <BookCover book={book} />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-end bg-foreground/70 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-xs font-medium text-background/80">{book.author}</p>
          <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-background/70">
            {book.summary}
          </p>
        </div>

        {/* By me badge */}
        {book.isMine && (
          <span className="absolute right-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium tracking-wide text-background">
            by me
          </span>
        )}
      </div>

      {/* Title */}
      <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-accent">
        {book.title}
      </p>
    </button>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/BookCard.tsx
git commit -m "feat: add BookCard component"
```

---

## Task 3: BookDetailPanel component

**Files:**
- Create: `src/components/ui/BookDetailPanel.tsx`

- [ ] **Step 1: Create `src/components/ui/BookDetailPanel.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { Book } from "@/content/library";
import { shelves } from "@/content/library";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

type Props = {
  book: Book | null;
  onClose: () => void;
};

export function BookDetailPanel({ book, onClose }: Props) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll and focus close button when panel opens
  useEffect(() => {
    if (!book) return;
    document.body.style.overflow = "hidden";
    // Small delay lets Framer Motion start the animation before stealing focus
    const t = setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [book]);

  // Esc to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const shelfLabel = book
    ? (shelves.find((s) => s.id === book.shelf)?.label ?? "")
    : "";

  const isInternal = book?.link?.startsWith("/");

  return (
    <AnimatePresence>
      {book && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          {/* Panel — slides up on mobile, centered on desktop */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={book.title}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-surface p-6 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-md sm:rounded-2xl sm:p-8"
            initial={reduce ? false : { opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? false : { opacity: 0, y: 48 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {/* Close button */}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-line hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <line x1="1" y1="1" x2="13" y2="13" />
                <line x1="13" y1="1" x2="1" y2="13" />
              </svg>
            </button>

            {/* Content */}
            <div className="flex gap-4">
              {/* Mini cover */}
              <div
                className="relative shrink-0 overflow-hidden rounded-md border border-line"
                style={{ width: 80, height: 108 }}
              >
                <div
                  className="flex h-full w-full items-end p-2"
                  style={{
                    background: `linear-gradient(160deg, hsl(${book.hue} 32% 90%), hsl(${book.hue} 24% 80%))`,
                  }}
                >
                  <span
                    className="font-display text-3xl leading-none opacity-25"
                    style={{ color: `hsl(${book.hue} 30% 25%)` }}
                    aria-hidden
                  >
                    {book.title.charAt(0)}
                  </span>
                </div>
                {book.isMine && (
                  <span className="absolute right-1 top-1 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-medium text-background">
                    by me
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="min-w-0">
                <p className="text-xs text-accent">{shelfLabel}</p>
                <h2 className="mt-1 font-display text-xl leading-tight tracking-tight">
                  {book.title}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {book.author} · {book.year}
                </p>
              </div>
            </div>

            <p className="mt-5 leading-relaxed text-muted">{book.summary}</p>

            {/* CTA */}
            {book.link && (
              <div className="mt-6">
                {isInternal ? (
                  <Link
                    href={book.link}
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm tracking-wide text-background transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-strong"
                  >
                    Read my work →
                  </Link>
                ) : (
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                  >
                    Learn more ↗
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/BookDetailPanel.tsx
git commit -m "feat: add BookDetailPanel slide-up component"
```

---

## Task 4: Library page

**Files:**
- Create: `src/app/library/LibraryClient.tsx`
- Create: `src/app/library/page.tsx`

- [ ] **Step 1: Create `src/app/library/LibraryClient.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { BookCard } from "@/components/ui/BookCard";
import { BookDetailPanel } from "@/components/ui/BookDetailPanel";
import { shelves, getShelfBooks, type Book } from "@/content/library";

export function LibraryClient() {
  const [selected, setSelected] = useState<Book | null>(null);

  return (
    <>
      {shelves.map((shelf) => {
        const shelfBooks = getShelfBooks(shelf.id);
        return (
          <Reveal key={shelf.id}>
            <section className="mt-16 first:mt-12">
              {/* Shelf label */}
              <div className="flex items-baseline gap-3 px-6 sm:px-0">
                <h2 className="font-display text-2xl tracking-tight">{shelf.label}</h2>
                <span className="text-sm text-muted">{shelfBooks.length} books</span>
              </div>

              {/* Scroll row wrapper — fades at the right edge */}
              <div className="relative mt-6">
                <div
                  className="flex gap-5 overflow-x-auto px-6 pb-4 sm:px-0"
                  style={{
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {shelfBooks.map((book) => (
                    <BookCard
                      key={book.slug}
                      book={book}
                      onSelect={setSelected}
                    />
                  ))}
                </div>
                {/* Right-edge fade hint */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
              </div>
            </section>
          </Reveal>
        );
      })}

      <BookDetailPanel book={selected} onClose={() => setSelected(null)} />
    </>
  );
}
```

- [ ] **Step 2: Create `src/app/library/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { LibraryClient } from "./LibraryClient";

export const metadata: Metadata = {
  title: "Library",
  description:
    "Books I've written and books I love — design, language, creativity, and curiosity.",
};

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-5xl py-24">
      <Reveal>
        <div className="px-6 sm:px-0">
          <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
            My Library
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            Books I&apos;ve written, books that shaped me, books I keep returning to.
          </p>
        </div>
      </Reveal>

      <LibraryClient />
    </div>
  );
}
```

- [ ] **Step 3: Start dev server and open `/library`**

Run: `npm run dev`
Open: http://localhost:3000/library

Expected: page loads with "My Library" heading, four shelves with horizontally scrollable book cards, typographic placeholder covers, "by me" badges on the first two cards.

- [ ] **Step 4: Click a regular book card**

Click any non-"by me" card.
Expected: backdrop appears, panel slides up from bottom (mobile viewport) or appears centered (desktop). Title, author, shelf name, and summary are visible. No CTA button for books without a `link`.

- [ ] **Step 5: Verify Esc and backdrop close**

With panel open: press Esc → panel closes. Open again → click backdrop → panel closes.

- [ ] **Step 6: Click the ESL Ebook card**

Expected: panel opens, "by me" badge visible on mini cover, CTA button reads "Read my work →", clicking it navigates to `/work/esl-ebook` and closes the panel.

- [ ] **Step 7: Commit**

```bash
git add src/app/library/
git commit -m "feat: add /library page with shelf rows and detail panel"
```

---

## Task 5: Profile literaryQuote + homepage quote block

**Files:**
- Modify: `src/content/profile.ts`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add `literaryQuote` to `src/content/profile.ts`**

Add the `literaryQuote` field inside the `profile` object, after `skills`:

```ts
  skills: [
    "Web Development",
    "UI / UX Design",
    "Motion Graphics",
    "Data Visualization",
    "Video Editing",
    "Content Creation",
  ],
  // ── Add this ──
  literaryQuote: {
    text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.",
    author: "George R.R. Martin",
  },
```

- [ ] **Step 2: Add quote block to `src/app/page.tsx`**

Insert the quote block between the Hero section and the About section. The file currently reads (lines 31–34):

```tsx
      </section>

      {/* About */}
      <section className="border-t border-line bg-surface">
```

Replace with:

```tsx
      </section>

      {/* Literary quote */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <Reveal>
            <blockquote className="border-l-2 border-accent pl-6">
              <p className="font-display text-2xl italic leading-relaxed tracking-tight text-muted sm:text-3xl">
                &ldquo;{profile.literaryQuote.text}&rdquo;
              </p>
              <cite className="mt-4 block text-sm not-italic text-muted/70">
                — {profile.literaryQuote.author}
              </cite>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* About */}
      <section className="border-t border-line bg-surface">
```

- [ ] **Step 3: Check homepage in dev server**

Open: http://localhost:3000
Expected: quote block appears between the hero and the about section. Left amber border, large italic serif text.

- [ ] **Step 4: Commit**

```bash
git add src/content/profile.ts src/app/page.tsx
git commit -m "feat: add literary quote block to homepage"
```

---

## Task 6: Homepage "From my library" teaser

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add import for library data**

At the top of `src/app/page.tsx`, add after the existing imports:

```tsx
import { BookCard } from "@/components/ui/BookCard";
import { featuredBooks } from "@/content/library";
```

- [ ] **Step 2: Add teaser section to `src/app/page.tsx`**

The file currently has (after the Featured work section, before the Contact CTA section):

```tsx
      {/* Contact CTA */}
      <section className="border-t border-line bg-surface">
```

Insert the library teaser before it:

```tsx
      {/* Library teaser */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <Reveal>
            <div className="flex items-end justify-between">
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                From my library
              </h2>
              <a
                href="/library"
                className="text-sm text-muted transition-colors hover:text-accent"
              >
                Browse all →
              </a>
            </div>
          </Reveal>
          <LibraryTeaser />
        </div>
      </section>

      {/* Contact CTA */}
      <section className="border-t border-line bg-surface">
```

- [ ] **Step 3: Add `LibraryTeaser` client component inline at bottom of file**

Because `BookCard` is `"use client"` and the homepage is a Server Component, extract just the interactive part. Add this **above** the `Home` default export:

```tsx
// Thin client wrapper so BookCard can fire onSelect
// The teaser intentionally has no detail panel — clicking a card navigates to /library
import { useRouter } from "next/navigation";
```

Wait — `useRouter` in a Server Component won't work. Instead, make `LibraryTeaser` a small client component that navigates to `/library` on card click rather than opening a panel (YAGNI — the full panel is on the library page itself).

Replace the import block at the top of `src/app/page.tsx` to look like this in full:

```tsx
import Link from "next/link";
import { HeroReveal, Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { LibraryTeaser } from "@/components/ui/LibraryTeaser";
import { profile } from "@/content/profile";
import { featuredProjects } from "@/content/projects";
```

- [ ] **Step 4: Create `src/components/ui/LibraryTeaser.tsx`**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { BookCard } from "@/components/ui/BookCard";
import { featuredBooks } from "@/content/library";
import type { Book } from "@/content/library";

export function LibraryTeaser() {
  const router = useRouter();

  function handleSelect(book: Book) {
    // On the homepage, clicking a book navigates to /library
    // (the full detail panel lives there)
    router.push("/library");
  }

  return (
    <div className="relative mt-10">
      <div
        className="flex gap-6 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {featuredBooks.map((book) => (
          <BookCard key={book.slug} book={book} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Check homepage in dev server**

Open: http://localhost:3000 and scroll to "From my library".
Expected: three book cards (ESL Ebook, Steal Like an Artist, The Art of Learning). Clicking any card navigates to `/library`.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/components/ui/LibraryTeaser.tsx
git commit -m "feat: add library teaser section to homepage"
```

---

## Task 7: Nav link + sitemap

**Files:**
- Modify: `src/components/ui/Nav.tsx`
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Add Library to nav links in `src/components/ui/Nav.tsx`**

Find the `links` array (line 9):

```ts
const links = [
  { href: "/work", label: "Work" },
  { href: "/resume", label: "Resume" },
  { href: "/links", label: "Links" },
  { href: "/contact", label: "Contact" },
];
```

Replace with:

```ts
const links = [
  { href: "/work", label: "Work" },
  { href: "/library", label: "Library" },
  { href: "/resume", label: "Resume" },
  { href: "/links", label: "Links" },
  { href: "/contact", label: "Contact" },
];
```

- [ ] **Step 2: Add `/library` to sitemap in `src/app/sitemap.ts`**

Find the `staticRoutes` array (line 6):

```ts
  const staticRoutes = ["", "/work", "/resume", "/links", "/contact"].map(
```

Replace with:

```ts
  const staticRoutes = ["", "/work", "/library", "/resume", "/links", "/contact"].map(
```

- [ ] **Step 3: Verify nav in dev server**

Open: http://localhost:3000
Expected: nav shows `Work · Library · Resume · Links · Contact`. Clicking Library navigates to `/library`. On mobile, hamburger menu includes Library.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Nav.tsx src/app/sitemap.ts
git commit -m "feat: add Library to nav and sitemap"
```

---

## Task 8: Build verification

- [ ] **Step 1: Run production build**

Run: `npm run build`
Expected output includes:
```
○ /library         (static)
```
Zero TypeScript errors, zero build errors.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors

- [ ] **Step 3: Mobile check (375px)**

In the preview browser, resize to 375×812. Visit `/library`.
Expected: shelf rows scroll horizontally with native momentum, cards are the right size, panel slides up from the bottom and fills most of the screen.

- [ ] **Step 4: Final commit if anything was fixed**

```bash
git add -A
git commit -m "fix: library build and lint cleanup"
```
