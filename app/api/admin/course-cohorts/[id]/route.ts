import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonUnauthorized } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth/session";
import { updateCourseCohortSchema } from "@/lib/validations/booking";

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
    const parsed = updateCourseCohortSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "資料驗證失敗");
    }

    const cohort = await prisma.courseCohort.update({
      where: { id },
      data: {
        ...parsed.data,
        registrationDeadline:
          parsed.data.registrationDeadline === undefined
            ? undefined
            : parsed.data.registrationDeadline
              ? new Date(parsed.data.registrationDeadline)
              : null,
      },
    });
    return NextResponse.json({ cohort });
  } catch (error) {
    console.error("[PATCH /api/admin/course-cohorts/[id]]", error);
    return jsonError("更新課程班期失敗", 500);
  }
}
