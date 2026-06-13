"use client";

import { useCallback, useEffect, useState } from "react";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { formatSlotRange } from "@/lib/datetime";

type Program = { id: string; title: string; capacity: number };
type Session = {
  id: string;
  weekNumber: number;
  startAt: string;
  endAt: string;
  topic: string;
  description: string | null;
};
type Cohort = {
  id: string;
  title: string;
  startsAt: string;
  registrationDeadline: string | null;
  capacity: number;
  status: string;
  courseProgram: { title: string; slug: string };
  sessions: Session[];
  _count: { enrollments: number };
};

const cohortStatuses = [
  { value: "DRAFT", label: "草稿" },
  { value: "OPEN", label: "開放" },
  { value: "CLOSED", label: "停止" },
  { value: "COMPLETED", label: "完成" },
  { value: "CANCELLED", label: "取消" },
];

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function CourseCohortsManager() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [programRes, cohortRes] = await Promise.all([
        fetch("/api/admin/course-programs"),
        fetch("/api/admin/course-cohorts"),
      ]);
      const programData = await programRes.json();
      const cohortData = await cohortRes.json();
      setPrograms(programData.programs ?? []);
      setCohorts(cohortData.cohorts ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function createCohort(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const startsAt = String(formData.get("startsAt") ?? "");
    const deadline = String(formData.get("registrationDeadline") ?? "");
    const payload = {
      courseProgramId: String(formData.get("courseProgramId") ?? ""),
      title: String(formData.get("title") ?? ""),
      startsAt: new Date(startsAt).toISOString(),
      registrationDeadline: deadline ? new Date(deadline).toISOString() : undefined,
      capacity: Number(formData.get("capacity") ?? 12),
      status: String(formData.get("status") ?? "DRAFT"),
    };
    const res = await fetch("/api/admin/course-cohorts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "建立班期失敗");
      return;
    }
    event.currentTarget.reset();
    setMessage("班期與 8 週課表已建立。");
    await loadData();
  }

  async function updateCohortStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/course-cohorts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMessage("班期狀態已更新。");
      await loadData();
    }
  }

  async function updateCohortDetails(
    event: React.FormEvent<HTMLFormElement>,
    id: string,
  ) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const deadline = String(formData.get("registrationDeadline") ?? "");
    const payload = {
      title: String(formData.get("title") ?? ""),
      capacity: Number(formData.get("capacity") ?? 12),
      registrationDeadline: deadline ? new Date(deadline).toISOString() : null,
    };

    const res = await fetch(`/api/admin/course-cohorts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "更新班期失敗");
      return;
    }
    setMessage("班期資料已更新。");
    await loadData();
  }

  async function updateSession(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      topic: String(formData.get("topic") ?? ""),
      description: String(formData.get("description") ?? ""),
      startAt: new Date(String(formData.get("startAt") ?? "")).toISOString(),
      endAt: new Date(String(formData.get("endAt") ?? "")).toISOString(),
    };
    const res = await fetch(`/api/admin/course-sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setMessage("週次已更新。");
      await loadData();
    }
  }

  return (
    <div className="space-y-6">
      {(message || error) && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
          {error ?? message}
        </div>
      )}
      <form onSubmit={createCohort} className="rounded-lg border border-brand-100 bg-white p-6">
        <h2 className="font-semibold text-brand-900">建立 8 週班期</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <select name="courseProgramId" required className="rounded border border-brand-200 px-3 py-2 text-sm">
            <option value="">選擇課程方案</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>{program.title}</option>
            ))}
          </select>
          <input name="title" required placeholder="班期名稱" className="rounded border border-brand-200 px-3 py-2 text-sm" />
          <input name="startsAt" required type="datetime-local" className="rounded border border-brand-200 px-3 py-2 text-sm" />
          <input name="registrationDeadline" type="datetime-local" className="rounded border border-brand-200 px-3 py-2 text-sm" />
          <input name="capacity" type="number" defaultValue={12} className="rounded border border-brand-200 px-3 py-2 text-sm" />
          <select name="status" defaultValue="DRAFT" className="rounded border border-brand-200 px-3 py-2 text-sm">
            <option value="DRAFT">草稿</option>
            <option value="OPEN">開放報名</option>
            <option value="CLOSED">停止報名</option>
          </select>
        </div>
        <button type="submit" className="mt-4 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark">
          建立班期
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-brand-500">載入中...</p>
      ) : (
        <div className="space-y-4">
          {cohorts.map((cohort) => (
            <div key={cohort.id} className="rounded-lg border border-brand-100 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-brand-900">{cohort.title}</p>
                  <p className="mt-1 text-sm text-brand-600">{cohort.courseProgram.title}</p>
                  <p className="mt-1 text-xs text-brand-500">名額 {cohort._count.enrollments}/{cohort.capacity}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <BookingStatusBadge status={cohort.status} />
                  {cohortStatuses.map((status) => (
                    <button key={status.value} type="button" onClick={() => updateCohortStatus(cohort.id, status.value)} className="rounded border border-brand-200 px-2 py-1 text-xs text-brand-600 hover:bg-brand-50">
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
              <form
                onSubmit={(event) => updateCohortDetails(event, cohort.id)}
                className="mt-4 grid gap-3 rounded border border-brand-100 bg-brand-50 p-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_220px_auto]"
              >
                <input
                  name="title"
                  defaultValue={cohort.title}
                  className="rounded border border-brand-200 px-3 py-2 text-sm"
                />
                <input
                  name="capacity"
                  type="number"
                  defaultValue={cohort.capacity}
                  className="rounded border border-brand-200 px-3 py-2 text-sm"
                />
                <input
                  name="registrationDeadline"
                  type="datetime-local"
                  defaultValue={
                    cohort.registrationDeadline
                      ? toDateTimeLocal(cohort.registrationDeadline)
                      : ""
                  }
                  className="rounded border border-brand-200 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded bg-brand-800 px-3 py-2 text-xs font-medium text-white"
                >
                  儲存班期
                </button>
              </form>
              <div className="mt-5 space-y-3">
                {cohort.sessions.map((session) => (
                  <form key={session.id} onSubmit={(event) => updateSession(event, session.id)} className="grid gap-2 rounded border border-brand-100 bg-brand-50 p-3 lg:grid-cols-[80px_1fr_1fr_1fr_auto]">
                    <p className="text-sm font-medium text-brand-700">第 {session.weekNumber} 週</p>
                    <input name="topic" defaultValue={session.topic} className="rounded border border-brand-200 px-2 py-1 text-sm" />
                    <input name="startAt" type="datetime-local" defaultValue={toDateTimeLocal(session.startAt)} className="rounded border border-brand-200 px-2 py-1 text-sm" />
                    <input name="endAt" type="datetime-local" defaultValue={toDateTimeLocal(session.endAt)} className="rounded border border-brand-200 px-2 py-1 text-sm" />
                    <button type="submit" className="rounded bg-brand-800 px-3 py-1 text-xs font-medium text-white">儲存</button>
                    <p className="text-xs text-brand-500 lg:col-span-5">{formatSlotRange(new Date(session.startAt), new Date(session.endAt))}</p>
                    <input name="description" defaultValue={session.description ?? ""} className="rounded border border-brand-200 px-2 py-1 text-sm lg:col-span-5" />
                  </form>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
