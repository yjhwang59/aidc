import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const now = new Date();
    const program = await prisma.courseProgram.findFirst({
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
    });

    if (!program) return jsonError("找不到課程", 404);
    return NextResponse.json({ program });
  } catch (error) {
    console.error("[GET /api/course-programs/[slug]]", error);
    return jsonError("無法取得課程", 500);
  }
}
