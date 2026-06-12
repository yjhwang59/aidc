import { NextRequest, NextResponse } from "next/server";
import {
  createMemberSessionToken,
  getMemberSessionCookieName,
  validateMemberCredentials,
} from "@/lib/auth/member-session";
import { jsonError } from "@/lib/api-utils";
import { memberLoginSchema } from "@/lib/validations/booking";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = memberLoginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "資料驗證失敗");
    }

    const member = await validateMemberCredentials(
      parsed.data.email,
      parsed.data.password,
    );
    if (!member) {
      return jsonError("帳號或密碼錯誤，或會員狀態無法登入", 401);
    }

    const { token, maxAge } = createMemberSessionToken(
      member.id,
      parsed.data.rememberMe ?? true,
    );
    const response = NextResponse.json({
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
        company: member.company,
        phone: member.phone,
      },
    });

    response.cookies.set(getMemberSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    console.error("[POST /api/member/login]", error);
    return jsonError("登入失敗", 500);
  }
}
