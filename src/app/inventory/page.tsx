export default function InventoryPage() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Inventory
        </p>
        <h2 className="mt-2 text-2xl font-bold">Stock Workspace</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Placeholder page for item list, adjustments, transfers, and cycle counts.
        </p>
      </div>
    </section>
  );
}
