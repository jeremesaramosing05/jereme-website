import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects — web apps, motion graphics, and design.",
};

export default function WorkPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Work</h1>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          A selection of projects across web development, motion design, and
          data storytelling.
        </p>
      </Reveal>
      <div className="mt-14 grid gap-12 sm:grid-cols-2">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={(i % 2) * 0.08}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
