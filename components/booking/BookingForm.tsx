"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  createBookingSchema,
  type CreateBookingInput,
} from "@/lib/validations/booking";

type BookingFormProps = {
  serviceId: string;
  slotId: string;
  serviceTitle: string;
  slotLabel: string;
};

export function BookingForm({
  serviceId,
  slotId,
  serviceTitle,
  slotLabel,
}: BookingFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [memberLoaded, setMemberLoaded] = useState(false);
  const [memberEmail, setMemberEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    reset,
  } = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      serviceId,
      slotId,
      name: "",
      email: "",
      company: "",
      phone: "",
      message: "",
    },
  });

  useEffect(() => {
    const draft = window.sessionStorage.getItem("aidc_booking_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as Partial<CreateBookingInput>;
        reset({
          serviceId,
          slotId,
          name: parsed.name ?? "",
          email: parsed.email ?? "",
          company: parsed.company ?? "",
          phone: parsed.phone ?? "",
          message: parsed.message ?? "",
        });
      } catch {
        window.sessionStorage.removeItem("aidc_booking_draft");
      }
    }

    fetch("/api/member/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.member) {
          setMemberEmail(data.member.email);
          const values = getValues();
          reset({
            ...values,
            serviceId,
            slotId,
            name: values.name || data.member.name || "",
            email: data.member.email || "",
            company: values.company || data.member.company || "",
            phone: values.phone || data.member.phone || "",
          });
        }
      })
      .finally(() => setMemberLoaded(true));
  }, [getValues, reset, serviceId, slotId]);

  async function onSubmit(data: CreateBookingInput) {
    setSubmitError(null);
    if (!memberEmail) {
      window.sessionStorage.setItem(
        "aidc_booking_draft",
        JSON.stringify({ ...data, serviceId, slotId }),
      );
      router.push("/member/login?redirect=/booking");
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (res.status === 401) {
        window.sessionStorage.setItem(
          "aidc_booking_draft",
          JSON.stringify({ ...data, serviceId, slotId }),
        );
        router.push("/member/login?redirect=/booking");
        return;
      }
      if (!res.ok) {
        setSubmitError(json.error ?? "預約失敗，請稍後再試");
        return;
      }

      window.sessionStorage.removeItem("aidc_booking_draft");
      router.push(`/booking/confirmation/${json.booking.id}`);
    } catch {
      setSubmitError("網路錯誤，請稍後再試");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("serviceId")} />
      <input type="hidden" {...register("slotId")} />

      <div className="rounded-lg bg-brand-50 p-4 text-sm text-brand-700">
        <p>
          <span className="font-medium">服務：</span>
          {serviceTitle}
        </p>
        <p className="mt-1">
          <span className="font-medium">時段：</span>
          {slotLabel}
        </p>
        {memberLoaded && (
          <p className="mt-2 text-xs text-brand-500">
            {memberEmail
              ? `已登入會員：${memberEmail}`
              : "送出預約前需要登入或建立會員帳號。系統會保留目前填寫內容。"}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-brand-700">
          姓名 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brand-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-brand-700">
          公司 / 組織
        </label>
        <input
          id="company"
          type="text"
          {...register("company")}
          className="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-brand-700">
          電話
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          className="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-brand-700">
          需求說明
        </label>
        <textarea
          id="message"
          rows={4}
          {...register("message")}
          placeholder="請簡述團隊現況、目標與預期時程"
          className="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {submitError && (
        <p className="text-sm text-red-600">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
      >
        {isSubmitting
          ? "送出中..."
          : memberEmail
            ? "確認預約"
            : "登入會員並繼續預約"}
      </button>
    </form>
  );
}
