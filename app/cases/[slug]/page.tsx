import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { CTASection } from "@/components/CTASection";
import { MarkdownContent } from "@/components/MarkdownContent";
import { getAllCases, getCaseStudy } from "@/lib/cases";
import { createPageMetadata } from "@/lib/metadata";

type CaseStudyPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllCases().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);

  if (!caseStudy) {
    return createPageMetadata("案例不存在", "找不到指定的案例研究。");
  }

  return createPageMetadata(caseStudy.title, caseStudy.description);
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);

  if (!caseStudy || caseStudy.draft) {
    notFound();
  }

  return (
    <>
      <article className="bg-white">
        <header className="border-b border-brand-100 bg-brand-50 py-14 sm:py-20">
          <Container className="max-w-4xl">
            <Link
              href="/cases"
              className="text-sm font-medium text-accent transition-colors hover:text-accent-dark"
            >
              返回案例研究
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-brand-500">
              <time dateTime={caseStudy.date}>{caseStudy.date}</time>
              <span>·</span>
              <span>{caseStudy.industry}</span>
              <span>·</span>
              <span>{caseStudy.serviceType}</span>
              <span>·</span>
              <span>{caseStudy.readingMinutes} 分鐘閱讀</span>
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl lg:text-5xl">
              {caseStudy.title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-brand-600">
              {caseStudy.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="text-sm text-brand-500">
                作者：{caseStudy.author}
              </span>
              {caseStudy.tags.map((tag) => (
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
          <MarkdownContent content={caseStudy.content} />
        </Container>
      </article>

      <CTASection
        title="想了解類似案例如何應用於您的團隊？"
        description="歡迎聯繫討論，我可以依您的產業與情境提供更具體的建議。"
        primaryCta={{ label: "聯絡我們", href: "/contact" }}
        secondaryCta={{ label: "查看更多案例", href: "/cases" }}
      />
    </>
  );
}
