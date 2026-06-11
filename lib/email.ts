import { Resend } from "resend";
import { formatSlotRange } from "@/lib/datetime";
import { siteConfig } from "@/lib/site-data";

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
}): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping email:", options.subject);
    return;
  }

  const result = await resend.emails.send({
    from: getFromEmail(),
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
  console.info("[email] sent:", options.subject, result.data?.id ?? "no-id");
}

function bookingDetailsHtml(data: BookingEmailData): string {
  const slot = formatSlotRange(data.startAt, data.endAt);
  return `
    <p><strong>預約編號：</strong>${data.id}</p>
    <p><strong>服務：</strong>${data.serviceTitle}</p>
    <p><strong>時段：</strong>${slot}</p>
    <p><strong>姓名：</strong>${data.name}</p>
    <p><strong>Email：</strong>${data.email}</p>
    ${data.company ? `<p><strong>公司：</strong>${data.company}</p>` : ""}
    ${data.phone ? `<p><strong>電話：</strong>${data.phone}</p>` : ""}
    ${data.message ? `<p><strong>需求說明：</strong>${data.message}</p>` : ""}
    <p><strong>狀態：</strong>${data.status}</p>
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
      html: `
        <h2>收到新的諮詢預約申請</h2>
        ${bookingDetailsHtml(data)}
        <p>請至管理後台確認或調整預約狀態。</p>
      `,
    }),
    sendEmail({
      to: data.email,
      subject: `[AIDC.work] 預約申請已收到`,
      html: `
        <h2>您好，${data.name}</h2>
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
    html: `
      <h2>您好，${data.name}</h2>
      <p>${message}</p>
      ${bookingDetailsHtml(data)}
    `,
  });
}
