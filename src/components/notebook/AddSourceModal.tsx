"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, DocIcon } from "./icons";

type Tab = "paste" | "upload";

export interface DraftSource {
  title: string;
  content: string;
}

export function AddSourceModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (sources: DraftSource[]) => void;
}) {
  const [tab, setTab] = useState<Tab>("paste");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function reset() {
    setTitle("");
    setText("");
    setTab("paste");
  }

  function submitPaste() {
    if (!text.trim()) return;
    onAdd([{ title: title.trim() || "Pasted text", content: text.trim() }]);
    reset();
    onClose();
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const drafts: DraftSource[] = [];
      for (const file of Array.from(files)) {
        const content = await file.text();
        drafts.push({ title: file.name.replace(/\.[^.]+$/, ""), content });
      }
      onAdd(drafts);
      reset();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add source"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl tracking-tight">Add source</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-accent"
          >
            <CloseIcon />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">
          Paste text or upload files (.txt, .md, .csv). Everything stays in your browser.
        </p>

        <div className="mt-5 flex gap-2">
          {(["paste", "upload"] as Tab[]).map((t) => (
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
              {t === "paste" ? "Paste text" : "Upload file"}
            </button>
          ))}
        </div>

        {tab === "paste" ? (
          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Source title (optional)"
              className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your notes, an article, a transcript, or CSV data…"
              rows={8}
              className="w-full resize-y rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={submitPaste}
                disabled={!text.trim()}
                className="rounded-full bg-foreground px-5 py-2 text-sm text-background transition-colors hover:bg-accent-strong disabled:opacity-40"
              >
                Add source
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-background py-10 text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <DocIcon width={28} height={28} />
              <span className="text-sm">{busy ? "Reading…" : "Click to choose files"}</span>
              <span className="text-xs">.txt · .md · .csv · .json</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".txt,.md,.markdown,.csv,.tsv,.json,text/plain"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
