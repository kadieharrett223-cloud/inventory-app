import Link from "next/link";
import type { ComponentType } from "react";
import { AlertTriangle, Bell, Boxes, CheckCheck, ClipboardCheck, Container, PackageOpen, Search, ShipWheel, TrendingUp } from "lucide-react";
import { computeProductAvailability, deriveAssignmentsFromApprovedInvoices, isContainerReceived, isInvoiceEligibleForWarehouse } from "@/lib/inventory-core";
import { containerShipments, customerInvoices, erpProducts } from "@/lib/inventory-data";

function shortDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function chartPath(index: number) {
  if (index === 0) return "M2 30 C 16 28, 24 18, 35 22 C 45 26, 56 11, 66 15 C 76 20, 86 8, 96 2";
  if (index === 1) return "M2 30 C 14 30, 22 23, 33 25 C 43 27, 55 14, 64 17 C 73 20, 84 10, 96 2";
  if (index === 2) return "M2 30 C 14 28, 24 19, 33 22 C 43 26, 54 15, 66 12 C 77 10, 86 13, 96 2";
  return "M2 30 C 16 28, 26 23, 35 18 C 44 12, 54 14, 66 10 C 76 6, 87 9, 96 2";
}

function statusTone(status: string) {
  const s = status.toLowerCase();
  if (s.includes("received") || s.includes("arrived")) return "bg-[#e7f6ed] text-[#2f6b4f]";
  if (s.includes("ship") || s.includes("port") || s.includes("origin") || s.includes("destination")) return "bg-[#e6edf8] text-[#1e3a5f]";
  return "bg-[#ecf0f5] text-[#334155]";
}

type TransitRow = {
  id: string;
  poNumber: string;
  containerNo: string;
  supplier: string;
  status: string;
  location: string;
  eta: string;
  units: number;
  products: number;
};

