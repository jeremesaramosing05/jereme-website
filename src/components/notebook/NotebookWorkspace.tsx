"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotebookStore } from "./store";
import { SourcesPanel } from "./SourcesPanel";
import { AskPanel } from "./AskPanel";
import { StudioPanel } from "./StudioPanel";
import { BackIcon, TrashIcon } from "./icons";

type Tab = "sources" | "chat" | "studio";

export function NotebookWorkspace({ id }: { id: string }) {
  const { getNotebook, hydrated, renameNotebook, deleteNotebook } = useNotebookStore();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("chat");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const notebook = getNotebook(id);

  if (!hydrated) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-muted">Loading…</div>
    );
  }

  if (!notebook) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted">This notebook could not be found in this browser.</p>
        <Link href="/notebook" className="text-sm text-accent hover:underline">
          ← Back to notebooks
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex items-center gap-3 border-b border-line px-4 py-2.5">
        <Link
          href="/notebook"
          aria-label="Back to notebooks"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-accent"
        >
          <BackIcon />
        </Link>
        <span className="shrink-0 text-xl" aria-hidden>
          {notebook.emoji}
        </span>
        <input
          key={notebook.id}
          defaultValue={notebook.title}
          onChange={(e) => renameNotebook(notebook.id, e.target.value)}
          aria-label="Notebook title"
          className="min-w-0 flex-1 truncate bg-transparent font-display text-lg tracking-tight outline-none"
        />
        <button
          type="button"
          onClick={() => {
            if (confirmDelete) {
              deleteNotebook(notebook.id);
              router.push("/notebook");
            } else {
              setConfirmDelete(true);
              setTimeout(() => setConfirmDelete(false), 3000);
            }
          }}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
            confirmDelete
              ? "border-red-500/60 text-red-500"
              : "border-line text-muted hover:border-accent hover:text-accent"
          }`}
        >
          <TrashIcon width={14} height={14} />
          {confirmDelete ? "Click again" : "Delete"}
        </button>
      </header>

      {/* Panel switcher (mobile only) */}
      <div className="flex gap-1 border-b border-line px-3 py-2 md:hidden">
        {(
          [
            ["sources", "Sources"],
            ["chat", "Chat"],
            ["studio", "Studio"],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-1.5 text-sm transition-colors ${
              tab === t ? "bg-foreground text-background" : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid flex-1 grid-rows-1 overflow-hidden md:grid-cols-[280px_minmax(0,1fr)_340px]">
        <div className={`overflow-hidden border-line md:block md:border-r ${tab === "sources" ? "" : "hidden"}`}>
          <SourcesPanel notebook={notebook} />
        </div>
        <div className={`overflow-hidden md:block ${tab === "chat" ? "" : "hidden"}`}>
          <AskPanel notebook={notebook} />
        </div>
        <div className={`overflow-hidden border-line md:block md:border-l ${tab === "studio" ? "" : "hidden"}`}>
          <StudioPanel notebook={notebook} />
        </div>
      </div>
    </div>
  );
}
