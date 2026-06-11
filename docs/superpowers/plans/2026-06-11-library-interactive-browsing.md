# Library Interactive Browsing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add shelf filter pills, cursor-sweep browsing, and click/hold arrow buttons to the `/library` page so every book is reachable and browsable with a mouse, finger, or keyboard.

**Architecture:** One hook (`useShelfScroller`) owns all programmatic scrolling per shelf — cursor sweep, arrow steps, and hold-to-run share a single target + rAF lerp loop so they never fight. A new `ShelfRow` component wraps the existing scroll row with arrow buttons. A new `ShelfFilter` pill bar drives a `filter` state in `LibraryClient`, which shows/hides shelf sections with Framer Motion `AnimatePresence`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Framer Motion 12.

**Spec:** `docs/superpowers/specs/2026-06-11-library-interactive-browsing-design.md`

**Note on testing:** This project has no test runner configured (no vitest/jest). The established verification pattern is `npx tsc --noEmit`, `npm run build`, `npm run lint`, and browser QA via the Claude Preview dev server. This plan follows that pattern; the feature is pointer-interaction-heavy, which browser QA covers better than JSDOM.

---

## File map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/hooks/useShelfScroller.ts` | All programmatic shelf scrolling: sweep, step, hold, edge state |
| Create | `src/components/ui/ShelfFilter.tsx` | Pill bar: All + one pill per shelf |
| Create | `src/components/ui/ShelfRow.tsx` | Scroll row + arrow buttons + edge fade |
| Modify | `src/app/library/LibraryClient.tsx` | Filter state, AnimatePresence sections, use ShelfRow |

`BookCard`, `BookDetailPanel`, `page.tsx`, and all content files are untouched.

---

## Task 1: useShelfScroller hook

**Files:**
- Create: `src/hooks/useShelfScroller.ts`

- [ ] **Step 1: Create `src/hooks/useShelfScroller.ts`**

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Arrow step distance — two cards: 2 × (180px card + 20px gap) */
const STEP_PX = 400;
/** Pixels per frame while an arrow is held (≈ 420 px/s at 60fps) */
const HOLD_SPEED = 7;
/** Lerp factor easing scrollLeft toward the target — the "silk" feel */
const LERP = 0.12;
/** Repeat interval for hold-to-run on touch devices */
const TOUCH_HOLD_MS = 300;

export type ShelfScroller<T extends HTMLElement> = {
  ref: React.RefObject<T | null>;
  /** Arrow click: advance the shelf by ~2 cards */
  step: (dir: -1 | 1) => void;
  /** Arrow press-and-hold: run the shelf continuously */
  startHold: (dir: -1 | 1) => void;
  endHold: () => void;
  /** False at the far left — dims the ‹ arrow */
  canLeft: boolean;
  /** False at the far right — dims the › arrow */
  canRight: boolean;
  /** False when all books fit on screen — hides both arrows */
  hasOverflow: boolean;
};

