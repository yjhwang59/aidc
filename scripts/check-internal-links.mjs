#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "content");

const ROUTE_PREFIXES = [
  { prefix: "/blog/", dir: "blog" },
  { prefix: "/cases/", dir: "cases" },
  { prefix: "/templates/", dir: "templates" },
];

const STATIC_ROUTES = new Set([
  "/",
  "/about",
  "/services",
  "/cases",
  "/courses",
  "/blog",
  "/templates",
  "/contact",
]);

function listPublishedSlugs(contentType) {
  const dir = path.join(CONTENT_DIR, contentType);
  if (!fs.existsSync(dir)) return new Set();

  return new Set(
    fs
      .readdirSync(dir)
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => fileName.replace(/\.md$/, "")),
  );
}

function collectMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath));
    } else if (entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractInternalLinks(content) {
  const links = [];
  const markdownLinkPattern = /\[[^\]]+\]\((\/[^)]+)\)/g;
  const hrefPattern = /href="(\/[^"]+)"/g;

  for (const match of content.matchAll(markdownLinkPattern)) {
    links.push(match[1]);
  }

  for (const match of content.matchAll(hrefPattern)) {
    links.push(match[1]);
  }

  return links;
}

function stripHashAndQuery(link) {
  return link.split("#")[0].split("?")[0];
}

function resolveLink(link) {
  const normalized = stripHashAndQuery(link);

  if (STATIC_ROUTES.has(normalized)) {
    return { ok: true };
  }

  for (const { prefix, dir } of ROUTE_PREFIXES) {
    if (!normalized.startsWith(prefix)) continue;

    const slug = normalized.slice(prefix.length);
    if (!slug || slug.includes("/")) {
      return { ok: false, reason: "unsupported nested path" };
    }

    const slugs = listPublishedSlugs(dir);
    if (slugs.has(slug)) {
      return { ok: true };
    }

    return { ok: false, reason: `missing content/${dir}/${slug}.md` };
  }

  return { ok: false, reason: "unknown internal route" };
}

function main() {
  const broken = [];

  for (const filePath of collectMarkdownFiles(CONTENT_DIR)) {
    const content = fs.readFileSync(filePath, "utf8");
    const relativeFile = path.relative(ROOT, filePath);

    for (const link of extractInternalLinks(content)) {
      if (!link.startsWith("/")) continue;

      const result = resolveLink(link);
      if (!result.ok) {
        broken.push({
          file: relativeFile,
          link,
          reason: result.reason,
        });
      }
    }
  }

  if (broken.length === 0) {
    console.log("Internal link check passed.");
    return;
  }

  console.error("Internal link check failed:\n");
  for (const item of broken) {
    console.error(`- ${item.file}`);
    console.error(`  ${item.link} (${item.reason})`);
  }

  process.exit(1);
}

main();
