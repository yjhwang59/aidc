import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const now = new Date();
    const programs = await prisma.courseProgram.findMany({
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
    });

    return NextResponse.json({ programs });
  } catch (error) {
    console.error("[GET /api/course-programs]", error);
    return jsonError("無法取得課程方案", 500);
  }
}
