"use client";

import { useCallback, useEffect, useState } from "react";

type Program = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string | null;
  durationWeeks: number;
  sessionDurationMin: number;
  capacity: number;
  isActive: boolean;
  sortOrder: number;
  _count?: { cohorts: number };
};

export function CourseProgramsManager() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/course-programs");
      const data = await res.json();
      setPrograms(data.programs ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  async function createProgram(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const payload = {
      slug: String(formData.get("slug") ?? ""),
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      level: String(formData.get("level") ?? ""),
      durationWeeks: Number(formData.get("durationWeeks") ?? 8),
      sessionDurationMin: Number(formData.get("sessionDurationMin") ?? 120),
      capacity: Number(formData.get("capacity") ?? 12),
      sortOrder: Number(formData.get("sortOrder") ?? 0),
      isActive: true,
    };
    const res = await fetch("/api/admin/course-programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "建立課程方案失敗");
      return;
    }
    event.currentTarget.reset();
    setMessage("課程方案已建立。");
    await loadPrograms();
  }

  async function toggleActive(program: Program) {
    const res = await fetch(`/api/admin/course-programs/${program.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !program.isActive }),
    });
    if (res.ok) {
      setMessage(program.isActive ? "課程已停用。" : "課程已啟用。");
      await loadPrograms();
    }
  }

  async function updateProgram(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      description: String(formData.get("description") ?? ""),
      level: String(formData.get("level") ?? ""),
      durationWeeks: Number(formData.get("durationWeeks") ?? 8),
      sessionDurationMin: Number(formData.get("sessionDurationMin") ?? 120),
      capacity: Number(formData.get("capacity") ?? 12),
      sortOrder: Number(formData.get("sortOrder") ?? 0),
    };

    const res = await fetch(`/api/admin/course-programs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "更新課程方案失敗");
      return;
    }
    setMessage("課程方案已更新。");
    await loadPrograms();
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

      <form
        onSubmit={createProgram}
        className="rounded-lg border border-brand-100 bg-white p-6"
      >
        <h2 className="font-semibold text-brand-900">新增課程方案</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input name="title" required placeholder="課程名稱" className="rounded border border-brand-200 px-3 py-2 text-sm" />
          <input name="slug" required placeholder="slug，例如 ai-system-development-intro" className="rounded border border-brand-200 px-3 py-2 text-sm" />
          <input name="level" placeholder="級別，例如 入門 / 進階" className="rounded border border-brand-200 px-3 py-2 text-sm" />
          <input name="sortOrder" type="number" defaultValue={0} className="rounded border border-brand-200 px-3 py-2 text-sm" />
          <input name="durationWeeks" type="number" defaultValue={8} className="rounded border border-brand-200 px-3 py-2 text-sm" />
          <input name="sessionDurationMin" type="number" defaultValue={120} className="rounded border border-brand-200 px-3 py-2 text-sm" />
          <input name="capacity" type="number" defaultValue={12} className="rounded border border-brand-200 px-3 py-2 text-sm" />
          <textarea name="description" required placeholder="課程說明" className="min-h-24 rounded border border-brand-200 px-3 py-2 text-sm sm:col-span-2" />
        </div>
        <button type="submit" className="mt-4 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark">
          建立課程方案
        </button>
      </form>

      <div className="rounded-lg border border-brand-100 bg-white">
        <div className="border-b border-brand-100 px-6 py-4">
          <h2 className="font-semibold text-brand-900">課程方案列表</h2>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-sm text-brand-500">載入中...</p>
        ) : (
          <div className="divide-y divide-brand-50">
            {programs.map((program) => (
              <form
                key={program.id}
                onSubmit={(event) => updateProgram(event, program.id)}
                className="space-y-3 px-6 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-brand-900">{program.title}</p>
                    <p className="mt-1 text-sm text-brand-600">{program.slug}</p>
                    <p className="mt-1 text-xs text-brand-500">
                      {program.level ?? "未分級"} · {program.durationWeeks} 週 · 名額 {program.capacity} · 班期 {program._count?.cohorts ?? 0}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded bg-brand-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-900"
                    >
                      儲存
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(program)}
                      className="rounded border border-brand-200 px-3 py-1.5 text-xs text-brand-600 hover:bg-brand-50"
                    >
                      {program.isActive ? "停用" : "啟用"}
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <input name="title" defaultValue={program.title} className="rounded border border-brand-200 px-3 py-2 text-sm" />
                  <input name="slug" defaultValue={program.slug} className="rounded border border-brand-200 px-3 py-2 text-sm" />
                  <input name="level" defaultValue={program.level ?? ""} className="rounded border border-brand-200 px-3 py-2 text-sm" />
                  <input name="sortOrder" type="number" defaultValue={program.sortOrder} className="rounded border border-brand-200 px-3 py-2 text-sm" />
                  <input name="durationWeeks" type="number" defaultValue={program.durationWeeks} className="rounded border border-brand-200 px-3 py-2 text-sm" />
                  <input name="sessionDurationMin" type="number" defaultValue={program.sessionDurationMin} className="rounded border border-brand-200 px-3 py-2 text-sm" />
                  <input name="capacity" type="number" defaultValue={program.capacity} className="rounded border border-brand-200 px-3 py-2 text-sm" />
                  <textarea name="description" defaultValue={program.description} className="min-h-20 rounded border border-brand-200 px-3 py-2 text-sm lg:col-span-4" />
                </div>
              </form>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
