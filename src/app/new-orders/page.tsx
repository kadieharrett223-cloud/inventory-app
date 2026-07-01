import { isInvoiceEligibleForWarehouse } from "@/lib/inventory-core";
import { customerInvoices, erpProducts } from "@/lib/inventory-data";

export default function NewOrdersPage() {
  const newOrders = customerInvoices
    .filter((invoice) => isInvoiceEligibleForWarehouse(invoice) && !invoice.approvedByShipping)
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const totalUnits = newOrders.reduce((sum, invoice) => sum + invoice.lines.reduce((s, line) => s + line.qty, 0), 0);

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <header className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">New Orders</p>
        <h2 className="mt-2 text-2xl font-bold">Unapproved Warehouse Queue</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Orders listed here are paid or partially paid but not yet approved for warehouse fulfillment. Inventory has not been taken out yet.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat title="Unapproved Orders" value={String(newOrders.length)} />
        <Stat title="Units Pending" value={String(totalUnits)} />
        <Stat title="Customers Waiting" value={String(new Set(newOrders.map((invoice) => invoice.customerName)).size)} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#2a323c] text-xs uppercase tracking-[0.16em] text-white/85">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Units</th>
              <th className="px-4 py-3">Items</th>
            </tr>
          </thead>
          <tbody>
            {newOrders.length > 0 ? (
              newOrders.map((invoice) => {
                const units = invoice.lines.reduce((sum, line) => sum + line.qty, 0);
                const itemSummary = invoice.lines
                  .map((line) => {
                    const product = erpProducts.find((entry) => entry.id === line.erpProductId);
                    return `${product?.sku ?? line.erpProductId} x${line.qty}`;
                  })
                  .join(", ");

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
                    <td className="px-4 py-3 text-[var(--text-muted)]">{invoice.createdAt}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{units}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{itemSummary}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                  No unapproved paid orders in queue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-xl border border-[var(--line-soft)] bg-[var(--panel)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{title}</p>
      <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{value}</p>
    </article>
  );
}
