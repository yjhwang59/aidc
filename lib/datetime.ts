import { formatInTimeZone } from "date-fns-tz";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

export const TIMEZONE = "Asia/Taipei";

export function formatSlotTime(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, "yyyy/MM/dd (EEE) HH:mm", {
    locale: zhTW,
  });
}

export function formatSlotRange(startAt: Date, endAt: Date): string {
  const datePart = formatInTimeZone(startAt, TIMEZONE, "yyyy/MM/dd (EEE)", {
    locale: zhTW,
  });
  const startPart = formatInTimeZone(startAt, TIMEZONE, "HH:mm");
  const endPart = formatInTimeZone(endAt, TIMEZONE, "HH:mm");
  return `${datePart} ${startPart} – ${endPart}`;
}

export function toTaipeiISO(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

export function parseDateInput(value: string): Date {
  return new Date(value);
}

export function formatDateForDisplay(date: Date): string {
  return format(date, "yyyy/MM/dd HH:mm", { locale: zhTW });
}
