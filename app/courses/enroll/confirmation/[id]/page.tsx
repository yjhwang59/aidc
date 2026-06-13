export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { formatSlotRange } from "@/lib/datetime";
import { createPageMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export const metadata = createPageMetadata(
  "課程報名確認",
  "您的課程報名申請已收到。",
);

export default async function CourseEnrollmentConfirmationPage({
  params,
}: PageProps) {
  const { id } = await params;
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id },
    include: {
      cohort: {
        include: {
          courseProgram: true,
          sessions: { orderBy: { weekNumber: "asc" } },
        },
      },
    },
  });

  if (!enrollment) notFound();

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl rounded-lg border border-brand-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-brand-900">報名申請已送出</h1>
          <p className="mt-3 text-brand-600">
            我們已收到您的課程報名，將在兩個工作天內以 Email 確認。
          </p>
          <div className="mt-8 space-y-3 rounded-lg bg-brand-50 p-6 text-left text-sm text-brand-700">
            <div className="flex justify-between gap-4">
              <span className="text-brand-500">報名編號</span>
              <span className="font-mono text-xs">{enrollment.id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-brand-500">狀態</span>
              <BookingStatusBadge status={enrollment.status} />
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-brand-500">課程</span>
              <span>{enrollment.cohort.courseProgram.title}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-brand-500">班期</span>
              <span>{enrollment.cohort.title}</span>
            </div>
            {enrollment.cohort.sessions[0] && (
              <div className="flex justify-between gap-4">
                <span className="text-brand-500">第一週</span>
                <span>
                  {formatSlotRange(
                    enrollment.cohort.sessions[0].startAt,
                    enrollment.cohort.sessions[0].endAt,
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-brand-500">姓名</span>
              <span>{enrollment.name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-brand-500">Email</span>
              <span>{enrollment.email}</span>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/courses"
              className="rounded-md border border-brand-200 px-4 py-2 text-sm text-brand-700 hover:bg-brand-50"
            >
              返回課程列表
            </Link>
            <Link
              href="/"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
            >
              返回首頁
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
