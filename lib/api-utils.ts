import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonUnauthorized() {
  return NextResponse.json({ error: "未授權" }, { status: 401 });
}
