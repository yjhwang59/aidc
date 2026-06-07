import Link from "next/link";
import { Container } from "@/components/Container";
import { navItems } from "@/lib/site-data";

export default function NotFound() {
  return (
    <section className="bg-brand-50 py-20 sm:py-28">
      <Container className="max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          404
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
          找不到此頁面
        </h1>
        <p className="mt-4 text-brand-600">
          您造訪的網址可能已移除、名稱已變更，或暫時無法使用。
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
          >
            返回首頁
          </Link>
        </div>
        <nav className="mt-10 border-t border-brand-100 pt-8">
          <p className="text-sm font-medium text-brand-900">熱門頁面</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-brand-600 transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </section>
  );
}
