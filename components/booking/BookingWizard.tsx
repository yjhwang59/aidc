"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { addWeeks } from "date-fns";
import { ServiceSelector, type ServiceOption } from "./ServiceSelector";
import { SlotCalendar, type SlotOption } from "./SlotCalendar";
import { BookingForm } from "./BookingForm";
import { formatSlotRange } from "@/lib/datetime";

export function BookingWizard() {
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get("service");

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        const list = data.services ?? [];
        setServices(list);
        if (initialSlug) {
          const match = list.find((s: ServiceOption) => s.slug === initialSlug);
          if (match) setSelectedServiceId(match.id);
        }
      })
      .finally(() => setLoadingServices(false));
  }, [initialSlug]);

  const loadSlots = useCallback(async (serviceId: string) => {
    setLoadingSlots(true);
    setSelectedSlotId(null);
    const from = new Date().toISOString();
    const to = addWeeks(new Date(), 4).toISOString();
    try {
      const res = await fetch(
        `/api/slots?serviceId=${serviceId}&from=${from}&to=${to}`,
      );
      const data = await res.json();
      setSlots(data.slots ?? []);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      loadSlots(selectedServiceId);
    }
  }, [selectedServiceId, loadSlots]);

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  if (loadingServices) {
    return <p className="text-sm text-brand-500">載入服務項目中...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 text-sm text-brand-500">
        <span className={step >= 1 ? "font-medium text-accent" : ""}>
          1. 選擇服務
        </span>
        <span>→</span>
        <span className={step >= 2 ? "font-medium text-accent" : ""}>
          2. 選擇時段
        </span>
        <span>→</span>
        <span className={step >= 3 ? "font-medium text-accent" : ""}>
          3. 填寫資料
        </span>
      </div>

      {step === 1 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-brand-900">
            1.請選擇諮詢服務：
          </h2>
          <ServiceSelector
            services={services}
            selectedId={selectedServiceId}
            onSelect={(id) => {
              setSelectedServiceId(id);
              setStep(2);
            }}
          />
        </div>
      )}

      {step === 2 && selectedService && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-900">
              2.請選擇諮詢時段：{selectedService.title}
            </h2>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-brand-500 hover:text-brand-700"
            >
              更換服務
            </button>
          </div>
          <SlotCalendar
            slots={slots}
            selectedId={selectedSlotId}
            onSelect={(id) => {
              setSelectedSlotId(id);
            }}
            loading={loadingSlots}
          />
          {selectedSlot && (
            <div className="mt-6 flex flex-col gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-brand-700">
                <span className="font-medium text-brand-900">已選時段：</span>
                {formatSlotRange(
                  new Date(selectedSlot.startAt),
                  new Date(selectedSlot.endAt),
                )}
              </p>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
              >
                下一步，填寫資料
              </button>
            </div>
          )}
        </div>
      )}

      {step === 3 && selectedService && selectedSlot && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-900">填寫預約資料</h2>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm text-brand-500 hover:text-brand-700"
            >
              更換時段
            </button>
          </div>
          <BookingForm
            serviceId={selectedService.id}
            slotId={selectedSlot.id}
            serviceTitle={selectedService.title}
            slotLabel={formatSlotRange(
              new Date(selectedSlot.startAt),
              new Date(selectedSlot.endAt),
            )}
          />
        </div>
      )}
    </div>
  );
}
