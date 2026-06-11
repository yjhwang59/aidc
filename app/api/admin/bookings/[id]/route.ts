import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonUnauthorized } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth/session";
import { updateBookingSchema } from "@/lib/validations/booking";
import { sendBookingStatusEmail } from "@/lib/email";

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
    const parsed = updateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "資料驗證失敗");
    }

    const existing = await prisma.booking.findUnique({
      where: { id },
      include: { service: true, slot: true },
    });

    if (!existing) {
      return jsonError("找不到預約紀錄", 404);
    }

    const { status, adminNote } = parsed.data;
    const now = new Date();

    const booking = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: {
          ...(status ? { status } : {}),
          ...(adminNote !== undefined ? { adminNote } : {}),
          ...(status === "CONFIRMED" ? { confirmedAt: now } : {}),
          ...(status === "CANCELLED" ? { cancelledAt: now } : {}),
        },
        include: { service: true, slot: true },
      });

      if (status === "CANCELLED") {
        await tx.availabilitySlot.update({
          where: { id: existing.slotId },
          data: { status: "AVAILABLE" },
        });
      } else if (status === "CONFIRMED" || status === "COMPLETED" || status === "NO_SHOW") {
        await tx.availabilitySlot.update({
          where: { id: existing.slotId },
          data: { status: "BOOKED" },
        });
      }

      return updated;
    });

    if (status && status !== existing.status) {
      sendBookingStatusEmail({
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
        console.error(
          "[PATCH /api/admin/bookings/[id]] email notification failed",
          emailError,
        );
      });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("[PATCH /api/admin/bookings/[id]]", error);
    return jsonError("更新預約失敗", 500);
  }
}
