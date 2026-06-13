"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "總覽" },
  { href: "/admin/bookings", label: "預約管理" },
  { href: "/admin/slots", label: "時段管理" },
  { href: "/admin/course-programs", label: "課程方案" },
  { href: "/admin/course-cohorts", label: "課程班期" },
  { href: "/admin/course-enrollments", label: "課程報名" },
  { href: "/admin/settings", label: "帳號設定" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-brand-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="font-semibold text-brand-900">
            AIDC<span className="text-accent">.work</span> 管理後台
          </Link>
          <nav className="hidden flex-wrap gap-4 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm ${
                  pathname === item.href
                    ? "font-medium text-accent"
                    : "text-brand-600 hover:text-brand-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-brand-500 hover:text-brand-700">
            返回網站
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-brand-600 hover:text-brand-900"
          >
            登出
          </button>
        </div>
      </div>
    </header>
  );
}
