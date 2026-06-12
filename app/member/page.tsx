export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { MemberLogoutButton } from "@/components/member/MemberLogoutButton";
import { formatSlotRange } from "@/lib/datetime";
import { getCurrentMember } from "@/lib/auth/member-session";
import { prisma } from "@/lib/prisma";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(
  "會員中心",
  "查看會員資料與預約紀錄。",
);

export default async function MemberPage() {
  const member = await getCurrentMember();
  if (!member) {
    redirect("/member/login?redirect=/member");
  }

  const bookings = await prisma.booking.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      service: { select: { title: true } },
      slot: { select: { startAt: true, endAt: true } },
    },
  });

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">會員中心</h1>
            <p className="mt-2 text-sm text-brand-500">
              {member.name}，你可以在這裡查看預約狀態與會員資料。
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/booking" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark">
              新增預約
            </Link>
            <MemberLogoutButton />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_2fr]">
          <aside className="rounded-lg border border-brand-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-900">會員資料</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-brand-500">姓名</dt>
                <dd className="text-brand-900">{member.name}</dd>
              </div>
              <div>
                <dt className="text-brand-500">Email</dt>
                <dd className="text-brand-900">{member.email}</dd>
              </div>
              <div>
                <dt className="text-brand-500">公司</dt>
                <dd className="text-brand-900">{member.company || "未填寫"}</dd>
              </div>
              <div>
                <dt className="text-brand-500">電話</dt>
                <dd className="text-brand-900">{member.phone || "未填寫"}</dd>
              </div>
            </dl>
          </aside>

          <div className="rounded-lg border border-brand-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-900">我的預約</h2>
              <Link href="/member/bookings" className="text-sm text-accent hover:text-accent-dark">
                查看全部
              </Link>
            </div>

            {bookings.length === 0 ? (
              <p className="mt-4 text-sm text-brand-500">目前沒有預約紀錄。</p>
            ) : (
              <div className="mt-4 divide-y divide-brand-100">
                {bookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/member/bookings/${booking.id}`}
                    className="block py-4 hover:bg-brand-50"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-brand-900">{booking.service.title}</p>
                        <p className="mt-1 text-sm text-brand-500">
                          {formatSlotRange(booking.slot.startAt, booking.slot.endAt)}
                        </p>
                      </div>
                      <BookingStatusBadge status={booking.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
