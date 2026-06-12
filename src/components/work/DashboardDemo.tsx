"use client";

/**
 * Embeds the Insight Desk live demo (a self-contained static build under
 * /public/demos/data-dashboard). Runs entirely in the visitor's browser.
 */
export function DashboardDemo() {
  return (
    <figure className="m-0">
      <div className="overflow-hidden rounded-xl border border-line bg-[#0f1117]">
        <iframe
          src="/demos/data-dashboard/index.html"
          title="Insight Desk — live data dashboard demo"
          className="h-[78vh] min-h-[620px] w-full border-0"
          allow="clipboard-write"
          loading="lazy"
        />
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span>Runs fully in your browser — your data never leaves this page.</span>
        <a
          href="/demos/data-dashboard/index.html"
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
