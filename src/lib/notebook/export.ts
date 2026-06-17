// Turn a Studio output into Markdown and let the user download or copy it.
// Browser-only helpers (Blob / clipboard) — call from client components.

import type { StudioOutput } from "./types";

export function outputToMarkdown(output: StudioOutput): string {
  const lines: string[] = [`# ${output.title}`, ""];

  switch (output.type) {
    case "report": {
      lines.push(`> ${output.data.summary}`, "");
      for (const section of output.data.sections) {
        lines.push(`## ${section.heading}`, "", section.body, "");
      }
      if (output.data.sourceTitles.length) {
        lines.push("---", "", `Sources: ${output.data.sourceTitles.join(", ")}`);
      }
      break;
    }
    case "slides": {
      output.data.slides.forEach((slide, i) => {
        lines.push(`## Slide ${i + 1} — ${slide.title}`, "");
        for (const b of slide.bullets) lines.push(`- ${b}`);
        lines.push("");
      });
      break;
    }
    case "mindmap": {
      const walk = (node: { label: string; children?: { label: string; children?: unknown[] }[] }, depth: number) => {
        lines.push(`${"  ".repeat(depth)}- ${node.label}`);
        node.children?.forEach((c) => walk(c as typeof node, depth + 1));
      };
      walk(output.data.root, 0);
      break;
    }
    case "flashcards": {
      output.data.cards.forEach((c, i) => {
        lines.push(`**${i + 1}. ${c.front}**`, "", c.back, "");
      });
      break;
    }
    case "quiz": {
      output.data.questions.forEach((q, i) => {
        lines.push(`**${i + 1}. ${q.question}**`, "");
        q.options.forEach((o, oi) => lines.push(`- ${String.fromCharCode(65 + oi)}. ${o}`));
        lines.push("", `_Answer: ${String.fromCharCode(65 + q.answer)}_`, "");
      });
      break;
    }
    case "infographic": {
      lines.push("## Key figures", "");
      for (const s of output.data.stats) lines.push(`- **${s.label}:** ${s.value}`);
      lines.push("", "## Top terms", "");
      for (const k of output.data.keywords) lines.push(`- ${k.label} (${k.value})`);
      for (const chart of output.data.charts) {
        lines.push("", `## ${chart.title}`, "");
        for (const bar of chart.bars) lines.push(`- ${bar.label}: ${bar.value}`);
      }
      break;
    }
    case "table": {
      for (const t of output.data.tables) {
        lines.push(`## ${t.sourceTitle}`, "");
        lines.push(`| ${t.columns.join(" | ")} |`);
        lines.push(`| ${t.columns.map(() => "---").join(" | ")} |`);
        for (const row of t.rows) lines.push(`| ${row.join(" | ")} |`);
        lines.push("");
      }
      break;
    }
  }

  return lines.join("\n");
}

export function downloadText(filename: string, text: string, mime = "text/markdown") {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "notebook"
  );
}
