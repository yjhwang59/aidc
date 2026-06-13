"use client";

import { useCallback, useEffect, useState } from "react";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { formatSlotRange } from "@/lib/datetime";

type Enrollment = {
  id: string;
  status: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string | null;
  adminNote: string | null;
  createdAt: string;
  cohort: {
    title: string;
    courseProgram: { title: string; slug: string };
    sessions: { id: string; weekNumber: number; startAt: string; endAt: string; topic: string }[];
  };
};

const statusFilters = [
  { value: "", label: "全部" },
  { value: "PENDING", label: "待確認" },
  { value: "CONFIRMED", label: "已確認" },
  { value: "WAITLISTED", label: "候補" },
  { value: "CANCELLED", label: "已取消" },
  { value: "COMPLETED", label: "已完成" },
];

const statusActions = [
  { value: "CONFIRMED", label: "確認並寄信" },
  { value: "WAITLISTED", label: "列為候補" },
  { value: "CANCELLED", label: "取消並寄信" },
  { value: "COMPLETED", label: "標記完成" },
];

export function CourseEnrollmentsManager() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/course-enrollments${params}`);
      const data = await res.json();
      setEnrollments(data.enrollments ?? []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  async function updateEnrollment(id: string, status?: string) {
    setMessage(null);
    setError(null);
    const res = await fetch(`/api/admin/course-enrollments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote: notes[id] || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "更新報名失敗");
      return;
    }
    setMessage(status ? "報名狀態已更新並寄出通知。" : "管理備註已儲存。");
    await loadEnrollments();
  }

  return (
    <div className="space-y-4">
      {(message || error) && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
          {error ?? message}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button key={filter.value} type="button" onClick={() => setStatusFilter(filter.value)} className={`rounded-full px-3 py-1 text-sm ${statusFilter === filter.value ? "bg-accent text-white" : "border border-brand-200 bg-white text-brand-600"}`}>
            {filter.label}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-sm text-brand-500">載入中...</p>
      ) : enrollments.length === 0 ? (
        <p className="text-sm text-brand-500">沒有符合條件的課程報名</p>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="rounded-lg border border-brand-100 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-brand-900">{enrollment.name}</h3>
                    <BookingStatusBadge status={enrollment.status} />
                  </div>
                  <p className="mt-1 text-sm text-brand-600">{enrollment.email}</p>
                  {enrollment.company && <p className="text-sm text-brand-500">{enrollment.company}</p>}
                  {enrollment.phone && <p className="text-sm text-brand-500">{enrollment.phone}</p>}
                  <p className="mt-2 text-xs text-brand-400">申請時間：{new Date(enrollment.createdAt).toLocaleString("zh-TW")}</p>
                </div>
                <div className="text-sm text-brand-600">
                  <p className="font-medium text-brand-900">{enrollment.cohort.courseProgram.title}</p>
                  <p>{enrollment.cohort.title}</p>
                  {enrollment.cohort.sessions[0] && (
                    <p className="mt-1 text-xs text-brand-500">
                      {formatSlotRange(new Date(enrollment.cohort.sessions[0].startAt), new Date(enrollment.cohort.sessions[0].endAt))}
                    </p>
                  )}
                </div>
              </div>
              {enrollment.message && <p className="mt-3 rounded bg-brand-50 p-3 text-sm text-brand-700">{enrollment.message}</p>}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input value={notes[enrollment.id] ?? enrollment.adminNote ?? ""} onChange={(event) => setNotes((prev) => ({ ...prev, [enrollment.id]: event.target.value }))} className="w-full rounded border border-brand-200 px-3 py-1.5 text-sm" placeholder="管理備註" />
                <button type="button" onClick={() => updateEnrollment(enrollment.id)} className="rounded border border-brand-300 px-3 py-1.5 text-xs text-brand-600 hover:bg-brand-50">儲存備註</button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {statusActions.map((status) => (
                  <button key={status.value} type="button" onClick={() => updateEnrollment(enrollment.id, status.value)} className="rounded bg-brand-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-900">
                    {status.label}
                  </button>
                ))}
                <p className="w-full text-xs text-brand-400">狀態按鈕會自動寄出 Email；管理備註只保留在後台。</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
