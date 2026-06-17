"use client";

import { useState } from "react";
import type {
  ChartBar,
  FlashcardsData,
  InfographicData,
  MindMapData,
  MindMapNode,
  QuizData,
  ReportData,
  SlidesData,
  StudioOutput,
  TableData,
} from "@/lib/notebook/types";
import { copyText, downloadText, outputToMarkdown, slugify } from "@/lib/notebook/export";
import { CloseIcon, CopyIcon, DownloadIcon } from "./icons";

function BarChart({ bars }: { bars: ChartBar[] }) {
  const max = Math.max(1, ...bars.map((b) => Math.abs(b.value)));
  return (
    <div className="space-y-1.5">
      {bars.map((b, i) => (
        <div key={`${b.label}-${i}`} className="flex items-center gap-3 text-xs">
          <span className="w-28 shrink-0 truncate text-muted" title={b.label}>
            {b.label}
          </span>
          <span className="h-4 flex-1 overflow-hidden rounded bg-background">
            <span
              className="block h-full rounded bg-accent"
              style={{ width: `${(Math.abs(b.value) / max) * 100}%` }}
            />
          </span>
          <span className="w-12 shrink-0 text-right tabular-nums">{b.value}</span>
        </div>
      ))}
    </div>
  );
}

function MindMapBranch({ node, depth = 0 }: { node: MindMapNode; depth?: number }) {
  return (
    <li>
      <span
        className={
          depth === 0
            ? "font-display text-lg"
            : depth === 1
              ? "font-medium text-accent"
              : "text-muted"
        }
      >
        {node.label}
      </span>
      {node.children && node.children.length > 0 && (
        <ul className="ml-4 mt-1 space-y-1 border-l border-line pl-4">
          {node.children.map((c, i) => (
            <MindMapBranch key={`${c.label}-${i}`} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

function Flashcards({ data }: { data: FlashcardsData }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (data.cards.length === 0) return <Empty />;
  const card = data.cards[i];

  function go(delta: number) {
    setFlipped(false);
    setI((prev) => (prev + delta + data.cards.length) % data.cards.length);
  }

  return (
    <div className="mx-auto max-w-md">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-44 w-full items-center justify-center rounded-2xl border border-line bg-background p-6 text-center text-lg leading-relaxed transition-colors hover:border-accent"
      >
        {flipped ? card.back : card.front}
      </button>
      <div className="mt-4 flex items-center justify-between text-sm">
        <button type="button" onClick={() => go(-1)} className="text-muted hover:text-accent">
          ← Prev
        </button>
        <span className="text-muted">
          {i + 1} / {data.cards.length} · tap card to flip
        </span>
        <button type="button" onClick={() => go(1)} className="text-muted hover:text-accent">
          Next →
        </button>
      </div>
    </div>
  );
}

function Quiz({ data }: { data: QuizData }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  if (data.questions.length === 0) return <Empty />;

  return (
    <ol className="space-y-6">
      {data.questions.map((q, qi) => (
        <li key={qi}>
          <p className="font-medium">
            {qi + 1}. {q.question}
          </p>
          <div className="mt-2 space-y-1.5">
            {q.options.map((opt, oi) => {
              const chosen = picked[qi];
              const isChosen = chosen === oi;
              const isAnswer = q.answer === oi;
              const revealed = chosen !== undefined;
              return (
                <button
                  key={oi}
                  type="button"
                  onClick={() => setPicked((p) => ({ ...p, [qi]: oi }))}
                  className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    revealed && isAnswer
                      ? "border-green-500/60 bg-green-500/10"
                      : revealed && isChosen
                        ? "border-red-500/60 bg-red-500/10"
                        : "border-line hover:border-accent"
                  }`}
                >
                  {String.fromCharCode(65 + oi)}. {opt}
                </button>
              );
            })}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Empty() {
  return (
    <p className="py-10 text-center text-sm text-muted">
      Not enough content in the selected sources to generate this. Add more text and try again.
    </p>
  );
}

function Body({ output }: { output: StudioOutput }) {
  switch (output.type) {
    case "report": {
      const data: ReportData = output.data;
      return (
        <div className="space-y-5">
          <p className="rounded-lg border border-line bg-background p-4 text-sm italic leading-relaxed text-muted">
            {data.summary}
          </p>
          {data.sections.map((s, i) => (
            <div key={i}>
              <h3 className="font-display text-lg tracking-tight">{s.heading}</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      );
    }
    case "slides": {
      const data: SlidesData = output.data;
      return (
        <div className="space-y-4">
          {data.slides.map((slide, i) => (
            <div key={i} className="aspect-video rounded-xl border border-line bg-background p-6">
              <p className="text-xs text-muted">Slide {i + 1}</p>
              <h3 className="mt-1 font-display text-xl tracking-tight">{slide.title}</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                {slide.bullets.map((b, bi) => (
                  <li key={bi}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }
    case "mindmap": {
      const data: MindMapData = output.data;
      return (
        <ul>
          <MindMapBranch node={data.root} />
        </ul>
      );
    }
    case "flashcards":
      return <Flashcards data={output.data} />;
    case "quiz":
      return <Quiz data={output.data} />;
    case "infographic": {
      const data: InfographicData = output.data;
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-background p-4 text-center">
                <div className="font-display text-2xl tracking-tight text-accent">{s.value}</div>
                <div className="mt-1 text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="mb-2 font-display text-lg tracking-tight">Most frequent terms</h3>
            <BarChart bars={data.keywords} />
          </div>
          {data.charts.map((chart, i) => (
            <div key={i}>
              <h3 className="mb-2 font-display text-lg tracking-tight">{chart.title}</h3>
              <BarChart bars={chart.bars} />
            </div>
          ))}
        </div>
      );
    }
    case "table": {
      const data: TableData = output.data;
      if (data.tables.length === 0) return <Empty />;
      return (
        <div className="space-y-6">
          {data.tables.map((t, i) => (
            <div key={i}>
              <h3 className="mb-2 font-display text-lg tracking-tight">{t.sourceTitle}</h3>
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full text-sm">
                  <thead className="bg-background text-left">
                    <tr>
                      {t.columns.map((c, ci) => (
                        <th key={ci} className="px-3 py-2 font-medium">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.rows.map((row, ri) => (
                      <tr key={ri} className="border-t border-line">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-3 py-2 text-muted">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      );
    }
  }
}

export function StudioOutputViewer({
  output,
  onClose,
}: {
  output: StudioOutput | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  if (!output) return null;

  async function doCopy() {
    if (!output) return;
    if (await copyText(outputToMarkdown(output))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  function doDownload() {
    if (!output) return;
    downloadText(`${slugify(output.title)}.md`, outputToMarkdown(output));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-none border-line bg-surface sm:max-h-[88vh] sm:rounded-2xl sm:border">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="truncate font-display text-lg tracking-tight">{output.title}</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={doCopy}
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <CopyIcon width={14} height={14} /> {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={doDownload}
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <DownloadIcon width={14} height={14} /> .md
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-accent"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto px-5 py-5">
          <Body output={output} />
        </div>
      </div>
    </div>
  );
}
