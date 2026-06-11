# Library Interactive Browsing — Design Spec
**Date:** 2026-06-11
**Status:** Approved

## Context

The `/library` page has five shelves rendered as vertical sections, each a horizontal
scroll row. Jereme wants two upgrades, both validated with live interactive mockups:

1. **Shelf filter** — a way to choose a category (e.g. only Original Comics) instead
   of scrolling past every shelf. Chosen behavior: **filter the page** (not jump-to-shelf).
2. **Cursor Sweep browsing** — on desktop, a shelf row follows the cursor: sweeping
   the mouse across the row glides through the entire shelf in one motion. Chosen over
   edge-glide and auto-drift alternatives in a live A/B/C demo.
3. **Shelf arrows** — visible `‹ ›` buttons at both ends of each shelf. Added after
   Jereme found the mouse-only interface gave no way to reach off-screen books
   (hidden scrollbar, no affordance). Click steps the shelf; press-and-hold runs it
   continuously. Approved in a follow-up mockup: "beautiful and useful… easy and
   accessible."

Everything else — BookCard, BookDetailPanel, comics PDFs, homepage teaser — stays as is.

---

## New component: `src/components/ui/ShelfFilter.tsx`

Client component. Pill-shaped filter buttons rendered under the page heading.

**Props:**
```ts
type ShelfFilterValue = ShelfId | "all";
type Props = {
  value: ShelfFilterValue;
  onChange: (value: ShelfFilterValue) => void;
};
```

**Rendering:**
- First pill: "All", then one pill per entry in `shelves` (from `@/content/library`),
  in array order. Adding a shelf to the data file automatically adds a pill.
- Pills are `<button type="button">` with `aria-pressed={active}`.
- Active pill: `bg-accent text-background border-accent`.
- Inactive pill: `border-line text-muted`, hover: `border-accent text-accent` with a
  slight `-translate-y-px` lift.
- Layout: `flex flex-wrap gap-2`, transitions 200–300ms.

## New hook: `src/hooks/useShelfScroller.ts`

One hook owns all programmatic scrolling for a shelf row — cursor sweep, arrow
steps, and hold-to-run share a single target + animation loop so they never fight.

```ts
type ShelfScroller<T extends HTMLElement> = {
  ref: React.RefObject<T | null>;
  step: (dir: -1 | 1) => void;       // arrow click
  startHold: (dir: -1 | 1) => void;  // arrow press-and-hold
  endHold: () => void;
  canLeft: boolean;                  // false at far left (dims the ‹ arrow)
  canRight: boolean;                 // false at far right (dims the › arrow)
  hasOverflow: boolean;              // false when books fit — arrows hidden
};
function useShelfScroller<T extends HTMLElement>(): ShelfScroller<T>;
```

**Shared engine (pointer-fine devices):**
- A `requestAnimationFrame` loop eases `scrollLeft` toward a `target` with lerp
  factor 0.12 (the "silk" feel from the approved demo). Runs while the cursor is
  over the row, a hold is active, or the lerp hasn't settled; stops when idle.
- On activation sets `scrollSnapType = "none"` on the element (snap fights
  programmatic scrolling); restores on cleanup.
- `prefers-reduced-motion: reduce`: no lerp — `scrollLeft` jumps to target.

**Cursor sweep (pointer-fine only):**
- `mousemove` maps cursor X fraction (outer 6–8% pins to the ends) to
  `target = fraction * (scrollWidth - clientWidth)`. Ignored while a hold is active.

**Arrows (all devices, including touch):**
- `step(dir)`: `target += dir * 400` (two card widths: 2 × (180px card + 20px gap)),
  clamped to the scroll range. On touch devices (no rAF engine) it uses native
  `scrollBy({ left, behavior: "smooth" })` so scroll-snap settles naturally.
- `startHold(dir)`: after a 250ms press, the target advances ~7px/frame until
  `endHold()` — the "books run past automatically" behavior. On touch, hold repeats
  a step every 300ms instead.
- `canLeft` / `canRight` / `hasOverflow` update from scroll position (recomputed in
  the loop / on scroll, set as React state only when the value changes).
- All listeners and rAF cleaned up on unmount.

## New component: `src/components/ui/ShelfRow.tsx`

Client component. Extracts the scroll row from `LibraryClient` and adds the arrows.

**Props:**
```ts
type Props = {
  books: Book[];
  onSelect: (book: Book) => void;
};
```

**Rendering:**
- Wrapper `div.relative`, containing: left arrow, the scroll row (current markup —
  `flex gap-5 overflow-x-auto` + snap styles + `BookCard`s), right arrow, and the
  existing right-edge fade.
- Arrow buttons: 38px circles, absolutely positioned at the row's vertical center,
  `left-2` / `right-2`, above the cards (`z-10`). Style: `bg-surface/90 border
  border-line text-accent shadow-md`, hover `bg-accent text-background scale-105`.
  Chevron glyphs `‹ ›` (SVG strokes, consistent with the site's icon style).
- `aria-label`: "Scroll shelf left" / "Scroll shelf right".
- Arrow at the end of its range: `opacity-25 pointer-events-none` (from
  `canLeft`/`canRight`). No overflow → both arrows unrendered (`hasOverflow`).
- Pointer handlers: `onClick` → `step`; `onPointerDown` (after 250ms) → `startHold`;
  `onPointerUp`/`onPointerLeave` → `endHold`. Keyboard: Enter/Space trigger the
  click step (native button behavior).

## Modified: `src/app/library/LibraryClient.tsx`

- New state: `const [filter, setFilter] = useState<ShelfFilterValue>("all")`.
- Render `<ShelfFilter value={filter} onChange={setFilter} />` above the shelves
  (inside the existing layout, after the page header block).
- Shelf sections wrap in `<AnimatePresence mode="popLayout">`; each section becomes a
  `motion.section` with `layout`, fade + 12px y-offset enter/exit (250ms,
  the site's standard EASE `[0.21, 0.47, 0.32, 0.98]`). Sections render only when
  `filter === "all" || filter === shelf.id`.
- Respect `useReducedMotion()`: skip enter/exit animation values when reduced.
- The row markup moves into `<ShelfRow books={shelfBooks} onSelect={setSelected} />`.
- The shelf header, BookCard rendering, and BookDetailPanel wiring stay unchanged.

---

## What is NOT included
- No changes to the homepage `LibraryTeaser` (3 books fit on screen; nothing to sweep).
- No URL/query-param persistence of the selected filter (YAGNI).
- No auto-drift or edge-glide modes (explored and not chosen).
- No changes to BookCard, BookDetailPanel, or content files.

---

## Verification
1. `npx tsc --noEmit` and `npm run build` — zero errors.
2. Desktop preview: sweep a long shelf (Original Comics, 7 books) — row follows the
   cursor smoothly end-to-end; hover lift and click-to-open panel still work.
3. Arrows: visible on overflowing shelves; click steps ~2 cards; press-and-hold runs
   the shelf continuously until release; `‹` dims at far left, `›` dims at far
   right; no arrows on a short shelf (Written by Me, 2 books).
4. Filter: click "Original Comics" — other shelves animate out; "All" restores them.
   Active pill styled in accent color; `aria-pressed` correct.
5. Mobile (375px): pills wrap to multiple lines and work; arrows tap-step the shelf;
   shelves swipe natively with snap; no cursor sweep.
6. Reduced motion (emulate in devtools): filter switches without animation; sweep
   and arrows jump without lerp.
7. Keyboard: Tab reaches arrows and pills; Enter/Space activates them.
