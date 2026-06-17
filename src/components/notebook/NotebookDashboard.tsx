"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import type { Notebook } from "@/lib/notebook/types";
import { templates } from "@/lib/notebook/sampleData";
import { useNotebookStore } from "./store";
import { DocIcon, DotsIcon, PlusIcon, SearchIcon } from "./icons";

type Tab = "all" | "mine" | "featured";

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function CreateTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[150px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line text-muted transition-colors hover:border-accent hover:text-accent"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-current">
        <PlusIcon width={22} height={22} />
      </span>
      <span className="text-sm">Create new notebook</span>
    </button>
  );
}

function NotebookCard({
  notebook,
  onOpen,
  onDelete,
}: {
  notebook: Notebook;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="relative flex min-h-[150px] flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent">
      <div className="flex items-start justify-between">
        <span className="text-3xl" aria-hidden>
          {notebook.emoji}
        </span>
        <div className="relative">
          <button
            type="button"
            aria-label="Notebook options"
            onClick={() => setMenu((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-accent"
          >
            <DotsIcon />
          </button>
          {menu && (
            <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
              <button
                type="button"
                onClick={() => {
                  if (confirm) onDelete();
                  else {
                    setConfirm(true);
                    setTimeout(() => setConfirm(false), 3000);
                  }
                }}
                className="block w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-background"
              >
                {confirm ? "Click again to delete" : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>

      <button type="button" onClick={onOpen} className="mt-auto block text-left">
        <h3 className="font-display text-lg leading-snug tracking-tight transition-colors hover:text-accent">
          {notebook.title}
        </h3>
        <p className="mt-1 text-xs text-muted">
          {fmtDate(notebook.createdAt)} · {notebook.sources.length} source
          {notebook.sources.length === 1 ? "" : "s"}
        </p>
      </button>
    </div>
  );
}

export function NotebookDashboard() {
  const { notebooks, createNotebook, deleteNotebook } = useNotebookStore();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  function open(id: string) {
    router.push(`/notebook/${id}`);
  }

  function create() {
    open(createNotebook());
  }

  function openTemplate(t: (typeof templates)[number]) {
    open(createNotebook({ title: t.title, emoji: t.emoji, sources: t.sources }));
  }

  const filtered = notebooks.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()));
  const showMine = tab === "all" || tab === "mine";
  const showFeatured = tab === "all" || tab === "featured";

  return (
    <div className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Notebook</h1>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          A private workspace to compile reports, organize sources, and run simple analysis. Add
          your own text or CSV data — everything is processed and saved right in your browser, with
          no account and no AI.
        </p>
      </Reveal>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(
            [
              ["all", "All"],
              ["mine", "My notebooks"],
              ["featured", "Featured"],
            ] as [Tab, string][]
          ).map(([t, label]) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                tab === t
                  ? "border-accent bg-accent text-background"
                  : "border-line text-muted hover:border-accent hover:text-accent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 rounded-full border border-line px-3 py-1.5 focus-within:border-accent">
          <SearchIcon width={16} height={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notebooks"
            className="w-36 bg-transparent text-sm outline-none sm:w-48"
          />
        </div>

        <button
          type="button"
          onClick={create}
          className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background transition-colors hover:bg-accent-strong"
        >
          <PlusIcon width={16} height={16} /> Create new
        </button>
      </div>

      {showMine && (
        <section className="mt-10">
          <h2 className="font-display text-2xl tracking-tight">My notebooks</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <CreateTile onClick={create} />
            {filtered.map((n) => (
              <NotebookCard
                key={n.id}
                notebook={n}
                onOpen={() => open(n.id)}
                onDelete={() => deleteNotebook(n.id)}
              />
            ))}
          </div>
          {notebooks.length === 0 && (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted">
              <DocIcon width={16} height={16} /> No notebooks yet — create one, or try a featured
              template below.
            </p>
          )}
        </section>
      )}

      {showFeatured && (
        <section className="mt-14">
          <h2 className="font-display text-2xl tracking-tight">Featured notebooks</h2>
          <p className="mt-1 text-sm text-muted">Starter templates — open one to get an editable copy.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => openTemplate(t)}
                className="flex min-h-[150px] flex-col rounded-2xl border border-line bg-surface p-5 text-left transition-colors hover:border-accent"
              >
                <span className="text-3xl" aria-hidden>
                  {t.emoji}
                </span>
                <h3 className="mt-auto font-display text-lg leading-snug tracking-tight">{t.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{t.description}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
