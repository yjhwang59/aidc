"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CancelBookingButtonProps = {
  bookingId: string;
};

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancelBooking() {
    if (!window.confirm("確定要取消這筆預約嗎？")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/member/bookings/${bookingId}`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "取消失敗");
        return;
      }
      router.refresh();
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={cancelBooking}
        disabled={loading}
        className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        {loading ? "取消中..." : "取消預約"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
