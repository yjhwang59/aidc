import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonUnauthorized } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth/session";
import { updateCourseEnrollmentSchema } from "@/lib/validations/booking";
import { sendCourseEnrollmentStatusEmail } from "@/lib/email";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return jsonUnauthorized();
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateCourseEnrollmentSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "資料驗證失敗");
    }

    const existing = await prisma.courseEnrollment.findUnique({
      where: { id },
      include: { cohort: true },
    });
    if (!existing) return jsonError("找不到報名紀錄", 404);

    const { status, adminNote } = parsed.data;
    const now = new Date();

    const enrollment = await prisma.$transaction(async (tx) => {
      const updated = await tx.courseEnrollment.update({
        where: { id },
        data: {
          ...(status ? { status } : {}),
          ...(adminNote !== undefined ? { adminNote } : {}),
          ...(status === "CONFIRMED" ? { confirmedAt: now } : {}),
          ...(status === "CANCELLED" ? { cancelledAt: now } : {}),
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

      if (status === "CONFIRMED") {
        const confirmedBefore = await tx.courseEnrollment.count({
          where: {
            cohortId: updated.cohortId,
            status: "CONFIRMED",
            id: { not: updated.id },
          },
        });
        if (confirmedBefore >= updated.cohort.capacity) {
          throw new Error("COHORT_FULL");
        }

        const confirmedCount = await tx.courseEnrollment.count({
          where: { cohortId: updated.cohortId, status: "CONFIRMED" },
        });
        if (confirmedCount >= updated.cohort.capacity) {
          await tx.courseCohort.update({
            where: { id: updated.cohortId },
            data: { status: "FULL" },
          });
        }
      }

      return updated;
    });

    if (status && status !== existing.status) {
      sendCourseEnrollmentStatusEmail({
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
        console.error(
          "[PATCH /api/admin/course-enrollments/[id]] email failed",
          emailError,
        );
      });
    }

    return NextResponse.json({ enrollment });
  } catch (error) {
    if (error instanceof Error && error.message === "COHORT_FULL") {
      return jsonError("此班期已達名額上限，請改列候補或調整名額");
    }
    console.error("[PATCH /api/admin/course-enrollments/[id]]", error);
    return jsonError("更新課程報名失敗", 500);
  }
}
