"use client";

import { useState } from "react";
import { profile } from "@/content/profile";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error ?? "Something went wrong.");
      }

      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-line bg-surface p-8 text-center">
        <p className="font-display text-2xl">Message sent ✓</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Thanks for reaching out — I&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm placeholder:text-muted/60 focus:border-accent focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-muted">Name</span>
          <input
            name="name"
            required
            maxLength={100}
            placeholder="Your name"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-muted">Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            placeholder="you@example.com"
            className={inputClass}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm text-muted">Message</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder="Tell me about your project or idea…"
          className={inputClass}
        />
      </label>

      {status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {error} You can also email me directly at{" "}
          <a href={`mailto:${profile.email}`} className="underline">
            {profile.email}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center justify-center rounded-full bg-foreground px-8 py-3 text-sm tracking-wide text-background transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-strong disabled:translate-y-0 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
