"use client";

import { useCallback, useState } from "react";
import type { ChatTurn, Notebook } from "@/lib/notebook/types";
import { activeSources, searchSources } from "@/lib/notebook/engine";
import { useNotebookStore } from "./store";
import { SendIcon } from "./icons";

function uid() {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const SUGGESTIONS = ["Summarize the key points", "What are the main risks?", "List the important terms"];

export function AskPanel({ notebook }: { notebook: Notebook }) {
  const { updateNotebook } = useNotebookStore();
  const [query, setQuery] = useState("");

  // Wrapped in useCallback so the impure id/timestamp calls run only when the
  // handler fires (on submit / suggestion click), never during render.
  const ask = useCallback(
    (qRaw: string) => {
      const q = qRaw.trim();
      if (!q) return;

      const sources = activeSources(notebook.sources);
      const userTurn: ChatTurn = { id: uid(), role: "user", text: q, createdAt: Date.now() };

      let answer: ChatTurn;
      if (sources.length === 0) {
        answer = {
          id: uid(),
          role: "assistant",
          text: "Add at least one source first — answers here are pulled straight from your sources.",
          createdAt: Date.now(),
        };
      } else {
        const hits = searchSources(sources, q);
        answer =
          hits.length === 0
            ? {
                id: uid(),
                role: "assistant",
                text: "I could not find that in your sources. Try different words, or add a source that covers it.",
                createdAt: Date.now(),
              }
            : {
                id: uid(),
                role: "assistant",
                text:
                  `Here is what your sources say:\n\n` +
                  hits.map((h) => `• ${h.snippet}  —[${h.sourceTitle}]`).join("\n\n"),
                citations: [...new Set(hits.map((h) => h.sourceTitle))],
                createdAt: Date.now(),
              };
      }

      updateNotebook(notebook.id, (nb) => ({ ...nb, chat: [...nb.chat, userTurn, answer] }));
      setQuery("");
    },
    [notebook, updateNotebook],
  );

  const empty = notebook.chat.length === 0;

  return (
    <section className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 className="font-display text-lg tracking-tight">{notebook.emoji} {notebook.title}</h2>
        <span className="text-xs text-muted">
          {notebook.sources.length} source{notebook.sources.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {empty ? (
          <div className="mx-auto mt-6 max-w-md text-center">
            <div className="text-4xl">{notebook.emoji}</div>
            <h3 className="mt-3 font-display text-2xl tracking-tight">{notebook.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Ask a question and the answer is pulled directly from your sources — offline, no AI,
              fully private. Or open <span className="text-accent">Studio</span> to compile a report,
              deck, or analysis.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {notebook.chat.map((turn) => (
              <li key={turn.id} className={turn.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    turn.role === "user"
                      ? "bg-foreground text-background"
                      : "border border-line bg-surface"
                  }`}
                >
                  {turn.text}
                  {turn.citations && turn.citations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {turn.citations.map((c) => (
                        <span key={c} className="rounded-full bg-background px-2 py-0.5 text-[11px] text-muted">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-line p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(query);
          }}
          className="flex items-center gap-2 rounded-full border border-line bg-background px-4 py-2 focus-within:border-accent"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask your sources…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            aria-label="Ask"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-colors hover:bg-accent-strong disabled:opacity-40"
          >
            <SendIcon width={15} height={15} />
          </button>
        </form>
      </div>
    </section>
  );
}
