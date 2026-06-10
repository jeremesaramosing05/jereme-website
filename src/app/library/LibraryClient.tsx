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
                <span className="text-sm text-muted">·</span>
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
