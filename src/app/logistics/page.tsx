"use client";

import { useMemo, useState } from "react";
import type { CustomerInvoice, ErpProduct } from "@/lib/inventory-core";
import { isInvoiceEligibleForWarehouse } from "@/lib/inventory-core";
import { customerInvoices, erpProducts } from "@/lib/inventory-data";

export default function LogisticsPage() {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>(customerInvoices);
  const [products, setProducts] = useState<ErpProduct[]>(erpProducts);

  const approvalQueue = useMemo(
    () => invoices.filter((invoice) => isInvoiceEligibleForWarehouse(invoice) && !invoice.approvedByShipping),
    [invoices],
  );

  const queueUnits = approvalQueue.reduce((sum, invoice) => sum + invoice.lines.reduce((lineSum, line) => lineSum + line.qty, 0), 0);

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <header className="rounded-2xl border border-[var(--line-soft)] bg-white p-6 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Logistics Operations</p>
        <h2 className="mt-2 text-2xl font-bold">Shipping Approval and Inventory Control</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Approve paid invoices for shipping and perform controlled inventory edits from one logistics workspace.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="New Orders Awaiting Approval" value={String(approvalQueue.length)} />
        <StatCard label="Units Waiting" value={String(queueUnits)} />
        <StatCard label="Products Editable" value={String(products.length)} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-white shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
        <div className="bg-[linear-gradient(90deg,#111d31_0%,#091223_100%)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
          New Order Approval Queue (Invoices Only)
        </div>

        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f7f9fc] text-xs uppercase tracking-[0.12em] text-[#667489]">
            <tr>
              <th className="px-4 py-2.5">Invoice</th>
              <th className="px-4 py-2.5">Customer</th>
              <th className="px-4 py-2.5">Payment</th>
              <th className="px-4 py-2.5">Units</th>
              <th className="px-4 py-2.5">Action</th>
            </tr>
          </thead>
          <tbody>
            {approvalQueue.length > 0 ? (
              approvalQueue.map((invoice) => {
                const units = invoice.lines.reduce((sum, line) => sum + line.qty, 0);
                return (
                  <tr key={invoice.id} className="border-t border-[var(--line-soft)]">
                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{invoice.invoiceNo}</td>
                    <td className="px-4 py-3 text-[var(--text-primary)]">{invoice.customerName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          invoice.paymentStatus === "Paid"
                            ? "bg-[var(--status-green-bg)] text-[var(--status-green-text)]"
                            : "bg-[var(--status-yellow-bg)] text-[var(--status-yellow-text)]"
                        }`}
                      >
                        {invoice.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{units}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setInvoices((prev) =>
                            prev.map((entry) =>
                              entry.id === invoice.id
                                ? {
                                    ...entry,
                                    approvedByShipping: true,
                                  }
                                : entry,
                            ),
                          );
                        }}
                        className="rounded-lg bg-[#8b1e24] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#75191e]"
                      >
                        Approve for shipping
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-7 text-center text-sm text-[var(--text-muted)]">
                  No paid or partially paid invoices waiting for approval.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-white shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
        <div className="bg-[linear-gradient(90deg,#111d31_0%,#091223_100%)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
          Inventory Edit Controls
        </div>

        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f7f9fc] text-xs uppercase tracking-[0.12em] text-[#667489]">
            <tr>
              <th className="px-4 py-2.5">Product</th>
              <th className="px-4 py-2.5">SKU</th>
              <th className="px-4 py-2.5">On Floor</th>
              <th className="px-4 py-2.5">Warehouse Stock</th>
              <th className="px-4 py-2.5">Package Weight</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-[var(--line-soft)]">
                <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{product.name}</td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{product.sku}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    value={product.onFloorQty}
                    onChange={(event) => {
                      const next = Number.parseInt(event.target.value, 10);
                      setProducts((prev) =>
                        prev.map((entry) =>
                          entry.id === product.id
                            ? { ...entry, onFloorQty: Number.isFinite(next) && next >= 0 ? next : 0 }
                            : entry,
                        ),
                      );
                    }}
                    className="w-24 rounded-lg border border-[var(--line-soft)] px-2.5 py-1.5 text-[13px]"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    value={product.inStockQty ?? 0}
                    onChange={(event) => {
                      const next = Number.parseInt(event.target.value, 10);
                      setProducts((prev) =>
                        prev.map((entry) =>
                          entry.id === product.id
                            ? { ...entry, inStockQty: Number.isFinite(next) && next >= 0 ? next : 0 }
                            : entry,
                        ),
                      );
                    }}
                    className="w-24 rounded-lg border border-[var(--line-soft)] px-2.5 py-1.5 text-[13px]"
                  />
                </td>
                <td className="px-4 py-3 text-[var(--text-primary)]">{product.packageWeightLbs} lb ({product.packageType})</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-[var(--line-soft)] px-4 py-3 text-right">
          <button type="button" className="rounded-lg bg-[#8b1e24] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#75191e]">
            Save inventory edits
          </button>
        </div>
      </section>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-[var(--line-soft)] bg-white px-4 py-3 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{value}</p>
    </article>
  );
}
