"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: "/", label: "🏠 Dashboard" },
  { href: "/availability", label: "📦 Availability" },
  { href: "/orders", label: "🛒 Orders" },
  { href: "/products", label: "📋 Products" },
  { href: "/containers", label: "🚢 Containers" },
  { href: "/settings", label: "⚙ Settings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-page)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-60">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(163,32,42,0.12)_0%,_rgba(163,32,42,0)_70%)]" />
        <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(31,95,153,0.08)_0%,_rgba(31,95,153,0)_70%)]" />
      </div>

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-[var(--line-soft)] bg-white/95 backdrop-blur lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col px-5 py-6">
            <Link href="/" className="mb-8 block">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Forge Ledger
              </p>
              <h1 className="mt-2 text-lg font-semibold tracking-tight">Operations Dashboard</h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Fast inventory, orders, and containers.
              </p>
            </Link>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center rounded-2xl px-3 py-3 text-sm font-medium ${
                      active
                        ? "bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-page)]"
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-page)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Connections
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                <li>Supabase</li>
                <li>QuickBooks Online</li>
                <li>GitHub + Vercel</li>
              </ul>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-20 border-b border-[var(--line-soft)] bg-[var(--bg-page)]/92 backdrop-blur">
            <div className="flex items-center justify-between px-5 py-4 sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Inventory App Shell
                </p>
                <p className="text-base font-semibold text-[var(--text-primary)]">
                  Operations dashboard for sales, warehouse, and management
                </p>
              </div>
              <button className="rounded-full border border-[var(--brand-accent)] bg-[var(--brand-accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                New Item
              </button>
            </div>
          </header>

          <main className="flex-1 px-5 py-6 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
