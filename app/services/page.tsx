import { Container } from "@/components/Container";
import { CTASection } from "@/components/CTASection";
import { HeroSection } from "@/components/HeroSection";
import { createPageMetadata } from "@/lib/metadata";
import { services } from "@/lib/site-data";

export const metadata = createPageMetadata(
  "服務項目",
  "AI 工具培訓、Vibe Coding、AI Agent 工作流與企業 AI 導入路線圖等顧問服務。",
);

const serviceDetails = [
  {
    id: "ai-tool-training",
    title: "AI 工具培訓",
    points: [
      "依企業實際場景設計培訓內容",
      "建立團隊正確使用 AI 工具的習慣",
      "提供效益評估與持續改善方法",
    ],
  },
  {
    id: "vibe-coding",
    title: "Vibe Coding",
    points: [
      "以 AI 輔助開發加速原型建置",
      "適合產品驗證與內部工具開發",
      "含任務拆解、驗收標準與協作流程",
    ],
  },
  {
    id: "ai-agent",
    title: "AI Agent 工作流",
    points: [
      "將業務流程轉化為可運行的 Agent 工作流",
      "涵蓋權限設計、錯誤處理與人工覆核",
      "建立可稽核、可維護的自動化流程",
    ],
  },
  {
    id: "ai-roadmap",
    title: "AI 導入藍圖",
    points: [
      "盤點現況與資源，評估導入可行性",
      "規劃分階段試點與規模化策略",
      "建立可追蹤的衡量指標與溝通框架",
    ],
  },
  {
    id: "ai-system",
    title: "AI 系統開發",
    points: [
      "從需求到落地的系統設計顧問",
      "協助團隊建立可維運的 AI 系統架構",
      "整合現有 IT 環境與資料流程",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <HeroSection
        subtitle="Services"
        title="服務項目"
        description="依企業階段與需求，提供從培訓、原型開發到 Agent 工作流與導入藍圖的完整顧問支援。"
        primaryCta={{ label: "預約諮詢", href: "/booking" }}
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-8">
            {serviceDetails.map((service) => (
              <div
                key={service.id}
                id={service.id}
                className="scroll-mt-24 rounded-lg border border-brand-100 bg-white p-8"
              >
                <h2 className="text-xl font-bold text-brand-900">
                  {service.title}
                </h2>
                <ul className="mt-4 space-y-2">
                  {service.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-brand-600"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-lg bg-brand-50 p-8">
            <h2 className="text-lg font-semibold text-brand-900">合作流程</h2>
            <ol className="mt-4 space-y-3 text-sm text-brand-600">
              <li>1. 初步洽詢：了解團隊現況與目標</li>
              <li>2. 需求評估：提出適合的服務組合與時程建議</li>
              <li>3. 執行陪跑：依約定進行培訓、開發或顧問支援</li>
              <li>4. 成果交接：交付文件、模板與後續建議</li>
            </ol>
          </div>
        </Container>
      </section>

      <section className="border-t border-brand-100 bg-brand-50 py-12">
        <Container>
          <h2 className="text-lg font-semibold text-brand-900">服務摘要</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <a
                key={service.slug}
                href={service.href}
                className="rounded-lg border border-brand-100 bg-white p-4 text-sm transition-shadow hover:shadow-md"
              >
                <p className="font-medium text-brand-900">{service.title}</p>
                <p className="mt-2 text-brand-600">{service.description}</p>
              </a>
            ))}
          </div>
        </Container>
      </section>

      <CTASection
        title="討論適合您團隊的服務組合"
        description="每個企業的 AI 導入階段不同，歡迎聯繫討論最適合的起點。"
        primaryCta={{ label: "聯絡我們", href: "/contact" }}
      />
    </>
  );
}
