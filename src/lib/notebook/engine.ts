// The offline "brain" for the Notebook. Pure, deterministic functions — no AI,
// no network. Everything here is rule-based text/data processing so it runs
// instantly, for free, on any device, fully private. Inputs are the user's
// sources; outputs are the structured Studio artifacts defined in types.ts.

import type {
  ChartBar,
  Flashcard,
  FlashcardsData,
  InfographicData,
  MindMapData,
  QuizData,
  QuizQuestion,
  ReportData,
  ReportVariant,
  SlidesData,
  Source,
  TableBlock,
  TableData,
} from "./types";

const STOPWORDS = new Set(
  "a an and are as at be but by for from has have he her his i in is it its of on or that the their them they this to was were will with you your we our us not can also into over more most than then them these those which who whom whose what when where why how do does did been being".split(
    " ",
  ),
);

/** Split prose into trimmed, non-empty sentences. */
export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Word-frequency keywords, most frequent first, stopwords removed. */
export function keywords(text: string, limit = 8): ChartBar[] {
  const counts = new Map<string, number>();
  const words = text.toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? [];
  for (const w of words) {
    if (STOPWORDS.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

/** Extractive summary: pick the highest-signal sentences, keep original order. */
export function summarize(text: string, maxSentences = 4): string {
  const sentences = splitSentences(text);
  if (sentences.length <= maxSentences) return sentences.join(" ");

  const freq = new Map<string, number>();
  for (const { label, value } of keywords(text, 40)) freq.set(label, value);

  const scored = sentences.map((sentence, index) => {
    const words = sentence.toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? [];
    let score = 0;
    for (const w of words) score += freq.get(w) ?? 0;
    // Normalize so very long sentences don't dominate purely by length.
    return { sentence, index, score: score / Math.sqrt(words.length || 1) };
  });

  const top = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence);

  return top.join(" ");
}

export interface TextStats {
  words: number;
  characters: number;
  sentences: number;
  readingMinutes: number;
}

export function textStats(text: string): TextStats {
  const words = (text.trim().match(/\S+/g) ?? []).length;
  return {
    words,
    characters: text.length,
    sentences: splitSentences(text).length,
    readingMinutes: Math.max(1, Math.round(words / 200)),
  };
}

/** Minimal CSV parser with basic double-quote handling. Returns null if the
 *  text doesn't look like a table (no delimiter, or a single column). */
export function parseCsv(text: string): { columns: string[]; rows: string[][] } | null {
  const lines = text.replace(/\r\n?/g, "\n").split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return null;

  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let cur = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') {
          quoted = false;
        } else {
          cur += ch;
        }
      } else if (ch === '"') {
        quoted = true;
      } else if (ch === ",") {
        cells.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    return cells;
  };

  const columns = parseLine(lines[0]);
  if (columns.length < 2) return null;
  const rows = lines.slice(1).map(parseLine);
  return { columns, rows };
}

function isNumeric(value: string): boolean {
  if (value.trim() === "") return false;
  return !Number.isNaN(Number(value.replace(/[,$%\s]/g, "")));
}

function toNumber(value: string): number {
  return Number(value.replace(/[,$%\s]/g, ""));
}

/** Sources that are included in generation (selected, or all if none selected). */
export function activeSources(sources: Source[]): Source[] {
  const selected = sources.filter((s) => s.selected);
  return selected.length > 0 ? selected : sources;
}

function combinedText(sources: Source[]): string {
  return sources.map((s) => s.content).join("\n\n");
}

function titleize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function firstSentenceWith(text: string, term: string): string | null {
  const lower = term.toLowerCase();
  return splitSentences(text).find((s) => s.toLowerCase().includes(lower)) ?? null;
}

// ── Studio generators ────────────────────────────────────────────────────────

export function generateReport(
  sources: Source[],
  variant: ReportVariant,
  notebookTitle: string,
): ReportData {
  const all = combinedText(sources);
  const sourceTitles = sources.map((s) => s.title);
  const summary = summarize(all, 5) || "Add some text to your sources to generate a report.";

  if (variant === "studyguide") {
    const terms = keywords(all, 6).map(({ label }) => {
      const sentence = firstSentenceWith(all, label);
      return { heading: titleize(label), body: sentence ?? `A key term across your sources.` };
    });
    const takeaways = splitSentences(summarize(all, 5));
    return {
      variant,
      summary,
      sourceTitles,
      sections: [
        { heading: "Overview", body: summary },
        ...terms,
        {
          heading: "Key takeaways",
          body: takeaways.map((t, i) => `${i + 1}. ${t}`).join("\n"),
        },
      ],
    };
  }

  if (variant === "faq") {
    const qs = keywords(all, 6).map(({ label }) => {
      const sentence = firstSentenceWith(all, label);
      return {
        heading: `What does "${label}" refer to here?`,
        body: sentence ?? `“${titleize(label)}” appears across your sources.`,
      };
    });
    return { variant, summary, sourceTitles, sections: qs };
  }

  // Default report: one section per source plus an executive summary.
  const sections = sources.map((s) => ({
    heading: s.title,
    body: summarize(s.content, 4) || s.content.slice(0, 280),
  }));
  return {
    variant,
    summary,
    sourceTitles,
    sections: [
      { heading: notebookTitle ? `${notebookTitle}: summary` : "Executive summary", body: summary },
      ...sections,
    ],
  };
}

