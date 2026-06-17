"use client";

import { useState } from "react";
import type { Notebook } from "@/lib/notebook/types";
import { useNotebookStore, makeSource } from "./store";
import { AddSourceModal, type DraftSource } from "./AddSourceModal";
import { DocIcon, PlusIcon, TableIcon, TrashIcon } from "./icons";

export function SourcesPanel({ notebook }: { notebook: Notebook }) {
  const { updateNotebook } = useNotebookStore();
  const [open, setOpen] = useState(false);

  function addSources(drafts: DraftSource[]) {
    updateNotebook(notebook.id, (nb) => ({
      ...nb,
      sources: [...nb.sources, ...drafts.map((d) => makeSource(d.title, d.content))],
    }));
  }

  function toggle(id: string) {
    updateNotebook(notebook.id, (nb) => ({
      ...nb,
      sources: nb.sources.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s)),
    }));
  }

  function remove(id: string) {
    updateNotebook(notebook.id, (nb) => ({
      ...nb,
      sources: nb.sources.filter((s) => s.id !== id),
    }));
  }

  return (
    <section className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="font-display text-lg tracking-tight">Sources</h2>
        <span className="text-xs text-muted">{notebook.sources.length}</span>
      </div>

      <div className="px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-line py-2 text-sm transition-colors hover:border-accent hover:text-accent"
        >
          <PlusIcon width={16} height={16} /> Add source
        </button>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto px-4 pb-4">
        {notebook.sources.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3 px-2 text-center text-muted">
            <DocIcon width={28} height={28} />
            <p className="text-sm leading-relaxed">
              Saved sources appear here. Add notes, articles, transcripts, or CSV data — then
              generate reports and analysis from them.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {notebook.sources.map((s) => (
              <li
                key={s.id}
                className="group flex items-start gap-2 rounded-lg border border-line bg-background p-2.5"
              >
                <input
                  type="checkbox"
                  checked={s.selected}
                  onChange={() => toggle(s.id)}
                  aria-label={`Include ${s.title}`}
                  className="mt-1 h-4 w-4 accent-[var(--accent)]"
                />
                <span className="mt-0.5 text-muted">
                  {s.kind === "csv" ? <TableIcon width={16} height={16} /> : <DocIcon width={16} height={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.title}</p>
                  <p className="truncate text-xs text-muted">
                    {s.kind === "csv" ? "Table" : "Text"} · {s.content.split(/\s+/).filter(Boolean).length} words
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  aria-label={`Remove ${s.title}`}
                  className="text-muted opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                >
                  <TrashIcon width={15} height={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddSourceModal open={open} onClose={() => setOpen(false)} onAdd={addSources} />
    </section>
  );
}
