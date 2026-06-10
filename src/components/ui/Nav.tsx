"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, startTransition } from "react";
import { useTheme } from "next-themes";
import { profile } from "@/content/profile";

const links = [
  { href: "/work", label: "Work" },
  { href: "/library", label: "Library" },
  { href: "/resume", label: "Resume" },
  { href: "/links", label: "Links" },
  { href: "/contact", label: "Contact" },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { startTransition(() => setMounted(true)); }, []);

  if (!mounted) return <span className="h-10 w-10" />;

  const dark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-10 w-10 items-center justify-center text-muted transition-colors hover:text-accent"
    >
      {dark ? (
        /* Sun */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2" x2="12" y2="4"/>
          <line x1="12" y1="20" x2="12" y2="22"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="2" y1="12" x2="4" y2="12"/>
          <line x1="20" y1="12" x2="22" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        /* Moon */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-lg tracking-tight transition-colors hover:text-accent"
          onClick={() => setOpen(false)}
        >
          {profile.name}
        </Link>

        <ul className="hidden items-center gap-8 sm:flex">
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`text-sm tracking-wide transition-colors hover:text-accent ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center sm:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3.5 w-5">
              <span
                className={`absolute left-0 top-0 h-px w-full bg-foreground transition-transform ${
                  open ? "top-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-px w-full bg-foreground transition-opacity ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-3 h-px w-full bg-foreground transition-transform ${
                  open ? "top-1.5 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {open && (
        <ul className="border-t border-line px-6 py-4 sm:hidden">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="block py-3 text-base text-muted transition-colors hover:text-accent"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
