"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container } from "@/components/Container";
import {
  memberRegisterSchema,
  type MemberRegisterInput,
} from "@/lib/validations/booking";

function MemberRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/member";
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MemberRegisterInput>({
    resolver: zodResolver(memberRegisterSchema),
    defaultValues: { email: "", password: "", name: "", company: "", phone: "" },
  });

  async function onSubmit(data: MemberRegisterInput) {
    setError(null);
    try {
      const res = await fetch("/api/member/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "註冊失敗");
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
      <h1 className="text-xl font-bold text-brand-900">建立會員帳號</h1>
      <p className="mt-2 text-sm text-brand-500">建立帳號後即可完成預約並查看後續狀態。</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-brand-700">
            姓名
          </label>
          <input id="name" {...register("name")} className="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-brand-700">
            Email
          </label>
          <input id="email" type="email" autoComplete="email" {...register("email")} className="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-brand-700">
            密碼
          </label>
          <input id="password" type="password" autoComplete="new-password" {...register("password")} className="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-brand-700">
            公司 / 組織
          </label>
          <input id="company" {...register("company")} className="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-brand-700">
            電話
          </label>
          <input id="phone" type="tel" {...register("phone")} className="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60">
          {isSubmitting ? "建立中..." : "建立帳號並繼續"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-brand-500">
        已經有帳號？{" "}
        <Link href={`/member/login?redirect=${encodeURIComponent(redirect)}`} className="text-accent hover:text-accent-dark">
          登入會員
        </Link>
      </p>
    </div>
  );
}

export default function MemberRegisterPage() {
  return (
    <section className="py-16">
      <Container>
        <Suspense>
          <MemberRegisterForm />
        </Suspense>
      </Container>
    </section>
  );
}
