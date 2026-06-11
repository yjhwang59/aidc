"use client";

import { useCallback, useEffect, useState } from "react";
import { addDays, eachDayOfInterval, format, getDay, setHours, setMinutes } from "date-fns";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { formatSlotRange } from "@/lib/datetime";

type Service = {
  id: string;
  slug: string;
  title: string;
  durationMin: number;
};

type Slot = {
  id: string;
  serviceId: string;
  startAt: string;
  endAt: string;
  status: string;
  service: { title: string; slug: string };
  booking: { id: string; name: string; email: string; status: string } | null;
};

export function SlotsManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [batchCreating, setBatchCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newDate, setNewDate] = useState(
    format(addDays(new Date(), 1), "yyyy-MM-dd"),
  );
  const [newStartTime, setNewStartTime] = useState("10:00");
  const [newEndTime, setNewEndTime] = useState("11:00");
  const [batchStartDate, setBatchStartDate] = useState(
    format(addDays(new Date(), 1), "yyyy-MM-dd"),
  );
  const [batchEndDate, setBatchEndDate] = useState(
    format(addDays(new Date(), 14), "yyyy-MM-dd"),
  );
  const [batchStartTime, setBatchStartTime] = useState("10:00");
  const [batchEndTime, setBatchEndTime] = useState("11:00");
  const [batchWeekdays, setBatchWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);

  const loadServices = useCallback(async () => {
    const res = await fetch("/api/services");
    const data = await res.json();
    const list = data.services ?? [];
    setServices(list);
    if (list.length > 0 && !selectedServiceId) {
      setSelectedServiceId(list[0].id);
    }
  }, [selectedServiceId]);

  const loadSlots = useCallback(async () => {
    if (!selectedServiceId) return;
    setLoading(true);
    try {
      const from = new Date().toISOString();
      const to = addDays(new Date(), 60).toISOString();
      const res = await fetch(
        `/api/admin/slots?serviceId=${selectedServiceId}&from=${from}&to=${to}`,
      );
      const data = await res.json();
      setSlots(data.slots ?? []);
    } finally {
      setLoading(false);
    }
  }, [selectedServiceId]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  async function createSlot() {
    if (!selectedServiceId) return;
    setCreating(true);
    setMessage(null);
    setError(null);
    try {
      const [year, month, day] = newDate.split("-").map(Number);
      const [startH, startM] = newStartTime.split(":").map(Number);
      const [endH, endM] = newEndTime.split(":").map(Number);

      const startAt = setMinutes(setHours(new Date(year, month - 1, day), startH), startM);
      const endAt = setMinutes(setHours(new Date(year, month - 1, day), endH), endM);

      const res = await fetch("/api/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
        }),
      });

      if (res.ok) {
        setMessage("已新增 1 個可預約時段。");
        await loadSlots();
      } else {
        const data = await res.json();
        setError(data.error ?? "新增時段失敗");
      }
    } finally {
      setCreating(false);
    }
  }

  async function createBatchSlots() {
    if (!selectedServiceId) return;
    setBatchCreating(true);
    setMessage(null);
    setError(null);
    try {
      const startDate = new Date(`${batchStartDate}T00:00:00`);
      const endDate = new Date(`${batchEndDate}T00:00:00`);
      if (endDate < startDate) {
        setError("批次結束日期必須晚於或等於開始日期");
        return;
      }
      if (batchWeekdays.length === 0) {
        setError("請至少選擇一個星期");
        return;
      }

      const [startH, startM] = batchStartTime.split(":").map(Number);
      const [endH, endM] = batchEndTime.split(":").map(Number);
      const slotsToCreate = eachDayOfInterval({ start: startDate, end: endDate })
        .filter((date) => batchWeekdays.includes(getDay(date)))
        .map((date) => {
          const startAt = setMinutes(setHours(date, startH), startM);
          const endAt = setMinutes(setHours(date, endH), endM);
          return {
            serviceId: selectedServiceId,
            startAt: startAt.toISOString(),
            endAt: endAt.toISOString(),
          };
        });

      if (slotsToCreate.length === 0) {
        setError("日期區間內沒有符合條件的星期");
        return;
      }

      const res = await fetch("/api/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: slotsToCreate }),
      });

      if (res.ok) {
        setMessage(`已批次新增 ${slotsToCreate.length} 個可預約時段。`);
        await loadSlots();
      } else {
        const data = await res.json();
        setError(data.error ?? "批次新增失敗，請確認是否已有重複時段");
      }
    } finally {
      setBatchCreating(false);
    }
  }

  async function updateSlotStatus(id: string, status: string) {
    setMessage(null);
    setError(null);
    const res = await fetch(`/api/admin/slots/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMessage(status === "AVAILABLE" ? "此時段已恢復可預約。" : "此時段已封鎖。");
      await loadSlots();
    } else {
      const data = await res.json();
      setError(data.error ?? "更新時段失敗");
    }
  }

  async function deleteSlot(id: string) {
    if (!confirm("確定要刪除此時段？")) return;
    const res = await fetch(`/api/admin/slots/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("時段已刪除。");
      await loadSlots();
    }
    else {
      const data = await res.json();
      setError(data.error ?? "刪除失敗");
    }
  }

  return (
    <div className="space-y-6">
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

      <div className="rounded-lg border border-brand-100 bg-white p-6">
        <h2 className="font-semibold text-brand-900">新增時段</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="text-xs text-brand-500">服務</label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="mt-1 w-full rounded border border-brand-200 px-3 py-2 text-sm"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-brand-500">日期</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="mt-1 w-full rounded border border-brand-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-brand-500">開始時間</label>
            <input
              type="time"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              className="mt-1 w-full rounded border border-brand-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-brand-500">結束時間</label>
            <input
              type="time"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              className="mt-1 w-full rounded border border-brand-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={createSlot}
              disabled={creating}
              className="w-full rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60"
            >
              {creating ? "建立中..." : "新增時段"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-brand-100 bg-white p-6">
        <h2 className="font-semibold text-brand-900">批次建立可預約時間</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-5">
          <div>
            <label className="text-xs text-brand-500">開始日期</label>
            <input
              type="date"
              value={batchStartDate}
              onChange={(e) => setBatchStartDate(e.target.value)}
              className="mt-1 w-full rounded border border-brand-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-brand-500">結束日期</label>
            <input
              type="date"
              value={batchEndDate}
              onChange={(e) => setBatchEndDate(e.target.value)}
              className="mt-1 w-full rounded border border-brand-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-brand-500">開始時間</label>
            <input
              type="time"
              value={batchStartTime}
              onChange={(e) => setBatchStartTime(e.target.value)}
              className="mt-1 w-full rounded border border-brand-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-brand-500">結束時間</label>
            <input
              type="time"
              value={batchEndTime}
              onChange={(e) => setBatchEndTime(e.target.value)}
              className="mt-1 w-full rounded border border-brand-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={createBatchSlots}
              disabled={batchCreating}
              className="w-full rounded bg-brand-800 px-4 py-2 text-sm font-medium text-white hover:bg-brand-900 disabled:opacity-60"
            >
              {batchCreating ? "建立中..." : "批次新增"}
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { value: 1, label: "週一" },
            { value: 2, label: "週二" },
            { value: 3, label: "週三" },
            { value: 4, label: "週四" },
            { value: 5, label: "週五" },
            { value: 6, label: "週六" },
            { value: 0, label: "週日" },
          ].map((day) => {
            const active = batchWeekdays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() =>
                  setBatchWeekdays((current) =>
                    active
                      ? current.filter((value) => value !== day.value)
                      : [...current, day.value],
                  )
                }
                className={`rounded-full border px-3 py-1 text-xs ${
                  active
                    ? "border-accent bg-accent text-white"
                    : "border-brand-200 bg-white text-brand-600 hover:border-accent"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-brand-100 bg-white">
        <div className="border-b border-brand-100 px-6 py-4">
          <h2 className="font-semibold text-brand-900">時段列表</h2>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-sm text-brand-500">載入中...</p>
        ) : slots.length === 0 ? (
          <p className="px-6 py-8 text-sm text-brand-500">尚無時段，請新增可預約時段</p>
        ) : (
          <ul className="divide-y divide-brand-50">
            {slots.map((slot) => (
              <li
                key={slot.id}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
              >
                <div>
                  <p className="font-medium text-brand-900">{slot.service.title}</p>
                  <p className="text-sm text-brand-600">
                    {formatSlotRange(new Date(slot.startAt), new Date(slot.endAt))}
                  </p>
                  {slot.booking && (
                    <p className="mt-1 text-xs text-brand-500">
                      預約：{slot.booking.name} ({slot.booking.email})
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <BookingStatusBadge status={slot.status} />
                  {slot.status === "AVAILABLE" && (
                    <button
                      type="button"
                      onClick={() => updateSlotStatus(slot.id, "BLOCKED")}
                      className="text-xs text-brand-500 hover:text-brand-700"
                    >
                      封鎖
                    </button>
                  )}
                  {slot.status === "BLOCKED" && (
                    <button
                      type="button"
                      onClick={() => updateSlotStatus(slot.id, "AVAILABLE")}
                      className="text-xs text-accent hover:text-accent-dark"
                    >
                      恢復
                    </button>
                  )}
                  {!slot.booking && (
                    <button
                      type="button"
                      onClick={() => deleteSlot(slot.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      刪除
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
