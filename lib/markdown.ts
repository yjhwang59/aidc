import fs from "node:fs";
import path from "node:path";

export type FrontMatterData = Record<string, string | string[] | boolean>;

export function parseFrontMatter(raw: string): {
  data: FrontMatterData;
  content: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

  if (!match) {
    throw new Error("Content file is missing front matter.");
  }

  const entries = match[1].split(/\r?\n/).filter(Boolean);
  const data: FrontMatterData = {};

  for (const entry of entries) {
    const separatorIndex = entry.indexOf(":");
    if (separatorIndex === -1) continue;

    const key = entry.slice(0, separatorIndex).trim();
    const rawValue = entry.slice(separatorIndex + 1).trim();

    if (rawValue === "true" || rawValue === "false") {
      data[key] = rawValue === "true";
    } else if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      data[key] = rawValue
        .slice(1, -1)
        .split(",")
        .map((value) => value.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);
    } else {
      data[key] = rawValue.replace(/^"|"$/g, "");
    }
  }

  return {
    data,
    content: match[2].trim(),
  };
}

export function getReadingMinutes(content: string) {
  const words = content.replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/);
  return Math.max(1, Math.ceil(words.length / 240));
}

export function readMarkdownFile(filePath: string) {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  return parseFrontMatter(raw);
}

export function listMarkdownSlugs(contentDir: string) {
  if (!fs.existsSync(contentDir)) return [];

  return fs
    .readdirSync(contentDir)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""));
}

export function getMarkdownFilePath(contentDir: string, slug: string) {
  return path.join(contentDir, `${slug}.md`);
}
