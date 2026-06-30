import { validateConfig } from "@/lib/config";
import { getQboConnectionState } from "@/lib/qbo";
import { getSupabaseConnectionState } from "@/lib/supabase";

export default function Home() {
  const config = validateConfig();
  const supabaseState = getSupabaseConnectionState();
  const qboState = getQboConnectionState();

  const metrics = [
    { label: "Total SKUs", value: "1,248", delta: "+4.9%" },
    { label: "Low Stock", value: "37", delta: "-1.2%" },
    { label: "Open Orders", value: "82", delta: "+8.1%" },
    { label: "Pending Receipts", value: "14", delta: "+2.4%" },
  ];

  const tableRows = [
    { sku: "FG-2101", item: "Aluminum Housing", qty: 148, reorder: 120, status: "Healthy" },
    { sku: "FG-2004", item: "Bearing Set", qty: 42, reorder: 60, status: "Reorder" },
    { sku: "FG-1008", item: "Control Board", qty: 16, reorder: 30, status: "Critical" },
    { sku: "FG-3302", item: "Pressure Valve", qty: 96, reorder: 80, status: "Healthy" },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl animate-[fadeIn_500ms_ease-out] space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-5 shadow-[0_24px_60px_-38px_rgba(0,0,0,0.2)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Operations Snapshot
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Inventory Command Deck</h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
            Shell UI is ready. Next step is data wiring: Supabase for inventory state,
            QuickBooks for accounting sync, and GitHub + Vercel for deployment workflow.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--line-soft)] bg-[linear-gradient(140deg,rgba(107,15,26,0.98),rgba(17,17,17,0.98))] p-5 text-white shadow-[0_24px_60px_-36px_rgba(107,15,26,0.5)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
            Integrations Status
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Supabase: {supabaseState.reason}</li>
            <li>QBO: {qboState.reason}</li>
            <li>Config readiness: {config.hasSupabase && config.hasQbo ? "Connected" : "Waiting for env vars"}</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-bold">{metric.value}</p>
            <p className="mt-1 text-xs font-medium text-[var(--brand-secondary)]">{metric.delta} vs 30d</p>
          </article>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)]">
        <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Stock Preview
          </h3>
          <button className="rounded-lg border border-[var(--line-soft)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]">
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--panel-strong)] text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">On Hand</th>
                <th className="px-4 py-3">Reorder Point</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.sku} className="border-t border-[var(--line-soft)]">
                  <td className="px-4 py-3 font-semibold">{row.sku}</td>
                  <td className="px-4 py-3">{row.item}</td>
                  <td className="px-4 py-3">{row.qty}</td>
                  <td className="px-4 py-3">{row.reorder}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        row.status === "Healthy"
                          ? "bg-black/5 text-black/80"
                          : row.status === "Reorder"
                            ? "bg-[#f4e2e5] text-[var(--brand-accent)]"
                            : "bg-[var(--brand-accent)] text-white"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
