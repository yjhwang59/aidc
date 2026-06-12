export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { formatSlotRange } from "@/lib/datetime";
import { getCurrentMember } from "@/lib/auth/member-session";
import { prisma } from "@/lib/prisma";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata("我的預約", "查看所有會員預約紀錄。");

export default async function MemberBookingsPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/member/login?redirect=/member/bookings");

  const bookings = await prisma.booking.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
    include: {
      service: { select: { title: true } },
      slot: { select: { startAt: true, endAt: true } },
    },
  });

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">我的預約</h1>
            <p className="mt-2 text-sm text-brand-500">查看預約狀態與詳細資料。</p>
          </div>
          <Link href="/booking" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark">
            新增預約
          </Link>
        </div>

        <div className="rounded-lg border border-brand-100 bg-white shadow-sm">
          {bookings.length === 0 ? (
            <p className="p-6 text-sm text-brand-500">目前沒有預約紀錄。</p>
          ) : (
            <div className="divide-y divide-brand-100">
              {bookings.map((booking) => (
                <Link key={booking.id} href={`/member/bookings/${booking.id}`} className="block p-6 hover:bg-brand-50">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-brand-900">{booking.service.title}</p>
                      <p className="mt-1 text-sm text-brand-500">{formatSlotRange(booking.slot.startAt, booking.slot.endAt)}</p>
                    </div>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
