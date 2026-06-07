import { Container } from "@/components/Container";
import { CTASection } from "@/components/CTASection";
import { HeroSection } from "@/components/HeroSection";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-data";

export const metadata = createPageMetadata(
  "關於 Jack Y. J. Hwang（黃燕忠）",
  "企業 AI 發展顧問 Jack Y. J. Hwang（黃燕忠）的專業背景、服務理念與合作方式。",
);

const expertise = [
  "AI 工具培訓",
  "Vibe Coding",
  "AI 系統開發",
  "AI Agent 工作流",
  "企業 AI 導入路線圖",
];

const industries = [
  "製造業",
  "零售業",
  "金融服務",
  "科技與新創",
  "專業服務",
];

export default function AboutPage() {
  return (
    <>
      <HeroSection
        subtitle="About"
        title="關於 Jack Y. J. Hwang（黃燕忠）"
        description="企業 AI 發展顧問，專注於協助企業將 AI 工具、Vibe Coding 與 AI Agent 轉化為可運行的系統與工作流。"
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl space-y-8">
            <div>
              <h2 className="text-xl font-bold text-brand-900">個人簡介</h2>
              <p className="mt-4 leading-relaxed text-brand-600">
                {siteConfig.author}（黃燕忠）是一位企業 AI
                發展顧問，協助決策者與技術團隊從 AI
                工具試用，走向可運行的系統與工作流落地。服務涵蓋培訓、原型開發、Agent
                工作流設計與導入路線圖規劃。
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-900">
                服務企業類型
              </h2>
              <p className="mt-4 leading-relaxed text-brand-600">
                曾協助多種產業的企業團隊建立 AI
                導入能力，從部門試點到跨團隊協作，依實際情境調整方法與節奏。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {industries.map((industry) => (
                  <span
                    key={industry}
                    className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-600"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-900">核心理念</h2>
              <p className="mt-4 leading-relaxed text-brand-600">
                相信 AI
                的價值在於解決實際問題，而非追逐流行。顧問工作的核心是陪跑：協助團隊建立方法、累積資產、形成可持續演進的導入能力，而非一次性專案交付。
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-900">合作方式</h2>
              <p className="mt-4 leading-relaxed text-brand-600">
                依需求提供培訓工作坊、顧問陪跑、原型開發支援與導入路線圖規劃。合作前會先了解團隊現況與目標，再提出適合的階段性建議。
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-900">專業領域</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {expertise.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-brand-200 px-3 py-1 text-sm text-brand-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CTASection
        title="想進一步了解合作方式？"
        description="歡迎與我聯繫，討論您的團隊現況與 AI 導入目標。"
        primaryCta={{ label: "聯絡我們", href: "/contact" }}
        secondaryCta={{ label: "查看服務", href: "/services" }}
      />
    </>
  );
}
