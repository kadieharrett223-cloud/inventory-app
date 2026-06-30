import Link from "next/link";
import { computeProductAvailability, deriveAssignmentsFromApprovedInvoices } from "@/lib/inventory-core";
import { containerShipments, customerInvoices, erpProducts } from "@/lib/inventory-data";

export default function ProductsPage() {
  const assignments = deriveAssignmentsFromApprovedInvoices(customerInvoices);

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Products
        </p>
        <h2 className="mt-2 text-2xl font-bold">Product Availability by SKU</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Open a product to view floor quantity, sold assignments, inbound container quantities, and next available fulfillment.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {erpProducts.map((product) => {
          const snapshot = computeProductAvailability(product, assignments, containerShipments);
          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-5 hover:border-[var(--brand-accent)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                {product.sku}
              </p>
              <h3 className="mt-1 text-lg font-bold">{product.name}</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <p>On Floor: {snapshot.onFloorQty}</p>
                <p>Sold: {snapshot.soldAssignedQty}</p>
                <p>Incoming: {snapshot.incomingQty}</p>
                <p>Real Available: {snapshot.realAvailableQty}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
