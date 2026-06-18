// ── SITE IDENTITY ────────────────────────────────────────────────────
// Everything on the site that talks about *you* reads from this file.

export const profile = {
  name: "Jereme Saramosing",
  firstName: "Jereme",
  tagline: "Data analyst, builder & storyteller",
  heroLine:
    "I turn data into clear decisions — and build the tools and stories around it.",
  location: "Davao City, Philippines",
  email: "jeremesaramosing05@gmail.com",
  about: [
    "I'm a detail-oriented remote professional with four years of Quality Control experience at San Miguel Corporation, one of the Philippines' largest F&B companies. I turn inspection and operational data into clear reports with SQL, Power BI, Tableau, and Excel — and automate the repetitive parts with Google Apps Script and AI tools like Claude, ChatGPT, and Gemini.",
    "I'm also an independent graphic novelist and digital content creator, publishing original illustrated stories across YouTube, TikTok, and Facebook, and I build small apps for the things I care about. I'm open to remote work in Quality Control, Data Analytics, Virtual Assistance, Creative Writing, and English/Math tutoring — delivering accurate, high-quality output independently, from anywhere.",
  ],
  skills: [
    "Data Analysis (SQL · Power BI · Tableau)",
    "Advanced Excel & Reporting",
    "Process Automation",
    "AI-Assisted Productivity",
    "Quality Control & HACCP",
    "Graphic Novels & Storytelling",
    "Content Creation",
    "English & Math Tutoring",
  ],
  literaryQuote: {
    text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.",
    author: "George R.R. Martin",
  },
  socials: [
    { label: "GitHub", href: "https://github.com/", handle: "@jereme" },
    { label: "LinkedIn", href: "https://linkedin.com/", handle: "Jereme Saramosing" },
    { label: "Instagram", href: "https://instagram.com/", handle: "@jereme" },
    { label: "Facebook", href: "https://facebook.com/", handle: "Jereme Saramosing" },
    { label: "YouTube", href: "https://youtube.com/", handle: "@jereme" },
  ],
} as const;

export const siteUrl = "https://jereme-website.vercel.app";
