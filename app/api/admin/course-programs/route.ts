import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonUnauthorized } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth/session";
import { createCourseProgramSchema } from "@/lib/validations/booking";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return jsonUnauthorized();
  }

  try {
    const programs = await prisma.courseProgram.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { cohorts: true } } },
    });
    return NextResponse.json({ programs });
  } catch (error) {
    console.error("[GET /api/admin/course-programs]", error);
    return jsonError("無法取得課程方案", 500);
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
    const parsed = createCourseProgramSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "資料驗證失敗");
    }

    const program = await prisma.courseProgram.create({ data: parsed.data });
    return NextResponse.json({ program }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("課程 slug 已存在");
    }
    console.error("[POST /api/admin/course-programs]", error);
    return jsonError("建立課程方案失敗", 500);
  }
}
