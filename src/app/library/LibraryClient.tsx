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
