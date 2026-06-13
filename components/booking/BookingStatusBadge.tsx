const statusLabels: Record<string, { label: string; className: string }> = {
  PENDING: { label: "待確認", className: "bg-amber-100 text-amber-800" },
  CONFIRMED: { label: "已確認", className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "已取消", className: "bg-red-100 text-red-800" },
  COMPLETED: { label: "已完成", className: "bg-brand-100 text-brand-800" },
  NO_SHOW: { label: "未出席", className: "bg-gray-100 text-gray-800" },
  AVAILABLE: { label: "可預約", className: "bg-green-100 text-green-800" },
  BOOKED: { label: "已預約", className: "bg-blue-100 text-blue-800" },
  BLOCKED: { label: "已封鎖", className: "bg-gray-100 text-gray-600" },
  DRAFT: { label: "草稿", className: "bg-gray-100 text-gray-700" },
  OPEN: { label: "開放報名", className: "bg-green-100 text-green-800" },
  FULL: { label: "額滿", className: "bg-blue-100 text-blue-800" },
  CLOSED: { label: "停止報名", className: "bg-gray-100 text-gray-700" },
  WAITLISTED: { label: "候補", className: "bg-sky-100 text-sky-800" },
};

export function BookingStatusBadge({ status }: { status: string }) {
  const config = statusLabels[status] ?? {
    label: status,
    className: "bg-brand-100 text-brand-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