export function useShelfScroller<T extends HTMLElement>(): ShelfScroller<T> {
  const ref = useRef<T | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Engine state lives in refs — it changes every animation frame.
  const target = useRef(0);
  const holdDir = useRef<0 | -1 | 1>(0);
  const rafId = useRef(0);
  const engineOn = useRef(false);
  const fine = useRef(false);     // pointer-fine (mouse/trackpad) device
  const reduced = useRef(false);  // prefers-reduced-motion
  const overRow = useRef(false);  // cursor currently over the row
  const touchHold = useRef<ReturnType<typeof setInterval> | null>(null);

  const clamp = useCallback((v: number) => {
    const el = ref.current;
    if (!el) return 0;
    return Math.min(Math.max(v, 0), el.scrollWidth - el.clientWidth);
  }, []);

  const updateEdges = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setHasOverflow(max > 4);
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < max - 4);
  }, []);

  const tick = useCallback(() => {
    const el = ref.current;
    if (!el) {
      engineOn.current = false;
      return;
    }
    if (holdDir.current) {
      target.current = clamp(target.current + holdDir.current * HOLD_SPEED);
    }
    const delta = target.current - el.scrollLeft;
    el.scrollLeft = reduced.current
      ? target.current
      : el.scrollLeft + delta * LERP;
    updateEdges();
    const settled = Math.abs(target.current - el.scrollLeft) < 0.5;
    if (settled && !overRow.current && !holdDir.current) {
      engineOn.current = false;
      return;
    }
    rafId.current = requestAnimationFrame(tick);
  }, [clamp, updateEdges]);

  const wake = useCallback(() => {
    if (!engineOn.current) {
      engineOn.current = true;
      rafId.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const step = useCallback(
    (dir: -1 | 1) => {
      const el = ref.current;
      if (!el) return;
      if (!fine.current) {
        // Touch: native smooth scroll settles onto scroll-snap points.
        el.scrollBy({
          left: dir * STEP_PX,
          behavior: reduced.current ? "auto" : "smooth",
        });
        return;
      }
      target.current = clamp(target.current + dir * STEP_PX);
      wake();
    },
    [clamp, wake]
  );

  const startHold = useCallback(
    (dir: -1 | 1) => {
      const el = ref.current;
      if (!el) return;
      if (!fine.current) {
        touchHold.current = setInterval(() => {
          el.scrollBy({ left: dir * STEP_PX, behavior: "smooth" });
        }, TOUCH_HOLD_MS);
        return;
      }
      holdDir.current = dir;
      wake();
    },
    [wake]
  );

  const endHold = useCallback(() => {
    holdDir.current = 0;
    if (touchHold.current) {
      clearInterval(touchHold.current);
      touchHold.current = null;
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    fine.current = window.matchMedia("(pointer: fine)").matches;
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    target.current = el.scrollLeft;
    updateEdges();
    window.addEventListener("resize", updateEdges);

    if (!fine.current) {
      // Touch devices keep native swipe + snap; arrows use scrollBy.
      const onScroll = () => updateEdges();
      el.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("resize", updateEdges);
        el.removeEventListener("scroll", onScroll);
        if (touchHold.current) clearInterval(touchHold.current);
      };
    }

    // Pointer-fine: programmatic scrolling fights snap — disable it.
    const prevSnap = el.style.scrollSnapType;
    el.style.scrollSnapType = "none";

    const onMove = (e: MouseEvent) => {
      if (holdDir.current) return; // hold owns the target while active
      const r = el.getBoundingClientRect();
      let x = (e.clientX - r.left) / r.width;
      // Outer 8% on each side pins to the ends.
      x = Math.min(1, Math.max(0, (x - 0.08) / 0.84));
      target.current = x * (el.scrollWidth - el.clientWidth);
    };
    const onEnter = () => {
      overRow.current = true;
      wake();
    };
    const onLeave = () => {
      overRow.current = false;
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.style.scrollSnapType = prevSnap;
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", updateEdges);
      cancelAnimationFrame(rafId.current);
      engineOn.current = false;
      if (touchHold.current) clearInterval(touchHold.current);
    };
  }, [updateEdges, wake]);

  return { ref, step, startHold, endHold, canLeft, canRight, hasOverflow };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useShelfScroller.ts
git -c user.name="Jereme Saramosing" -c user.email="jeremesaramosing05@gmail.com" commit -m "feat: add useShelfScroller hook for sweep, step, and hold scrolling"
```

---

## Task 2: ShelfFilter component

**Files:**
- Create: `src/components/ui/ShelfFilter.tsx`

- [ ] **Step 1: Create `src/components/ui/ShelfFilter.tsx`**

```tsx
"use client";

import { shelves, type ShelfId } from "@/content/library";

export type ShelfFilterValue = ShelfId | "all";

type Props = {
  value: ShelfFilterValue;
  onChange: (value: ShelfFilterValue) => void;
};

const pills: { id: ShelfFilterValue; label: string }[] = [
  { id: "all", label: "All" },
  ...shelves.map((s) => ({ id: s.id as ShelfFilterValue, label: s.label })),
];

export function ShelfFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 px-6 sm:px-0">
      {pills.map((pill) => {
        const active = value === pill.id;
        return (
          <button
            key={pill.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(pill.id)}
            className={`rounded-full border px-4 py-1.5 text-sm tracking-wide transition-all duration-300 ${
              active
                ? "border-accent bg-accent text-background"
                : "border-line text-muted hover:-translate-y-px hover:border-accent hover:text-accent"
            }`}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ShelfFilter.tsx
git -c user.name="Jereme Saramosing" -c user.email="jeremesaramosing05@gmail.com" commit -m "feat: add ShelfFilter pill bar component"
```

---

## Task 3: ShelfRow component

**Files:**
- Create: `src/components/ui/ShelfRow.tsx`

- [ ] **Step 1: Create `src/components/ui/ShelfRow.tsx`**

The scroll row markup (flex, gap, snap styles, edge fade) moves here from
`LibraryClient` unchanged, gaining the scroller ref and the two arrow buttons.

```tsx
"use client";

import { useRef } from "react";
import { BookCard } from "@/components/ui/BookCard";
import { useShelfScroller } from "@/hooks/useShelfScroller";
import type { Book } from "@/content/library";

/** Press this long before a hold starts running the shelf */
const HOLD_DELAY_MS = 250;

type Props = {
  books: Book[];
  onSelect: (book: Book) => void;
};

function Chevron({ dir }: { dir: -1 | 1 }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === -1 ? <path d="M10 3 5 8l5 5" /> : <path d="m6 3 5 5-5 5" />}
    </svg>
  );
}

export function ShelfRow({ books, onSelect }: Props) {
  const { ref, step, startHold, endHold, canLeft, canRight, hasOverflow } =
    useShelfScroller<HTMLDivElement>();
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);

  function pressStart(dir: -1 | 1) {
    held.current = false;
    holdTimer.current = setTimeout(() => {
      held.current = true;
      startHold(dir);
    }, HOLD_DELAY_MS);
  }

  function pressEnd() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    endHold();
  }

  function clickStep(dir: -1 | 1) {
    // A completed hold already moved the shelf — don't add a step on release.
    if (held.current) {
      held.current = false;
      return;
    }
    step(dir);
  }

  const arrowBase =
    "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/90 text-accent shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-accent hover:text-background";

  return (
    <div className="relative mt-6">
      {hasOverflow && (
        <button
          type="button"
          aria-label="Scroll shelf left"
          onClick={() => clickStep(-1)}
          onPointerDown={() => pressStart(-1)}
          onPointerUp={pressEnd}
          onPointerLeave={pressEnd}
          className={`${arrowBase} left-2 ${
            canLeft ? "" : "pointer-events-none opacity-25"
          }`}
        >
          <Chevron dir={-1} />
        </button>
      )}

      <div
        ref={ref}
        className="flex gap-5 overflow-x-auto px-6 pb-4 sm:px-0"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {books.map((book) => (
          <BookCard key={book.slug} book={book} onSelect={onSelect} />
        ))}
      </div>

      {hasOverflow && (
        <button
          type="button"
          aria-label="Scroll shelf right"
          onClick={() => clickStep(1)}
          onPointerDown={() => pressStart(1)}
          onPointerUp={pressEnd}
          onPointerLeave={pressEnd}
          className={`${arrowBase} right-2 ${
            canRight ? "" : "pointer-events-none opacity-25"
          }`}
        >
          <Chevron dir={1} />
        </button>
      )}

      {/* Right-edge fade hint */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ShelfRow.tsx
git -c user.name="Jereme Saramosing" -c user.email="jeremesaramosing05@gmail.com" commit -m "feat: add ShelfRow with arrow buttons and shelf scroller"
```

---

## Task 4: LibraryClient integration

**Files:**
- Modify: `src/app/library/LibraryClient.tsx` (full rewrite below)

- [ ] **Step 1: Replace the contents of `src/app/library/LibraryClient.tsx`**

Changes vs. current file: adds `filter` state + `ShelfFilter`, swaps the
`Reveal` wrapper for `AnimatePresence` + `motion.section` (Reveal and
AnimatePresence both animate opacity and would conflict), and moves the row
markup into `ShelfRow`. The shelf header and `BookDetailPanel` wiring stay.

```tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookDetailPanel } from "@/components/ui/BookDetailPanel";
import { ShelfFilter, type ShelfFilterValue } from "@/components/ui/ShelfFilter";
import { ShelfRow } from "@/components/ui/ShelfRow";
import { shelves, getShelfBooks, type Book } from "@/content/library";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export function LibraryClient() {
  const [selected, setSelected] = useState<Book | null>(null);
  const [filter, setFilter] = useState<ShelfFilterValue>("all");
  const reduce = useReducedMotion();

  return (
    <>
      <div className="mt-10">
        <ShelfFilter value={filter} onChange={setFilter} />
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        {shelves
          .filter((shelf) => filter === "all" || filter === shelf.id)
          .map((shelf) => {
            const shelfBooks = getShelfBooks(shelf.id);
            return (
              <motion.section
                key={shelf.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: 12 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="mt-16 first:mt-12"
              >
                {/* Shelf label */}
                <div className="flex items-baseline gap-3 px-6 sm:px-0">
                  <h2 className="font-display text-2xl tracking-tight">
                    {shelf.label}
                  </h2>
                  <span className="text-sm text-muted">·</span>
                  <span className="text-sm text-muted">
                    {shelfBooks.length} books
                  </span>
                </div>

                <ShelfRow books={shelfBooks} onSelect={setSelected} />
              </motion.section>
            );
          })}
      </AnimatePresence>

      <BookDetailPanel book={selected} onClose={() => setSelected(null)} />
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript and build**

Run: `npx tsc --noEmit && npm run build`
Expected: zero errors; route list includes `○ /library`

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: no errors (the old `Reveal` import must be gone)

- [ ] **Step 4: Commit**

```bash
git add src/app/library/LibraryClient.tsx
git -c user.name="Jereme Saramosing" -c user.email="jeremesaramosing05@gmail.com" commit -m "feat: wire shelf filter, sweep, and arrows into library page"
```

---

## Task 5: Browser QA

Use the Claude Preview dev server (`.claude/launch.json` name: `dev`, port 3000).

- [ ] **Step 1: Desktop QA at default viewport on http://localhost:3000/library**

- Sweep: move the cursor across the Original Comics shelf (7 books) — the row
  glides end-to-end following the cursor; hovering a card still lifts it;
  clicking still opens the detail panel.
- Arrows: `‹ ›` visible on overflowing shelves; click steps ~2 cards smoothly;
  press-and-hold runs the shelf until release; `‹` dims at far left, `›` dims at
  far right.
- Short shelf (Written by Me, 2 books): no arrows rendered, row doesn't move.
- Filter: click "Original Comics" — other shelves animate out (fade + slide),
  remaining section glides up; "All" restores everything; active pill is
  accent-filled; `aria-pressed="true"` on the active pill only.
- Keyboard: Tab reaches pills and arrows in order; Enter/Space activates a pill
  (filters) and an arrow (steps the shelf).

- [ ] **Step 2: Mobile QA at 375×812 (preview_resize)**

- Pills wrap to multiple lines and filter correctly on tap.
- Shelves swipe natively with snap; arrows tap-step the shelf.
- No cursor-sweep side effects.

- [ ] **Step 3: Reduced-motion QA**

Emulate `prefers-reduced-motion: reduce` (preview_eval:
`matchMedia` emulation isn't possible — instead verify via devtools emulation or
confirm the code paths: `reduce` flag in LibraryClient and `reduced.current` in
the hook). Filter switches without animation; sweep/step jump without lerp.

- [ ] **Step 4: Check console for errors**

preview_console_logs (level: error) — no new errors on /library.

- [ ] **Step 5: Fix anything found, re-verify, commit fixes**

```bash
git add -A
git -c user.name="Jereme Saramosing" -c user.email="jeremesaramosing05@gmail.com" commit -m "fix: library browsing QA fixes"
```

(Skip the commit if nothing needed fixing.)

---

## Task 6: Ship

- [ ] **Step 1: Push to GitHub**

```bash
git push
```

- [ ] **Step 2: Deploy to Vercel production**

```bash
npx -y vercel@latest deploy --prod --yes
```

- [ ] **Step 3: Verify live**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://jereme-website.vercel.app/library
```

Expected: `200`. Spot-check https://jereme-website.vercel.app/library in the
preview browser: pills present, arrows present, sweep works.
