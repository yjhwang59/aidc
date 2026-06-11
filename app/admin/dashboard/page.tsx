export const dynamic = "force-dynamic";

import Link from "next/link";
import { startOfDay, endOfDay, addDays } from "date-fns";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { formatSlotRange } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const now = new Date();
  const weekEnd = addDays(now, 7);

  const [pendingCount, upcomingBookings, recentBookings] = await Promise.all([
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        slot: { startAt: { gte: startOfDay(now), lte: endOfDay(weekEnd) } },
      },
      orderBy: { slot: { startAt: "asc" } },
      take: 10,
      include: {
        service: { select: { title: true } },
        slot: { select: { startAt: true, endAt: true } },
      },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        service: { select: { title: true } },
        slot: { select: { startAt: true, endAt: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">總覽</h1>
        <p className="mt-1 text-sm text-brand-600">預約服務管理儀表板</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-brand-100 bg-white p-6">
          <p className="text-sm text-brand-500">待確認預約</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{pendingCount}</p>
        </div>
        <div className="rounded-lg border border-brand-100 bg-white p-6">
          <p className="text-sm text-brand-500">本週諮詢</p>
          <p className="mt-2 text-3xl font-bold text-accent">{upcomingBookings.length}</p>
        </div>
        <Link
          href="/admin/slots"
          className="rounded-lg border border-brand-100 bg-white p-6 transition-colors hover:border-accent"
        >
          <p className="text-sm text-brand-500">時段管理</p>
          <p className="mt-2 text-sm font-medium text-accent">新增可預約時段 →</p>
        </Link>
      </div>

      <section className="rounded-lg border border-brand-100 bg-white">
        <div className="border-b border-brand-100 px-6 py-4">
          <h2 className="font-semibold text-brand-900">本週即將到來的諮詢</h2>
        </div>
        {upcomingBookings.length === 0 ? (
          <p className="px-6 py-8 text-sm text-brand-500">本週沒有即將到來的諮詢</p>
        ) : (
          <ul className="divide-y divide-brand-50">
            {upcomingBookings.map((booking) => (
              <li key={booking.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-brand-900">{booking.name}</p>
                  <p className="text-sm text-brand-600">
                    {booking.service.title} ·{" "}
                    {formatSlotRange(booking.slot.startAt, booking.slot.endAt)}
                  </p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-brand-100 bg-white">
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4">
          <h2 className="font-semibold text-brand-900">最近預約</h2>
          <Link href="/admin/bookings" className="text-sm text-accent hover:text-accent-dark">
            查看全部 →
          </Link>
        </div>
        <ul className="divide-y divide-brand-50">
          {recentBookings.map((booking) => (
            <li key={booking.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-brand-900">{booking.name}</p>
                <p className="text-sm text-brand-600">{booking.email}</p>
              </div>
              <BookingStatusBadge status={booking.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
