import { validateConfig } from "@/lib/config";
import { computeProductAvailability, deriveAssignmentsFromApprovedInvoices, isContainerReceived, isInvoiceEligibleForWarehouse } from "@/lib/inventory-core";
import { containerShipments, customerInvoices, erpProducts } from "@/lib/inventory-data";
import { getQboConnectionState } from "@/lib/qbo";
import { getSupabaseConnectionState } from "@/lib/supabase";

export default function Home() {
  const config = validateConfig();
  const supabaseState = getSupabaseConnectionState();
  const qboState = getQboConnectionState();

  const assignments = deriveAssignmentsFromApprovedInvoices(customerInvoices);

  const snapshots = erpProducts.map((product) =>
    computeProductAvailability(product, assignments, containerShipments),
  );

  const totalOnFloor = snapshots.reduce((sum, snapshot) => sum + snapshot.onFloorQty, 0);
  const totalSold = snapshots.reduce((sum, snapshot) => sum + snapshot.soldAssignedQty, 0);
  const totalIncoming = snapshots.reduce((sum, snapshot) => sum + snapshot.incomingQty, 0);
  const totalBackorder = snapshots.reduce((sum, snapshot) => sum + snapshot.oversoldQty, 0);
  const containersComing = containerShipments.filter((container) => !isContainerReceived(container)).length;
  const ordersNeedingApproval = customerInvoices.filter(
    (invoice) => isInvoiceEligibleForWarehouse(invoice) && !invoice.approvedByShipping,
  ).length;

  const metrics = [
    { label: "On Floor Units", value: String(totalOnFloor), delta: "Physical now" },
    { label: "Sold / Assigned", value: String(totalSold), delta: "Committed orders" },
    { label: "Incoming Units", value: String(totalIncoming), delta: "On containers" },
    { label: "Backordered Units", value: String(totalBackorder), delta: "Needs inbound" },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl animate-[fadeIn_500ms_ease-out] space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-5 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.22)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Operations Snapshot
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Inventory Command Deck</h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
            Simple operational overview for management, sales, and warehouse: what is sold, what is physically here, what is coming, and what needs approval.
          </p>
        </div>
        <div className="rounded-2xl border border-[#2c3440] bg-[#202934] p-5 text-white shadow-[0_24px_60px_-36px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
            Integrations Status
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Supabase: {supabaseState.reason}</li>
            <li>QBO: {qboState.reason}</li>
            <li>Config readiness: {config.hasSupabase && config.hasQbo ? "Connected" : "Waiting for env vars"}</li>
            <li>Containers coming: {containersComing}</li>
            <li>Orders needing approval: {ordersNeedingApproval}</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-bold">{metric.value}</p>
            <p className="mt-1 text-xs font-medium text-[var(--brand-accent)]">{metric.delta} vs 30d</p>
          </article>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)]">
        <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Priority Queue
          </h3>
        </div>
        <div className="grid gap-3 px-4 py-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--line-soft)] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Needs approval</p>
            <p className="mt-1 text-2xl font-bold">{ordersNeedingApproval}</p>
            <p className="text-sm text-[var(--text-muted)]">Paid or partially paid invoices waiting for shipping approval.</p>
          </div>
          <div className="rounded-xl border border-[var(--line-soft)] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Backorder risk</p>
            <p className="mt-1 text-2xl font-bold">{totalBackorder}</p>
            <p className="text-sm text-[var(--text-muted)]">Units already oversold versus physical quantity on floor.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
