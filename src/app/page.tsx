import Link from "next/link";
import { computeProductAvailability, deriveAssignmentsFromApprovedInvoices, isContainerReceived, isInvoiceEligibleForWarehouse } from "@/lib/inventory-core";
import { containerShipments, customerInvoices, erpProducts } from "@/lib/inventory-data";
import { AlertIcon, ArrowUpRightIcon, CheckIcon, ClockIcon, ContainersIcon, DashboardIcon, InventoryIcon, OrdersIcon, ShipIcon } from "@/components/line-icons";

function sumBy<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((total, item) => total + selector(item), 0);
}

export default function Home() {
  const assignments = deriveAssignmentsFromApprovedInvoices(customerInvoices);
  const snapshots = erpProducts.map((product) => computeProductAvailability(product, assignments, containerShipments));

  const totalAvailableNow = sumBy(snapshots, (snapshot) => snapshot.availableNowQty);
  const totalIncoming = sumBy(snapshots, (snapshot) => snapshot.incomingQty);
  const totalAssigned = sumBy(snapshots, (snapshot) => snapshot.soldAssignedQty);
  const lowProducts = snapshots.filter((snapshot) => snapshot.availableNowQty <= 5).length;
  const containersInTransit = containerShipments.filter((container) => !isContainerReceived(container)).length;
  const ordersWaitingApproval = customerInvoices.filter((invoice) => isInvoiceEligibleForWarehouse(invoice) && !invoice.approvedByShipping).length;
  const nextContainer = containerShipments.find((container) => !isContainerReceived(container)) ?? containerShipments[0];

  const cards = [
    {
      title: "Inventory",
      value: totalAvailableNow,
      subtitle: "Available now",
      tone: "green",
      strip: "bg-[var(--status-green-text)]",
      icon: InventoryIcon,
    },
    {
      title: "Incoming Containers",
      value: totalIncoming,
      subtitle: `Next arrival: ${nextContainer?.portDate ?? "—"}`,
      tone: "blue",
      strip: "bg-[var(--status-blue-text)]",
      icon: ShipIcon,
    },
    {
      title: "Orders Waiting",
      value: ordersWaitingApproval,
      subtitle: "Awaiting shipping approval",
      tone: "orange",
      strip: "bg-[var(--status-yellow-text)]",
      icon: OrdersIcon,
    },
    {
      title: "Containers In Transit",
      value: containersInTransit,
      subtitle: "Tracking active",
      tone: "gray",
      strip: "bg-[var(--status-gray-text)]",
      icon: ContainersIcon,
    },
  ] as const;

  const actions = [
    {
      title: "Review Orders",
      description: "Approve paid invoices and move them into shipping.",
      href: "/orders",
      icon: CheckIcon,
      accent: "bg-[var(--brand-accent)]",
    },
    {
      title: "Check Availability",
      description: "See the spreadsheet-style availability math for every product.",
      href: "/availability",
      icon: DashboardIcon,
      accent: "bg-[var(--status-blue-text)]",
    },
    {
      title: "Open Containers",
      description: "Follow the progress timeline from ordered to warehouse.",
      href: "/containers",
      icon: ClockIcon,
      accent: "bg-[var(--status-gray-text)]",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[20px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
          <p className="text-sm font-medium text-[var(--text-muted)]">Good morning, Kadie.</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Premium logistics software for Olympic Equipment.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
            Fast answers for warehouse managers, logistics coordinators, and sales teams. Inventory, containers, and orders stay visible in one operational view.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusPill tone="blue" text={`${containersInTransit} in transit`} />
            <StatusPill tone="green" text={`${totalAvailableNow} units available now`} />
            <StatusPill tone="orange" text={`${ordersWaitingApproval} orders waiting`} />
          </div>
        </div>

        <div className="rounded-[20px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Priority</p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight">Today&apos;s focus</h3>
            </div>
            <div className="rounded-2xl bg-[var(--bg-page)] p-3 text-[var(--brand-accent)]">
              <AlertIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <PriorityRow label="Orders ready to approve" value={totalAssigned} tone="green" />
            <PriorityRow label="Low stock products" value={lowProducts} tone="orange" />
            <PriorityRow label="Next inbound container" value={nextContainer?.containerNo ?? "—"} tone="blue" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="card-hover rounded-[18px] border border-[var(--line-soft)] bg-white shadow-[0_10px_26px_-24px_rgba(17,24,39,0.35)]">
              <div className={`h-1.5 w-full ${card.strip}`} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-muted)]">{card.title}</p>
                    <p className="mt-2 text-4xl font-semibold tracking-tight text-[var(--text-primary)]">{card.value}</p>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">{card.subtitle}</p>
                  </div>
                  <div className="rounded-2xl bg-[var(--bg-page)] p-3 text-[var(--text-primary)]">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.href} className="card-hover rounded-[18px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_10px_26px_-24px_rgba(17,24,39,0.35)]">
              <div className={`inline-flex rounded-2xl p-3 text-white ${action.accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{action.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{action.description}</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                Open
                <ArrowUpRightIcon className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function StatusPill({ tone, text }: { tone: "blue" | "green" | "orange"; text: string }) {
  const toneClasses = {
    blue: "bg-[var(--status-blue-bg)] text-[var(--status-blue-text)]",
    green: "bg-[var(--status-green-bg)] text-[var(--status-green-text)]",
    orange: "bg-[var(--status-yellow-bg)] text-[var(--status-yellow-text)]",
  } as const;

  return <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${toneClasses[tone]}`}>{text}</span>;
}

function PriorityRow({ label, value, tone }: { label: string; value: number | string; tone: "green" | "orange" | "blue" }) {
  const toneClasses = {
    green: "border-[var(--status-green-bg)] text-[var(--status-green-text)]",
    orange: "border-[var(--status-yellow-bg)] text-[var(--status-yellow-text)]",
    blue: "border-[var(--status-blue-bg)] text-[var(--status-blue-text)]",
  } as const;

  return (
    <div className={`flex items-center justify-between rounded-2xl border bg-[var(--bg-page)] px-4 py-3 ${toneClasses[tone]}`}>
      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}
