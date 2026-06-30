"use client";

import Link from "next/link";
import { useState } from "react";
import { containerShipments, erpProducts } from "@/lib/inventory-data";
import { getContainerLineCount, getContainerTotalUnits } from "@/lib/inventory-core";

export default function ContainersPage() {
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [messageById, setMessageById] = useState<Record<string, string>>({});

  async function refreshTracking(containerId: string) {
    setRefreshingId(containerId);

    try {
      const response = await fetch(`/api/container-log/${containerId}/refresh`, {
        method: "POST",
      });

      const payload = (await response.json()) as { error?: string; source?: string };

      if (!response.ok) {
        setMessageById((prev) => ({
          ...prev,
          [containerId]: payload.error ?? "Refresh failed",
        }));
        return;
      }

      setMessageById((prev) => ({
        ...prev,
        [containerId]: payload.source === "live" ? "Tracking updated from live API" : "Tracking updated from fallback logic",
      }));
    } catch {
      setMessageById((prev) => ({
        ...prev,
        [containerId]: "Refresh failed",
      }));
    } finally {
      setRefreshingId(null);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Containers
        </p>
        <h2 className="mt-2 text-2xl font-bold">Container Log and Tracking</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          One page for container log and tracking: PO number, supplier, tracking, payment, status, ETA/port date, lines, and units.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)]">
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] text-left text-sm">
            <thead className="bg-[#2a323c] text-xs uppercase tracking-[0.16em] text-white/85">
              <tr>
                <th className="px-4 py-3">Container / PO #</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Tracking #</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Port / ETA</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Total Units</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Refresh</th>
              </tr>
            </thead>
            <tbody>
              {containerShipments.map((container) => (
                <tr key={container.id} className="border-t border-[var(--line-soft)]">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{container.containerNo}</p>
                    <p className="text-xs text-[var(--text-muted)]">PO #{container.poNumber}</p>
                  </td>
                  <td className="px-4 py-3">{container.supplier}</td>
                  <td className="px-4 py-3">{container.trackingNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{container.status}</p>
                    <p className="text-xs text-[var(--text-muted)]">{container.inventoryStatus}</p>
                  </td>
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
                  <td className="px-4 py-3">{getContainerTotalUnits(container)}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{getContainerLineCount(container)} lines</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/containers/${container.id}`}
                      className="rounded-md border border-[var(--line-soft)] px-2.5 py-1.5 text-xs font-semibold hover:border-[var(--brand-accent)]"
                    >
                      Details
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => refreshTracking(container.id)}
                      className="rounded-md border border-[var(--line-soft)] px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!container.trackingConnected || refreshingId === container.id}
                    >
                      {refreshingId === container.id ? "Refreshing..." : "Refresh"}
                    </button>
                    {messageById[container.id] ? (
                      <p className="mt-1 text-[10px] text-[var(--text-muted)]">{messageById[container.id]}</p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-5">
        <h3 className="text-lg font-bold">Products on incoming containers</h3>
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
