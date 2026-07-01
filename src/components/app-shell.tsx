"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AvailabilityIcon, ContainersIcon, DashboardIcon, OrdersIcon, ProductsIcon, SettingsIcon } from "@/components/line-icons";

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: "/", label: "Dashboard", icon: DashboardIcon },
  { href: "/availability", label: "Availability", icon: AvailabilityIcon },
  { href: "/orders", label: "Orders", icon: OrdersIcon },
  { href: "/products", label: "Products", icon: ProductsIcon },
  { href: "/containers", label: "Containers", icon: ContainersIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
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
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(139,30,36,0.12)_0%,_rgba(139,30,36,0)_70%)]" />
        <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(30,58,95,0.08)_0%,_rgba(30,58,95,0)_70%)]" />
      </div>

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-[#323a45] bg-[var(--sidebar-bg)] text-white lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col px-5 py-6">
            <Link href="/" className="mb-8 block">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                Forge Ledger
              </p>
              <h1 className="mt-2 text-lg font-semibold tracking-tight text-white">Operations Dashboard</h1>
              <p className="mt-1 text-sm text-white/70">
                Fast inventory, orders, and containers.
              </p>
            </Link>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium ${active ? "bg-white/10 text-white" : "text-white/74 hover:bg-white/6 hover:text-white"}`}
                  >
                    {active ? <span className="absolute left-0 top-2.5 h-8 w-1 rounded-r-full bg-[var(--brand-accent)]" /> : null}
                    <Icon className="h-5 w-5 shrink-0 text-current" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Connections
              </p>
              <ul className="mt-3 space-y-2 text-sm text-white/76">
                <li>Supabase</li>
                <li>QuickBooks Online</li>
                <li>GitHub + Vercel</li>
              </ul>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-20 border-b border-[var(--line-soft)] bg-[var(--bg-page)]/96 backdrop-blur">
            <div className="flex items-center justify-between px-5 py-4 sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Olympic Equipment Operations
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
