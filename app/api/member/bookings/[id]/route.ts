import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/auth/member-session";
import { jsonError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const member = await requireMember();
    const { id } = await context.params;
    const booking = await prisma.booking.findFirst({
      where: { id, memberId: member.id },
      include: {
        service: { select: { title: true } },
        slot: { select: { startAt: true, endAt: true } },
      },
    });

    if (!booking) {
      return jsonError("找不到預約資料", 404);
    }

    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return jsonError("請先登入會員", 401);
    }
    console.error("[GET /api/member/bookings/[id]]", error);
    return jsonError("讀取預約資料失敗", 500);
  }
}

export async function PATCH(_request: NextRequest, context: RouteContext) {
  try {
    const member = await requireMember();
    const { id } = await context.params;

    const booking = await prisma.$transaction(async (tx) => {
      const existing = await tx.booking.findFirst({
        where: { id, memberId: member.id },
      });

      if (!existing) throw new Error("BOOKING_NOT_FOUND");
      if (!["PENDING", "CONFIRMED"].includes(existing.status)) {
        throw new Error("BOOKING_NOT_CANCELLABLE");
      }

      const updated = await tx.booking.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
        include: {
          service: { select: { title: true } },
          slot: { select: { startAt: true, endAt: true } },
        },
      });

      await tx.availabilitySlot.update({
        where: { id: existing.slotId },
        data: { status: "AVAILABLE" },
      });

      return updated;
    });

    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof Error) {
      const messages: Record<string, [string, number]> = {
        UNAUTHORIZED: ["請先登入會員", 401],
        BOOKING_NOT_FOUND: ["找不到預約資料", 404],
        BOOKING_NOT_CANCELLABLE: ["此預約目前不可取消", 400],
      };
      const message = messages[error.message];
      if (message) return jsonError(message[0], message[1]);
    }
    console.error("[PATCH /api/member/bookings/[id]]", error);
    return jsonError("取消預約失敗", 500);
  }
}
