import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/blog";
import { getAllCases } from "@/lib/cases";
import { getAllTemplates } from "@/lib/templates";

export const dynamic = "force-static";

const BASE_URL = "https://aidc.work";

const staticRoutes = [
  "",
  "/about",
  "/services",
  "/cases",
  "/courses",
  "/blog",
  "/templates",
  "/contact",
  "/booking",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  const blogEntries: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const caseEntries: MetadataRoute.Sitemap = getAllCases().map((item) => ({
    url: `${BASE_URL}/cases/${item.slug}`,
    lastModified: new Date(item.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const templateEntries: MetadataRoute.Sitemap = getAllTemplates().map(
    (item) => ({
      url: `${BASE_URL}/templates/${item.slug}`,
      lastModified: new Date(item.date),
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  return [
    ...staticEntries,
    ...blogEntries,
    ...caseEntries,
    ...templateEntries,
  ];
}
