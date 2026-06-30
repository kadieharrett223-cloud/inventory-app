import { notFound } from "next/navigation";
import { containerShipments, erpProducts } from "@/lib/inventory-data";
import { getContainerLineCount, getContainerTotalUnits } from "@/lib/inventory-core";

type ContainerDetailPageProps = {
  params: Promise<{ containerId: string }>;
};

export default async function ContainerDetailPage({ params }: ContainerDetailPageProps) {
  const { containerId } = await params;

  const container = containerShipments.find((entry) => entry.id === containerId);
  if (!container) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Container / PO #{container.poNumber}
        </p>
        <h2 className="mt-2 text-2xl font-bold">{container.containerNo}</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Supplier {container.supplier} • Tracking {container.trackingNumber} via {container.trackingSource}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Payment" value={container.paymentStatus} />
        <Metric label="Container status" value={container.status} />
        <Metric label="Inventory status" value={container.inventoryStatus} />
        <Metric label="Uploaded" value={container.uploadedAt} />
        <Metric label="Origin" value={container.origin} />
        <Metric label="Origin port date" value={container.originPortDate} />
        <Metric label="On ship date" value={container.onShipDate} />
        <Metric label="Port / Arrival date" value={`${container.portDate} (${container.portName})`} />
        <Metric label="Delivery date" value={container.deliveryDate} />
        <Metric label="Lines" value={String(getContainerLineCount(container))} />
        <Metric label="Total units" value={String(getContainerTotalUnits(container))} />
      </div>

      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-5">
        <h3 className="text-lg font-bold">Tracking Milestones</h3>
        <div className="mt-3 space-y-2">
          {container.milestones.map((milestone) => (
            <div key={`${milestone.stage}-${milestone.date}`} className="flex items-center justify-between rounded-lg border border-[var(--line-soft)] px-3 py-2 text-sm">
              <p className="font-semibold">{milestone.stage}</p>
              <p className="text-[var(--text-muted)]">{milestone.date}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-5">
        <h3 className="text-lg font-bold">Products inside container</h3>
        <div className="mt-3 space-y-2 text-sm">
          {container.items.map((item) => {
            const product = erpProducts.find((entry) => entry.id === item.erpProductId);
            return (
              <div key={item.erpProductId} className="rounded-lg border border-[var(--line-soft)] px-3 py-2">
                <p className="font-semibold">{product?.name ?? item.erpProductId}</p>
                <p className="text-[var(--text-muted)]">{product?.sku ?? "Unknown SKU"}</p>
                <p className="mt-1">Units: {item.qty}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <article className="rounded-xl border border-[var(--line-soft)] bg-[var(--panel)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </article>
  );
}
