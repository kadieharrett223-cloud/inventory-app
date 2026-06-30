import Link from "next/link";

const modules = [
  {
    href: "/product-mapping",
    title: "Product Mapping",
    description: "Map QuickBooks products to internal ERP products.",
  },
  {
    href: "/orders",
    title: "New Orders / Invoices",
    description: "Review paid and partially paid invoices and approve for shipping.",
  },
  {
    href: "/containers",
    title: "Container Entry",
    description: "Track inbound containers, ETAs, and product quantities.",
  },
  {
    href: "/availability",
    title: "Availability",
    description: "See real available inventory and next container coverage.",
  },
  {
    href: "/products",
    title: "Product Truth",
    description: "Per-product view of floor stock, sold assignments, and incoming containers.",
  },
];

export default function InventoryPage() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Inventory
        </p>
        <h2 className="mt-2 text-2xl font-bold">Core Workflow Modules</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Start with product mapping, invoice approvals, container intake, and live availability calculations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-5 hover:border-[var(--brand-accent)]"
          >
            <h3 className="text-lg font-bold">{module.title}</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{module.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