export function generateSlides(sources: Source[], notebookTitle: string): SlidesData {
  const all = combinedText(sources);
  const title = notebookTitle || "Presentation";
  const slides: SlidesData["slides"] = [
    {
      title,
      bullets: [
        `${sources.length} source${sources.length === 1 ? "" : "s"}`,
        ...keywords(all, 3).map((k) => titleize(k.label)),
      ],
    },
  ];

  for (const s of sources) {
    const points = splitSentences(summarize(s.content, 4));
    slides.push({
      title: s.title,
      bullets: points.length > 0 ? points : ["(no text in this source)"],
    });
  }

  slides.push({
    title: "Key takeaways",
    bullets: splitSentences(summarize(all, 4)),
  });
  return { slides };
}

export function generateMindMap(sources: Source[], notebookTitle: string): MindMapData {
  return {
    root: {
      label: notebookTitle || "Notebook",
      children: sources.map((s) => ({
        label: s.title,
        children: keywords(s.content, 4).map((k) => ({ label: titleize(k.label) })),
      })),
    },
  };
}

export function generateFlashcards(sources: Source[]): FlashcardsData {
  const sentences = splitSentences(combinedText(sources));
  const cards: Flashcard[] = [];

  for (const sentence of sentences) {
    if (cards.length >= 12) break;

    const defMatch = sentence.match(/^(.{3,60}?)\s+(?:is|are|was|were|means|refers to)\s+(.{8,})$/i);
    if (defMatch) {
      cards.push({ front: `What ${defMatch[0].match(/\b(is|are|was|were)\b/i)?.[0] ?? "is"} ${defMatch[1].trim()}?`, back: sentence });
      continue;
    }

    const colon = sentence.match(/^(.{3,50}?):\s+(.{8,})$/);
    if (colon) {
      cards.push({ front: colon[1].trim(), back: colon[2].trim() });
      continue;
    }

    // Cloze: hide the strongest keyword in the sentence.
    const kw = keywords(sentence, 1)[0];
    if (kw && sentence.length < 220) {
      const re = new RegExp(`\\b${kw.label}\\b`, "i");
      cards.push({ front: sentence.replace(re, "_____"), back: titleize(kw.label) });
    }
  }

  return { cards };
}

export function generateQuiz(sources: Source[]): QuizData {
  const all = combinedText(sources);
  const pool = keywords(all, 16).map((k) => k.label);
  const sentences = splitSentences(all);
  const questions: QuizQuestion[] = [];

  for (const sentence of sentences) {
    if (questions.length >= 8) break;
    if (sentence.length > 220) continue;

    const kw = keywords(sentence, 1)[0];
    if (!kw) continue;

    const distractors = pool.filter((w) => w !== kw.label).slice(0, 3);
    if (distractors.length < 3) continue;

    const re = new RegExp(`\\b${kw.label}\\b`, "i");
    // Deterministic option order: rotate by question index.
    const options = [kw.label, ...distractors].map(titleize);
    const shift = questions.length % options.length;
    const rotated = [...options.slice(shift), ...options.slice(0, shift)];
    questions.push({
      question: `Fill in the blank: ${sentence.replace(re, "_____")}`,
      options: rotated,
      answer: rotated.indexOf(titleize(kw.label)),
    });
  }

  return { questions };
}

export function generateTables(sources: Source[]): TableData {
  const tables: TableBlock[] = [];
  for (const s of sources) {
    const parsed = parseCsv(s.content);
    if (parsed) {
      tables.push({ sourceTitle: s.title, columns: parsed.columns, rows: parsed.rows });
    }
  }
  return { tables };
}

export function generateInfographic(sources: Source[]): InfographicData {
  const all = combinedText(sources);
  const stats: InfographicData["stats"] = [];
  const charts: InfographicData["charts"] = [];

  const ts = textStats(all);
  stats.push({ label: "Sources", value: String(sources.length) });
  stats.push({ label: "Words", value: ts.words.toLocaleString() });
  stats.push({ label: "Reading time", value: `${ts.readingMinutes} min` });

  // For each CSV source, chart the first numeric column against the first
  // text column (or row number) — a real, simple visualization of the data.
  let tableCount = 0;
  for (const s of sources) {
    const parsed = parseCsv(s.content);
    if (!parsed) continue;
    tableCount++;

    const numericCol = parsed.columns.findIndex((_, ci) =>
      parsed.rows.slice(0, 5).every((r) => isNumeric(r[ci] ?? "")),
    );
    if (numericCol === -1) continue;

    const labelCol = parsed.columns.findIndex((_, ci) => ci !== numericCol);
    const bars: ChartBar[] = parsed.rows.slice(0, 12).map((r, i) => ({
      label: labelCol >= 0 ? r[labelCol] ?? `Row ${i + 1}` : `Row ${i + 1}`,
      value: toNumber(r[numericCol] ?? "0"),
    }));
    charts.push({ title: `${parsed.columns[numericCol]} by ${parsed.columns[labelCol] ?? "row"}`, bars });
  }
  stats.push({ label: "Data tables", value: String(tableCount) });

  return { stats, keywords: keywords(all, 8), charts };
}

// ── Ask (extractive search across sources) ───────────────────────────────────

export interface SearchHit {
  sourceTitle: string;
  snippet: string;
  score: number;
}

/** Honest, AI-free "ask": rank source sentences by query-term overlap and
 *  return the best-matching passages with their source for citation. */
export function searchSources(sources: Source[], query: string): SearchHit[] {
  const terms = (query.toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? []).filter(
    (t) => !STOPWORDS.has(t),
  );
  if (terms.length === 0) return [];

  const hits: SearchHit[] = [];
  for (const s of sources) {
    for (const sentence of splitSentences(s.content)) {
      const lower = sentence.toLowerCase();
      let score = 0;
      for (const t of terms) if (lower.includes(t)) score++;
      if (score > 0) hits.push({ sourceTitle: s.title, snippet: sentence, score });
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 4);
}
