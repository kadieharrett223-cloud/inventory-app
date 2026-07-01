"use client";

import { useMemo, useState } from "react";
import { erpProducts, productMappings, qboProducts } from "@/lib/inventory-data";

export default function SettingsPage() {
  const initialMap = useMemo(() => {
    const mapping = new Map<string, string>();
    for (const item of productMappings) {
      mapping.set(item.qboProductId, item.erpProductId);
    }
    return mapping;
  }, []);

  const [mappingByQbo, setMappingByQbo] = useState<Record<string, string>>(
    Object.fromEntries(initialMap.entries()),
  );

  const mappedCount = Object.values(mappingByQbo).filter(Boolean).length;

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <div className="rounded-[20px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_10px_26px_-24px_rgba(17,24,39,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Settings
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Settings & Mapping</h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--text-muted)]">
          Keep the app simple. Use this page for product mapping and integration settings.
        </p>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-[18px] border border-[var(--line-soft)] bg-[var(--bg-page)] p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Supabase URL</dt>
            <dd className="mt-1 break-all font-medium">{process.env.NEXT_PUBLIC_SUPABASE_URL ?? "Not set"}</dd>
          </div>
          <div className="rounded-[18px] border border-[var(--line-soft)] bg-[var(--bg-page)] p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">QBO Client</dt>
            <dd className="mt-1 break-all font-medium">Configured via server env</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-[20px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_10px_26px_-24px_rgba(17,24,39,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Product Mapping
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">QuickBooks to ERP Product Mapping</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Map QBO products to ERP products here. This is kept under Settings to keep the app simple.
        </p>
        <p className="mt-3 text-sm font-semibold text-[var(--status-blue-text)]">
          {mappedCount} of {qboProducts.length} mapped
        </p>

        <div className="mt-4 overflow-hidden rounded-[18px] border border-[var(--line-soft)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--bg-page)] text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3">QBO Product</th>
                <th className="px-4 py-3">ERP Product</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {qboProducts.map((qboProduct) => {
                const mappedProductId = mappingByQbo[qboProduct.id] ?? "";
                const mappedProduct = erpProducts.find((product) => product.id === mappedProductId);

                return (
                  <tr key={qboProduct.id} className="border-t border-[var(--line-soft)]">
                    <td className="px-4 py-3 font-semibold">{qboProduct.name}</td>
                    <td className="px-4 py-3">
                      <select
                        value={mappedProductId}
                        onChange={(event) =>
                          setMappingByQbo((prev) => ({
                            ...prev,
                            [qboProduct.id]: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-[var(--line-soft)] bg-white px-2 py-2 text-sm"
                      >
                        <option value="">Not mapped</option>
                        {erpProducts.map((erpProduct) => (
                          <option key={erpProduct.id} value={erpProduct.id}>
                            {erpProduct.sku} - {erpProduct.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          mappedProduct
                            ? "bg-[var(--status-green-bg)] text-[var(--status-green-text)]"
                            : "bg-[var(--status-gray-bg)] text-[var(--status-gray-text)]"
                        }`}
                      >
                        {mappedProduct ? "Mapped" : "Needs mapping"}
                      </span>
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
