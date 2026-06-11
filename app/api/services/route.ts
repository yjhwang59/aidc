import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        durationMin: true,
      },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error("[GET /api/services]", error);
    return jsonError("無法取得服務列表", 500);
  }
}
