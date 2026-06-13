import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonUnauthorized } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return jsonUnauthorized();
  }

  try {
    const status = request.nextUrl.searchParams.get("status");
    const enrollments = await prisma.courseEnrollment.findMany({
      where: status ? { status: status as never } : {},
      orderBy: { createdAt: "desc" },
      include: {
        cohort: {
          include: {
            courseProgram: { select: { title: true, slug: true } },
            sessions: { orderBy: { weekNumber: "asc" } },
          },
        },
      },
    });
    return NextResponse.json({ enrollments });
  } catch (error) {
    console.error("[GET /api/admin/course-enrollments]", error);
    return jsonError("無法取得課程報名", 500);
  }
}
