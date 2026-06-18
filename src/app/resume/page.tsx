import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import {
  certifications,
  education,
  experience,
  summary,
  toolset,
  type ResumeEntry,
} from "@/content/resume";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Quality Control, data analytics, automation, and creative work — experience, education, skills, and certifications.",
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
          <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Resume</h1>
          <ButtonLink href="/resume.pdf" download variant="ghost">
            Download PDF ↓
          </ButtonLink>
        </div>
        <p className="mt-6 max-w-2xl leading-relaxed text-muted">{summary}</p>
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

      <section className="mt-16">
        <Reveal>
          <h2 className="font-display text-2xl tracking-tight">Certifications &amp; Training</h2>
          <ul className="mt-6 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {certifications.map((cert) => (
              <li key={cert} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {cert}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </div>
  );
}
