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

export const createCourseProgramSchema = z.object({
  slug: z.string().min(1, "請填寫 slug").max(100),
  title: z.string().min(1, "請填寫課程名稱").max(200),
  description: z.string().min(1, "請填寫課程說明").max(4000),
  level: z.string().max(100).optional(),
  durationWeeks: z.coerce.number().int().min(1).max(24).default(8),
  sessionDurationMin: z.coerce.number().int().min(30).max(600).default(120),
  capacity: z.coerce.number().int().min(1).max(200).default(12),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const updateCourseProgramSchema = z.object({
  slug: z.string().min(1, "請填寫 slug").max(100).optional(),
  title: z.string().min(1, "請填寫課程名稱").max(200).optional(),
  description: z.string().min(1, "請填寫課程說明").max(4000).optional(),
  level: z.string().max(100).optional(),
  durationWeeks: z.coerce.number().int().min(1).max(24).optional(),
  sessionDurationMin: z.coerce.number().int().min(30).max(600).optional(),
  capacity: z.coerce.number().int().min(1).max(200).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
});

export const createCourseCohortSchema = z.object({
  courseProgramId: z.string().min(1, "請選擇課程方案"),
  title: z.string().min(1, "請填寫班期名稱").max(200),
  startsAt: z.string().datetime({ message: "請提供有效的第一週開始時間" }),
  registrationDeadline: z
    .string()
    .datetime({ message: "請提供有效的報名截止時間" })
    .optional(),
  capacity: z.coerce.number().int().min(1).max(200).default(12),
  status: z
    .enum(["DRAFT", "OPEN", "FULL", "CLOSED", "COMPLETED", "CANCELLED"])
    .default("DRAFT"),
});

export const updateCourseCohortSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  registrationDeadline: z.string().datetime().nullable().optional(),
  capacity: z.coerce.number().int().min(1).max(200).optional(),
  status: z
    .enum(["DRAFT", "OPEN", "FULL", "CLOSED", "COMPLETED", "CANCELLED"])
    .optional(),
});

export const updateCourseSessionSchema = z.object({
  startAt: z.string().datetime({ message: "請提供有效的開始時間" }),
  endAt: z.string().datetime({ message: "請提供有效的結束時間" }),
  topic: z.string().min(1, "請填寫週次主題").max(200),
  description: z.string().max(2000).optional(),
});

export const createCourseEnrollmentSchema = z.object({
  cohortId: z.string().min(1, "請選擇班期"),
  name: z.string().min(1, "請填寫姓名").max(100),
  email: z.string().email("請填寫有效的 Email"),
  company: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  message: z.string().max(2000).optional(),
});

export const updateCourseEnrollmentSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "CANCELLED", "WAITLISTED", "COMPLETED"])
    .optional(),
  adminNote: z.string().max(2000).optional(),
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
export type CreateCourseEnrollmentInput = z.infer<
  typeof createCourseEnrollmentSchema
>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type MemberRegisterInput = z.infer<typeof memberRegisterSchema>;
export type MemberLoginInput = z.infer<typeof memberLoginSchema>;
export type UpdateMemberProfileInput = z.infer<typeof updateMemberProfileSchema>;
