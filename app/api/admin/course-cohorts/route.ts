import { NextRequest, NextResponse } from "next/server";
import { addWeeks } from "date-fns";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonUnauthorized } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth/session";
import { getDefaultCourseSessions } from "@/lib/course-data";
import { createCourseCohortSchema } from "@/lib/validations/booking";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return jsonUnauthorized();
  }

  try {
    const cohorts = await prisma.courseCohort.findMany({
      orderBy: { startsAt: "desc" },
      include: {
        courseProgram: { select: { title: true, slug: true } },
        sessions: { orderBy: { weekNumber: "asc" } },
        _count: { select: { enrollments: true } },
      },
    });
    return NextResponse.json({ cohorts });
  } catch (error) {
    console.error("[GET /api/admin/course-cohorts]", error);
    return jsonError("無法取得課程班期", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return jsonUnauthorized();
  }

  try {
    const body = await request.json();
    const parsed = createCourseCohortSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "資料驗證失敗");
    }

    const program = await prisma.courseProgram.findUnique({
      where: { id: parsed.data.courseProgramId },
    });
    if (!program) return jsonError("找不到課程方案", 404);

    const startsAt = new Date(parsed.data.startsAt);
    const sessions = getDefaultCourseSessions(program.slug);
    const endsAt = addWeeks(startsAt, program.durationWeeks - 1);

    const cohort = await prisma.courseCohort.create({
      data: {
        courseProgramId: program.id,
        title: parsed.data.title,
        startsAt,
        endsAt,
        registrationDeadline: parsed.data.registrationDeadline
          ? new Date(parsed.data.registrationDeadline)
          : null,
        capacity: parsed.data.capacity,
        status: parsed.data.status,
        sessions: {
          create: sessions.slice(0, program.durationWeeks).map((session, index) => {
            const startAt = addWeeks(startsAt, index);
            return {
              weekNumber: index + 1,
              startAt,
              endAt: new Date(
                startAt.getTime() + program.sessionDurationMin * 60 * 1000,
              ),
              topic: session.topic,
              description: session.description,
            };
          }),
        },
      },
      include: { sessions: { orderBy: { weekNumber: "asc" } } },
    });

    return NextResponse.json({ cohort }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/course-cohorts]", error);
    return jsonError("建立課程班期失敗", 500);
  }
}
