import { Activity, AlertTriangle, Boxes, CheckCheck, Container, ShipWheel } from "lucide-react";

const allActivity = [
  {
    id: "a1",
    icon: Container,
    iconBg: "bg-[#1e3a5f]",
    title: "Container PO #241 status updated",
    detail: "On Ship",
    ago: "1h ago",
  },
  {
    id: "a2",
    icon: CheckCheck,
    iconBg: "bg-[#2f6b4f]",
    title: "Order #126088 approved for shipping",
    detail: "4PHR-9X (2 units)",
    ago: "2h ago",
  },
  {
    id: "a3",
    icon: Boxes,
    iconBg: "bg-[#374151]",
    title: "Inventory received into warehouse",
    detail: "PO #238 - 28 units",
    ago: "4h ago",
  },
  {
    id: "a4",
    icon: AlertTriangle,
    iconBg: "bg-[#b7791f]",
    title: "Product 4PHR-9X is oversold by 5 units",
    detail: "View backorder report",
    ago: "6h ago",
  },
  {
    id: "a5",
    icon: Container,
    iconBg: "bg-[#1e3a5f]",
    title: "Container PO #240 arrived at origin port",
    detail: "Ningbo, China",
    ago: "8h ago",
  },
  {
    id: "a6",
    icon: ShipWheel,
    iconBg: "bg-[#1e4f9f]",
    title: "Container PO #239 cleared destination port",
    detail: "Long Beach, USA",
    ago: "10h ago",
  },
];

export default function ActivityPage() {
  return (
    <section className="mx-auto w-full max-w-5xl space-y-4">
      <header className="rounded-xl border border-[#d8e0eb] bg-white px-5 py-4 shadow-[0_20px_38px_-32px_rgba(15,23,42,0.45)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#5c697b]">Operations</p>
        <div className="mt-1 flex items-center gap-2">
          <Activity className="h-5 w-5 text-[#1e3a5f]" />
          <h1 className="text-[28px] font-bold tracking-tight text-[#172436]">Recent Activity</h1>
        </div>
        <p className="mt-1 text-[13px] text-[#5c6878]">
          Full stream of logistics, inventory, and order events.
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-[#d8e0eb] bg-white shadow-[0_20px_38px_-32px_rgba(15,23,42,0.45)]">
        <div className="bg-[linear-gradient(90deg,#111d31_0%,#091223_100%)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
          All Recent Activity
        </div>
        <div className="divide-y divide-[#e5eaf1] px-1">
          {allActivity.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.id} className="flex items-start gap-3 px-4 py-3.5">
                <div className={`rounded-full p-2 text-white ${item.iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-[#172436]">{item.title}</p>
                  <p className={`text-[13px] ${item.detail === "View backorder report" ? "font-semibold text-[#b91c1c]" : "text-[#475569]"}`}>{item.detail}</p>
                </div>
                <span className="pt-0.5 text-[11px] text-[#65758a]">{item.ago}</span>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
