import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { PosDemo } from "@/components/work/PosDemo";
import { DashboardDemo } from "@/components/work/DashboardDemo";
import { ReaderDemo } from "@/components/work/ReaderDemo";
import { ChessDemo } from "@/components/work/ChessDemo";
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
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-xl border border-line">
          {project.cover ? (
            <Image
              src={project.cover}
              alt={`${project.title} cover`}
              fill
              priority
              unoptimized
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
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
          )}
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

      {project.demo === "dashboard" && (
        <Reveal delay={0.2}>
          <h2 className="mt-12 font-display text-2xl tracking-tight">
            Try it live
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            The real app, running in your browser. Click a sample dataset
            (sales, survey, finance, or pandemic) and watch it clean, analyze,
            and build a dashboard with insights — or drop in your own Excel/CSV.
          </p>
          <div className="mt-6">
            <DashboardDemo />
          </div>
        </Reveal>
      )}

      {project.demo === "reader" && (
        <Reveal delay={0.2}>
          <h2 className="mt-12 font-display text-2xl tracking-tight">
            Try it live
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            An interactive preview of the Android app, running in your browser.
            Tap a book to open it, switch between Light, Sepia, and Dark, resize
            the type, and open the table of contents.
          </p>
          <div className="mt-6">
            <ReaderDemo />
          </div>
        </Reveal>
      )}

      {project.demo === "chess" && (
        <Reveal delay={0.2}>
          <h2 className="mt-12 font-display text-2xl tracking-tight">
            Try it live
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            A faithful, in-browser preview of the coaching analysis. Move the
            pieces — or tap a candidate line — and watch the five best moves,
            their evaluations, principal variations, and coach&apos;s notes update
            live. The shipped app runs Stockfish 18 on-device for full strength.
          </p>
          <div className="mt-6">
            <ChessDemo />
          </div>
          <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
            <h3 className="font-display text-xl tracking-tight">
              Get the Android app
            </h3>
            <p className="mt-2 leading-relaxed text-muted">
              The real app, with the full Stockfish 18 engine running offline on
              your phone. Download the APK and install it (you may need to allow
              &ldquo;Install unknown apps&rdquo;). Android, arm64.
            </p>
            <div className="mt-4">
              <ButtonLink
                href="https://github.com/jeremesaramosing05/jereme-website/releases/download/chess-app-latest/chess-trainer-arm64.apk"
                external
              >
                Download for Android (APK)
              </ButtonLink>
            </div>
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
