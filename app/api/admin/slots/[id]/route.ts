import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonUnauthorized } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth/session";
import { updateSlotSchema } from "@/lib/validations/booking";

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
    const parsed = updateSlotSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "資料驗證失敗");
    }

    const existing = await prisma.availabilitySlot.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!existing) {
      return jsonError("找不到時段", 404);
    }

    if (parsed.data.status === "AVAILABLE" && existing.booking) {
      return jsonError("此時段已有預約，無法設為可預約");
    }

    const slot = await prisma.availabilitySlot.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ slot });
  } catch (error) {
    console.error("[PATCH /api/admin/slots/[id]]", error);
    return jsonError("更新時段失敗", 500);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return jsonUnauthorized();
  }

  try {
    const { id } = await context.params;

    const existing = await prisma.availabilitySlot.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!existing) {
      return jsonError("找不到時段", 404);
    }

    if (existing.booking) {
      return jsonError("此時段已有預約，無法刪除");
    }

    await prisma.availabilitySlot.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/slots/[id]]", error);
    return jsonError("刪除時段失敗", 500);
  }
}
