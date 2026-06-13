import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonUnauthorized } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth/session";
import { updateCourseSessionSchema } from "@/lib/validations/booking";

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
    const parsed = updateCourseSessionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "資料驗證失敗");
    }

    const startAt = new Date(parsed.data.startAt);
    const endAt = new Date(parsed.data.endAt);
    if (endAt <= startAt) return jsonError("結束時間必須晚於開始時間");

    const session = await prisma.courseSession.update({
      where: { id },
      data: {
        startAt,
        endAt,
        topic: parsed.data.topic,
        description: parsed.data.description,
      },
    });
    return NextResponse.json({ session });
  } catch (error) {
    console.error("[PATCH /api/admin/course-sessions/[id]]", error);
    return jsonError("更新課程週次失敗", 500);
  }
}
