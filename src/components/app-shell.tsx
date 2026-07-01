"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { AvailabilityIcon, ContainersIcon, DashboardIcon, OrdersIcon, ProductsIcon, SettingsIcon } from "@/components/line-icons";

type AppShellProps = {
  children: ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: DashboardIcon },
  { href: "/availability", label: "Availability", icon: AvailabilityIcon },
  { href: "/orders", label: "Orders", icon: OrdersIcon },
  { href: "/products", label: "Products", icon: ProductsIcon },
  { href: "/containers", label: "Containers", icon: ContainersIcon },
  { href: "/inventory", label: "Reports", icon: DashboardIcon },
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
    <div className="grid min-h-screen grid-cols-1 bg-[#f2f4f8] text-[#182233] lg:grid-cols-[248px_1fr]">
      <aside className="relative overflow-hidden border-r border-[#202c3d] bg-[radial-gradient(1000px_500px_at_-20%_-10%,#16345f_0%,#0d1b2f_40%,#091423_100%)] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_35%)]" />
        <div className="relative flex h-full flex-col p-4">
          <Link href="/" className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[30px] font-extrabold leading-none tracking-tight text-white">OLYMPIC</p>
            <p className="text-[14px] font-semibold uppercase tracking-[0.24em] text-[#ef2d35]">Equipment</p>
          </Link>

          <nav className="mt-5 space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[linear-gradient(90deg,#b81d24_0%,#8b1e24_100%)] text-white shadow-[0_14px_24px_-18px_rgba(184,29,36,0.8)]"
                      : "text-white/78 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">Connections</p>
              <ul className="mt-3 space-y-2.5 text-sm text-white/85">
                <li className="flex items-center justify-between">
                  <span>Supabase</span>
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                </li>
                <li className="flex items-center justify-between">
                  <span>QuickBooks Online</span>
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                </li>
                <li className="flex items-center justify-between">
                  <span>GitHub + Vercel</span>
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                </li>
                <li className="flex items-center justify-between">
                  <span>Container Tracking</span>
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-xs font-bold">KH</div>
                <div>
                  <p className="text-sm font-semibold text-white">Kadie Harrett</p>
                  <p className="text-xs text-white/60">Administrator</p>
                </div>
              </div>
              <span className="text-white/55">›</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="overflow-x-hidden p-5 lg:p-6">{children}</main>
    </div>
  );
}
