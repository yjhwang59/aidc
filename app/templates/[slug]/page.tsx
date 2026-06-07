import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { CTASection } from "@/components/CTASection";
import { MarkdownContent } from "@/components/MarkdownContent";
import { createPageMetadata } from "@/lib/metadata";
import { getAllTemplates, getTemplate } from "@/lib/templates";

type TemplatePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllTemplates().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: TemplatePageProps) {
  const { slug } = await params;
  const template = getTemplate(slug);

  if (!template) {
    return createPageMetadata("模板不存在", "找不到指定的模板資源。");
  }

  return createPageMetadata(template.title, template.description);
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { slug } = await params;
  const template = getTemplate(slug);

  if (!template || template.draft) {
    notFound();
  }

  return (
    <>
      <article className="bg-white">
        <header className="border-b border-brand-100 bg-brand-50 py-14 sm:py-20">
          <Container className="max-w-4xl">
            <Link
              href="/templates"
              className="text-sm font-medium text-accent transition-colors hover:text-accent-dark"
            >
              返回模板與工具
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-brand-500">
              <time dateTime={template.date}>{template.date}</time>
              <span>·</span>
              <span>{template.format}</span>
              <span>·</span>
              <span>{template.category}</span>
              <span>·</span>
              <span>{template.readingMinutes} 分鐘閱讀</span>
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl lg:text-5xl">
              {template.title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-brand-600">
              {template.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="text-sm text-brand-500">
                作者：{template.author}
              </span>
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-600 ring-1 ring-brand-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Container>
        </header>

        <Container className="max-w-4xl py-12 sm:py-16" as="section">
          <MarkdownContent content={template.content} />
        </Container>
      </article>

      <CTASection
        title="需要客製化的模板或工作流設計？"
        description="可依企業情境調整模板內容，或協助設計專屬的工作流文件。"
        primaryCta={{ label: "聯絡我們", href: "/contact" }}
        secondaryCta={{ label: "查看更多模板", href: "/templates" }}
      />
    </>
  );
}
