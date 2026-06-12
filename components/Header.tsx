"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Container } from "./Container";
import { navItems } from "@/lib/site-data";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/95 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="inline-flex shrink-0 items-center">
            <Image
              src="/brand/logo-color.png"
              alt="AIDC.work"
              width={328}
              height={173}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-brand-600 transition-colors hover:text-brand-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/member"
              className="text-sm text-brand-600 transition-colors hover:text-brand-900"
            >
              會員中心
            </Link>
            <Link
              href="/booking"
              className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
            >
              預約諮詢
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-brand-700 md:hidden"
            aria-label="開啟選單"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-brand-100 py-4 md:hidden">
            <ul className="flex flex-col gap-3">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block text-sm text-brand-600 hover:text-brand-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/member"
                  className="block text-sm text-brand-600 hover:text-brand-900"
                  onClick={() => setMenuOpen(false)}
                >
                  會員中心
                </Link>
              </li>
              <li>
                <Link
                  href="/booking"
                  className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  預約諮詢
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </Container>
    </header>
  );
}
