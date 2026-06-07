import Link from "next/link";
import { BlogCard } from "@/components/BlogCard";
import { CaseCard } from "@/components/CaseCard";
import { Container } from "@/components/Container";
import { CTASection } from "@/components/CTASection";
import { HeroSection } from "@/components/HeroSection";
import { ServiceCard } from "@/components/ServiceCard";
import { getAllBlogPosts } from "@/lib/blog";
import { getAllCases } from "@/lib/cases";
import { painPoints, services } from "@/lib/site-data";
import { getAllTemplates } from "@/lib/templates";

export default function HomePage() {
  const featuredCases = getAllCases().slice(0, 2);
  const featuredPosts = getAllBlogPosts().slice(0, 2);
  const featuredTemplates = getAllTemplates().slice(0, 2);

  return (
    <>
      <HeroSection
        subtitle="Enterprise AI Development Consultant"
        title="企業 AI 發展顧問"
        description="協助企業將 AI 從實驗走向落地。從 AI 工具培訓、Vibe Coding 到 AI Agent 工作流，建立可運行、可複製的系統與導入路線圖。"
        primaryCta={{ label: "預約諮詢", href: "/contact" }}
        secondaryCta={{ label: "了解服務", href: "/services" }}
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">
              企業導入 AI 的常見痛點
            </h2>
            <p className="mt-4 text-brand-600">
              多數企業已開始接觸 AI，但從工具試用到系統落地之間，往往缺少清晰的方法與陪跑支援。
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {painPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-lg border border-brand-100 bg-white p-6"
              >
                <h3 className="font-semibold text-brand-900">{point.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-brand-600">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-brand-50 py-16 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">
                服務項目
              </h2>
              <p className="mt-4 max-w-2xl text-brand-600">
                依企業階段與需求，提供從培訓、原型開發到 Agent
                工作流與導入藍圖的完整顧問支援。
              </p>
            </div>
            <Link
              href="/services"
              className="text-sm font-medium text-accent hover:text-accent-dark"
            >
              查看全部服務 →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <ServiceCard
                key={service.slug}
                title={service.title}
                description={service.description}
                href={service.href}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">
                案例精選
              </h2>
              <p className="mt-4 max-w-2xl text-brand-600">
                實際協助企業將 AI 導入日常工作的成果摘要。
              </p>
            </div>
            <Link
              href="/cases"
              className="text-sm font-medium text-accent hover:text-accent-dark"
            >
              查看全部案例 →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {featuredCases.map((caseItem) => (
              <CaseCard
                key={caseItem.slug}
                title={caseItem.title}
                industry={caseItem.industry}
                serviceType={caseItem.serviceType}
                description={caseItem.description}
                tags={caseItem.tags}
                href={`/cases/${caseItem.slug}`}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-brand-50 py-16 sm:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">
                  最新文章
                </h2>
                <Link
                  href="/blog"
                  className="text-sm font-medium text-accent hover:text-accent-dark"
                >
                  查看全部 →
                </Link>
              </div>
              <div className="mt-8 grid gap-6">
                {featuredPosts.map((post) => (
                  <BlogCard
                    key={post.slug}
                    title={post.title}
                    date={post.date}
                    category={post.category}
                    description={post.description}
                    tags={post.tags}
                    href={`/blog/${post.slug}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">
                  精選模板
                </h2>
                <Link
                  href="/templates"
                  className="text-sm font-medium text-accent hover:text-accent-dark"
                >
                  查看全部 →
                </Link>
              </div>
              <div className="mt-8 grid gap-6">
                {featuredTemplates.map((template) => (
                  <Link
                    key={template.slug}
                    href={`/templates/${template.slug}`}
                    className="block rounded-lg border border-brand-100 bg-white p-6 transition-shadow hover:border-accent/40 hover:shadow-md"
                  >
                    <p className="text-xs text-brand-500">{template.format}</p>
                    <h3 className="mt-1 text-lg font-semibold text-brand-900">
                      {template.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-brand-600">
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
            </div>
          </div>
        </Container>
      </section>

      <CTASection
        title="想討論您的 AI 導入計畫？"
        description="無論是培訓、原型開發、Agent 工作流或導入路線圖規劃，歡迎與我聯繫，一起找出適合您團隊的下一步。"
        primaryCta={{ label: "預約諮詢", href: "/contact" }}
        secondaryCta={{ label: "瀏覽課程", href: "/courses" }}
      />
    </>
  );
}