export default function Home() {
  const assignments = deriveAssignmentsFromApprovedInvoices(customerInvoices);
  const snapshots = erpProducts.map((product) => computeProductAvailability(product, assignments, containerShipments));

  const totalFloor = snapshots.reduce((sum, snapshot) => sum + snapshot.floorQty + snapshot.inStockQty, 0);
  const totalIncoming = snapshots.reduce((sum, snapshot) => sum + snapshot.onOrderQty, 0);
  const totalAssigned = snapshots.reduce((sum, snapshot) => sum + snapshot.soldAssignedQty, 0);
  const oversoldUnits = snapshots.reduce((sum, snapshot) => sum + snapshot.oversoldQty, 0);

  const ordersWaiting = customerInvoices.filter((invoice) => isInvoiceEligibleForWarehouse(invoice) && !invoice.approvedByShipping);
  const ordersReady = customerInvoices.filter((invoice) => invoice.approvedByShipping);
  const lowProducts = snapshots.filter((snapshot) => snapshot.availableNowQty <= 5).length;

  const inbound = containerShipments
    .filter((container) => !isContainerReceived(container))
    .slice()
    .sort((a, b) => a.portDate.localeCompare(b.portDate));

  const transitRows: TransitRow[] = [
    ...inbound.map((container) => ({
      id: container.id,
      poNumber: container.poNumber,
      containerNo: container.containerNo,
      supplier: container.supplier,
      status: container.status,
      location: `${container.origin.split(",")[0]}, ${container.origin.split(",")[2]?.trim() ?? ""}`,
      eta: shortDate(container.portDate),
      units: container.items.reduce((sum, item) => sum + item.qty, 0),
      products: container.items.length,
    })),
    {
      id: "mock-1",
      poNumber: "240",
      containerNo: "COSU1234567",
      supplier: "Highlift",
      status: "At origin port",
      location: "Ningbo, China",
      eta: "Jun 28, 2025",
      units: 320,
      products: 27,
    },
    {
      id: "mock-2",
      poNumber: "239",
      containerNo: "SEGU9876543",
      supplier: "Qingdao Hiker",
      status: "At destination port",
      location: "Long Beach, USA",
      eta: "Jun 20, 2025",
      units: 410,
      products: 31,
    },
    {
      id: "mock-3",
      poNumber: "238",
      containerNo: "TCLU5566778",
      supplier: "Yizhan Machinery",
      status: "Released from port",
      location: "Los Angeles, USA",
      eta: "Jun 18, 2025",
      units: 380,
      products: 28,
    },
    {
      id: "mock-4",
      poNumber: "237",
      containerNo: "BMOU1122334",
      supplier: "Yizhan Machinery",
      status: "In transit",
      location: "On Vessel",
      eta: "Jul 14, 2025",
      units: 610,
      products: 49,
    },
  ].slice(0, 5);

  const kpiCards = [
    {
      title: "Inventory on Floor",
      value: totalFloor,
      sub: "Units available now",
      trend: `${Math.max(1, Math.round(totalFloor / 8))} vs last 30 days`,
      icon: PackageOpen,
      iconBg: "bg-[#163f78]",
      chartStroke: "stroke-[#2f6ccb]",
      tone: "text-[#2f6ccb]",
    },
    {
      title: "Incoming Units",
      value: totalIncoming,
      sub: "On containers",
      trend: `Next arrival: ${shortDate(inbound[0]?.portDate ?? "")}`,
      icon: ShipWheel,
      iconBg: "bg-[#1e4f9f]",
      chartStroke: "stroke-[#2f6ccb]",
      tone: "text-[#2f6ccb]",
    },
    {
      title: "Assigned / Sold",
      value: totalAssigned,
      sub: "Units committed",
      trend: `${Math.max(1, Math.round(totalAssigned / 10))} vs last 30 days`,
      icon: ClipboardCheck,
      iconBg: "bg-[#9d6a1b]",
      chartStroke: "stroke-[#c2871f]",
      tone: "text-[#b7791f]",
    },
    {
      title: "Backordered Units",
      value: oversoldUnits,
      sub: "Units oversold",
      trend: oversoldUnits > 0 ? "Action needed" : "No issues",
      icon: AlertTriangle,
      iconBg: "bg-[#a61f24]",
      chartStroke: "stroke-[#c93d42]",
      tone: oversoldUnits > 0 ? "text-[#8b1e24]" : "text-[#2f6b4f]",
    },
  ] as const;

  const activity = [
    {
      icon: Container,
      color: "bg-[#1e3a5f]",
      title: `Container PO #${inbound[0]?.poNumber ?? "241"} status updated`,
      sub: inbound[0]?.status ?? "On Ship",
      ago: "1h ago",
    },
    {
      icon: CheckCheck,
      color: "bg-[#2f6b4f]",
      title: `Order #${ordersReady[0]?.invoiceNo ?? "126088"} approved for shipping`,
      sub: `${ordersReady[0]?.customerName ?? "4PHR-9X"} (${ordersReady[0]?.lines.reduce((s, l) => s + l.qty, 0) ?? 2} units)`,
      ago: "2h ago",
    },
    {
      icon: Boxes,
      color: "bg-[#374151]",
      title: "Inventory received into warehouse",
      sub: `PO #${containerShipments[2]?.poNumber ?? "238"} - ${containerShipments[2]?.items.reduce((s, i) => s + i.qty, 0) ?? 28} units`,
      ago: "4h ago",
    },
    {
      icon: AlertTriangle,
      color: "bg-[#b7791f]",
      title: `Product ${erpProducts[0]?.sku ?? "4PHR-9X"} is oversold by ${Math.max(0, oversoldUnits)} units`,
      sub: "View backorder report",
      ago: "6h ago",
    },
    {
      icon: Container,
      color: "bg-[#1e3a5f]",
      title: `Container PO #${inbound[1]?.poNumber ?? "240"} arrived at origin port`,
      sub: inbound[1]?.origin.split(",").slice(0, 2).join(", ") ?? "Ningbo, China",
      ago: "8h ago",
    },
  ];

  return (
    <section className="space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[48px] font-bold leading-[1] tracking-tight text-[#192536]">Good morning, Kadie.</h1>
          <p className="text-[14px] text-[#5c6878]">Operations dashboard for sales, warehouse, and management.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="inline-flex h-9 items-center gap-2 rounded-full border border-[#d9e1eb] bg-white px-3.5 text-[13px] text-[#667589] shadow-sm">
            <Search className="h-3.5 w-3.5" />
            <span>Search anything...</span>
            <span className="rounded-md bg-[#f1f4f9] px-1.5 py-0.5 text-[11px] font-semibold text-[#5e6b7a]">K</span>
          </button>

          <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9e1eb] bg-white text-[#415165] shadow-sm">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#b81d24] text-[10px] font-bold text-white">3</span>
          </button>
        </div>
      </header>

      <div className="grid gap-3 xl:grid-cols-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="relative min-h-[152px] overflow-hidden rounded-xl border border-[#d8e0eb] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-3.5 py-3 shadow-[0_20px_38px_-32px_rgba(15,23,42,0.45)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5c697b]">{card.title}</p>
                  <p className="mt-0.5 text-[52px] font-bold leading-none text-[#172436]">{card.value}</p>
                  <p className="mt-0.5 text-[12px] font-medium text-[#334155]">{card.sub}</p>
                </div>
                <div className={`rounded-lg p-2 text-white ${card.iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className={`mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold ${card.tone}`}>
                <TrendingUp className="h-3 w-3" />
                {card.trend}
              </p>
              <svg viewBox="0 0 96 32" className="pointer-events-none absolute bottom-1.5 right-1.5 h-8 w-20 opacity-60" fill="none" strokeWidth="1.7">
                <path d={chartPath(index)} className={card.chartStroke} />
              </svg>
            </article>
          );
        })}
      </div>

      <div className="grid gap-3 xl:grid-cols-[2fr_1.15fr]">
        <section className="overflow-hidden rounded-xl border border-[#d8e0eb] bg-white shadow-[0_20px_38px_-32px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between bg-[linear-gradient(90deg,#111d31_0%,#091223_100%)] px-4 py-2.5 text-white">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.1em]">Containers in Transit</h2>
            <Link href="/containers" className="text-[12px] font-semibold text-[#ef2d35]">View all containers</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[13px]">
              <thead className="bg-[#f7f9fc] text-[11px] uppercase tracking-[0.08em] text-[#65758a]">
                <tr>
                  <th className="px-3.5 py-2.5">Container / PO #</th>
                  <th className="px-3.5 py-2.5">Supplier</th>
                  <th className="px-3.5 py-2.5">Status</th>
                  <th className="px-3.5 py-2.5">Location</th>
                  <th className="px-3.5 py-2.5">ETA</th>
                  <th className="px-3.5 py-2.5">Units</th>
                  <th className="px-3.5 py-2.5">Products</th>
                  <th className="px-3.5 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {transitRows.map((container) => {
                  return (
                    <tr key={container.id} className="border-t border-[#e5eaf1] hover:bg-[#fafcff]">
                      <td className="px-3.5 py-2.5">
                        <p className="font-bold text-[#172436]">PO #{container.poNumber}</p>
                        <p className="text-[11px] text-[#65758a]">{container.containerNo}</p>
                      </td>
                      <td className="px-3.5 py-2.5 text-[#334155] whitespace-normal max-w-[120px] leading-4.5">{container.supplier}</td>
                      <td className="px-3.5 py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${statusTone(container.status)}`}>
                          {container.status}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-[#334155]">{container.location}</td>
                      <td className="px-3.5 py-2.5 text-[#1f2e40]">{container.eta}</td>
                      <td className="px-3.5 py-2.5 font-semibold text-[#1f2e40]">{container.units}</td>
                      <td className="px-3.5 py-2.5 font-semibold text-[#1f2e40]">{container.products}</td>
                      <td className="px-3.5 py-2.5 text-right text-[#95a2b4]">›</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[#e5eaf1] px-4 py-2 text-center text-[12px] font-semibold text-[#b81d24]">View all containers →</div>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#d8e0eb] bg-white shadow-[0_20px_38px_-32px_rgba(15,23,42,0.45)]">
          <div className="bg-[linear-gradient(90deg,#111d31_0%,#091223_100%)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">Recent Activity</div>
          <div className="divide-y divide-[#e5eaf1] px-1">
            {activity.map((item) => {
              const Icon = item.icon;
              return (
                <article key={`${item.title}-${item.ago}`} className="flex items-start gap-2.5 px-3.5 py-3">
                  <div className={`rounded-full p-1.5 text-white ${item.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[#172436]">{item.title}</p>
                    <p className={`text-[12px] ${item.sub === "View backorder report" ? "font-semibold text-[#b91c1c]" : "text-[#475569]"}`}>{item.sub}</p>
                  </div>
                  <span className="pt-0.5 text-[11px] text-[#65758a]">{item.ago}</span>
                </article>
              );
            })}
          </div>
          <div className="border-t border-[#e5eaf1] px-4 py-2 text-center text-[12px] font-semibold text-[#b81d24]">View all activity →</div>
        </section>
      </div>

      <div className="grid gap-3 xl:grid-cols-[2fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-[#d8e0eb] shadow-[0_20px_38px_-32px_rgba(15,23,42,0.45)]">
          <div className="bg-[linear-gradient(90deg,#111d31_0%,#091223_100%)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">Priority Actions</div>
          <div className="grid gap-px bg-[#1f2937] sm:grid-cols-2 xl:grid-cols-4">
            <PriorityCard
              tone="red"
              value={ordersWaiting.length}
              title="Orders Waiting Approval"
              desc="Paid or partially paid invoices need approval."
              cta="Review Now"
              icon={ClipboardCheck}
            />
            <PriorityCard
              tone="blue"
              value={inbound.length}
              title="Container Arriving Soon"
              desc={`PO #${inbound[0]?.poNumber ?? "---"} arriving ${shortDate(inbound[0]?.portDate ?? "")}`}
              cta="View Container"
              icon={ShipWheel}
            />
            <PriorityCard
              tone="amber"
              value={lowProducts}
              title="Products Running Low"
              desc="Track low products before sales over-commit stock."
              cta="View Inventory"
              icon={AlertTriangle}
            />
            <PriorityCard
              tone="navy"
              value={ordersReady.length}
              title="Orders Ready To Ship"
              desc="Approved and ready for warehouse pick and ship."
              cta="View Orders"
              icon={CheckCheck}
            />
          </div>
        </section>

        <div className="space-y-3">
          <section className="overflow-hidden rounded-xl border border-[#d8e0eb] bg-white shadow-[0_20px_38px_-32px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between bg-[linear-gradient(90deg,#111d31_0%,#091223_100%)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
              <span>Arriving Next 7 Days</span>
              <span className="text-[11px] text-[#ef2d35]">View schedule</span>
            </div>
            <div className="divide-y divide-[#e5eaf1] px-3 py-0.5">
              {transitRows.slice(0, 3).map((container) => (
                <div key={`schedule-${container.id}`} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2.5 py-2 text-[13px]">
                  <span className="text-[#334155]">{container.eta}</span>
                  <span className="font-semibold text-[#172436]">PO #{container.poNumber}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${statusTone(container.status)}`}>{container.status}</span>
                  <span className="text-[#334155]">{container.units} units</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#e5eaf1] px-4 py-2 text-center text-[12px] font-semibold text-[#b81d24]">View full schedule →</div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#d8e0eb] bg-white shadow-[0_20px_38px_-32px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between bg-[linear-gradient(90deg,#111d31_0%,#091223_100%)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
              <span>Integrations Status</span>
              <span className="text-[11px] text-[#22c55e]">All systems operational</span>
            </div>
            <div className="flex flex-wrap gap-2 p-3">
              {["Supabase", "QuickBooks", "Vercel", "Container Tracking"].map((chip) => (
                <span key={chip} className="inline-flex items-center gap-2 rounded-full border border-[#d9e2ec] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#233143]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                  {chip}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

      <p className="pt-0.5 text-center text-[11px] text-[#7b8798]">© 2025 Olympic Equipment LLC. All rights reserved.</p>
    </section>
  );
}

function PriorityCard({
  tone,
  value,
  title,
  desc,
  cta,
  icon: Icon,
}: {
  tone: "red" | "blue" | "amber" | "navy";
  value: number;
  title: string;
  desc: string;
  cta: string;
  icon: ComponentType<{ className?: string }>;
}) {
  const toneClass =
    tone === "red"
      ? "from-[#421017]/95 via-[#2f0b11]/95 to-[#1f070b]/95"
      : tone === "blue"
        ? "from-[#102847]/95 via-[#0c1f39]/95 to-[#08162a]/95"
        : tone === "amber"
          ? "from-[#402b11]/95 via-[#2e1f0d]/95 to-[#1f1408]/95"
          : "from-[#0d223f]/95 via-[#0a1b33]/95 to-[#071325]/95";

  const iconClass =
    tone === "red"
      ? "bg-[#b81d24]"
      : tone === "blue"
        ? "bg-[#1d4b9b]"
        : tone === "amber"
          ? "bg-[#a26a11]"
          : "bg-[#1e3a5f]";

  const ctaClass =
    tone === "red"
      ? "text-[#ef2d35]"
      : tone === "blue"
        ? "text-[#6aa7ff]"
        : tone === "amber"
          ? "text-[#f6b23c]"
          : "text-[#99c3ff]";

  return (
    <article className={`relative min-h-[166px] overflow-hidden bg-gradient-to-br ${toneClass} px-3 py-3 text-white`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_40%)]" />
      <div className="relative">
        <div className={`inline-flex rounded-full p-2 ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="mt-2 text-[44px] font-bold leading-none">{value}</p>
        <p className="mt-1 text-[13px] font-semibold">{title}</p>
        <p className="mt-1.5 text-[11px] leading-4.5 text-white/74">{desc}</p>
        <p className={`mt-2.5 text-[12px] font-semibold ${ctaClass}`}>{cta} →</p>
      </div>
    </article>
  );
}
