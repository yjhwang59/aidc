"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container } from "@/components/Container";
import { memberLoginSchema, type MemberLoginInput } from "@/lib/validations/booking";

function MemberLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/member";
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<MemberLoginInput>({
    resolver: zodResolver(memberLoginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  async function onSubmit(data: MemberLoginInput) {
    setError(null);
    try {
      const res = await fetch("/api/member/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "登入失敗");
        return;
      }
      router.push(redirect);
      router.refresh();
    } catch {
      setError("網路錯誤，請稍後再試");
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-brand-100 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-bold text-brand-900">會員登入</h1>
      <p className="mt-2 text-sm text-brand-500">登入後即可完成預約並追蹤預約狀態。</p>

      <div className="mt-6 grid gap-3">
        <a
          href={`/api/member/oauth/google?redirect=${encodeURIComponent(redirect)}`}
          className="rounded-md border border-brand-200 px-4 py-2 text-center text-sm text-brand-700 hover:bg-brand-50"
        >
          使用 Google 登入
        </a>
        <a
          href={`/api/member/oauth/line?redirect=${encodeURIComponent(redirect)}`}
          className="rounded-md border border-brand-200 px-4 py-2 text-center text-sm text-brand-700 hover:bg-brand-50"
        >
          使用 LINE 登入
        </a>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-brand-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-brand-700">
            密碼
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-brand-600">
          <input type="checkbox" {...register("rememberMe")} className="rounded" />
          記住我
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {isSubmitting ? "登入中..." : "登入並繼續"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-brand-500">
        還不是會員？{" "}
        <Link href={`/member/register?redirect=${encodeURIComponent(redirect)}`} className="text-accent hover:text-accent-dark">
          建立會員帳號
        </Link>
      </p>
    </div>
  );
}

export default function MemberLoginPage() {
  return (
    <section className="py-16">
      <Container>
        <Suspense>
          <MemberLoginForm />
        </Suspense>
      </Container>
    </section>
  );
}
