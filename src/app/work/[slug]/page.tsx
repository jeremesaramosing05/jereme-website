import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { PosDemo } from "@/components/work/PosDemo";
import { getProject, projects } from "@/content/projects";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

const sections = [
  { key: "problem", label: "The problem" },
  { key: "process", label: "The process" },
  { key: "result", label: "The result" },
] as const;

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="mx-auto max-w-3xl px-6 py-24">
      <Reveal>
        <Link
          href="/work"
          className="text-sm text-muted transition-colors hover:text-accent"
        >
          ← All work
        </Link>
        <h1 className="mt-6 font-display text-4xl tracking-tight sm:text-5xl">
          {project.title}
        </h1>
        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 border-y border-line py-5 text-sm">
          <div>
            <dt className="text-muted">Year</dt>
            <dd className="mt-1">{project.year}</dd>
          </div>
          <div>
            <dt className="text-muted">Role</dt>
            <dd className="mt-1">{project.role}</dd>
          </div>
          <div>
            <dt className="text-muted">Focus</dt>
            <dd className="mt-1">{project.tags.join(" · ")}</dd>
          </div>
        </dl>
      </Reveal>

      <Reveal delay={0.1}>
        <div
          className="mt-10 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border border-line"
          style={{
            background: `linear-gradient(135deg, hsl(${project.hue} 28% 92%), hsl(${project.hue} 22% 84%))`,
          }}
        >
          <span
            className="font-display text-8xl opacity-30"
            style={{ color: `hsl(${project.hue} 30% 30%)` }}
            aria-hidden
          >
            {project.title.charAt(0)}
          </span>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <p className="mt-10 text-lg leading-relaxed">{project.summary}</p>
      </Reveal>

      {project.demo === "pos" && (
        <Reveal delay={0.2}>
          <h2 className="mt-12 font-display text-2xl tracking-tight">
            Try it live
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            A faithful browser recreation of the POS — build a cart, apply a
            discount, complete a sale, and get a receipt. No login required.
          </p>
          <div className="mt-6">
            <PosDemo />
          </div>
        </Reveal>
      )}

      {sections.map(({ key, label }) => (
        <Reveal key={key}>
          <h2 className="mt-12 font-display text-2xl tracking-tight">{label}</h2>
          <p className="mt-4 leading-relaxed text-muted">
            {project.caseStudy[key]}
          </p>
        </Reveal>
      ))}

      {project.link && (
        <Reveal>
          <div className="mt-12">
            <ButtonLink href={project.link.href} external variant="ghost">
              {project.link.label} ↗
            </ButtonLink>
          </div>
        </Reveal>
      )}

      <Reveal>
        <div className="mt-16 border-t border-line pt-8">
          <p className="text-sm text-muted">Next project</p>
          <Link
            href={`/work/${next.slug}`}
            className="mt-2 inline-block font-display text-2xl tracking-tight transition-colors hover:text-accent"
          >
            {next.title} →
          </Link>
        </div>
      </Reveal>
    </article>
  );
}
