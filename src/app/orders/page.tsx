"use client";

import { useState } from "react";
import { deriveAssignmentsFromApprovedInvoices, isInvoiceEligibleForWarehouse, type CustomerInvoice } from "@/lib/inventory-core";
import { customerInvoices, erpProducts } from "@/lib/inventory-data";

export default function OrdersPage() {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>(customerInvoices);

  const queue = invoices.filter(isInvoiceEligibleForWarehouse);

  const assignments = deriveAssignmentsFromApprovedInvoices(invoices);

  const assignmentsByProduct = new Map<string, { customerName: string; invoiceNo: string; qty: number }[]>();

  for (const assignment of assignments) {
    const list = assignmentsByProduct.get(assignment.productId) ?? [];
    list.push({
      customerName: assignment.customerName,
      invoiceNo: assignment.invoiceNo,
      qty: assignment.qty,
    });
    assignmentsByProduct.set(assignment.productId, list);
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          New Orders / Invoices
        </p>
        <h2 className="mt-2 text-2xl font-bold">Shipping Approval Queue</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Paid and partially paid QuickBooks invoices appear here for warehouse approval. Approving assigns customers to product allocation lists.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#2a323c] text-xs uppercase tracking-[0.16em] text-white/85">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Payment Status</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((invoice) => (
              <tr key={invoice.id} className="border-t border-[var(--line-soft)]">
                <td className="px-4 py-3 font-semibold">{invoice.invoiceNo}</td>
                <td className="px-4 py-3">{invoice.customerName}</td>
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
                <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                  {invoice.lines
                    .map((line) => {
                      const product = erpProducts.find((entry) => entry.id === line.erpProductId);
                      return `${product?.name ?? line.erpProductId} x${line.qty}`;
                    })
                    .join(", ")}
                </td>
                <td className="px-4 py-3">
                  {invoice.approvedByShipping ? (
                    <span className="rounded-full bg-[var(--status-blue-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--status-blue-text)]">
                      Approved
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        setInvoices((prev) =>
                          prev.map((entry) =>
                            entry.id === invoice.id
                              ? { ...entry, approvedByShipping: true }
                              : entry,
                          ),
                        )
                      }
                      className="rounded-lg border border-[var(--brand-secondary)] bg-[var(--brand-accent)] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-6">
        <h3 className="text-lg font-bold">Assigned Customers by Product</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {erpProducts.map((product) => {
            const list = assignmentsByProduct.get(product.id) ?? [];
            return (
              <article key={product.id} className="rounded-xl border border-[var(--line-soft)] p-4">
                <p className="text-sm font-semibold">{product.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{product.sku}</p>
                <div className="mt-2 space-y-1 text-xs">
                  {list.length ? (
                    list.map((entry) => (
                      <p key={`${entry.invoiceNo}-${entry.customerName}`}>
                        {entry.customerName} - {entry.invoiceNo} (Qty {entry.qty})
                      </p>
                    ))
                  ) : (
                    <p className="text-[var(--text-muted)]">No assigned customers yet</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
