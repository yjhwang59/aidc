import { Suspense } from "react";
import { Container } from "@/components/Container";
import { HeroSection } from "@/components/HeroSection";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(
  "預約諮詢",
  "線上預約企業 AI 導入、培訓、Vibe Coding 與 AI Agent 工作流顧問諮詢時段。",
);

export default function BookingPage() {
  return (
    <>
      <HeroSection
        subtitle="Booking"
        title="預約諮詢"
        description="選擇服務類型與合適時段，我們將在兩個工作天內確認您的預約。"
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Suspense fallback={<p className="text-sm text-brand-500">載入中...</p>}>
              <BookingWizard />
            </Suspense>
          </div>
        </Container>
      </section>
    </>
  );
}
