"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Notebook, Source } from "@/lib/notebook/types";

const STORAGE_KEY = "jereme-notebook-store-v1";

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface NewNotebookInput {
  title?: string;
  emoji?: string;
  sources?: { title: string; content: string }[];
}

interface NotebookStore {
  notebooks: Notebook[];
  hydrated: boolean;
  createNotebook: (input?: NewNotebookInput) => string;
  deleteNotebook: (id: string) => void;
  renameNotebook: (id: string, title: string) => void;
  getNotebook: (id: string) => Notebook | undefined;
  updateNotebook: (id: string, updater: (nb: Notebook) => Notebook) => void;
}

const StoreContext = createContext<NotebookStore | null>(null);

function makeSource(title: string, content: string): Source {
  const looksCsv = /,/.test(content.split("\n")[0] ?? "") && content.trim().includes("\n");
  return {
    id: uid(),
    title,
    kind: looksCsv ? "csv" : "text",
    content,
    addedAt: Date.now(),
    selected: true,
  };
}

export function NotebookStoreProvider({ children }: { children: ReactNode }) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once from localStorage on mount. Intentional one-time hydration from
  // an external store — the canonical case the set-state-in-effect rule allows.
  useEffect(() => {
    // One-time hydration from localStorage (an external store). This is the
    // canonical, safe use of setState inside an effect.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setNotebooks(JSON.parse(raw) as Notebook[]);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persist on every change (but never overwrite stored data before load).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks));
    } catch {
      /* storage full or unavailable — keep working in-memory */
    }
  }, [notebooks, hydrated]);

  const createNotebook = useCallback((input?: NewNotebookInput) => {
    const id = uid();
    const now = Date.now();
    const nb: Notebook = {
      id,
      title: input?.title?.trim() || "Untitled notebook",
      emoji: input?.emoji ?? "📓",
      createdAt: now,
      updatedAt: now,
      sources: (input?.sources ?? []).map((s) => makeSource(s.title, s.content)),
      chat: [],
      outputs: [],
    };
    setNotebooks((prev) => [nb, ...prev]);
    return id;
  }, []);

  const deleteNotebook = useCallback((id: string) => {
    setNotebooks((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const renameNotebook = useCallback((id: string, title: string) => {
    setNotebooks((prev) =>
      prev.map((n) => (n.id === id ? { ...n, title: title.trim() || n.title, updatedAt: Date.now() } : n)),
    );
  }, []);

  const updateNotebook = useCallback((id: string, updater: (nb: Notebook) => Notebook) => {
    setNotebooks((prev) =>
      prev.map((n) => (n.id === id ? { ...updater(n), id: n.id, updatedAt: Date.now() } : n)),
    );
  }, []);

  const getNotebook = useCallback((id: string) => notebooks.find((n) => n.id === id), [notebooks]);

  const value = useMemo<NotebookStore>(
    () => ({ notebooks, hydrated, createNotebook, deleteNotebook, renameNotebook, getNotebook, updateNotebook }),
    [notebooks, hydrated, createNotebook, deleteNotebook, renameNotebook, getNotebook, updateNotebook],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useNotebookStore(): NotebookStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useNotebookStore must be used within NotebookStoreProvider");
  return ctx;
}

export { makeSource };
