export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { CancelBookingButton } from "@/components/member/CancelBookingButton";
import { formatSlotRange } from "@/lib/datetime";
import { getCurrentMember } from "@/lib/auth/member-session";
import { prisma } from "@/lib/prisma";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ id: string }> };

export const metadata = createPageMetadata("預約詳情", "查看會員預約詳情。");

export default async function MemberBookingDetailPage({ params }: PageProps) {
  const member = await getCurrentMember();
  const { id } = await params;
  if (!member) redirect(`/member/login?redirect=/member/bookings/${id}`);

  const booking = await prisma.booking.findFirst({
    where: { id, memberId: member.id },
    include: {
      service: { select: { title: true } },
      slot: { select: { startAt: true, endAt: true } },
    },
  });

  if (!booking) notFound();

  const cancellable = booking.status === "PENDING" || booking.status === "CONFIRMED";

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="mx-auto max-w-2xl rounded-lg border border-brand-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-900">預約詳情</h1>
              <p className="mt-2 font-mono text-xs text-brand-400">{booking.id}</p>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>

          <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-brand-500">服務</dt>
              <dd className="mt-1 text-brand-900">{booking.service.title}</dd>
            </div>
            <div>
              <dt className="text-brand-500">時段</dt>
              <dd className="mt-1 text-brand-900">{formatSlotRange(booking.slot.startAt, booking.slot.endAt)}</dd>
            </div>
            <div>
              <dt className="text-brand-500">姓名</dt>
              <dd className="mt-1 text-brand-900">{booking.name}</dd>
            </div>
            <div>
              <dt className="text-brand-500">Email</dt>
              <dd className="mt-1 text-brand-900">{booking.email}</dd>
            </div>
            <div>
              <dt className="text-brand-500">公司</dt>
              <dd className="mt-1 text-brand-900">{booking.company || "未填寫"}</dd>
            </div>
            <div>
              <dt className="text-brand-500">電話</dt>
              <dd className="mt-1 text-brand-900">{booking.phone || "未填寫"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-brand-500">需求說明</dt>
              <dd className="mt-1 whitespace-pre-wrap text-brand-900">{booking.message || "未填寫"}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/member/bookings" className="rounded-md border border-brand-200 px-4 py-2 text-sm text-brand-700 hover:bg-brand-50">
              返回我的預約
            </Link>
            {cancellable && <CancelBookingButton bookingId={booking.id} />}
          </div>
        </div>
      </Container>
    </section>
  );
}
