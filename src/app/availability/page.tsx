"use client";

import { useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { computeProductAvailability, deriveAssignmentsFromApprovedInvoices, type ProductAvailabilitySnapshot } from "@/lib/inventory-core";
import { containerShipments, customerInvoices, erpProducts } from "@/lib/inventory-data";
import { ArrowUpRightIcon, CheckIcon, ClockIcon, ContainersIcon, InventoryIcon, OrdersIcon, ProductsIcon, ShipIcon } from "@/components/line-icons";

type Row = {
  product: (typeof erpProducts)[number];
  snapshot: ProductAvailabilitySnapshot;
};

type FilterKey =
  | "all"
  | "available"
  | "backordered"
  | "arrivingSoon"
  | "oversold"
  | "accessories"
  | "lifts";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All Products" },
  { key: "available", label: "Available" },
  { key: "backordered", label: "Backordered" },
  { key: "arrivingSoon", label: "Arriving Soon" },
  { key: "oversold", label: "Oversold" },
  { key: "accessories", label: "Accessories" },
  { key: "lifts", label: "Lifts" },
];

export default function AvailabilityPage() {
  const assignments = useMemo(() => deriveAssignmentsFromApprovedInvoices(customerInvoices), []);
  const rows = useMemo<Row[]>(
    () => erpProducts.map((product) => ({ product, snapshot: computeProductAvailability(product, assignments, containerShipments) })),
    [assignments],
  );

  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const filteredRows = useMemo(() => rows.filter((row) => matchesFilter(row, activeFilter)), [rows, activeFilter]);

  const [selectedProductId, setSelectedProductId] = useState(filteredRows[0]?.product.id ?? rows[0]?.product.id ?? "");

  const selected =
    filteredRows.find((row) => row.product.id === selectedProductId) ??
    rows.find((row) => row.product.id === selectedProductId) ??
    filteredRows[0] ??
    rows[0];

  const selectedAssignedInvoices = getInvoicesForProduct(selected?.product.id);
  const selectedWaitingCustomers = selectedAssignedInvoices.filter((entry) => entry.invoice.approvedByShipping);
  const selectedContainers = containerShipments.filter((container) =>
    container.items.some((item) => item.erpProductId === selected?.product.id),
  );

  return (
    <section className="grid gap-5 xl:grid-cols-[1.5fr_0.85fr]">
      <div className="space-y-5">
        <header className="rounded-[20px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
          <p className="text-sm font-medium text-[var(--text-muted)]">Inventory Availability</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Sales Snapshot</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
            Quick view for sales reps: on-floor units, sold commitments, package weight, and the next inbound timing.
          </p>
        </header>

        <div className="rounded-[20px] border border-[var(--line-soft)] bg-white p-4 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => {
              const active = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter.key);
                    if (!filteredRows.some((row) => row.product.id === selectedProductId)) {
                      setSelectedProductId((rows.find((row) => matchesFilter(row, filter.key)) ?? rows[0])?.product.id ?? "");
                    }
                  }}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${active ? "border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white" : "border-[var(--line-soft)] bg-white text-[var(--text-primary)] hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"}`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-[var(--line-soft)] bg-white shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
          <div className="overflow-x-auto p-4">
            <div className="min-w-[1120px] space-y-3">
              <div className="sticky top-0 z-10 rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-page)] px-4 py-3">
                <div className="grid grid-cols-[2.4fr_0.8fr_0.8fr_0.9fr_1fr_0.9fr_1.5fr_1.2fr] gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  <span>Product</span>
                  <span>On Floor</span>
                  <span>In Stock</span>
                  <span>Sold</span>
                  <span>Pkg Wt</span>
                  <span>Available</span>
                  <span>Next Container</span>
                  <span>ETA</span>
                </div>
              </div>

              {filteredRows.map((row) => {
                const isSelected = row.product.id === selected?.product.id;
                const container = findContainer(row.snapshot.nextContainerNo);
                const eta = getEtaMeta(row.snapshot.nextContainerDate);
                const oversold = row.snapshot.oversoldQty > 0;

                return (
                  <button
                    key={row.product.id}
                    type="button"
                    onClick={() => setSelectedProductId(row.product.id)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      isSelected
                        ? "border-[var(--brand-accent)] bg-[#fffafa] shadow-[0_16px_32px_-30px_rgba(139,30,36,0.45)]"
                        : "border-[var(--line-soft)] bg-white hover:-translate-y-[1px] hover:shadow-[0_18px_36px_-30px_rgba(17,24,39,0.45)]"
                    }`}
                  >
                    <div className="grid grid-cols-[2.4fr_0.8fr_0.8fr_0.9fr_1fr_0.9fr_1.5fr_1.2fr] gap-3">
                      <div className="flex items-center gap-3">
                        <ProductThumb label={row.product.name} icon={ProductsIcon} />
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{row.product.name}</p>
                          <p className="mt-0.5 text-xs text-[var(--text-muted)]">{row.product.sku} • {row.product.category} • {row.product.packageType}</p>
                        </div>
                      </div>

                      <Metric value={row.snapshot.floorQty} />
                      <Metric value={row.snapshot.inStockQty} />
                      <Metric value={row.snapshot.soldAssignedQty} color={oversold ? "red" : "default"} />
                      <Metric value={`${row.product.packageWeightLbs} lb`} color="steel" />
                      <Metric value={row.snapshot.availableNowQty} color={row.snapshot.availableNowQty > 0 ? "green" : "red"} />

                      <div className="space-y-1">
                        <span className="inline-flex rounded-full bg-[var(--status-blue-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--status-blue-text)]">
                          {container ? `PO #${container.poNumber}` : row.snapshot.nextContainerNo ?? "No inbound"}
                        </span>
                        <p className="truncate text-xs text-[var(--text-muted)]">{container?.containerNo ?? ""}</p>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{eta.dateLabel}</p>
                        <p className={`text-xs font-medium ${eta.toneClass}`}>{eta.relativeLabel}</p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredRows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--line-soft)] bg-white px-4 py-10 text-center text-sm text-[var(--text-muted)]">
                  No products match this filter.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-[20px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Product 360</p>
          <div className="mt-3 flex items-start gap-3">
            <ProductThumb label={selected?.product.name ?? "Product"} icon={ProductsIcon} large />
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">{selected?.product.name}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{selected?.product.sku} • {selected?.product.category}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <PanelMetric title="Available" value={selected?.snapshot.availableNowQty ?? 0} tone="green" icon={CheckIcon} />
            <PanelMetric title="Assigned" value={selected?.snapshot.soldAssignedQty ?? 0} tone="red" icon={OrdersIcon} />
            <PanelMetric title="On Order" value={selected?.snapshot.onOrderQty ?? 0} tone="steel" icon={ShipIcon} />
            <PanelMetric title="In Stock" value={selected?.snapshot.inStockQty ?? 0} tone="navy" icon={InventoryIcon} />
          </div>
        </div>

        <PanelCard title="Visual Timeline" icon={ClockIcon}>
          <TimelineBar
            label="Warehouse"
            value={selected?.snapshot.availableNowQty ?? 0}
            max={Math.max(1, selected?.snapshot.forSaleQty ?? 1)}
            tone="steel"
            note={`${selected?.snapshot.availableNowQty ?? 0} units`}
          />
          <TimelineBar
            label="Customers Waiting"
            value={sumQty(selectedWaitingCustomers)}
            max={Math.max(1, selected?.snapshot.forSaleQty ?? 1)}
            tone="red"
            note={`${selectedWaitingCustomers.length} invoices`}
          />
          <TimelineBar
            label="Next Container"
            value={nextContainerQty(selected?.product.id)}
            max={Math.max(1, selected?.snapshot.onOrderQty ?? 1)}
            tone="navy"
            note={getEtaMeta(selected?.snapshot.nextContainerDate).dateLabel}
          />
        </PanelCard>

        <PanelCard title="Waiting Customers" icon={OrdersIcon}>
          {selectedWaitingCustomers.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No waiting customers.</p>
          ) : (
            <ul className="space-y-2">
              {selectedWaitingCustomers.slice(0, 5).map(({ invoice, line }) => (
                <li key={`${invoice.invoiceNo}-${line.erpProductId}`} className="rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-page)] px-3 py-2">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{invoice.customerName}</p>
                  <p className="text-xs text-[var(--text-muted)]">Invoice {invoice.invoiceNo} • Qty {line.qty}</p>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>

        <PanelCard title="Containers Carrying This Product" icon={ContainersIcon}>
          {selectedContainers.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No containers currently carrying this product.</p>
          ) : (
            <ul className="space-y-2">
              {selectedContainers.slice(0, 5).map((container) => (
                <li key={container.id} className="rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-page)] px-3 py-2">
                  <p className="text-sm font-medium text-[var(--text-primary)]">PO #{container.poNumber} • {container.containerNo}</p>
                  <p className="text-xs text-[var(--text-muted)]">ETA {getEtaMeta(container.portDate).dateLabel} • {getEtaMeta(container.portDate).relativeLabel}</p>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>

        <PanelCard title="Purchase History" icon={ArrowUpRightIcon}>
          {selectedContainers.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No purchase history for this product yet.</p>
          ) : (
            <ul className="space-y-2">
              {selectedContainers
                .slice()
                .sort((a, b) => new Date(b.poDate).getTime() - new Date(a.poDate).getTime())
                .slice(0, 5)
                .map((container) => (
                  <li key={container.id} className="rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-page)] px-3 py-2">
                    <p className="text-sm font-medium text-[var(--text-primary)]">PO #{container.poNumber} • {container.supplier}</p>
                    <p className="text-xs text-[var(--text-muted)]">Purchased {formatShortDate(container.poDate)} • {findItemQty(container.id, selected?.product.id)} units</p>
                  </li>
                ))}
            </ul>
          )}
        </PanelCard>

        <PanelCard title="Assigned Invoices" icon={ShipIcon}>
          {selectedAssignedInvoices.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No assigned invoices.</p>
          ) : (
            <ul className="space-y-2">
              {selectedAssignedInvoices.slice(0, 6).map(({ invoice, line }) => (
                <li key={`${invoice.invoiceNo}-${line.erpProductId}-assigned`} className="rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-page)] px-3 py-2">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{invoice.invoiceNo} • {invoice.customerName}</p>
                  <p className="text-xs text-[var(--text-muted)]">Qty {line.qty} • {invoice.paymentStatus}</p>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>
      </aside>
    </section>
  );
}

function matchesFilter(row: Row, filter: FilterKey) {
  const category = row.product.category.toLowerCase();
  const etaDays = getEtaMeta(row.snapshot.nextContainerDate).days;

  if (filter === "all") return true;
  if (filter === "available") return row.snapshot.availableNowQty > 0;
  if (filter === "backordered") return row.snapshot.availableNowQty <= 0 && row.snapshot.onOrderQty > 0;
  if (filter === "arrivingSoon") return etaDays !== null && etaDays >= 0 && etaDays <= 30;
  if (filter === "oversold") return row.snapshot.oversoldQty > 0;
  if (filter === "accessories") return category.includes("access");
  if (filter === "lifts") return category.includes("lift");

  return true;
}

function findContainer(containerNo: string | null) {
  if (!containerNo) return null;
  return containerShipments.find((entry) => entry.containerNo === containerNo) ?? null;
}

function getInvoicesForProduct(productId?: string) {
  if (!productId) return [];

  return customerInvoices
    .flatMap((invoice) =>
      invoice.lines
        .filter((line) => line.erpProductId === productId)
        .map((line) => ({ invoice, line })),
    );
}

function sumQty(items: Array<{ line: { qty: number } }>) {
  return items.reduce((sum, item) => sum + item.line.qty, 0);
}

function nextContainerQty(productId?: string) {
  if (!productId) return 0;

  return containerShipments.reduce((sum, container) => {
    const item = container.items.find((line) => line.erpProductId === productId);
    return sum + (item?.qty ?? 0);
  }, 0);
}

function findItemQty(containerId: string, productId?: string) {
  if (!productId) return 0;
  const container = containerShipments.find((entry) => entry.id === containerId);
  return container?.items.find((line) => line.erpProductId === productId)?.qty ?? 0;
}

function formatShortDate(value?: string | null) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function getEtaMeta(value?: string | null) {
  if (!value) {
    return {
      dateLabel: "No ETA",
      relativeLabel: "Awaiting schedule",
      days: null as number | null,
      toneClass: "text-[var(--text-muted)]",
    };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return {
      dateLabel: value,
      relativeLabel: "Awaiting schedule",
      days: null as number | null,
      toneClass: "text-[var(--text-muted)]",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.round((target.getTime() - today.getTime()) / msPerDay);

  if (days < 0) {
    return {
      dateLabel: formatShortDate(value),
      relativeLabel: `${Math.abs(days)} days ago`,
      days,
      toneClass: "text-[var(--status-red-text)]",
    };
  }

  if (days <= 18) {
    return {
      dateLabel: formatShortDate(value),
      relativeLabel: `Arriving in ${days} days`,
      days,
      toneClass: "text-[var(--status-green-text)]",
    };
  }

  if (days <= 35) {
    return {
      dateLabel: formatShortDate(value),
      relativeLabel: `${days} days`,
      days,
      toneClass: "text-[var(--status-yellow-text)]",
    };
  }

  return {
    dateLabel: formatShortDate(value),
    relativeLabel: `${days} days`,
    days,
    toneClass: "text-[var(--status-blue-text)]",
  };
}

function ProductThumb({ label, icon: Icon, large = false }: { label: string; icon: ComponentType<{ className?: string }>; large?: boolean }) {
  const initials = label
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className={`${large ? "h-14 w-14" : "h-11 w-11"} relative flex shrink-0 items-center justify-center rounded-xl border border-[var(--line-soft)] bg-[var(--bg-page)]`}>
      <Icon className={`${large ? "h-6 w-6" : "h-5 w-5"} absolute text-[var(--status-blue-text)]`} />
      <span className="sr-only">{label}</span>
      <span className={`${large ? "text-[10px]" : "text-[9px]"} absolute bottom-1 rounded bg-white px-1.5 py-0.5 font-semibold tracking-wide text-[var(--text-muted)]`}>
        {initials}
      </span>
    </div>
  );
}

function Metric({ value, color = "default" }: { value: number | string; color?: "default" | "green" | "red" | "steel" }) {
  const className =
    color === "green"
      ? "text-[var(--status-green-text)]"
      : color === "red"
        ? "text-[var(--status-red-text)]"
        : color === "steel"
          ? "text-[var(--status-blue-text)]"
          : "text-[var(--text-primary)]";

  return <p className={`text-lg font-semibold leading-8 ${className}`}>{value}</p>;
}

function PanelCard({ title, icon: Icon, children }: { title: string; icon: ComponentType<{ className?: string }>; children: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[var(--status-blue-text)]" />
        <h4 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function PanelMetric({ title, value, tone, icon: Icon }: { title: string; value: number; tone: "green" | "red" | "steel" | "navy"; icon: ComponentType<{ className?: string }> }) {
  const toneClass =
    tone === "green"
      ? "bg-[var(--status-green-bg)] text-[var(--status-green-text)]"
      : tone === "red"
        ? "bg-[var(--status-red-bg)] text-[var(--status-red-text)]"
        : tone === "navy"
          ? "bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]"
          : "bg-[var(--status-gray-bg)] text-[var(--status-blue-text)]";

  return (
    <div className={`rounded-2xl px-3 py-3 ${toneClass}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em]">{title}</p>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function TimelineBar({ label, value, max, tone, note }: { label: string; value: number; max: number; tone: "steel" | "red" | "navy"; note: string }) {
  const width = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  const barClass =
    tone === "red"
      ? "bg-[var(--status-red-text)]"
      : tone === "navy"
        ? "bg-[var(--status-blue-text)]"
        : "bg-[#4B6B88]";

  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-page)]">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${width}%` }} />
      </div>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{note}</p>
    </div>
  );
}
