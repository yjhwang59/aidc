import { z } from "zod";

export const createBookingSchema = z.object({
  slotId: z.string().min(1, "請選擇預約時段"),
  serviceId: z.string().min(1, "請選擇服務類型"),
  name: z.string().min(1, "請填寫姓名").max(100),
  email: z.string().email("請填寫有效的 Email"),
  company: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  message: z.string().max(2000).optional(),
});

export const updateBookingSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"])
    .optional(),
  adminNote: z.string().max(2000).optional(),
});

export const createSlotSchema = z.object({
  serviceId: z.string().min(1),
  startAt: z.string().datetime({ message: "請提供有效的開始時間" }),
  endAt: z.string().datetime({ message: "請提供有效的結束時間" }),
});

export const createSlotsBatchSchema = z.object({
  slots: z.array(createSlotSchema).min(1).max(50),
});

export const updateSlotSchema = z.object({
  status: z.enum(["AVAILABLE", "BOOKED", "BLOCKED"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

export const memberRegisterSchema = z.object({
  email: z.string().email("請填寫有效的 Email").max(200),
  password: z
    .string()
    .min(10, "密碼至少需要 10 個字元")
    .max(100, "密碼過長"),
  name: z.string().min(1, "請填寫姓名").max(100),
  company: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
});

export const memberLoginSchema = z.object({
  email: z.string().email("請填寫有效的 Email"),
  password: z.string().min(1, "請輸入密碼"),
  rememberMe: z.boolean().optional(),
});

export const updateMemberProfileSchema = z.object({
  name: z.string().min(1, "請填寫姓名").max(100),
  company: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  jobTitle: z.string().max(100).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "請輸入目前密碼"),
    newPassword: z
      .string()
      .min(10, "新密碼至少需要 10 個字元")
      .max(100, "新密碼過長"),
    confirmPassword: z.string().min(1, "請再次輸入新密碼"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "兩次輸入的新密碼不一致",
    path: ["confirmPassword"],
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type MemberRegisterInput = z.infer<typeof memberRegisterSchema>;
export type MemberLoginInput = z.infer<typeof memberLoginSchema>;
export type UpdateMemberProfileInput = z.infer<typeof updateMemberProfileSchema>;
