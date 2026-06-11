import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";
import { createBookingSchema } from "@/lib/validations/booking";
import { sendBookingCreatedEmails } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`booking:${ip}`);
    if (!rate.allowed) {
      return jsonError(`請求過於頻繁，請 ${rate.retryAfter} 秒後再試`, 429);
    }

    const body = await request.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "資料驗證失敗");
    }

    const { slotId, serviceId, name, email, company, phone, message } =
      parsed.data;

    const booking = await prisma.$transaction(async (tx) => {
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: slotId },
        include: { service: true },
      });

      if (!slot) {
        throw new Error("SLOT_NOT_FOUND");
      }

      if (slot.serviceId !== serviceId) {
        throw new Error("SERVICE_MISMATCH");
      }

      if (slot.status !== "AVAILABLE") {
        throw new Error("SLOT_UNAVAILABLE");
      }

      if (slot.startAt <= new Date()) {
        throw new Error("SLOT_PAST");
      }

      const created = await tx.booking.create({
        data: {
          serviceId,
          slotId,
          name,
          email,
          company,
          phone,
          message,
          status: "PENDING",
        },
        include: {
          service: true,
          slot: true,
        },
      });

      await tx.availabilitySlot.update({
        where: { id: slotId },
        data: { status: "BOOKED" },
      });

      return created;
    });

    sendBookingCreatedEmails({
      id: booking.id,
      name: booking.name,
      email: booking.email,
      company: booking.company,
      phone: booking.phone,
      message: booking.message,
      serviceTitle: booking.service.title,
      startAt: booking.slot.startAt,
      endAt: booking.slot.endAt,
      status: booking.status,
    }).catch((emailError) => {
      console.error("[POST /api/bookings] email notification failed", emailError);
    });

    return NextResponse.json(
      {
        booking: {
          id: booking.id,
          status: booking.status,
          service: {
            title: booking.service.title,
          },
          slot: {
            startAt: booking.slot.startAt,
            endAt: booking.slot.endAt,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error) {
      const messages: Record<string, string> = {
        SLOT_NOT_FOUND: "找不到指定的時段",
        SERVICE_MISMATCH: "服務與時段不符",
        SLOT_UNAVAILABLE: "此時段已被預約或不可預約",
        SLOT_PAST: "無法預約已過去的時段",
      };
      if (messages[error.message]) {
        return jsonError(messages[error.message]);
      }
    }
    console.error("[POST /api/bookings]", error);
    return jsonError("建立預約失敗", 500);
  }
}
