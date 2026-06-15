"use client";

/**
 * Embeds the Reader live demo (a self-contained static page under
 * /public/demos/reader). An interactive preview of the Android reading app —
 * browse the library, open a book, switch themes, resize the type. Runs
 * entirely in the visitor's browser.
 */
export function ReaderDemo() {
  return (
    <figure className="m-0">
      <div className="overflow-hidden rounded-xl border border-line bg-[#f7f2e9]">
        <iframe
          src="/demos/reader/index.html"
          title="Reader — interactive ebook app demo"
          className="h-[82vh] min-h-[760px] w-full border-0"
          loading="lazy"
        />
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span>An interactive preview of the app — runs fully in your browser.</span>
        <a
          href="/demos/reader/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-accent"
        >
          Open full screen ↗
        </a>
      </figcaption>
    </figure>
  );
}
