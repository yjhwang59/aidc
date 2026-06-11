"use client";

import { useCallback, useEffect, useState } from "react";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { formatSlotRange } from "@/lib/datetime";

type Booking = {
  id: string;
  status: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string | null;
  adminNote: string | null;
  service: { title: string; slug: string };
  slot: { startAt: string; endAt: string; status: string };
  createdAt: string;
};

const statusFilters = [
  { value: "", label: "全部" },
  { value: "PENDING", label: "待確認" },
  { value: "CONFIRMED", label: "已確認" },
  { value: "CANCELLED", label: "已取消" },
  { value: "COMPLETED", label: "已完成" },
  { value: "NO_SHOW", label: "未出席" },
];

export function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/bookings${params}`);
      const data = await res.json();
      setBookings(data.bookings ?? []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function updateBooking(id: string, status: string) {
    setUpdatingId(id);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNote: notes[id] || undefined,
        }),
      });
      if (res.ok) {
        const labels: Record<string, string> = {
          CONFIRMED: "已確認預約，系統會寄出確認通知信。",
          CANCELLED: "已取消預約，系統會寄出取消通知信，並釋放該時段。",
          COMPLETED: "已標記完成，系統會寄出狀態通知信。",
          NO_SHOW: "已標記未出席，系統會寄出狀態通知信。",
        };
        setMessage(labels[status] ?? "預約狀態已更新。");
        await loadBookings();
      } else {
        const data = await res.json();
        setError(data.error ?? "更新預約失敗");
      }
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setUpdatingId(null);
    }
  }

  async function saveNote(id: string) {
    setUpdatingId(id);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: notes[id] ?? "" }),
      });
      if (res.ok) {
        setMessage("管理備註已儲存。");
        await loadBookings();
      } else {
        const data = await res.json();
        setError(data.error ?? "儲存備註失敗");
      }
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-brand-500">載入中...</p>;
  }

  return (
    <div className="space-y-4">
      {(message || error) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-3 py-1 text-sm ${
              statusFilter === f.value
                ? "bg-accent text-white"
                : "bg-white text-brand-600 border border-brand-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-brand-500">沒有符合條件的預約</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-lg border border-brand-100 bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-brand-900">{booking.name}</h3>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                  <p className="mt-1 text-sm text-brand-600">{booking.email}</p>
                  {booking.company && (
                    <p className="text-sm text-brand-500">{booking.company}</p>
                  )}
                  {booking.phone && (
                    <p className="text-sm text-brand-500">{booking.phone}</p>
                  )}
                  <p className="mt-2 text-xs text-brand-400">
                    申請時間：{new Date(booking.createdAt).toLocaleString("zh-TW")}
                  </p>
                </div>
                <p className="text-sm text-brand-600">
                  {booking.service.title}
                  <br />
                  {formatSlotRange(
                    new Date(booking.slot.startAt),
                    new Date(booking.slot.endAt),
                  )}
                </p>
              </div>

              {booking.message && (
                <p className="mt-3 rounded bg-brand-50 p-3 text-sm text-brand-700">
                  {booking.message}
                </p>
              )}

              <div className="mt-4">
                <label className="text-xs text-brand-500">管理備註</label>
                <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={notes[booking.id] ?? booking.adminNote ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [booking.id]: e.target.value }))
                    }
                    className="w-full rounded border border-brand-200 px-3 py-1.5 text-sm"
                    placeholder="內部備註，不會寄給客戶"
                  />
                  <button
                    type="button"
                    disabled={updatingId === booking.id}
                    onClick={() => saveNote(booking.id)}
                    className="rounded border border-brand-300 px-3 py-1.5 text-xs text-brand-600 hover:bg-brand-50 disabled:opacity-60"
                  >
                    儲存備註
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {booking.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      disabled={updatingId === booking.id}
                      onClick={() => updateBooking(booking.id, "CONFIRMED")}
                      className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      確認成功並寄信
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === booking.id}
                      onClick={() => updateBooking(booking.id, "CANCELLED")}
                      className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      取消預約並寄信
                    </button>
                  </>
                )}
                {booking.status === "CONFIRMED" && (
                  <>
                    <button
                      type="button"
                      disabled={updatingId === booking.id}
                      onClick={() => updateBooking(booking.id, "COMPLETED")}
                      className="rounded bg-brand-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-800 disabled:opacity-60"
                    >
                      標記完成
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === booking.id}
                      onClick={() => updateBooking(booking.id, "NO_SHOW")}
                      className="rounded border border-brand-300 px-3 py-1.5 text-xs text-brand-600 hover:bg-brand-50 disabled:opacity-60"
                    >
                      未出席
                    </button>
                  </>
                )}
                <p className="w-full text-xs text-brand-400">
                  狀態按鈕會自動寄出 Email 通知客戶；管理備註只保留在後台。
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
