import { describe, it, expect } from "vitest";
import { profile, siteUrl } from "./profile";
import { projects, featuredProjects, getProject } from "./projects";

// These guard the data that drives every page on the site. They're pure-data
// checks — fast, deterministic, and they fail loudly on the easy mistakes
// (a duplicate slug, a missing case-study field, a typo'd demo id).

const ALLOWED_DEMOS = new Set(["pos", "dashboard", "reader", "chess"]);

describe("profile", () => {
  it("has the essential identity fields", () => {
    expect(profile.name.trim().length).toBeGreaterThan(0);
    expect(profile.firstName.trim().length).toBeGreaterThan(0);
    expect(profile.tagline.trim().length).toBeGreaterThan(0);
  });

  it("has a plausible email", () => {
    expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });

  it("has at least one social link, each with a label and an http(s) href", () => {
    expect(profile.socials.length).toBeGreaterThan(0);
    for (const s of profile.socials) {
      expect(s.label.trim().length).toBeGreaterThan(0);
      expect(s.href).toMatch(/^https?:\/\//);
    }
  });

  it("exposes an https siteUrl with no trailing slash", () => {
    expect(siteUrl).toMatch(/^https:\/\//);
    expect(siteUrl.endsWith("/")).toBe(false);
  });
});

describe("projects", () => {
  it("is non-empty", () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it("has unique slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("uses url-safe slugs", () => {
    for (const p of projects) {
      expect(p.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("has all required fields filled on every project", () => {
    for (const p of projects) {
      expect(p.title.trim().length, `title for ${p.slug}`).toBeGreaterThan(0);
      expect(p.year.trim().length, `year for ${p.slug}`).toBeGreaterThan(0);
      expect(p.role.trim().length, `role for ${p.slug}`).toBeGreaterThan(0);
      expect(p.summary.trim().length, `summary for ${p.slug}`).toBeGreaterThan(0);
      expect(p.tags.length, `tags for ${p.slug}`).toBeGreaterThan(0);
      expect(p.hue, `hue for ${p.slug}`).toBeGreaterThanOrEqual(0);
      expect(p.hue, `hue for ${p.slug}`).toBeLessThanOrEqual(360);
      expect(p.caseStudy.problem.trim().length, `problem for ${p.slug}`).toBeGreaterThan(0);
      expect(p.caseStudy.process.trim().length, `process for ${p.slug}`).toBeGreaterThan(0);
      expect(p.caseStudy.result.trim().length, `result for ${p.slug}`).toBeGreaterThan(0);
    }
  });

  it("only references known demo ids", () => {
    for (const p of projects) {
      if (p.demo) expect(ALLOWED_DEMOS.has(p.demo), `demo "${p.demo}" on ${p.slug}`).toBe(true);
    }
  });

  it("gives external links an http(s) href", () => {
    for (const p of projects) {
      if (p.link) expect(p.link.href, `link for ${p.slug}`).toMatch(/^https?:\/\//);
    }
  });
});

describe("featuredProjects", () => {
  it("contains exactly the projects flagged featured", () => {
    expect(featuredProjects).toEqual(projects.filter((p) => p.featured));
    expect(featuredProjects.every((p) => p.featured)).toBe(true);
  });
});

describe("getProject", () => {
  it("finds a project by slug", () => {
    const first = projects[0];
    expect(getProject(first.slug)?.slug).toBe(first.slug);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getProject("definitely-not-a-real-slug")).toBeUndefined();
  });
});
