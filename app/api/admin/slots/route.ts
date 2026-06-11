import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonUnauthorized } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth/session";
import {
  createSlotSchema,
  createSlotsBatchSchema,
} from "@/lib/validations/booking";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return jsonUnauthorized();
  }

  try {
    const { searchParams } = request.nextUrl;
    const serviceId = searchParams.get("serviceId");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const where: {
      serviceId?: string;
      startAt?: { gte?: Date; lte?: Date };
    } = {};

    if (serviceId) where.serviceId = serviceId;
    if (fromParam || toParam) {
      where.startAt = {};
      if (fromParam) where.startAt.gte = new Date(fromParam);
      if (toParam) where.startAt.lte = new Date(toParam);
    }

    const slots = await prisma.availabilitySlot.findMany({
      where,
      orderBy: { startAt: "asc" },
      include: {
        service: { select: { title: true, slug: true } },
        booking: {
          select: { id: true, name: true, email: true, status: true },
        },
      },
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("[GET /api/admin/slots]", error);
    return jsonError("無法取得時段列表", 500);
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

    const batchParsed = createSlotsBatchSchema.safeParse(body);
    if (batchParsed.success) {
      const slots = await prisma.$transaction(
        batchParsed.data.slots.map((slot) => {
          const startAt = new Date(slot.startAt);
          const endAt = new Date(slot.endAt);
          if (endAt <= startAt) {
            throw new Error("INVALID_RANGE");
          }
          return prisma.availabilitySlot.create({
            data: {
              serviceId: slot.serviceId,
              startAt,
              endAt,
              status: "AVAILABLE",
            },
          });
        }),
      );
      return NextResponse.json({ slots }, { status: 201 });
    }

    const parsed = createSlotSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "資料驗證失敗");
    }

    const startAt = new Date(parsed.data.startAt);
    const endAt = new Date(parsed.data.endAt);
    if (endAt <= startAt) {
      return jsonError("結束時間必須晚於開始時間");
    }

    const service = await prisma.service.findUnique({
      where: { id: parsed.data.serviceId },
    });
    if (!service) {
      return jsonError("找不到服務", 404);
    }

    const slot = await prisma.availabilitySlot.create({
      data: {
        serviceId: parsed.data.serviceId,
        startAt,
        endAt,
        status: "AVAILABLE",
      },
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_RANGE") {
      return jsonError("結束時間必須晚於開始時間");
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("此服務在相同開始時間已有時段");
    }
    console.error("[POST /api/admin/slots]", error);
    return jsonError("建立時段失敗", 500);
  }
}
