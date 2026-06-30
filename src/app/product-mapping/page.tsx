"use client";

import { useMemo, useState } from "react";
import { erpProducts, productMappings, qboProducts } from "@/lib/inventory-data";

export default function ProductMappingPage() {
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
      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Product Mapping
        </p>
        <h2 className="mt-2 text-2xl font-bold">QuickBooks to ERP Product Mapping</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Map QBO product names to your ERP products so paid invoices route correctly into warehouse and availability logic.
        </p>
        <p className="mt-3 text-sm font-semibold text-[var(--brand-secondary)]">
          {mappedCount} of {qboProducts.length} products mapped
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#2a323c] text-xs uppercase tracking-[0.16em] text-white/85">
            <tr>
              <th className="px-4 py-3">QBO Product</th>
              <th className="px-4 py-3">ERP Product</th>
              <th className="px-4 py-3">Mapping Status</th>
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
    </section>
  );
}
