"use client";

import { useRouter } from "next/navigation";
import { BookCard } from "@/components/ui/BookCard";
import { featuredBooks } from "@/content/library";
import type { Book } from "@/content/library";

export function LibraryTeaser() {
  const router = useRouter();

  function handleSelect(_book: Book) {
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
