import { computeProductAvailability, deriveAssignmentsFromApprovedInvoices } from "@/lib/inventory-core";
import { containerShipments, customerInvoices, erpProducts } from "@/lib/inventory-data";

export default function AvailabilityPage() {
  const assignments = deriveAssignmentsFromApprovedInvoices(customerInvoices);

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Availability
        </p>
        <h2 className="mt-2 text-2xl font-bold">Real-Time Product Availability</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Shows floor stock, sold assignments, container pipeline, and the next container that can fulfill demand.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#2a323c] text-xs uppercase tracking-[0.16em] text-white/85">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">On Order</th>
              <th className="px-4 py-3">On Floor</th>
              <th className="px-4 py-3">Sold</th>
              <th className="px-4 py-3">For Sale</th>
              <th className="px-4 py-3">Available Now</th>
              <th className="px-4 py-3">Next Container</th>
              <th className="px-4 py-3">ETA / Port Date</th>
            </tr>
          </thead>
          <tbody>
            {erpProducts.map((product) => {
              const snapshot = computeProductAvailability(product, assignments, containerShipments);
              const netClass =
                snapshot.realAvailableQty > 0
                  ? "bg-[var(--status-green-bg)] text-[var(--status-green-text)]"
                  : snapshot.realAvailableQty === 0
                    ? "bg-[var(--status-yellow-bg)] text-[var(--status-yellow-text)]"
                    : "bg-[var(--status-red-bg)] text-[var(--status-red-text)]";

              return (
                <tr key={product.id} className="border-t border-[var(--line-soft)]">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{product.sku}</p>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">{snapshot.onOrderQty}</td>
                  <td className="px-4 py-3">{snapshot.onFloorQty}</td>
                  <td className="px-4 py-3">{snapshot.soldAssignedQty}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${netClass}`}>
                      {snapshot.forSaleQty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${netClass}`}>
                      {snapshot.availableNowQty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {snapshot.nextContainerNo ? (
                      <>
                        <p className="font-semibold">{snapshot.nextContainerNo}</p>
                        <p className="text-[var(--text-muted)]">
                          Available after backlog: {snapshot.availableAfterNextContainer}
                        </p>
                      </>
                    ) : (
                      <span className="text-[var(--text-muted)]">No inbound container</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                    {snapshot.nextContainerDate ? `${snapshot.nextContainerDate} - ${snapshot.nextContainerPort}` : "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
