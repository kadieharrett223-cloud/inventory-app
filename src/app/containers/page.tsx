"use client";

import { useMemo, useState } from "react";
import { estimateArrivalWindowFromDeparture } from "@/lib/inventory-core";
import { containerShipments, erpProducts } from "@/lib/inventory-data";

export default function ContainersPage() {
  const [departureDate, setDepartureDate] = useState("2026-07-05");
  const [containerNo, setContainerNo] = useState("NEW-PLAN-001");
  const [portName, setPortName] = useState("Long Beach");

  const etaWindow = useMemo(
    () => estimateArrivalWindowFromDeparture(departureDate, 60, 90),
    [departureDate],
  );

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Containers
        </p>
        <h2 className="mt-2 text-2xl font-bold">Container Inventory Entry</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Enter each inbound container and expected product quantities. ETA planning uses the 60-90 day transit window.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-5">
          <h3 className="text-lg font-bold">New Container Planner</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Container No</span>
              <input
                value={containerNo}
                onChange={(event) => setContainerNo(event.target.value)}
                className="w-full rounded-lg border border-[var(--line-soft)] px-2 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Departure Date</span>
              <input
                type="date"
                value={departureDate}
                onChange={(event) => setDepartureDate(event.target.value)}
                className="w-full rounded-lg border border-[var(--line-soft)] px-2 py-2"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Port</span>
              <input
                value={portName}
                onChange={(event) => setPortName(event.target.value)}
                className="w-full rounded-lg border border-[var(--line-soft)] px-2 py-2"
              />
            </label>
          </div>

          <div className="mt-4 rounded-xl border border-[var(--line-soft)] bg-[var(--status-blue-bg)] p-3 text-sm text-[var(--status-blue-text)]">
            <p className="font-semibold">Transit estimate: {containerNo}</p>
            <p>
              Departing {departureDate} from origin suggests port window of {etaWindow.earliest} to {etaWindow.latest} at {portName}.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-5">
          <h3 className="text-lg font-bold">Products to load</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {erpProducts.map((product) => (
              <li key={product.id} className="flex items-center justify-between rounded-lg border border-[var(--line-soft)] px-3 py-2">
                <span>{product.name}</span>
                <span className="text-xs text-[var(--text-muted)]">Qty field in DB form</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#2a323c] text-xs uppercase tracking-[0.16em] text-white/85">
            <tr>
              <th className="px-4 py-3">Container</th>
              <th className="px-4 py-3">Port Date</th>
              <th className="px-4 py-3">Port</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Items</th>
            </tr>
          </thead>
          <tbody>
            {containerShipments.map((container) => (
              <tr key={container.id} className="border-t border-[var(--line-soft)]">
                <td className="px-4 py-3 font-semibold">{container.containerNo}</td>
                <td className="px-4 py-3">{container.portDate}</td>
                <td className="px-4 py-3">{container.portName}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[var(--status-blue-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--status-blue-text)]">
                    {container.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                  {container.items
                    .map((item) => {
                      const product = erpProducts.find((entry) => entry.id === item.erpProductId);
                      return `${product?.name ?? item.erpProductId} x${item.qty}`;
                    })
                    .join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
