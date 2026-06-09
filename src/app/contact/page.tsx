import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about projects, collaborations, or opportunities.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <Reveal>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
          Get in touch
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          Have a project, a job opportunity, or just want to say hello? Send a
          message below, or email me directly at{" "}
          <a
            href={`mailto:${profile.email}`}
            className="text-accent underline-offset-4 hover:underline"
          >
            {profile.email}
          </a>
          .
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="mt-12">
          <ContactForm />
        </div>
      </Reveal>
    </section>
  );
}
