import type { Metadata } from "next";
import { HeroReveal } from "@/components/motion/Reveal";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "Links",
  description: "All of Jereme's links in one place.",
};

const links = [
  ...profile.socials.map(({ label, href, handle }) => ({
    label,
    href,
    sub: handle,
  })),
  { label: "Email me", href: `mailto:${profile.email}`, sub: profile.email },
  { label: "My work", href: "/work", sub: "Selected projects" },
  { label: "Resume", href: "/resume", sub: "Experience & skills" },
];

export default function LinksPage() {
  return (
    <section className="mx-auto max-w-md px-6 py-24 text-center">
      <HeroReveal>
        <p className="font-display text-3xl tracking-tight">{profile.name}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {profile.tagline} · {profile.location}
        </p>
      </HeroReveal>
      <div className="mt-10 space-y-3">
        {links.map(({ label, href, sub }, i) => (
          <HeroReveal key={label} delay={0.08 + i * 0.05}>
            <a
              href={href}
              {...(href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="block rounded-xl border border-line bg-surface px-6 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-sm"
            >
              <span className="block font-medium">{label}</span>
              <span className="mt-0.5 block text-sm text-muted">{sub}</span>
            </a>
          </HeroReveal>
        ))}
      </div>
    </section>
  );
}
