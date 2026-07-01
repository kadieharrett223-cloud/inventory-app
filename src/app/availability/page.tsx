"use client";

import { useMemo, useState } from "react";
import { computeProductAvailability, deriveAssignmentsFromApprovedInvoices } from "@/lib/inventory-core";
import { containerShipments, customerInvoices, erpProducts } from "@/lib/inventory-data";

export default function AvailabilityPage() {
  const assignments = useMemo(() => deriveAssignmentsFromApprovedInvoices(customerInvoices), []);
  const snapshots = useMemo(
    () => erpProducts.map((product) => ({ product, snapshot: computeProductAvailability(product, assignments, containerShipments) })),
    [assignments],
  );

  const [selectedProductId, setSelectedProductId] = useState(snapshots[0]?.product.id ?? "");

  const selected = snapshots.find((entry) => entry.product.id === selectedProductId) ?? snapshots[0];

  return (
    <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-5">
        <div className="rounded-[20px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_10px_26px_-24px_rgba(17,24,39,0.28)]">
          <p className="text-sm font-medium text-[var(--text-muted)]">Availability</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">What can we sell right now?</h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--text-muted)]">
            This replaces the spreadsheet math: product, available, incoming, sold, next container, and ETA.
          </p>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-[var(--line-soft)] bg-white shadow-[0_10px_26px_-24px_rgba(17,24,39,0.28)]">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] text-left text-sm">
              <thead className="bg-[var(--bg-page)] text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Available</th>
                  <th className="px-5 py-4">Incoming</th>
                  <th className="px-5 py-4">Sold</th>
                  <th className="px-5 py-4">Next Container</th>
                  <th className="px-5 py-4">ETA</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map(({ product, snapshot }) => {
                  const isActive = product.id === selectedProductId;
                  return (
                    <tr
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`cursor-pointer border-t border-[var(--line-soft)] ${isActive ? "bg-[var(--status-blue-bg)]/50" : "hover:bg-[var(--bg-page)]/80"}`}
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{product.sku} • {product.category}</p>
                      </td>
                      <td className="px-5 py-4">
                        <MetricNumber value={snapshot.availableNowQty} tone={snapshot.availableNowQty > 0 ? "green" : snapshot.availableNowQty === 0 ? "orange" : "red"} />
                      </td>
                      <td className="px-5 py-4">
                        <MetricNumber value={snapshot.onOrderQty} tone="blue" />
                      </td>
                      <td className="px-5 py-4">
                        <MetricNumber value={snapshot.soldAssignedQty} tone="gray" />
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-[var(--text-primary)]">{snapshot.nextContainerNo ?? "—"}</td>
                      <td className="px-5 py-4 text-sm text-[var(--text-muted)]">{snapshot.nextContainerDate ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-[20px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_10px_26px_-24px_rgba(17,24,39,0.28)]">
          <p className="text-sm font-medium text-[var(--text-muted)]">Selected product</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight">{selected?.product.name}</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{selected?.product.sku} • {selected?.product.category}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoCard label="Available now" value={String(selected?.snapshot.availableNowQty ?? 0)} tone="green" />
            <InfoCard label="Incoming" value={String(selected?.snapshot.onOrderQty ?? 0)} tone="blue" />
            <InfoCard label="Sold / assigned" value={String(selected?.snapshot.soldAssignedQty ?? 0)} tone="gray" />
            <InfoCard label="For sale" value={String(selected?.snapshot.forSaleQty ?? 0)} tone="orange" />
          </div>
        </div>

        <DetailBlock title="Waiting customers" tone="green">
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            {customerInvoices
              .filter((invoice) => invoice.approvedByShipping)
              .flatMap((invoice) => invoice.lines.map((line) => ({ invoice, line })))
              .filter(({ line }) => line.erpProductId === selected?.product.id)
              .map(({ invoice, line }) => (
                <li key={`${invoice.invoiceNo}-${line.erpProductId}`} className="rounded-xl border border-[var(--line-soft)] bg-[var(--bg-page)] px-3 py-2">
                  <p className="font-medium text-[var(--text-primary)]">{invoice.customerName}</p>
                  <p className="text-xs">Invoice {invoice.invoiceNo} • Qty {line.qty}</p>
                </li>
              ))}
            {!customerInvoices.some((invoice) => invoice.approvedByShipping && invoice.lines.some((line) => line.erpProductId === selected?.product.id)) ? (
              <li className="text-sm text-[var(--text-muted)]">No customers assigned yet.</li>
            ) : null}
          </ul>
        </DetailBlock>

        <DetailBlock title="Incoming containers" tone="blue">
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            {containerShipments
              .filter((container) => container.items.some((item) => item.erpProductId === selected?.product.id))
              .map((container) => (
                <li key={container.id} className="rounded-xl border border-[var(--line-soft)] bg-[var(--bg-page)] px-3 py-2">
                  <p className="font-medium text-[var(--text-primary)]">{container.containerNo}</p>
                  <p className="text-xs">ETA {container.portDate} • {container.portName}</p>
                </li>
              ))}
            {!containerShipments.some((container) => container.items.some((item) => item.erpProductId === selected?.product.id)) ? (
              <li className="text-sm text-[var(--text-muted)]">No incoming containers.</li>
            ) : null}
          </ul>
        </DetailBlock>

        <DetailBlock title="Inventory timeline" tone="orange">
          <div className="space-y-3 text-sm text-[var(--text-muted)]">
            <ProgressRow label="On floor" value={selected?.snapshot.floorQty ?? 0} total={(selected?.snapshot.floorQty ?? 0) + (selected?.snapshot.inStockQty ?? 0) + (selected?.snapshot.onOrderQty ?? 0)} />
            <ProgressRow label="In stock" value={selected?.snapshot.inStockQty ?? 0} total={(selected?.snapshot.floorQty ?? 0) + (selected?.snapshot.inStockQty ?? 0) + (selected?.snapshot.onOrderQty ?? 0)} />
            <ProgressRow label="Incoming" value={selected?.snapshot.onOrderQty ?? 0} total={(selected?.snapshot.floorQty ?? 0) + (selected?.snapshot.inStockQty ?? 0) + (selected?.snapshot.onOrderQty ?? 0)} />
          </div>
        </DetailBlock>

        <DetailBlock title="Allocation" tone="gray">
          <p className="text-sm text-[var(--text-muted)]">
            Available now is on floor plus in stock. Total on order appears after available now. The next container and ETA show what can cover the next sale.
          </p>
        </DetailBlock>
      </aside>
    </section>
  );
}

function MetricNumber({ value, tone }: { value: number; tone: "green" | "blue" | "orange" | "red" | "gray" }) {
  const toneClasses: Record<string, string> = {
    green: "bg-[var(--status-green-bg)] text-[var(--status-green-text)]",
    blue: "bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]",
    orange: "bg-[var(--status-yellow-bg)] text-[var(--status-yellow-text)]",
    red: "bg-[var(--status-red-bg)] text-[var(--status-red-text)]",
    gray: "bg-[var(--status-gray-bg)] text-[var(--status-gray-text)]",
  };

  return <span className={`inline-flex min-w-16 justify-center rounded-full px-3 py-1 text-sm font-semibold ${toneClasses[tone]}`}>{value}</span>;
}

function InfoCard({ label, value, tone }: { label: string; value: string; tone: "green" | "blue" | "orange" | "gray" }) {
  const toneClasses: Record<string, string> = {
    green: "bg-[var(--status-green-bg)] text-[var(--status-green-text)]",
    blue: "bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]",
    orange: "bg-[var(--status-yellow-bg)] text-[var(--status-yellow-text)]",
    gray: "bg-[var(--status-gray-bg)] text-[var(--status-gray-text)]",
  };

  return (
    <div className={`rounded-2xl px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function DetailBlock({ title, tone, children }: { title: string; tone: "green" | "blue" | "orange" | "gray"; children: React.ReactNode }) {
  const toneClasses: Record<string, string> = {
    green: "border-[var(--status-green-bg)]",
    blue: "border-[var(--status-blue-bg)]",
    orange: "border-[var(--status-yellow-bg)]",
    gray: "border-[var(--status-gray-bg)]",
  };

  return (
    <div className={`rounded-[20px] border ${toneClasses[tone]} bg-white p-5 shadow-[0_10px_26px_-24px_rgba(17,24,39,0.28)]`}>
      <h4 className="text-base font-semibold">{title}</h4>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ProgressRow({ label, value, total }: { label: string; value: number; total: number }) {
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
