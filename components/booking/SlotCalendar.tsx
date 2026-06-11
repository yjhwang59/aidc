"use client";

import { formatInTimeZone } from "date-fns-tz";
import { zhTW } from "date-fns/locale";

const TIMEZONE = "Asia/Taipei";

export type SlotOption = {
  id: string;
  serviceId: string;
  startAt: string;
  endAt: string;
  status: string;
};

type SlotCalendarProps = {
  slots: SlotOption[];
  selectedId: string | null;
  onSelect: (slotId: string) => void;
  loading?: boolean;
};

function groupSlotsByDate(slots: SlotOption[]): Map<string, SlotOption[]> {
  const groups = new Map<string, SlotOption[]>();
  for (const slot of slots) {
    const dateKey = formatInTimeZone(
      new Date(slot.startAt),
      TIMEZONE,
      "yyyy-MM-dd",
    );
    const existing = groups.get(dateKey) ?? [];
    existing.push(slot);
    groups.set(dateKey, existing);
  }
  return groups;
}

export function SlotCalendar({
  slots,
  selectedId,
  onSelect,
  loading,
}: SlotCalendarProps) {
  if (loading) {
    return (
      <p className="text-sm text-brand-500">載入可預約時段中...</p>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-brand-100 bg-brand-50 p-6 text-center">
        <p className="text-sm text-brand-600">
          目前沒有可預約的時段，請稍後再試或直接來信聯絡。
        </p>
      </div>
    );
  }

  const grouped = groupSlotsByDate(slots);

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([dateKey, daySlots]) => {
        const dateLabel = formatInTimeZone(
          new Date(daySlots[0].startAt),
          TIMEZONE,
          "yyyy/MM/dd (EEE)",
          { locale: zhTW },
        );

        return (
          <div key={dateKey}>
            <h3 className="mb-3 text-sm font-semibold text-brand-800">
              {dateLabel}
            </h3>
            <div className="flex flex-wrap gap-2">
              {daySlots.map((slot) => {
                const isSelected = selectedId === slot.id;
                const timeLabel = `${formatInTimeZone(new Date(slot.startAt), TIMEZONE, "HH:mm")} – ${formatInTimeZone(new Date(slot.endAt), TIMEZONE, "HH:mm")}`;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSelect(slot.id)}
                    aria-pressed={isSelected}
                    className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                      isSelected
                        ? "border-accent bg-accent text-white"
                        : "border-brand-200 bg-white text-brand-700 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {timeLabel}
                    {isSelected && (
                      <span className="ml-2 text-xs font-medium">已選擇</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
