"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CourseEnrollmentForm({ cohortId }: { cohortId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      cohortId,
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    try {
      const res = await fetch("/api/course-enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "報名失敗，請稍後再試");
        return;
      }
      router.push(`/courses/enroll/confirmation/${data.enrollment.id}`);
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-brand-700">
          姓名
          <input
            name="name"
            required
            className="mt-1 w-full rounded border border-brand-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm text-brand-700">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-brand-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm text-brand-700">
          公司
          <input
            name="company"
            className="mt-1 w-full rounded border border-brand-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm text-brand-700">
          電話
          <input
            name="phone"
            className="mt-1 w-full rounded border border-brand-200 px-3 py-2"
          />
        </label>
      </div>
      <label className="block text-sm text-brand-700">
        需求說明
        <textarea
          name="message"
          rows={5}
          className="mt-1 w-full rounded border border-brand-200 px-3 py-2"
          placeholder="可簡述團隊背景、期待學習重點或希望討論的專案。"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60"
      >
        {submitting ? "送出中..." : "送出報名申請"}
      </button>
    </form>
  );
}
