import Link from "next/link";
import { containerShipments, erpProducts } from "@/lib/inventory-data";
import { getContainerLineCount, getContainerTotalUnits } from "@/lib/inventory-core";

export default function ContainersPage() {
  return (
    <section className="space-y-5">
      <div className="rounded-[20px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_10px_26px_-24px_rgba(17,24,39,0.28)]">
        <p className="text-sm font-medium text-[var(--text-muted)]">Containers</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">What is on the water?</h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--text-muted)]">
          Each container should feel like a Trello card: quick to scan, easy to open, and focused on ETA, status, and product count.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {containerShipments.map((container) => (
          <article key={container.id} className="card-hover rounded-[20px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_10px_26px_-24px_rgba(17,24,39,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-2xl">🚢</p>
                <h3 className="mt-3 text-lg font-semibold">Container #{container.poNumber}</h3>
                <p className="text-sm text-[var(--text-muted)]">{container.supplier}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${container.status === "Received into inventory" ? "bg-[var(--status-green-bg)] text-[var(--status-green-text)]" : container.status === "On the ship" ? "bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]" : container.status === "At origin port" ? "bg-[var(--status-yellow-bg)] text-[var(--status-yellow-text)]" : "bg-[var(--status-gray-bg)] text-[var(--status-gray-text)]"}`}>
                {container.inventoryStatus}
              </span>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-[var(--text-muted)]">
              <p><span className="font-medium text-[var(--text-primary)]">Status:</span> {container.status}</p>
              <p><span className="font-medium text-[var(--text-primary)]">ETA:</span> {container.portDate}</p>
              <p><span className="font-medium text-[var(--text-primary)]">Delivery:</span> {container.deliveryDate}</p>
              <p><span className="font-medium text-[var(--text-primary)]">Payment:</span> {container.paymentStatus}</p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <MiniStat label="Products" value={getContainerLineCount(container)} />
              <MiniStat label="Units" value={getContainerTotalUnits(container)} />
              <MiniStat label="Tracking" value={container.trackingConnected ? 1 : 0} />
            </div>

            <div className="mt-5 space-y-2 rounded-2xl bg-[var(--bg-page)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Inside container</p>
              <div className="space-y-2 text-sm text-[var(--text-muted)]">
                {container.items.map((item) => {
                  const product = erpProducts.find((entry) => entry.id === item.erpProductId);
                  return (
                    <div key={item.erpProductId} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-[0_10px_26px_-24px_rgba(17,24,39,0.28)]">
                      <span className="font-medium text-[var(--text-primary)]">{product?.name ?? item.erpProductId}</span>
                      <span>{item.qty}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <Link href={`/containers/${container.id}`} className="font-medium text-[var(--status-blue-text)]">View →</Link>
              <span className="text-xs text-[var(--text-muted)]">{container.trackingSource}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-[20px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_10px_26px_-24px_rgba(17,24,39,0.28)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Products on incoming containers</h3>
            <p className="text-sm text-[var(--text-muted)]">Quick visibility for what&apos;s coming next.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {erpProducts.map((product) => (
            <div key={product.id} className="rounded-[18px] border border-[var(--line-soft)] bg-[var(--bg-page)] p-4">
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{product.category}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[var(--bg-page)] px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
