import { describe, it, expect } from "vitest";
import {
  generateQuiz,
  generateReport,
  generateTables,
  keywords,
  parseCsv,
  searchSources,
  summarize,
} from "./engine";
import type { Source } from "./types";

function src(title: string, content: string, kind: Source["kind"] = "text"): Source {
  return { id: title, title, kind, content, addedAt: 0, selected: true };
}

const PROSE =
  "Photosynthesis converts light into chemical energy. Chlorophyll absorbs light in plants. " +
  "The Calvin cycle fixes carbon dioxide into glucose. Oxygen is released as a by-product. " +
  "Stomata control gas exchange and water loss in leaves.";

const CSV = "Week,Signups\nWeek 1,120\nWeek 2,138\nWeek 3,166";

describe("parseCsv", () => {
  it("parses headers and rows", () => {
    const parsed = parseCsv(CSV);
    expect(parsed).not.toBeNull();
    expect(parsed?.columns).toEqual(["Week", "Signups"]);
    expect(parsed?.rows).toHaveLength(3);
    expect(parsed?.rows[0]).toEqual(["Week 1", "120"]);
  });

  it("returns null for non-tabular text", () => {
    expect(parseCsv("just a sentence with no delimiter")).toBeNull();
  });

  it("handles quoted fields containing commas", () => {
    const parsed = parseCsv('Name,Note\n"Doe, John",hello');
    expect(parsed?.rows[0]).toEqual(["Doe, John", "hello"]);
  });
});

describe("keywords", () => {
  it("returns frequent, non-stopword terms", () => {
    const kw = keywords(PROSE, 5).map((k) => k.label);
    expect(kw).toContain("light");
    expect(kw).not.toContain("the");
    expect(kw).not.toContain("is");
  });
});

describe("summarize", () => {
  it("returns a non-empty subset of the text", () => {
    const out = summarize(PROSE, 2);
    expect(out.length).toBeGreaterThan(0);
    expect(out.length).toBeLessThanOrEqual(PROSE.length);
  });
});

describe("generateReport", () => {
  it("builds a summary section plus one section per source", () => {
    const sources = [src("Notes A", PROSE), src("Notes B", "A short second source about energy.")];
    const report = generateReport(sources, "report", "Science");
    expect(report.sourceTitles).toEqual(["Notes A", "Notes B"]);
    // executive summary + one per source
    expect(report.sections).toHaveLength(3);
    expect(report.sections.some((s) => s.heading === "Notes A")).toBe(true);
  });

  it("builds FAQ-style question headings", () => {
    const faq = generateReport([src("Notes", PROSE)], "faq", "Science");
    expect(faq.variant).toBe("faq");
    expect(faq.sections.length).toBeGreaterThan(0);
    expect(faq.sections[0].heading).toMatch(/\?$/);
  });
});

describe("generateTables", () => {
  it("extracts a table from a CSV source and ignores prose", () => {
    const out = generateTables([src("metrics", CSV, "csv"), src("notes", PROSE)]);
    expect(out.tables).toHaveLength(1);
    expect(out.tables[0].columns).toEqual(["Week", "Signups"]);
  });
});

describe("generateQuiz", () => {
  it("marks the correct option index", () => {
    const quiz = generateQuiz([src("Notes", PROSE)]);
    for (const q of quiz.questions) {
      expect(q.options[q.answer]).toBeDefined();
      expect(q.options).toHaveLength(4);
    }
  });
});

describe("searchSources", () => {
  it("ranks passages that match the query terms", () => {
    const hits = searchSources([src("Notes", PROSE)], "carbon dioxide glucose");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].snippet.toLowerCase()).toContain("carbon");
    expect(hits[0].sourceTitle).toBe("Notes");
  });

  it("returns nothing for an all-stopword query", () => {
    expect(searchSources([src("Notes", PROSE)], "the and is")).toEqual([]);
  });
});
