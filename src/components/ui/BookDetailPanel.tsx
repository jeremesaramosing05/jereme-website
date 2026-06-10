"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { createPortal } from "react-dom";
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
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

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

  // Focus trap: intercept Tab/Shift-Tab inside the panel
  useEffect(() => {
    if (!book) return;

    function trapFocus(e: KeyboardEvent) {
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", trapFocus);
    return () => document.removeEventListener("keydown", trapFocus);
  }, [book]);

  useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);

  const shelfLabel = book
    ? (shelves.find((s) => s.id === book.shelf)?.label ?? "")
    : "";

  // PDFs live in /public — serve them with a plain anchor in a new tab,
  // not client-side routing
  const isInternal = book?.link?.startsWith("/") && !book.link.endsWith(".pdf");

  if (!mounted) return null;
  return createPortal(
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
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={book.title}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-surface p-6 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-md sm:rounded-2xl sm:p-8"
            initial={reduce ? false : { opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: 48 }}
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
                    {book.isMine ? "Read my work →" : "Learn more →"}
                  </Link>
                ) : (
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                  >
                    {book.isMine ? "Read my work →" : "Learn more →"}
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
