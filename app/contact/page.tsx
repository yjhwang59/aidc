import Link from "next/link";
import { Container } from "@/components/Container";
import { HeroSection } from "@/components/HeroSection";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-data";

export const metadata = createPageMetadata(
  "聯絡我們",
  "洽詢企業 AI 導入、培訓、Vibe Coding 與 AI Agent 工作流顧問合作。",
);

export default function ContactPage() {
  return (
    <>
      <HeroSection
        subtitle="Contact"
        title="聯絡我們"
        description="想討論您的 AI 導入計畫？歡迎線上預約諮詢時段，或直接來信聯絡。"
        primaryCta={{ label: "線上預約諮詢", href: "/booking" }}
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto grid max-w-4xl gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-bold text-brand-900">合作洽詢</h2>
              <p className="mt-4 leading-relaxed text-brand-600">
                無論是 AI 工具培訓、Vibe Coding 工作坊、Agent
                工作流設計或導入路線圖規劃，都歡迎來信討論。請簡述您的團隊現況、目標與預期時程。
              </p>

              <div className="mt-8 space-y-4">
                <div>
                  <p className="text-sm font-medium text-brand-700">Email</p>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="text-accent hover:text-accent-dark"
                  >
                    {siteConfig.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-700">
                    預期回覆時間
                  </p>
                  <p className="text-brand-600">兩個工作天內</p>
                </div>
              </div>

              <div className="mt-8 rounded-lg bg-brand-50 p-6">
                <h3 className="font-semibold text-brand-900">合作流程</h3>
                <ol className="mt-3 space-y-2 text-sm text-brand-600">
                  <li>1. 線上預約或來信說明需求與現況</li>
                  <li>2. 安排初步討論（線上或實體）</li>
                  <li>3. 提出服務建議與報價</li>
                  <li>4. 確認合作後開始執行</li>
                </ol>
              </div>
            </div>

            <div className="rounded-lg border border-brand-100 bg-white p-8">
              <h2 className="text-lg font-semibold text-brand-900">線上預約諮詢</h2>
              <p className="mt-2 text-sm text-brand-500">
                選擇服務類型與合適時段，我們將在兩個工作天內確認您的預約。
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-brand-50 p-4 text-sm text-brand-700">
                  <p>支援的諮詢類型：</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>AI 工具培訓</li>
                    <li>Vibe Coding</li>
                    <li>AI Agent 工作流</li>
                    <li>AI 導入藍圖</li>
                    <li>AI 系統開發</li>
                  </ul>
                </div>

                <Link
                  href="/booking"
                  className="inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
                >
                  前往預約
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
