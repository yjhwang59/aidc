import { NextRequest, NextResponse } from "next/server";
import { addWeeks } from "date-fns";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const serviceId = searchParams.get("serviceId");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    if (!serviceId) {
      return jsonError("請提供 serviceId");
    }

    const from = fromParam ? new Date(fromParam) : new Date();
    const to = toParam ? new Date(toParam) : addWeeks(from, 4);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return jsonError("日期格式無效");
    }

    const slots = await prisma.availabilitySlot.findMany({
      where: {
        serviceId,
        status: "AVAILABLE",
        startAt: { gte: from, lte: to },
      },
      orderBy: { startAt: "asc" },
      select: {
        id: true,
        serviceId: true,
        startAt: true,
        endAt: true,
        status: true,
      },
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("[GET /api/slots]", error);
    return jsonError("無法取得可預約時段", 500);
  }
}
