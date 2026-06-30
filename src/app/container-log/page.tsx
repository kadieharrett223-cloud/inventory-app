import Link from "next/link";
import { containerShipments, erpProducts } from "@/lib/inventory-data";
import { getContainerLineCount, getContainerTotalUnits } from "@/lib/inventory-core";

export default function ContainerLogPage() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Container Log
        </p>
        <h2 className="mt-2 text-2xl font-bold">PO and Container Tracking</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Track every PO/container with supplier, tracking source, milestones, payment, line count, and units. Use details to inspect product lines and lifecycle stage.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)]">
        <div className="overflow-x-auto">
          <table className="min-w-[1300px] text-left text-sm">
            <thead className="bg-[#2a323c] text-xs uppercase tracking-[0.16em] text-white/85">
              <tr>
                <th className="px-4 py-3">Container / PO #</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Tracking #</th>
                <th className="px-4 py-3">Freight Source</th>
                <th className="px-4 py-3">PO Date</th>
                <th className="px-4 py-3">Port / Arrival Date</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Lines</th>
                <th className="px-4 py-3">Total Units</th>
                <th className="px-4 py-3">Container Status</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3">View</th>
                <th className="px-4 py-3">Refresh Tracking</th>
              </tr>
            </thead>
            <tbody>
              {containerShipments.map((container) => (
                <tr key={container.id} className="border-t border-[var(--line-soft)]">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{container.poNumber}</p>
                    <p className="text-xs text-[var(--text-muted)]">{container.containerNo}</p>
                  </td>
                  <td className="px-4 py-3">{container.supplier}</td>
                  <td className="px-4 py-3">{container.trackingNumber}</td>
                  <td className="px-4 py-3">{container.trackingSource}</td>
                  <td className="px-4 py-3">{container.poDate}</td>
                  <td className="px-4 py-3">
                    <p>{container.portDate}</p>
                    <p className="text-xs text-[var(--text-muted)]">{container.portName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        container.paymentStatus === "Paid"
                          ? "bg-[var(--status-green-bg)] text-[var(--status-green-text)]"
                          : container.paymentStatus === "Partially Paid"
                            ? "bg-[var(--status-yellow-bg)] text-[var(--status-yellow-text)]"
                            : "bg-[var(--status-red-bg)] text-[var(--status-red-text)]"
                      }`}
                    >
                      {container.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">{getContainerLineCount(container)}</td>
                  <td className="px-4 py-3">{getContainerTotalUnits(container)}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{container.status}</p>
                    <p className="text-xs text-[var(--text-muted)]">{container.inventoryStatus}</p>
                  </td>
                  <td className="px-4 py-3">{container.uploadedAt}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/container-log/${container.id}`}
                      className="rounded-md border border-[var(--line-soft)] px-2.5 py-1.5 text-xs font-semibold hover:border-[var(--brand-accent)]"
                    >
                      Details
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="rounded-md border border-[var(--line-soft)] px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!container.trackingConnected}
                    >
                      Refresh
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-5">
        <h3 className="text-lg font-bold">Container product coverage</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Each container line is linked to ERP products. Received containers add units into product availability calculations automatically.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
          {erpProducts.map((product) => (
            <div key={product.id} className="rounded-lg border border-[var(--line-soft)] px-3 py-2">
              <p className="font-semibold">{product.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{product.sku}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
