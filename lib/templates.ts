import path from "node:path";
import {
  getMarkdownFilePath,
  getReadingMinutes,
  listMarkdownSlugs,
  readMarkdownFile,
} from "./markdown";

const TEMPLATES_DIR = path.join(process.cwd(), "content", "templates");

export type TemplateResource = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  format: string;
  category: string;
  tags: string[];
  draft: boolean;
  content: string;
  readingMinutes: number;
};

function mapTemplate(slug: string): TemplateResource | null {
  const parsed = readMarkdownFile(getMarkdownFilePath(TEMPLATES_DIR, slug));
  if (!parsed) return null;

  const { data, content } = parsed;

  return {
    slug,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    author: String(data.author ?? ""),
    format: String(data.format ?? "Markdown"),
    category: String(data.category ?? ""),
    tags: Array.isArray(data.tags) ? data.tags : [],
    draft: Boolean(data.draft),
    content,
    readingMinutes: getReadingMinutes(content),
  };
}

export function getAllTemplates() {
  return listMarkdownSlugs(TEMPLATES_DIR)
    .map((slug) => mapTemplate(slug))
    .filter((item): item is TemplateResource => item !== null && !item.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getTemplate(slug: string) {
  return mapTemplate(slug);
}
