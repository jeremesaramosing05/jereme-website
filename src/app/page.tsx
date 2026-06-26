import Link from "next/link";
import { HeroReveal, Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { LibraryTeaser } from "@/components/ui/LibraryTeaser";
import { profile } from "@/content/profile";
import { featuredProjects } from "@/content/projects";

export default function Home() {
  // Two-tone headline: everything after the em-dash picks up the brand accent.
  const [heroHead, heroTail] = profile.heroLine.includes(" — ")
    ? [
        profile.heroLine.slice(0, profile.heroLine.indexOf(" — ") + 2),
        profile.heroLine.slice(profile.heroLine.indexOf(" — ") + 3),
      ]
    : [profile.heroLine, ""];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Warm accent glow behind the headline */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-[8%] -z-10 h-[520px] w-[760px] max-w-[120vw] rounded-full opacity-80 blur-[90px]"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 26%, transparent), transparent)",
          }}
        />
        <div className="mx-auto max-w-5xl px-6 pb-24 pt-28 sm:pt-36">
          <HeroReveal>
            <p className="flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-accent">
              <span aria-hidden className="h-px w-8 bg-accent" />
              {profile.tagline}
            </p>
          </HeroReveal>
          <HeroReveal delay={0.12}>
            <h1 className="mt-7 max-w-4xl text-balance font-display text-[clamp(2.85rem,7.5vw,5.25rem)] font-medium leading-[1.04] tracking-[-0.025em]">
              {heroHead}
              <span className="text-accent"> {heroTail}</span>
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
        </div>
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
