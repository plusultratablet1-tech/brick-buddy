import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://brick-buddy-ten.vercel.app";
  const lastModified = new Date();
  return ["", "/build-ideas", "/explore", "/privacy", "/terms", "/safety"].map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : (path === "/build-ideas" || path === "/explore") ? 0.7 : 0.4,
  }));
}
