"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: "/", label: "Dashboard", note: "KPIs" },
  { href: "/inventory", label: "Inventory", note: "Stock" },
  { href: "/suppliers", label: "Suppliers", note: "Vendors" },
  { href: "/orders", label: "Orders", note: "PO / SO" },
  { href: "/purchasing", label: "Purchasing", note: "PO" },
  { href: "/containers", label: "Containers", note: "ETA" },
  { href: "/receiving", label: "Receiving", note: "ASN" },
  { href: "/settings", label: "Settings", note: "Config" },
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
      <div className="pointer-events-none absolute inset-0 z-0 opacity-70">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(107,15,26,0.22)_0%,_rgba(107,15,26,0)_70%)]" />
        <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(0,0,0,0.12)_0%,_rgba(0,0,0,0)_70%)]" />
      </div>

      <div className="relative z-10 grid min-h-screen grid-cols-1 md:grid-cols-[252px_1fr]">
        <aside className="border-b border-[var(--line-soft)] bg-[var(--panel-strong)]/85 backdrop-blur md:border-b-0 md:border-r">
          <div className="flex h-full flex-col p-5">
            <Link href="/" className="mb-8 block">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Forge Ledger
              </p>
              <h1 className="mt-2 text-xl font-bold tracking-tight">Inventory OS</h1>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Built for velocity and control
              </p>
            </Link>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between rounded-xl border px-3 py-2.5 transition ${
                      active
                        ? "border-[var(--brand-accent)] bg-[var(--brand-accent)]/12"
                        : "border-transparent hover:border-[var(--line-soft)] hover:bg-[var(--panel)]"
                    }`}
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="rounded-md border border-[var(--line-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
                      {item.note}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-xl border border-[var(--line-soft)] bg-[var(--panel)] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Connections
              </p>
              <ul className="mt-2 space-y-2 text-xs text-[var(--text-muted)]">
                <li className="flex items-center justify-between">
                  <span>Supabase</span>
                  <span className="rounded border border-[var(--line-soft)] px-1.5 py-0.5">DB</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>QuickBooks Online</span>
                  <span className="rounded border border-[var(--line-soft)] px-1.5 py-0.5">QBO</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>GitHub + Vercel</span>
                  <span className="rounded border border-[var(--line-soft)] px-1.5 py-0.5">CI</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-20 border-b border-[var(--line-soft)] bg-[var(--bg-page)]/85 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Inventory App Shell
                </p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Ready for Supabase + QBO wiring
                </p>
              </div>
              <button className="rounded-lg border border-[var(--line-soft)] bg-[var(--panel)] px-3 py-2 text-xs font-semibold hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]">
                New Item
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
