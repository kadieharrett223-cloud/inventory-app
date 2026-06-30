"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: "/", label: "Dashboard", note: "KPIs" },
  { href: "/product-mapping", label: "Product Mapping", note: "QBO" },
  { href: "/inventory", label: "Inventory", note: "Stock" },
  { href: "/products", label: "Products", note: "SKU" },
  { href: "/availability", label: "Availability", note: "ATP" },
  { href: "/suppliers", label: "Suppliers", note: "Vendors" },
  { href: "/orders", label: "New Orders", note: "Invoices" },
  { href: "/purchasing", label: "Purchasing", note: "PO" },
  { href: "/containers", label: "Containers", note: "ETA" },
  { href: "/container-log", label: "Container Log", note: "Track" },
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
      <div className="pointer-events-none absolute inset-0 z-0 opacity-80">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(163,32,42,0.24)_0%,_rgba(163,32,42,0)_70%)]" />
        <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(26,36,48,0.2)_0%,_rgba(26,36,48,0)_70%)]" />
      </div>

      <div className="relative z-10 grid min-h-screen grid-cols-1 md:grid-cols-[252px_1fr]">
        <aside className="border-b border-white/10 bg-[linear-gradient(180deg,var(--panel-strong),var(--panel-strong-alt))] text-white md:border-b-0 md:border-r">
          <div className="flex h-full flex-col p-5">
            <Link href="/" className="mb-8 block">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
                Forge Ledger
              </p>
              <h1 className="mt-2 flex items-center gap-2 text-xl font-bold tracking-tight">
                Inventory OS
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--brand-gold)]" />
              </h1>
              <p className="mt-1 text-xs text-white/65">
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
                        : "border-transparent hover:border-white/20 hover:bg-white/8"
                    }`}
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="rounded-md border border-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70 group-hover:text-white">
                      {item.note}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-xl border border-white/20 bg-black/35 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Connections
              </p>
              <ul className="mt-2 space-y-2 text-xs text-white/75">
                <li className="flex items-center justify-between">
                  <span>Supabase</span>
                  <span className="rounded border border-white/25 px-1.5 py-0.5">DB</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>QuickBooks Online</span>
                  <span className="rounded border border-white/25 px-1.5 py-0.5">QBO</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>GitHub + Vercel</span>
                  <span className="rounded border border-white/25 px-1.5 py-0.5">CI</span>
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
              <button className="rounded-lg border border-[var(--brand-secondary)] bg-[var(--brand-accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-secondary)]">
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
