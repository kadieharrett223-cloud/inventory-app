import Link from "next/link";
import { computeProductAvailability, deriveAssignmentsFromApprovedInvoices, isContainerReceived, isInvoiceEligibleForWarehouse } from "@/lib/inventory-core";
import { containerShipments, customerInvoices, erpProducts } from "@/lib/inventory-data";

function iconCard(title: string, value: string, subtitle: string, icon: string) {
  return { title, value, subtitle, icon };
}

export default function Home() {
  const assignments = deriveAssignmentsFromApprovedInvoices(customerInvoices);
  const snapshots = erpProducts.map((product) => computeProductAvailability(product, assignments, containerShipments));

  const totalIncoming = snapshots.reduce((sum, snapshot) => sum + snapshot.incomingQty, 0);
  const totalAssigned = snapshots.reduce((sum, snapshot) => sum + snapshot.soldAssignedQty, 0);
  const lowProducts = snapshots.filter((snapshot) => snapshot.availableNowQty <= 5).length;
  const containersInTransit = containerShipments.filter((container) => !isContainerReceived(container)).length;
  const ordersWaitingApproval = customerInvoices.filter(
    (invoice) => isInvoiceEligibleForWarehouse(invoice) && !invoice.approvedByShipping,
  ).length;

  const kpis = [
    iconCard("Inventory", `${snapshots.reduce((sum, snapshot) => sum + snapshot.availableNowQty, 0)}`, "Units available now", "📦"),
    iconCard("Incoming", `${totalIncoming}`, "Units on the water", "🚢"),
    iconCard("Assigned", `${totalAssigned}`, "Units tied to customers", "📋"),
    iconCard("Backordered", `${lowProducts}`, "Products running low", "⚠️"),
  ];

  const priorityActions = [
    {
      title: `Orders Waiting Approval (${ordersWaitingApproval})`,
      description: "Review paid or partially paid invoices and approve for shipping.",
      href: "/orders",
      cta: "Approve →",
      icon: "🛒",
    },
    {
      title: `Container Arriving Tomorrow`,
      description: `See the next inbound container and whether it covers current demand.`,
      href: "/containers",
      cta: "View →",
      icon: "🚢",
    },
    {
      title: `Inventory Running Low`,
      description: `${lowProducts} products need attention before sales overcommit stock.`,
      href: "/availability",
      cta: "Check →",
      icon: "📦",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-[20px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_10px_30px_-24px_rgba(17,24,39,0.35)]">
        <p className="text-sm font-medium text-[var(--text-muted)]">Good morning, Kadie.</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">Here&apos;s what&apos;s happening today.</h2>
        <div className="mt-5 grid gap-3 text-sm text-[var(--text-primary)] sm:grid-cols-2 xl:grid-cols-5">
          <SummaryPill icon="✓" text={`${containersInTransit} Containers In Transit`} tone="blue" />
          <SummaryPill icon="✓" text={`${totalAssigned} Orders Ready To Ship`} tone="green" />
          <SummaryPill icon="✓" text={`${ordersWaitingApproval} Orders Waiting Approval`} tone="orange" />
          <SummaryPill icon="✓" text={`${lowProducts} Products Running Low`} tone="red" />
          <SummaryPill icon="✓" text={`1 Container Arriving Tomorrow`} tone="gray" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => (
          <article key={card.title} className="card-hover rounded-[20px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_10px_26px_-24px_rgba(17,24,39,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--text-muted)]">{card.title}</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight">{card.value}</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{card.subtitle}</p>
              </div>
              <div className="rounded-2xl bg-[var(--bg-page)] px-3 py-2 text-2xl">{card.icon}</div>
            </div>
          </article>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Priority actions</h3>
            <p className="text-sm text-[var(--text-muted)]">The fastest path to what needs attention right now.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {priorityActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="card-hover rounded-[20px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_10px_26px_-24px_rgba(17,24,39,0.28)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl">{action.icon}</p>
                  <h4 className="mt-3 text-lg font-semibold">{action.title}</h4>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">{action.description}</p>
                </div>
                <span className="mt-1 text-sm font-medium text-[var(--brand-accent)]">{action.cta}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function SummaryPill({ icon, text, tone }: { icon: string; text: string; tone: "blue" | "green" | "orange" | "red" | "gray" }) {
  const toneClasses: Record<string, string> = {
    blue: "bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]",
    green: "bg-[var(--status-green-bg)] text-[var(--status-green-text)]",
    orange: "bg-[var(--status-yellow-bg)] text-[var(--status-yellow-text)]",
    red: "bg-[var(--status-red-bg)] text-[var(--status-red-text)]",
    gray: "bg-[var(--status-gray-bg)] text-[var(--status-gray-text)]",
  };

  return (
    <div className={`rounded-full px-4 py-2 ${toneClasses[tone]}`}>
      <span className="mr-2 font-semibold">{icon}</span>
      {text}
    </div>
  );
}