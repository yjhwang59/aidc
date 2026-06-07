import path from "node:path";
import {
  getMarkdownFilePath,
  getReadingMinutes,
  listMarkdownSlugs,
  readMarkdownFile,
} from "./markdown";

const CASES_DIR = path.join(process.cwd(), "content", "cases");

export type CaseStudy = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  industry: string;
  serviceType: string;
  tags: string[];
  draft: boolean;
  content: string;
  readingMinutes: number;
};

function mapCaseStudy(slug: string): CaseStudy | null {
  const parsed = readMarkdownFile(getMarkdownFilePath(CASES_DIR, slug));
  if (!parsed) return null;

  const { data, content } = parsed;

  return {
    slug,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    author: String(data.author ?? ""),
    industry: String(data.industry ?? ""),
    serviceType: String(data.serviceType ?? ""),
    tags: Array.isArray(data.tags) ? data.tags : [],
    draft: Boolean(data.draft),
    content,
    readingMinutes: getReadingMinutes(content),
  };
}

export function getAllCases() {
  return listMarkdownSlugs(CASES_DIR)
    .map((slug) => mapCaseStudy(slug))
    .filter((item): item is CaseStudy => item !== null && !item.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getCaseStudy(slug: string) {
  return mapCaseStudy(slug);
}
