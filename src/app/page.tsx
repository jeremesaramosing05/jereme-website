import Link from "next/link";
import { HeroReveal, Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { LibraryTeaser } from "@/components/ui/LibraryTeaser";
import { profile } from "@/content/profile";
import { featuredProjects } from "@/content/projects";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-28 sm:pt-36">
        <HeroReveal>
          <p className="text-sm uppercase tracking-[0.25em] text-accent">
            {profile.tagline}
          </p>
        </HeroReveal>
        <HeroReveal delay={0.12}>
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.08] tracking-tight sm:text-7xl">
            {profile.heroLine}
          </h1>
        </HeroReveal>
        <HeroReveal delay={0.24}>
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/work">View my work</ButtonLink>
            <ButtonLink href="/contact" variant="ghost">
              Get in touch
            </ButtonLink>
          </div>
        </HeroReveal>
      </section>

      {/* Literary quote */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <Reveal>
            <blockquote className="border-l-2 border-accent pl-6">
              <p className="font-display text-2xl italic leading-relaxed tracking-tight text-muted sm:text-3xl">
                &ldquo;{profile.literaryQuote.text}&rdquo;
              </p>
              <cite className="mt-4 block text-sm not-italic text-muted/70">
                — {profile.literaryQuote.author}
              </cite>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* About */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-24 sm:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
              About me
            </h2>
          </Reveal>
          <div>
            {profile.about.map((paragraph) => (
              <Reveal key={paragraph.slice(0, 24)}>
                <p className="mb-5 leading-relaxed text-muted">{paragraph}</p>
              </Reveal>
            ))}
            <Reveal delay={0.1}>
              <ul className="mt-8 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full border border-line px-4 py-1.5 text-sm text-foreground"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Featured work */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
              Selected work
            </h2>
            <Link
              href="/work"
              className="text-sm text-muted transition-colors hover:text-accent"
            >
              View all →
            </Link>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-12 sm:grid-cols-2">
          {featuredProjects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.08}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Library teaser */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <Reveal>
            <div className="flex items-end justify-between">
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                From my library
              </h2>
              <Link
                href="/library"
                className="text-sm text-muted transition-colors hover:text-accent"
              >
                Browse all →
              </Link>
            </div>
          </Reveal>
          <LibraryTeaser />
        </div>
      </section>

      {/* Contact CTA */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <Reveal>
            <h2 className="font-display text-3xl tracking-tight sm:text-5xl">
              Let&apos;s build something together
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted">
              Whether it&apos;s a website, a brand, or an idea that needs shape —
              I&apos;m one message away.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-10 flex justify-center">
              <ButtonLink href="/contact">Start a conversation</ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
