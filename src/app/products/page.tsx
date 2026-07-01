import Link from "next/link";
import { computeProductAvailability, deriveAssignmentsFromApprovedInvoices } from "@/lib/inventory-core";
import { containerShipments, customerInvoices, erpProducts, productMappings, qboProducts } from "@/lib/inventory-data";

export default function ProductsPage() {
  const assignments = deriveAssignmentsFromApprovedInvoices(customerInvoices);

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Products
        </p>
        <h2 className="mt-2 text-2xl font-bold">Product Master and Inventory</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Spreadsheet product rows simplified into one clean page with mapping, dimensions, inventory, assignments, and inbound containers.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)]">
        <div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#2a323c] text-xs uppercase tracking-[0.16em] text-white/85">
              <tr>
                <th className="px-4 py-3">ERP Product</th>
                <th className="px-4 py-3">QBO Mapped Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Dimensions</th>
                <th className="px-4 py-3">Inventory Totals</th>
                <th className="px-4 py-3">Customer Assignments</th>
                <th className="px-4 py-3">Incoming Containers</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {erpProducts.map((product) => {
                const snapshot = computeProductAvailability(product, assignments, containerShipments);
                const assignedCustomers = assignments.filter((entry) => entry.productId === product.id);
                const mapping = productMappings.find((entry) => entry.erpProductId === product.id);
                const qboMapped = qboProducts.find((entry) => entry.id === mapping?.qboProductId);
                const inboundContainers = containerShipments.filter((container) =>
                  container.items.some((item) => item.erpProductId === product.id),
                );

                return (
                  <tr key={product.id} className="border-t border-[var(--line-soft)]">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{product.sku}</p>
                    </td>
                    <td className="px-4 py-3">{qboMapped?.name ?? "Not mapped"}</td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3">{product.dimensions}</td>
                    <td className="px-4 py-3 text-xs">
                      <p>On floor: {snapshot.onFloorQty}</p>
                      <p>Sold: {snapshot.soldAssignedQty}</p>
                      <p>On order: {snapshot.onOrderQty}</p>
                      <p>Available now: {snapshot.availableNowQty}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)] break-words">
                      {assignedCustomers.length
                        ? assignedCustomers.map((entry) => `${entry.customerName} (${entry.qty})`).join(", ")
                        : "None"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)] break-words">
                      {inboundContainers.length
                        ? inboundContainers.map((container) => `${container.containerNo} (${container.portDate})`).join(", ")
                        : "None"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/products/${product.id}`}
                        className="rounded-md border border-[var(--line-soft)] px-2.5 py-1.5 text-xs font-semibold hover:border-[var(--brand-accent)]"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
