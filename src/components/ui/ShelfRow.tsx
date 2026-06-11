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
          onPointerLeave={() => {
            pressEnd();
            held.current = false; // pointerleave never precedes a click — safe to reset
          }}
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
          onPointerLeave={() => {
            pressEnd();
            held.current = false; // pointerleave never precedes a click — safe to reset
          }}
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
