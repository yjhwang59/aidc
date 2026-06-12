export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { formatSlotRange } from "@/lib/datetime";
import { getCurrentMember } from "@/lib/auth/member-session";
import { prisma } from "@/lib/prisma";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ id: string }> };

export const metadata = createPageMetadata(
  "預約確認",
  "您的諮詢預約申請已收到。",
);

export default async function BookingConfirmationPage({ params }: PageProps) {
  const { id } = await params;

  let booking;
  try {
    booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: { select: { title: true } },
        slot: { select: { startAt: true, endAt: true } },
      },
    });
  } catch {
    notFound();
  }

  if (!booking) {
    notFound();
  }

  if (booking.memberId) {
    const member = await getCurrentMember();
    if (!member || member.id !== booking.memberId) {
      notFound();
    }
  }

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-xl rounded-lg border border-brand-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-brand-900">預約申請已送出</h1>
          <p className="mt-3 text-brand-600">
            我們已收到您的諮詢預約，將在兩個工作天內以 Email 確認。
          </p>

          <div className="mt-8 space-y-3 rounded-lg bg-brand-50 p-6 text-left text-sm text-brand-700">
            <div className="flex justify-between">
              <span className="text-brand-500">預約編號</span>
              <span className="font-mono text-xs">{booking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-500">狀態</span>
              <BookingStatusBadge status={booking.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-brand-500">服務</span>
              <span>{booking.service.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-500">時段</span>
              <span>
                {formatSlotRange(booking.slot.startAt, booking.slot.endAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-500">姓名</span>
              <span>{booking.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-500">Email</span>
              <span>{booking.email}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex rounded-md border border-brand-200 px-4 py-2 text-sm text-brand-700 hover:bg-brand-50"
            >
              返回首頁
            </Link>
            <Link
              href="/booking"
              className="inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
            >
              再次預約
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
