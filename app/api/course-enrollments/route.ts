import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createCourseEnrollmentSchema } from "@/lib/validations/booking";
import { sendCourseEnrollmentCreatedEmails } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`course-enrollment:${ip}`);
    if (!rate.allowed) {
      return jsonError(`請求過於頻繁，請 ${rate.retryAfter} 秒後再試`, 429);
    }

    const body = await request.json();
    const parsed = createCourseEnrollmentSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "資料驗證失敗");
    }

    const enrollment = await prisma.$transaction(async (tx) => {
      const cohort = await tx.courseCohort.findUnique({
        where: { id: parsed.data.cohortId },
        include: {
          courseProgram: true,
          sessions: { orderBy: { weekNumber: "asc" } },
          _count: { select: { enrollments: { where: { status: "CONFIRMED" } } } },
        },
      });

      if (!cohort) throw new Error("COHORT_NOT_FOUND");
      if (cohort.status !== "OPEN") throw new Error("COHORT_NOT_OPEN");
      if (
        cohort.registrationDeadline &&
        cohort.registrationDeadline < new Date()
      ) {
        throw new Error("REGISTRATION_CLOSED");
      }

      const created = await tx.courseEnrollment.create({
        data: {
          cohortId: cohort.id,
          name: parsed.data.name,
          email: parsed.data.email,
          company: parsed.data.company,
          phone: parsed.data.phone,
          message: parsed.data.message,
          status: "PENDING",
        },
        include: {
          cohort: {
            include: {
              courseProgram: true,
              sessions: { orderBy: { weekNumber: "asc" } },
            },
          },
        },
      });

      return created;
    });

    sendCourseEnrollmentCreatedEmails({
      id: enrollment.id,
      name: enrollment.name,
      email: enrollment.email,
      company: enrollment.company,
      phone: enrollment.phone,
      message: enrollment.message,
      programTitle: enrollment.cohort.courseProgram.title,
      cohortTitle: enrollment.cohort.title,
      status: enrollment.status,
      sessions: enrollment.cohort.sessions,
    }).catch((emailError) => {
      console.error("[POST /api/course-enrollments] email failed", emailError);
    });

    return NextResponse.json({ enrollment: { id: enrollment.id } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      const messages: Record<string, string> = {
        COHORT_NOT_FOUND: "找不到指定班期",
        COHORT_NOT_OPEN: "此班期目前未開放報名",
        REGISTRATION_CLOSED: "此班期已超過報名截止日",
      };
      if (messages[error.message]) return jsonError(messages[error.message]);
    }
    console.error("[POST /api/course-enrollments]", error);
    return jsonError("建立課程報名失敗", 500);
  }
}
