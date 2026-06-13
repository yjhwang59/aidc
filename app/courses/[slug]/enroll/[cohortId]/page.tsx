export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { CourseEnrollmentForm } from "@/components/booking/CourseEnrollmentForm";
import { formatSlotRange } from "@/lib/datetime";
import { createPageMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ slug: string; cohortId: string }> };

export const metadata = createPageMetadata(
  "課程報名",
  "填寫 AIDC.work 課程班期報名資料。",
);

export default async function CourseEnrollPage({ params }: PageProps) {
  const { slug, cohortId } = await params;
  const cohort = await prisma.courseCohort.findFirst({
    where: {
      id: cohortId,
      courseProgram: { slug, isActive: true },
    },
    include: {
      courseProgram: true,
      sessions: { orderBy: { weekNumber: "asc" } },
    },
  });

  if (!cohort) notFound();
  if (cohort.status !== "OPEN") notFound();

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-lg border border-brand-100 bg-brand-50 p-6">
            <p className="text-sm font-semibold text-accent">課程報名</p>
            <h1 className="mt-2 text-2xl font-bold text-brand-900">
              {cohort.courseProgram.title}
            </h1>
            <p className="mt-4 font-medium text-brand-800">{cohort.title}</p>
            <div className="mt-5 space-y-2 text-sm text-brand-600">
              {cohort.sessions.map((session) => (
                <p key={session.id}>
                  第 {session.weekNumber} 週：{formatSlotRange(session.startAt, session.endAt)}
                </p>
              ))}
            </div>
          </aside>
          <div className="rounded-lg border border-brand-100 bg-white p-6">
            <h2 className="text-xl font-semibold text-brand-900">填寫報名資料</h2>
            <p className="mt-2 text-sm text-brand-600">
              送出後狀態為待確認，管理員確認後會以 Email 通知。
            </p>
            <div className="mt-6">
              <CourseEnrollmentForm cohortId={cohort.id} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
