"use client";

import { useMemo, useState } from "react";
import { computeProductAvailability, deriveAssignmentsFromApprovedInvoices, type ProductAvailabilitySnapshot } from "@/lib/inventory-core";
import { containerShipments, customerInvoices, erpProducts } from "@/lib/inventory-data";
import { ArrowUpRightIcon, CheckIcon, ClockIcon, ContainersIcon, InventoryIcon, OrdersIcon, ShipIcon } from "@/components/line-icons";
import type { ComponentType, ReactNode } from "react";

export default function AvailabilityPage() {
  const assignments = useMemo(() => deriveAssignmentsFromApprovedInvoices(customerInvoices), []);
  const rows = useMemo(
    () => erpProducts.map((product) => ({ product, snapshot: computeProductAvailability(product, assignments, containerShipments) })),
    [assignments],
  );

  const [selectedProductId, setSelectedProductId] = useState(rows[0]?.product.id ?? "");
  const selectedRow = rows.find((row) => row.product.id === selectedProductId) ?? rows[0];

  return (
    <section className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
      <div className="space-y-5">
        <header className="rounded-[20px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
          <p className="text-sm font-medium text-[var(--text-muted)]">Availability</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Sales-first stock visibility</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
            Available now means floor plus in stock. Total on order follows immediately after, so sales and warehouse teams can read the sheet the same way.
          </p>
        </header>

        <div className="overflow-hidden rounded-[20px] border border-[var(--line-soft)] bg-white shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
          <div className="max-h-[72vh] overflow-auto">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-[var(--line-soft)] bg-[var(--bg-page)] text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">On Floor</th>
                  <th className="px-5 py-4">In Stock</th>
                  <th className="px-5 py-4">Sold</th>
                  <th className="px-5 py-4">For Sale</th>
                  <th className="px-5 py-4">Available Now</th>
                  <th className="px-5 py-4">Total On Order</th>
                  <th className="px-5 py-4">Next Container</th>
                  <th className="px-5 py-4">ETA</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ product, snapshot }) => {
                  const active = product.id === selectedProductId;
                  return (
                    <tr
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`cursor-pointer border-b border-[var(--line-soft)] transition-colors ${active ? "bg-[var(--status-blue-bg)]/50" : "hover:bg-[var(--bg-page)]/80"}`}
                    >
                      <td className="px-5 py-4 align-top">
                        <p className="font-semibold text-[var(--text-primary)]">{product.name}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{product.sku} • {product.category}</p>
                      </td>
                      <td className="px-5 py-4 align-top">{numberBadge(snapshot.floorQty, "gray")}</td>
                      <td className="px-5 py-4 align-top">{numberBadge(snapshot.inStockQty, "blue")}</td>
                      <td className="px-5 py-4 align-top">{numberBadge(snapshot.soldAssignedQty, "orange")}</td>
                      <td className="px-5 py-4 align-top">{numberBadge(snapshot.forSaleQty, snapshot.forSaleQty > 0 ? "green" : "orange")}</td>
                      <td className="px-5 py-4 align-top">{numberBadge(snapshot.availableNowQty, snapshot.availableNowQty > 0 ? "green" : "red")}</td>
                      <td className="px-5 py-4 align-top">{numberBadge(snapshot.onOrderQty, "blue")}</td>
                      <td className="px-5 py-4 align-top font-medium text-[var(--text-primary)]">{snapshot.nextContainerNo ?? "—"}</td>
                      <td className="px-5 py-4 align-top text-[var(--text-muted)]">{snapshot.nextContainerDate ?? "—"}</td>
                      <td className="px-5 py-4 align-top">
                        <button className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] shadow-sm hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]">
                          View
                          <ArrowUpRightIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-[20px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
          <p className="text-sm font-medium text-[var(--text-muted)]">Selected product</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight">{selectedRow?.product.name}</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{selectedRow?.product.sku} • {selectedRow?.product.category}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <SummaryTile label="Available now" value={selectedRow?.snapshot.availableNowQty ?? 0} tone="green" icon={CheckIcon} />
            <SummaryTile label="Incoming" value={selectedRow?.snapshot.onOrderQty ?? 0} tone="blue" icon={ShipIcon} />
            <SummaryTile label="Sold" value={selectedRow?.snapshot.soldAssignedQty ?? 0} tone="orange" icon={OrdersIcon} />
            <SummaryTile label="On floor" value={selectedRow?.snapshot.floorQty ?? 0} tone="gray" icon={InventoryIcon} />
          </div>
        </div>

        <DetailBlock title="Customer allocations" tone="green" icon={CheckIcon}>
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            {customerInvoices
              .filter((invoice) => invoice.approvedByShipping)
              .flatMap((invoice) => invoice.lines.map((line) => ({ invoice, line })))
              .filter(({ line }) => line.erpProductId === selectedRow?.product.id)
              .map(({ invoice, line }) => (
                <li key={`${invoice.invoiceNo}-${line.erpProductId}`} className="rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-page)] px-3 py-2">
                  <p className="font-medium text-[var(--text-primary)]">{invoice.customerName}</p>
                  <p className="text-xs">Invoice {invoice.invoiceNo} • Qty {line.qty}</p>
                </li>
              ))}
            {!customerInvoices.some((invoice) => invoice.approvedByShipping && invoice.lines.some((line) => line.erpProductId === selectedRow?.product.id)) ? (
              <li className="text-sm text-[var(--text-muted)]">No customer allocation yet.</li>
            ) : null}
          </ul>
        </DetailBlock>

        <DetailBlock title="Incoming containers" tone="blue" icon={ContainersIcon}>
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            {containerShipments
              .filter((container) => container.items.some((item) => item.erpProductId === selectedRow?.product.id))
              .map((container) => (
                <li key={container.id} className="rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-page)] px-3 py-2">
                  <p className="font-medium text-[var(--text-primary)]">{container.containerNo}</p>
                  <p className="text-xs">ETA {container.portDate} • {container.portName}</p>
                </li>
              ))}
            {!containerShipments.some((container) => container.items.some((item) => item.erpProductId === selectedRow?.product.id)) ? (
              <li className="text-sm text-[var(--text-muted)]">No inbound containers.</li>
            ) : null}
          </ul>
        </DetailBlock>

        <DetailBlock title="Allocation timeline" tone="orange" icon={ClockIcon}>
          <div className="space-y-3 text-sm text-[var(--text-muted)]">
            <TimelineRow label="On floor" value={selectedRow?.snapshot.floorQty ?? 0} total={timelineTotal(selectedRow?.snapshot)} />
            <TimelineRow label="In stock" value={selectedRow?.snapshot.inStockQty ?? 0} total={timelineTotal(selectedRow?.snapshot)} />
            <TimelineRow label="Incoming" value={selectedRow?.snapshot.onOrderQty ?? 0} total={timelineTotal(selectedRow?.snapshot)} />
          </div>
        </DetailBlock>
      </aside>
    </section>
  );
}

