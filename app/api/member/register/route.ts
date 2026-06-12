import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
  createMemberSessionToken,
  getMemberSessionCookieName,
  registerMember,
} from "@/lib/auth/member-session";
import { jsonError } from "@/lib/api-utils";
import { memberRegisterSchema } from "@/lib/validations/booking";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = memberRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "資料驗證失敗");
    }

    const member = await registerMember(parsed.data);
    const { token, maxAge } = createMemberSessionToken(member.id, true);
    const response = NextResponse.json({
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
        company: member.company,
        phone: member.phone,
      },
    }, { status: 201 });

    response.cookies.set(getMemberSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError("此 Email 已註冊，請直接登入", 409);
    }
    console.error("[POST /api/member/register]", error);
    return jsonError("註冊失敗", 500);
  }
}
