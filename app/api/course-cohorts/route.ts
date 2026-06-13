import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const programId = request.nextUrl.searchParams.get("programId");
    const now = new Date();
    const cohorts = await prisma.courseCohort.findMany({
      where: {
        ...(programId ? { courseProgramId: programId } : {}),
        status: { in: ["OPEN", "FULL"] },
        OR: [
          { registrationDeadline: null },
          { registrationDeadline: { gte: now } },
        ],
        courseProgram: { isActive: true },
      },
      orderBy: { startsAt: "asc" },
      include: {
        courseProgram: { select: { title: true, slug: true } },
        sessions: { orderBy: { weekNumber: "asc" } },
        _count: { select: { enrollments: { where: { status: "CONFIRMED" } } } },
      },
    });

    return NextResponse.json({ cohorts });
  } catch (error) {
    console.error("[GET /api/course-cohorts]", error);
    return jsonError("無法取得課程班期", 500);
  }
}
