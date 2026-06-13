export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { formatSlotRange } from "@/lib/datetime";
import { createPageMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { courseProgramSeeds, getDefaultCourseSessions } from "@/lib/course-data";

type PageProps = { params: Promise<{ slug: string }> };

function withDatabaseTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("DATABASE_TIMEOUT")), 1500),
    ),
  ]);
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  let program;
  try {
    program = await withDatabaseTimeout(
      prisma.courseProgram.findUnique({ where: { slug } }),
    );
  } catch {
    program = courseProgramSeeds.find((item) => item.slug === slug);
  }
  return createPageMetadata(
    program?.title ?? "課程詳情",
    program?.description ?? "AIDC.work 課程詳情與班期報名。",
  );
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const now = new Date();
  let program;

  try {
    program = await withDatabaseTimeout(prisma.courseProgram.findFirst({
      where: { slug, isActive: true },
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
    console.error("[CourseDetailPage] database unavailable, using static course fallback", error);
    const fallback = courseProgramSeeds.find((item) => item.slug === slug);
    program = fallback
      ? {
          id: fallback.slug,
          slug: fallback.slug,
          title: fallback.title,
          description: fallback.description,
          level: fallback.level,
          durationWeeks: fallback.durationWeeks,
          sessionDurationMin: fallback.sessionDurationMin,
          capacity: fallback.capacity,
          cohorts: [],
        }
      : null;
  }

  if (!program) notFound();
  const firstCohort = program.cohorts[0];
  const sessions =
    firstCohort?.sessions.length
      ? firstCohort.sessions
      : getDefaultCourseSessions(program.slug).map((session, index) => ({
          id: `${program.slug}-outline-${index + 1}`,
          weekNumber: index + 1,
          startAt: null,
          endAt: null,
          topic: session.topic,
          description: session.description,
        }));

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm font-semibold text-accent">
              {program.level ?? "Course"} · {program.durationWeeks} 週 · 每堂{" "}
              {program.sessionDurationMin} 分鐘
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
              {program.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-brand-600">
              {program.description}
            </p>

            <div className="mt-10">
              <h2 className="text-xl font-semibold text-brand-900">8 週課表</h2>
              <div className="mt-5 space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-brand-100 bg-white p-4"
                  >
                    <p className="text-sm font-semibold text-accent">
                      第 {session.weekNumber} 週
                      {session.startAt && session.endAt
                        ? ` · ${formatSlotRange(session.startAt, session.endAt)}`
                        : ""}
                    </p>
                    <h3 className="mt-1 font-semibold text-brand-900">
                      {session.topic}
                    </h3>
                    {session.description && (
                      <p className="mt-2 text-sm leading-relaxed text-brand-600">
                        {session.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <h2 className="text-lg font-semibold text-brand-900">開放班期</h2>
            {program.cohorts.length === 0 ? (
              <div className="rounded-lg border border-brand-100 bg-brand-50 p-5 text-sm text-brand-600">
                目前尚無開放班期，歡迎先聯絡討論企業內訓。
              </div>
            ) : (
              program.cohorts.map((cohort) => (
                <div
                  key={cohort.id}
                  className="rounded-lg border border-brand-100 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-brand-900">
                      {cohort.title}
                    </h3>
                    <BookingStatusBadge status={cohort.status} />
                  </div>
                  <p className="mt-3 text-sm text-brand-600">
                    {cohort.sessions[0]
                      ? formatSlotRange(
                          cohort.sessions[0].startAt,
                          cohort.sessions[0].endAt,
                        )
                      : formatSlotRange(cohort.startsAt, cohort.endsAt)}
                  </p>
                  <p className="mt-2 text-sm text-brand-500">
                    名額 {cohort._count.enrollments}/{cohort.capacity}
                  </p>
                  {cohort.status === "OPEN" && (
                    <Link
                      href={`/courses/${program.slug}/enroll/${cohort.id}`}
                      className="mt-4 inline-flex rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
                    >
                      報名此班期
                    </Link>
                  )}
                </div>
              ))
            )}
          </aside>
        </div>
      </Container>
    </section>
  );
}
