import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth/member-session";
import { jsonError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const member = await requireMember();
    const bookings = await prisma.booking.findMany({
      where: { memberId: member.id },
      orderBy: { createdAt: "desc" },
      include: {
        service: { select: { title: true } },
        slot: { select: { startAt: true, endAt: true } },
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return jsonError("請先登入會員", 401);
    }
    console.error("[GET /api/member/bookings]", error);
    return jsonError("讀取預約資料失敗", 500);
  }
}
