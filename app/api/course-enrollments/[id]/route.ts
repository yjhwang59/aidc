import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
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

    if (!enrollment) return jsonError("找不到報名紀錄", 404);
    return NextResponse.json({ enrollment });
  } catch (error) {
    console.error("[GET /api/course-enrollments/[id]]", error);
    return jsonError("無法取得報名紀錄", 500);
  }
}
