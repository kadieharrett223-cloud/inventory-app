import { notFound } from "next/navigation";
import { computeProductAvailability, deriveAssignmentsFromApprovedInvoices } from "@/lib/inventory-core";
import { containerShipments, customerInvoices, erpProducts } from "@/lib/inventory-data";

type ProductDetailPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = await params;

  const product = erpProducts.find((entry) => entry.id === productId);
  if (!product) {
    notFound();
  }

  const assignments = deriveAssignmentsFromApprovedInvoices(customerInvoices).filter(
    (assignment) => assignment.productId === product.id,
  );

  const snapshot = computeProductAvailability(product, assignments, containerShipments);

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          {product.sku}
        </p>
        <h2 className="mt-2 text-2xl font-bold">{product.name}</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Product truth view: floor stock, sold assignments, inbound containers, and next fulfillment source.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="On floor" value={snapshot.onFloorQty} />
        <MetricCard label="Sold / assigned" value={snapshot.soldAssignedQty} />
        <MetricCard label="Incoming on containers" value={snapshot.incomingQty} />
        <MetricCard label="Oversold now" value={snapshot.oversoldQty} />
        <MetricCard label="Real available" value={snapshot.realAvailableQty} />
        <MetricCard label="Next container qty" value={snapshot.nextContainerQty} />
      </div>

      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-5">
        <h3 className="text-lg font-bold">Next Available Container</h3>
        {snapshot.nextContainerNo ? (
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {snapshot.nextContainerNo} arriving {snapshot.nextContainerDate} at {snapshot.nextContainerPort}. Remaining units after current backlog: {snapshot.availableAfterNextContainer}.
          </p>
        ) : (
          <p className="mt-2 text-sm text-[var(--text-muted)]">No upcoming container linked to this product.</p>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-5">
        <h3 className="text-lg font-bold">Assigned Customers</h3>
        <div className="mt-3 space-y-2 text-sm">
          {assignments.length ? (
            assignments.map((assignment) => (
              <div key={`${assignment.invoiceNo}-${assignment.customerName}`} className="rounded-lg border border-[var(--line-soft)] p-3">
                <p className="font-semibold">{assignment.customerName}</p>
                <p className="text-[var(--text-muted)]">Invoice {assignment.invoiceNo} - Qty {assignment.qty}</p>
              </div>
            ))
          ) : (
            <p className="text-[var(--text-muted)]">No customers assigned yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

type MetricCardProps = {
  label: string;
  value: number;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </article>
  );
}
