import Link from "next/link";
import { Container } from "@/components/Container";
import { CTASection } from "@/components/CTASection";
import { HeroSection } from "@/components/HeroSection";
import { createPageMetadata } from "@/lib/metadata";
import { getAllTemplates } from "@/lib/templates";

export const metadata = createPageMetadata(
  "模板與工具",
  "AI 導入評估檢核表、Agent 工作流設計模板與 Vibe Coding 工作坊引導指南等實用資源。",
);

export default function TemplatesPage() {
  const templates = getAllTemplates();

  return (
    <>
      <HeroSection
        subtitle="Templates & Tools"
        title="模板與工具"
        description="可複製的工作文件、流程模板與引導指南，協助團隊加速 AI 導入與工作流設計。"
      />

      <section className="py-16 sm:py-20">
        <Container>
          {templates.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Link
                  key={template.slug}
                  href={`/templates/${template.slug}`}
                  className="flex flex-col rounded-lg border border-brand-100 bg-white p-6 transition-shadow hover:border-accent/40 hover:shadow-md"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-brand-500">
                    {template.format}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-brand-900">
                    {template.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-600">
                    {template.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-brand-500">
              模板資源準備中，敬請期待。
            </p>
          )}
        </Container>
      </section>

      <CTASection
        title="需要客製化的模板或工作流設計？"
        description="可依企業情境調整模板內容，或協助設計專屬的工作流文件。"
        primaryCta={{ label: "聯絡我們", href: "/contact" }}
      />
    </>
  );
}
