import Link from "next/link";
import type { ComponentType } from "react";
import { containerShipments, erpProducts } from "@/lib/inventory-data";
import { getContainerLineCount, getContainerTotalUnits } from "@/lib/inventory-core";
import { ArrowUpRightIcon, ClockIcon, ContainersIcon, IncomingIcon, ShipIcon } from "@/components/line-icons";

const containerTimeline = ["Ordered", "At Factory", "At Origin Port", "On Vessel", "Destination Port", "Released", "Warehouse"] as const;

export default function ContainersPage() {
  return (
    <section className="space-y-5">
      <header className="rounded-[20px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
        <p className="text-sm font-medium text-[var(--text-muted)]">Containers</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">Tracking timeline and inbound flow</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
          Each container is presented like a status card with a progress timeline so the team can see where inventory is without reading a wall of text.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {containerShipments.map((container) => {
          const completedSteps = container.status === "Arrived at warehouse" ? 7 : container.status === "Released from port" ? 6 : container.status === "At destination port" ? 5 : container.status === "On the ship" ? 4 : container.status === "At origin port" ? 3 : 2;

          return (
            <article key={container.id} className="card-hover rounded-[20px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="rounded-2xl bg-[var(--bg-page)] p-3 text-[var(--status-blue-text)]">
                    <ShipIcon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">Container #{container.poNumber}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{container.supplier}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(container.inventoryStatus)}`}>
                  {container.inventoryStatus}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-[var(--text-muted)]">
                <p><span className="font-medium text-[var(--text-primary)]">ETA:</span> {container.portDate}</p>
                <p><span className="font-medium text-[var(--text-primary)]">Delivery:</span> {container.deliveryDate}</p>
                <p><span className="font-medium text-[var(--text-primary)]">Payment:</span> {container.paymentStatus}</p>
                <p><span className="font-medium text-[var(--text-primary)]">Units:</span> {getContainerTotalUnits(container)}</p>
              </div>

              <div className="mt-5">
                <Timeline completed={completedSteps} />
                <div className="mt-3 grid grid-cols-7 gap-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  {containerTimeline.map((step, index) => (
                    <span key={step} className={`${index < completedSteps ? "text-[var(--status-blue-text)]" : "text-[var(--text-muted)]"}`}>
                      {step}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <MiniStat label="Lines" value={getContainerLineCount(container)} icon={ContainersIcon} />
                <MiniStat label="Units" value={getContainerTotalUnits(container)} icon={IncomingIcon} />
                <MiniStat label="Track" value={container.trackingConnected ? 1 : 0} icon={ClockIcon} />
              </div>

              <div className="mt-5 space-y-2 rounded-2xl bg-[var(--bg-page)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Products inside</p>
                <div className="space-y-2 text-sm text-[var(--text-muted)]">
                  {container.items.map((item) => {
                    const product = erpProducts.find((entry) => entry.id === item.erpProductId);
                    return (
                      <div key={item.erpProductId} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 shadow-sm">
                        <span className="font-medium text-[var(--text-primary)]">{product?.name ?? item.erpProductId}</span>
                        <span>{item.qty}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <Link href={`/containers/${container.id}`} className="inline-flex items-center gap-2 font-medium text-[var(--brand-accent)]">
                  View container
                  <ArrowUpRightIcon className="h-4 w-4" />
                </Link>
                <span className="text-xs text-[var(--text-muted)]">{container.trackingSource}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="rounded-[20px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Products on incoming containers</h3>
            <p className="text-sm text-[var(--text-muted)]">Quick visibility for what&apos;s coming next.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {erpProducts.map((product) => (
            <div key={product.id} className="rounded-[18px] border border-[var(--line-soft)] bg-[var(--bg-page)] p-4">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{product.name}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{product.category}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function statusTone(value: string) {
  if (value.includes("Received")) {
    return "bg-[var(--status-green-bg)] text-[var(--status-green-text)]";
  }

  if (value.includes("On the ship")) {
    return "bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]";
  }

  if (value.includes("Port") || value.includes("Factory")) {
    return "bg-[var(--status-yellow-bg)] text-[var(--status-yellow-text)]";
  }

  return "bg-[var(--status-gray-bg)] text-[var(--status-gray-text)]";
}

function Timeline({ completed }: { completed: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {containerTimeline.map((step, index) => {
        const done = index < completed;
        return (
          <div key={step} className="flex flex-1 items-center gap-1.5 last:flex-none">
            <span className={`h-3 w-3 rounded-full border ${done ? "border-[var(--status-blue-text)] bg-[var(--status-blue-text)]" : "border-[var(--line-soft)] bg-white"}`} />
            {index < containerTimeline.length - 1 ? <span className={`h-[2px] flex-1 ${done ? "bg-[var(--status-blue-text)]" : "bg-[var(--line-soft)]"}`} /> : null}
          </div>
        );
      })}
    </div>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: number; icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl bg-[var(--bg-page)] px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
        <Icon className="h-4 w-4 text-[var(--brand-secondary)]" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
