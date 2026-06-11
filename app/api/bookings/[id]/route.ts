import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: { select: { title: true, slug: true } },
        slot: { select: { startAt: true, endAt: true } },
      },
    });

    if (!booking) {
      return jsonError("找不到預約紀錄", 404);
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        status: booking.status,
        name: booking.name,
        email: booking.email,
        company: booking.company,
        phone: booking.phone,
        message: booking.message,
        service: booking.service,
        slot: booking.slot,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    console.error("[GET /api/bookings/[id]]", error);
    return jsonError("無法取得預約紀錄", 500);
  }
}