function numberBadge(value: number, tone: "green" | "blue" | "orange" | "red" | "gray") {
  const toneClasses = {
    green: "bg-[var(--status-green-bg)] text-[var(--status-green-text)]",
    blue: "bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]",
    orange: "bg-[var(--status-yellow-bg)] text-[var(--status-yellow-text)]",
    red: "bg-[var(--status-red-bg)] text-[var(--status-red-text)]",
    gray: "bg-[var(--status-gray-bg)] text-[var(--status-gray-text)]",
  } as const;

  return <span className={`inline-flex min-w-16 justify-center rounded-full px-3 py-1 text-sm font-semibold ${toneClasses[tone]}`}>{value}</span>;
}

function SummaryTile({ label, value, tone, icon: Icon }: { label: string; value: number; tone: "green" | "blue" | "orange" | "gray"; icon: React.ComponentType<{ className?: string }> }) {
  const toneClasses = {
    green: "bg-[var(--status-green-bg)] text-[var(--status-green-text)]",
    blue: "bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]",
    orange: "bg-[var(--status-yellow-bg)] text-[var(--status-yellow-text)]",
    gray: "bg-[var(--status-gray-bg)] text-[var(--status-gray-text)]",
  } as const;

  return (
    <div className={`rounded-2xl px-4 py-3 ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] opacity-80">{label}</p>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function DetailBlock({ title, tone, icon: Icon, children }: { title: string; tone: "green" | "blue" | "orange" | "gray"; icon: ComponentType<{ className?: string }>; children: ReactNode }) {
  const toneClasses = {
    green: "border-[var(--status-green-bg)]",
    blue: "border-[var(--status-blue-bg)]",
    orange: "border-[var(--status-yellow-bg)]",
    gray: "border-[var(--status-gray-bg)]",
  } as const;

  return (
    <div className={`rounded-[20px] border ${toneClasses[tone]} bg-white p-5 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]`}>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-[var(--brand-secondary)]" />
        <h4 className="text-base font-semibold">{title}</h4>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function TimelineRow({ label, value, total }: { label: string; value: number; total: number }) {
  const width = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-[0.14em]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-page)]">
        <div className="h-full rounded-full bg-[var(--status-blue-text)] transition-[width] duration-700" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function timelineTotal(snapshot?: ProductAvailabilitySnapshot) {
  if (!snapshot) {
    return 0;
  }

  return snapshot.floorQty + snapshot.inStockQty + snapshot.onOrderQty;
}
