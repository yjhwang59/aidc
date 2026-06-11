import { NextRequest, NextResponse } from "next/server";
import { jsonError, jsonUnauthorized } from "@/lib/api-utils";
import { requireAdmin, changeAdminPassword } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/validations/booking";

export async function POST(request: NextRequest) {
  let email: string;
  try {
    email = await requireAdmin();
  } catch {
    return jsonUnauthorized();
  }

  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "資料驗證失敗");
    }

    const changed = await changeAdminPassword({
      email,
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });

    if (!changed) {
      return jsonError("目前密碼不正確", 401);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/admin/change-password]", error);
    return jsonError("修改密碼失敗", 500);
  }
}
