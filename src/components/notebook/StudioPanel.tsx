"use client";

import { useState, type ReactNode } from "react";
import type { Notebook, ReportVariant, StudioOutput } from "@/lib/notebook/types";
import {
  activeSources,
  generateFlashcards,
  generateInfographic,
  generateMindMap,
  generateQuiz,
  generateReport,
  generateSlides,
  generateTables,
} from "@/lib/notebook/engine";
import { useNotebookStore } from "./store";
import { StudioOutputViewer } from "./StudioOutputViewer";
import {
  AudioIcon,
  ChartIcon,
  DocIcon,
  FlashIcon,
  MindMapIcon,
  QuizIcon,
  ReportIcon,
  SlidesIcon,
  TableIcon,
  TrashIcon,
  VideoIcon,
} from "./icons";

function uid() {
  return `o-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

type Action =
  | { kind: "report" }
  | { kind: "slides" }
  | { kind: "mindmap" }
  | { kind: "flashcards" }
  | { kind: "quiz" }
  | { kind: "infographic" }
  | { kind: "table" };

function Tile({
  icon,
  label,
  onClick,
  disabled,
  note,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  note?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={note}
      className={`flex items-center gap-2.5 rounded-xl border border-line bg-background px-3 py-3 text-left text-sm transition-colors ${
        disabled
          ? "cursor-not-allowed opacity-45"
          : "hover:border-accent hover:text-accent"
      }`}
    >
      <span className="text-accent">{icon}</span>
      <span className="leading-tight">{label}</span>
    </button>
  );
}

export function StudioPanel({ notebook }: { notebook: Notebook }) {
  const { updateNotebook } = useNotebookStore();
  const [active, setActive] = useState<StudioOutput | null>(null);
  const [reportMenu, setReportMenu] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const hasSources = notebook.sources.length > 0;

  function build(action: Action, variant: ReportVariant = "report"): StudioOutput {
    const srcs = activeSources(notebook.sources);
    const id = uid();
    const createdAt = Date.now();
    const title = notebook.title;
    switch (action.kind) {
      case "report":
        return {
          id,
          createdAt,
          type: "report",
          title: variant === "studyguide" ? "Study guide" : variant === "faq" ? "FAQ" : "Report",
          data: generateReport(srcs, variant, title),
        };
      case "slides":
        return { id, createdAt, type: "slides", title: "Slide deck", data: generateSlides(srcs, title) };
      case "mindmap":
        return { id, createdAt, type: "mindmap", title: "Mind map", data: generateMindMap(srcs, title) };
      case "flashcards":
        return { id, createdAt, type: "flashcards", title: "Flashcards", data: generateFlashcards(srcs) };
      case "quiz":
        return { id, createdAt, type: "quiz", title: "Quiz", data: generateQuiz(srcs) };
      case "infographic":
        return { id, createdAt, type: "infographic", title: "Infographic", data: generateInfographic(srcs) };
      case "table":
        return { id, createdAt, type: "table", title: "Data table", data: generateTables(srcs) };
    }
  }

  function run(action: Action, variant?: ReportVariant) {
    if (!hasSources) {
      setNote("Add a source first — Studio builds everything from your sources.");
      return;
    }
    setReportMenu(false);
    const output = build(action, variant);
    updateNotebook(notebook.id, (nb) => ({ ...nb, outputs: [output, ...nb.outputs] }));
    setActive(output);
  }

  function removeOutput(id: string) {
    updateNotebook(notebook.id, (nb) => ({ ...nb, outputs: nb.outputs.filter((o) => o.id !== id) }));
  }

  return (
    <section className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="font-display text-lg tracking-tight">Studio</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          <Tile icon={<AudioIcon width={16} height={16} />} label="Audio Overview" disabled note="Needs audio generation — not available in the offline engine" />
          <Tile icon={<SlidesIcon width={16} height={16} />} label="Slide Deck" onClick={() => run({ kind: "slides" })} />
          <Tile icon={<VideoIcon width={16} height={16} />} label="Video Overview" disabled note="Needs video generation — not available in the offline engine" />
          <Tile icon={<MindMapIcon width={16} height={16} />} label="Mind Map" onClick={() => run({ kind: "mindmap" })} />

          <div className="relative">
            <Tile icon={<ReportIcon width={16} height={16} />} label="Reports" onClick={() => (hasSources ? setReportMenu((v) => !v) : run({ kind: "report" }))} />
            {reportMenu && (
              <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
                {([
                  ["report", "Report"],
                  ["studyguide", "Study guide"],
                  ["faq", "FAQ"],
                ] as [ReportVariant, string][]).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => run({ kind: "report" }, v)}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-background hover:text-accent"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Tile icon={<FlashIcon width={16} height={16} />} label="Flashcards" onClick={() => run({ kind: "flashcards" })} />
          <Tile icon={<QuizIcon width={16} height={16} />} label="Quiz" onClick={() => run({ kind: "quiz" })} />
          <Tile icon={<ChartIcon width={16} height={16} />} label="Infographic" onClick={() => run({ kind: "infographic" })} />
          <Tile icon={<TableIcon width={16} height={16} />} label="Data Table" onClick={() => run({ kind: "table" })} />
        </div>

        {note && <p className="mt-3 rounded-lg border border-line bg-background p-3 text-xs text-muted">{note}</p>}

        <div className="mt-6">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Saved outputs</h3>
          {notebook.outputs.length === 0 ? (
            <div className="mt-3 flex flex-col items-center gap-2 rounded-xl border border-dashed border-line py-8 text-center text-muted">
              <DocIcon width={22} height={22} />
              <p className="px-4 text-xs leading-relaxed">
                Studio output is saved here. Add sources, then generate a report, deck, or analysis.
              </p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {notebook.outputs.map((o) => (
                <li key={o.id} className="group flex items-center gap-2 rounded-lg border border-line bg-background p-2.5">
                  <button type="button" onClick={() => setActive(o)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium transition-colors group-hover:text-accent">{o.title}</p>
                    <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleString()}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeOutput(o.id)}
                    aria-label={`Delete ${o.title}`}
                    className="text-muted opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                  >
                    <TrashIcon width={15} height={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <StudioOutputViewer output={active} onClose={() => setActive(null)} />
    </section>
  );
}
