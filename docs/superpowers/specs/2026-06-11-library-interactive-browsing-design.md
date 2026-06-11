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

## New hook: `src/hooks/useCursorSweep.ts`

Encapsulates the sweep behavior. Returns a ref to attach to a horizontally
scrollable row element.

```ts
function useCursorSweep<T extends HTMLElement>(): React.RefObject<T | null>;
```

**Behavior:**
- Activates only when `window.matchMedia("(pointer: fine)").matches` — mouse/trackpad
  devices. Touch devices keep native swipe + scroll-snap untouched.
- On activation, sets `scrollSnapType = "none"` on the element (snap fights
  programmatic scrolling); restores on cleanup.
- `mousemove` on the row: cursor X fraction across the row, clamped so the
  outer 6% on each side pins to the ends, maps to target
  `scrollLeft = fraction * (scrollWidth - clientWidth)`.
- A `requestAnimationFrame` loop eases actual `scrollLeft` toward the target with
  lerp factor 0.12 (the "silk" feel from the approved demo).
- If `prefers-reduced-motion: reduce`: no lerp — set `scrollLeft` to target directly.
- If `scrollWidth <= clientWidth` (shelf fits on screen): do nothing.
- The rAF loop runs only while the cursor is over the row (start on `mouseenter`,
  stop after the lerp settles following `mouseleave`); listeners and rAF are cleaned
  up on unmount.
- Native wheel and drag scrolling still work when the cursor is outside the row.

## Modified: `src/app/library/LibraryClient.tsx`

- New state: `const [filter, setFilter] = useState<ShelfFilterValue>("all")`.
- Render `<ShelfFilter value={filter} onChange={setFilter} />` above the shelves
  (inside the existing layout, after the page header block).
- Shelf sections wrap in `<AnimatePresence mode="popLayout">`; each section becomes a
  `motion.section` with `layout`, fade + 12px y-offset enter/exit (200–300ms,
  site's standard ease). Sections render only when `filter === "all" || filter === shelf.id`.
- Respect `useReducedMotion()`: skip enter/exit animation values when reduced.
- Each scroll row gets the `useCursorSweep` ref. The inline `scrollSnapType:
  "x mandatory"` style stays (the hook disables it at runtime on pointer-fine
  devices only).
- The shelf header, edge fade, BookCard rendering, and BookDetailPanel wiring stay
  unchanged.

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
3. Filter: click "Original Comics" — other shelves animate out; "All" restores them.
   Active pill styled in accent color; `aria-pressed` correct.
4. Short shelf (Written by Me, 2 books): no sweep movement, no errors.
5. Mobile (375px): pills wrap to multiple lines and work; shelves swipe natively
   with snap; no cursor behavior.
6. Reduced motion (emulate in devtools): filter switches without animation; sweep
   jumps without lerp.
