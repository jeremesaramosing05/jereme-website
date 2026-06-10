import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { siteUrl } from "@/content/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/work", "/library", "/resume", "/links", "/contact"].map(
    (path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
    })
  );

  const projectRoutes = projects.map(({ slug }) => ({
    url: `${siteUrl}/work/${slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...projectRoutes];
}
