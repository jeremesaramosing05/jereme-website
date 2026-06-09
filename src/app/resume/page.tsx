import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { education, experience, toolset, type ResumeEntry } from "@/content/resume";

export const metadata: Metadata = {
  title: "Resume",
  description: "Experience, education, and skills.",
};

function Timeline({ title, entries }: { title: string; entries: ResumeEntry[] }) {
  return (
    <section className="mt-16">
      <Reveal>
        <h2 className="font-display text-2xl tracking-tight">{title}</h2>
      </Reveal>
      <div className="mt-8 space-y-10 border-l border-line pl-6">
        {entries.map((entry) => (
          <Reveal key={`${entry.title}-${entry.period}`}>
            <div className="relative">
              <span className="absolute -left-[1.85rem] top-2 h-2 w-2 rounded-full bg-accent" />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-medium">{entry.title}</h3>
                <span className="text-sm text-muted">{entry.period}</span>
              </div>
              <p className="mt-1 text-sm text-accent">{entry.org}</p>
              <ul className="mt-3 space-y-2">
                {entry.points.map((point) => (
                  <li key={point} className="text-sm leading-relaxed text-muted">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
              Resume
            </h1>
            <p className="mt-4 max-w-md leading-relaxed text-muted">
              A snapshot of where I&apos;ve been and what I work with.
            </p>
          </div>
          <ButtonLink href="/resume.pdf" download variant="ghost">
            Download PDF ↓
          </ButtonLink>
        </div>
      </Reveal>

      <Timeline title="Experience" entries={experience} />
      <Timeline title="Education" entries={education} />

      <section className="mt-16">
        <Reveal>
          <h2 className="font-display text-2xl tracking-tight">Toolset</h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {toolset.map((tool) => (
              <li
                key={tool}
                className="rounded-full border border-line px-4 py-1.5 text-sm"
              >
                {tool}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </div>
  );
}
