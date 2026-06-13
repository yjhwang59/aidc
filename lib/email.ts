import { Resend } from "resend";
import { formatSlotRange } from "@/lib/datetime";
import { siteConfig } from "@/lib/site-data";
import { escapeHtml } from "@/lib/html";
import { prisma } from "@/lib/prisma";

type BookingEmailData = {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  message?: string | null;
  serviceTitle: string;
  startAt: Date;
  endAt: Date;
  status: string;
};

type CourseSessionEmailData = {
  weekNumber: number;
  startAt: Date;
  endAt: Date;
  topic: string;
};

type CourseEnrollmentEmailData = {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  message?: string | null;
  programTitle: string;
  cohortTitle: string;
  status: string;
  sessions: CourseSessionEmailData[];
};

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromEmail(): string {
  return process.env.NOTIFICATION_FROM_EMAIL ?? "onboarding@resend.dev";
}

function getToEmail(): string {
  return process.env.NOTIFICATION_TO_EMAIL ?? siteConfig.email;
}

async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  relatedType?: string;
  relatedId?: string;
}): Promise<void> {
  const toEmail = Array.isArray(options.to) ? options.to.join(", ") : options.to;

  // Persist a log row up front so a delivery failure is always recoverable.
  // DB errors here must not block (or mask) the actual send, so we degrade
  // gracefully to a null record id.
  const record = await prisma.notification
    .create({
      data: {
        toEmail,
        subject: options.subject,
        status: "PENDING",
        relatedType: options.relatedType,
        relatedId: options.relatedId,
      },
    })
    .catch((dbError) => {
      console.error("[email] failed to persist notification log", dbError);
      return null;
    });

  const updateRecord = (data: {
    status: "SENT" | "FAILED" | "SKIPPED";
    providerMessageId?: string | null;
    error?: string | null;
  }) => {
    if (!record) return Promise.resolve();
    return prisma.notification
      .update({ where: { id: record.id }, data })
      .catch((dbError) => {
        console.error("[email] failed to update notification log", dbError);
      });
  };

  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping email:", options.subject);
    await updateRecord({ status: "SKIPPED", error: "RESEND_API_KEY not set" });
    return;
  }

  let result;
  try {
    result = await resend.emails.send({
      from: getFromEmail(),
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (sendError) {
    const message = sendError instanceof Error ? sendError.message : String(sendError);
    await updateRecord({ status: "FAILED", error: message });
    throw sendError;
  }

  if (result.error) {
    await updateRecord({ status: "FAILED", error: result.error.message });
    throw new Error(`Resend error: ${result.error.message}`);
  }

  await updateRecord({ status: "SENT", providerMessageId: result.data?.id ?? null });
  console.info("[email] sent:", options.subject, result.data?.id ?? "no-id");
}

function bookingDetailsHtml(data: BookingEmailData): string {
  const slot = formatSlotRange(data.startAt, data.endAt);
  return `
    <p><strong>預約編號：</strong>${escapeHtml(data.id)}</p>
    <p><strong>服務：</strong>${escapeHtml(data.serviceTitle)}</p>
    <p><strong>時段：</strong>${escapeHtml(slot)}</p>
    <p><strong>姓名：</strong>${escapeHtml(data.name)}</p>
    <p><strong>Email：</strong>${escapeHtml(data.email)}</p>
    ${data.company ? `<p><strong>公司：</strong>${escapeHtml(data.company)}</p>` : ""}
    ${data.phone ? `<p><strong>電話：</strong>${escapeHtml(data.phone)}</p>` : ""}
    ${data.message ? `<p><strong>需求說明：</strong>${escapeHtml(data.message)}</p>` : ""}
    <p><strong>狀態：</strong>${escapeHtml(data.status)}</p>
  `;
}

export async function sendBookingCreatedEmails(
  data: BookingEmailData,
): Promise<void> {
  const slot = formatSlotRange(data.startAt, data.endAt);

  await Promise.all([
    sendEmail({
      to: getToEmail(),
      subject: `[AIDC.work] 新預約申請 — ${data.name}`,
      relatedType: "booking",
      relatedId: data.id,
      html: `
        <h2>收到新的諮詢預約申請</h2>
        ${bookingDetailsHtml(data)}
        <p>請至管理後台確認或調整預約狀態。</p>
      `,
    }),
    sendEmail({
      to: data.email,
      subject: `[AIDC.work] 預約申請已收到`,
      relatedType: "booking",
      relatedId: data.id,
      html: `
        <h2>您好，${escapeHtml(data.name)}</h2>
        <p>我們已收到您的諮詢預約申請，將在兩個工作天內確認。</p>
        ${bookingDetailsHtml(data)}
        <p>若有任何問題，歡迎回信至 ${siteConfig.email}。</p>
      `,
    }),
  ]);

  void slot;
}

export async function sendBookingStatusEmail(
  data: BookingEmailData,
): Promise<void> {
  const statusMessages: Record<string, string> = {
    CONFIRMED: "您的諮詢預約已確認，請於約定時間上線或到場。",
    CANCELLED: "您的諮詢預約已取消。若需重新預約，歡迎再次造訪 AIDC.work。",
    COMPLETED: "感謝您參與本次諮詢，期待後續合作。",
    NO_SHOW: "您預約的諮詢時段已過且未出席，如需重新安排請再次預約。",
  };

  const message = statusMessages[data.status] ?? "您的預約狀態已更新。";

  await sendEmail({
    to: data.email,
    subject: `[AIDC.work] 預約狀態更新 — ${data.status}`,
    relatedType: "booking",
    relatedId: data.id,
    html: `
      <h2>您好，${escapeHtml(data.name)}</h2>
      <p>${message}</p>
      ${bookingDetailsHtml(data)}
    `,
  });
}

function courseSessionsHtml(sessions: CourseSessionEmailData[]): string {
  return `
    <ol>
      ${sessions
        .map(
          (session) =>
            `<li>第 ${session.weekNumber} 週：${escapeHtml(session.topic)}（${escapeHtml(
              formatSlotRange(session.startAt, session.endAt),
            )}）</li>`,
        )
        .join("")}
    </ol>
  `;
}

function courseEnrollmentDetailsHtml(data: CourseEnrollmentEmailData): string {
  return `
    <p><strong>報名編號：</strong>${escapeHtml(data.id)}</p>
    <p><strong>課程：</strong>${escapeHtml(data.programTitle)}</p>
    <p><strong>班期：</strong>${escapeHtml(data.cohortTitle)}</p>
    <p><strong>姓名：</strong>${escapeHtml(data.name)}</p>
    <p><strong>Email：</strong>${escapeHtml(data.email)}</p>
    ${data.company ? `<p><strong>公司：</strong>${escapeHtml(data.company)}</p>` : ""}
    ${data.phone ? `<p><strong>電話：</strong>${escapeHtml(data.phone)}</p>` : ""}
    ${data.message ? `<p><strong>需求說明：</strong>${escapeHtml(data.message)}</p>` : ""}
    <p><strong>狀態：</strong>${escapeHtml(data.status)}</p>
    <h3>8 週課表</h3>
    ${courseSessionsHtml(data.sessions)}
  `;
}

export async function sendCourseEnrollmentCreatedEmails(
  data: CourseEnrollmentEmailData,
): Promise<void> {
  await Promise.all([
    sendEmail({
      to: getToEmail(),
      subject: `[AIDC.work] 新課程報名 — ${data.name}`,
      relatedType: "course-enrollment",
      relatedId: data.id,
      html: `
        <h2>收到新的課程報名申請</h2>
        ${courseEnrollmentDetailsHtml(data)}
        <p>請至管理後台確認、取消或列為候補。</p>
      `,
    }),
    sendEmail({
      to: data.email,
      subject: "[AIDC.work] 課程報名申請已收到",
      relatedType: "course-enrollment",
      relatedId: data.id,
      html: `
        <h2>您好，${escapeHtml(data.name)}</h2>
        <p>我們已收到您的課程報名申請，將在兩個工作天內以 Email 確認。</p>
        ${courseEnrollmentDetailsHtml(data)}
        <p>若有任何問題，歡迎回信至 ${siteConfig.email}。</p>
      `,
    }),
  ]);
}

export async function sendCourseEnrollmentStatusEmail(
  data: CourseEnrollmentEmailData,
): Promise<void> {
  const statusMessages: Record<string, string> = {
    CONFIRMED: "您的課程報名已確認，後續上課資訊將另行通知。",
    CANCELLED: "您的課程報名已取消。若需重新報名，歡迎再次造訪 AIDC.work。",
    WAITLISTED: "您的課程報名已列為候補；若有名額釋出，將再以 Email 通知。",
    COMPLETED: "感謝您參與本期課程，期待後續交流。",
  };

  await sendEmail({
    to: data.email,
    subject: `[AIDC.work] 課程報名狀態更新 — ${data.status}`,
    relatedType: "course-enrollment",
    relatedId: data.id,
    html: `
      <h2>您好，${escapeHtml(data.name)}</h2>
      <p>${statusMessages[data.status] ?? "您的課程報名狀態已更新。"}</p>
      ${courseEnrollmentDetailsHtml(data)}
    `,
  });
}
