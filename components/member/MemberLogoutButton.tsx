"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MemberLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/member/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="rounded-md border border-brand-200 px-3 py-2 text-sm text-brand-700 hover:bg-brand-50 disabled:opacity-60"
    >
      {loading ? "登出中..." : "登出"}
    </button>
  );
}
