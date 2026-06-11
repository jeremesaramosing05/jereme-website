import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";

/**
 * Until a real cover image exists, each project gets a quiet typographic
 * cover tinted with its own hue — keeps the grid elegant with zero assets.
 */
function Cover({ project }: { project: Project }) {
  if (project.cover) {
    return (
      <Image
        src={project.cover}
        alt={`${project.title} cover`}
        fill
        unoptimized
        sizes="(min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    );
  }

  return (
    <div
      className="flex h-full w-full items-end p-6 transition-transform duration-500 group-hover:scale-[1.03]"
      style={{
        background: `linear-gradient(135deg, hsl(${project.hue} 28% 92%), hsl(${project.hue} 22% 84%))`,
      }}
    >
      <span
        className="font-display text-6xl leading-none opacity-30 sm:text-7xl"
        style={{ color: `hsl(${project.hue} 30% 30%)` }}
        aria-hidden
      >
        {project.title.charAt(0)}
      </span>
    </div>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block focus-visible:outline-accent"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-surface">
        <Cover project={project} />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-xl transition-colors group-hover:text-accent">
          {project.title}
        </h3>
        <span className="shrink-0 text-sm text-muted">{project.year}</span>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-muted">{project.summary}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-line px-3 py-1 text-xs text-muted"
          >
            {tag}
          </li>
        ))}
      </ul>
    </Link>
  );
}
