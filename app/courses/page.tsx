export const dynamic = "force-dynamic";

import Link from "next/link";
import { Container } from "@/components/Container";
import { CTASection } from "@/components/CTASection";
import { HeroSection } from "@/components/HeroSection";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { formatSlotRange } from "@/lib/datetime";
import { createPageMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { courseProgramSeeds } from "@/lib/course-data";

export const metadata = createPageMetadata(
  "課程與培訓",
  "Vibe Coding、AI 系統開發與 AI Agent 工作流設計等課程與 8 週班期報名。",
);

function withDatabaseTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("DATABASE_TIMEOUT")), 1500),
    ),
  ]);
}

export default async function CoursesPage() {
  const now = new Date();
  let programs;

  try {
    programs = await withDatabaseTimeout(prisma.courseProgram.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        cohorts: {
          where: {
            status: { in: ["OPEN", "FULL"] },
            OR: [
              { registrationDeadline: null },
              { registrationDeadline: { gte: now } },
            ],
          },
          orderBy: { startsAt: "asc" },
          include: {
            sessions: { orderBy: { weekNumber: "asc" } },
            _count: { select: { enrollments: { where: { status: "CONFIRMED" } } } },
          },
        },
      },
    }));
  } catch (error) {
    console.error("[CoursesPage] database unavailable, using static course fallback", error);
    programs = courseProgramSeeds.map((program) => ({
      id: program.slug,
      slug: program.slug,
      title: program.title,
      description: program.description,
      level: program.level,
      durationWeeks: program.durationWeeks,
      sessionDurationMin: program.sessionDurationMin,
      capacity: program.capacity,
      cohorts: [],
    }));
  }

  return (
    <>
      <HeroSection
        subtitle="Courses & Training"
        title="課程與培訓"
        description="以 8 週班期協助團隊從 AI 工具使用，走向可落地的 AI 系統開發與 Agent 工作流實作。"
        primaryCta={{ label: "預約諮詢", href: "/booking" }}
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            {programs.map((program) => (
              <article
                key={program.id}
                className="rounded-lg border border-brand-100 bg-white p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-accent">
                      {program.level ?? "Course"} · {program.durationWeeks} 週
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-brand-900">
                      {program.title}
                    </h2>
                  </div>
                  <Link
                    href={`/courses/${program.slug}`}
                    className="shrink-0 rounded border border-brand-200 px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50"
                  >
                    查看詳情
                  </Link>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-brand-600">
                  {program.description}
                </p>
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-semibold text-brand-900">
                    可報名班期
                  </h3>
                  {program.cohorts.length === 0 ? (
                    <p className="text-sm text-brand-500">目前尚無開放班期。</p>
                  ) : (
                    program.cohorts.map((cohort) => (
                      <div
                        key={cohort.id}
                        className="rounded border border-brand-100 bg-brand-50 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-brand-900">
                              {cohort.title}
                            </p>
                            <p className="mt-1 text-sm text-brand-600">
                              {cohort.sessions[0]
                                ? formatSlotRange(
                                    cohort.sessions[0].startAt,
                                    cohort.sessions[0].endAt,
                                  )
                                : formatSlotRange(cohort.startsAt, cohort.endsAt)}
                            </p>
                          </div>
                          <BookingStatusBadge status={cohort.status} />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                          <span className="text-brand-500">
                            名額 {cohort._count.enrollments}/{cohort.capacity}
                          </span>
                          {cohort.status === "OPEN" && (
                            <Link
                              href={`/courses/${program.slug}/enroll/${cohort.id}`}
                              className="rounded bg-accent px-3 py-1.5 font-medium text-white hover:bg-accent-dark"
                            >
                              報名
                            </Link>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <CTASection
        title="需要企業內訓或專屬班期？"
        description="可依企業情境調整 8 週課綱、上課形式與專案產出。"
        primaryCta={{ label: "聯絡討論", href: "/contact" }}
      />
    </>
  );
}
