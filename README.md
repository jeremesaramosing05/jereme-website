# Jereme's Website

Personal portfolio + creative showcase for Jereme Saramosing. Clean, minimal,
elegant — built with Next.js (App Router), TypeScript, Tailwind CSS v4, and
Framer Motion.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Hero, about, featured work, contact CTA |
| `/work` | Full project gallery |
| `/work/[slug]` | Case study (problem → process → result) |
| `/resume` | Experience, education, toolset + PDF download |
| `/links` | Linktree-style hub for social media bios |
| `/contact` | Contact form (Resend-powered API route) |

## Editing content

All personal content lives in `src/content/` — no code changes needed:

- `profile.ts` — name, tagline, bio, skills, social links
- `projects.ts` — the work gallery and case studies
- `resume.ts` — experience, education, toolset

Drop a real resume at `public/resume.pdf` (a placeholder is there now).
Project cover images go in `public/work/<slug>.jpg` — set `cover` on the
project entry; until then each project renders an elegant typographic cover.

## Develop

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (all pages statically generated)
```

## Contact form

Copy `.env.example` to `.env.local` and set `RESEND_API_KEY`
(free at [resend.com](https://resend.com)). Without the key the form shows a
friendly "not configured" message with a direct mailto fallback.

## Deploy

Push to GitHub → import the repo at [vercel.com](https://vercel.com) → add
`RESEND_API_KEY` in the project's environment variables → deploy. Then update
`siteUrl` in `src/content/profile.ts` to the real production URL.
