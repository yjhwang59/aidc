"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container } from "@/components/Container";
import { loginSchema } from "@/lib/validations/booking";
import type { z } from "zod";

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/admin/dashboard";
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  async function onSubmit(data: LoginForm) {
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
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
      <h1 className="text-xl font-bold text-brand-900">管理員登入</h1>
      <p className="mt-2 text-sm text-brand-500">AIDC.work 預約管理後台</p>

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
          {isSubmitting ? "登入中..." : "登入"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <section className="flex min-h-[60vh] items-center py-16">
      <Container>
        <Suspense>
          <LoginForm />
        </Suspense>
      </Container>
    </section>
  );
}
