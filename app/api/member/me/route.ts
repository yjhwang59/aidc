import { NextRequest, NextResponse } from "next/server";
import { getCurrentMember, requireMember } from "@/lib/auth/member-session";
import { jsonError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { updateMemberProfileSchema } from "@/lib/validations/booking";

export async function GET() {
  const member = await getCurrentMember();
  return NextResponse.json({ member });
}

export async function PATCH(request: NextRequest) {
  try {
    const member = await requireMember();
    const body = await request.json();
    const parsed = updateMemberProfileSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "資料驗證失敗");
    }

    const updated = await prisma.member.update({
      where: { id: member.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        company: parsed.data.company || null,
        jobTitle: parsed.data.jobTitle || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        company: true,
        jobTitle: true,
        status: true,
      },
    });

    return NextResponse.json({ member: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return jsonError("請先登入會員", 401);
    }
    console.error("[PATCH /api/member/me]", error);
    return jsonError("更新會員資料失敗", 500);
  }
}
