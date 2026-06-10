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
