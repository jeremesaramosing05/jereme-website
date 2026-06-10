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
