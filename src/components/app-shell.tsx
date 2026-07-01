"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BarChart3, Boxes, Cog, Gauge, LayoutDashboard, PackageCheck, ShoppingCart } from "lucide-react";

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/availability", label: "Availability", icon: Gauge },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/containers", label: "Containers", icon: PackageCheck },
  { href: "/inventory", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Cog },
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
    <div className="grid min-h-screen grid-cols-1 bg-[#F3F5F8] text-[#182233] lg:grid-cols-[200px_1fr]">
      <aside className="relative border-r border-[#1e2633] bg-[linear-gradient(180deg,#0d131c_0%,#0a1017_55%,#090e15_100%)] text-white">
        <div className="relative flex h-full flex-col px-2.5 py-4">
          <Link href="/" className="px-1 py-0.5">
            <p className="text-[26px] font-black leading-none tracking-tight text-white">OLYMPIC</p>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ef2d35]">Equipment</p>
          </Link>

          <nav className="mt-4.5 space-y-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 rounded-xl px-2 py-2 text-[13px] font-semibold transition ${
                    active
                      ? "bg-[linear-gradient(90deg,#b51f25_0%,#8b1e24_100%)] text-white shadow-[0_14px_24px_-18px_rgba(181,31,37,0.9)]"
                      : "text-white/78 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {active ? <span className="absolute left-0 top-1.5 h-6 w-1 rounded-r-full bg-[#ff444e]" /> : null}
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2.5">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">Connections</p>
              <ul className="mt-2.5 space-y-1.5 text-[11px] text-white/84">
                <li className="flex items-center justify-between">
                  <span>Supabase</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                </li>
                <li className="flex items-center justify-between">
                  <span>QuickBooks Online</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                </li>
                <li className="flex items-center justify-between">
                  <span>GitHub + Vercel</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                </li>
                <li className="flex items-center justify-between">
                  <span>Container Tracking</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-2 py-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold">KH</div>
                <div>
                  <p className="text-[11px] font-semibold text-white">Kadie Harrett</p>
                  <p className="text-[10px] text-white/60">Administrator</p>
                </div>
              </div>
              <span className="text-sm text-white/50">›</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="overflow-x-hidden px-5 pb-5 pt-5 lg:px-6">{children}</main>
    </div>
  );
}
