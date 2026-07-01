import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  type ContainerDocument,
  type ContainerUnloadPlanStatus,
  deriveAssignmentsFromApprovedInvoices,
  getContainerTotalUnits,
  getReceivedUnitsForProduct,
  isContainerReceived,
} from "@/lib/inventory-core";
import { containerDocumentsById, containerShipments, containerUnloadPlans, customerInvoices, erpProducts } from "@/lib/inventory-data";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

type ContainerDetailPageProps = {
  params: Promise<{ containerId: string }>;
};

type TimelineStep = {
  key: "origin" | "ship" | "destination" | "released" | "scheduled" | "arrived" | "received";
  label: string;
};

const timelineSteps: TimelineStep[] = [
  { key: "origin", label: "At origin port" },
  { key: "ship", label: "On the ship" },
  { key: "destination", label: "At destination port" },
  { key: "released", label: "Released from port" },
  { key: "scheduled", label: "Scheduled for warehouse delivery" },
  { key: "arrived", label: "Arrived at warehouse" },
  { key: "received", label: "Unloaded / received into inventory" },
];

const unloadStatuses: ContainerUnloadPlanStatus[] = ["Not Scheduled", "Scheduled", "Ready to Unload", "Unloaded"];

type AppContainer = (typeof containerShipments)[number];

function getSupabaseOrNull() {
  try {
    return getSupabaseAdminClient();
  } catch {
    return null;
  }
}

async function fetchContainerFromSupabase(containerId: string): Promise<AppContainer | null> {
  const supabase = getSupabaseOrNull();
  if (!supabase) return null;

  const { data: containerRow, error: containerError } = await supabase
    .from("container_shipments")
    .select("*")
    .eq("id", containerId)
    .maybeSingle();

  if (containerError || !containerRow) return null;

  const [{ data: itemRows, error: itemsError }, { data: milestoneRows, error: milestonesError }] = await Promise.all([
    supabase.from("container_items").select("erp_product_id, qty").eq("container_id", containerId),
    supabase.from("container_milestones").select("stage, milestone_date").eq("container_id", containerId).order("milestone_date", { ascending: true }),
  ]);

  if (itemsError || milestonesError) return null;

  return {
    id: containerRow.id,
    poNumber: containerRow.po_number,
    containerNo: containerRow.container_no,
    supplier: containerRow.supplier,
    trackingNumber: containerRow.tracking_number ?? "",
    trackingSource: containerRow.tracking_source ?? "",
    origin: containerRow.origin ?? "",
    originPortDate: containerRow.origin_port_date ?? "",
    onShipDate: containerRow.on_ship_date ?? "",
    poDate: containerRow.po_date ?? "",
    portDate: containerRow.port_date ?? "",
    deliveryDate: containerRow.delivery_date ?? "",
    portName: containerRow.port_name ?? "",
    paymentStatus: containerRow.payment_status,
    status: containerRow.status,
    inventoryStatus: containerRow.inventory_status,
    uploadedAt: containerRow.uploaded_at ?? "",
    trackingConnected: Boolean(containerRow.tracking_connected),
    milestones: (milestoneRows ?? []).map((row) => ({ stage: row.stage, date: row.milestone_date })),
    items: (itemRows ?? []).map((row) => ({ erpProductId: row.erp_product_id, qty: row.qty })),
  };
}

async function fetchContainerSupportData(containerId: string) {
  const fallbackPlan = containerUnloadPlans.find((entry) => entry.containerId === containerId) ?? null;
  const fallbackDocs =
    containerDocumentsById[containerId] ??
    [
      { label: "Supplier invoice", uploadedAt: null, status: "Missing" as const },
      { label: "Packing list", uploadedAt: null, status: "Missing" as const },
      { label: "Bill of lading", uploadedAt: null, status: "Missing" as const },
      { label: "Delivery appointment", uploadedAt: null, status: "Missing" as const },
    ];

  const supabase = getSupabaseOrNull();
  if (!supabase) {
    return { unloadPlan: fallbackPlan, documents: fallbackDocs };
  }

  const [planRes, docsRes, notesRes] = await Promise.all([
    supabase
      .from("container_unload_plans")
      .select("scheduled_unload_date, scheduled_unload_time, warehouse_bay, forklift_needed, staff_assigned, estimated_pallets, estimated_units, notes, status")
      .eq("container_id", containerId)
      .maybeSingle(),
    supabase.from("container_documents").select("doc_label, uploaded_at, status").eq("container_id", containerId),
    supabase.from("container_internal_notes").select("notes").eq("container_id", containerId).maybeSingle(),
  ]);

  const unloadPlan = planRes.data
    ? {
        containerId,
        scheduledUnloadDate: planRes.data.scheduled_unload_date,
        scheduledUnloadTime: planRes.data.scheduled_unload_time,
        warehouseBay: planRes.data.warehouse_bay,
        forkliftNeeded: Boolean(planRes.data.forklift_needed),
        staffAssigned: planRes.data.staff_assigned ?? [],
        estimatedPallets: planRes.data.estimated_pallets ?? 0,
        estimatedUnits: planRes.data.estimated_units ?? 0,
        notes: notesRes.data?.notes ?? planRes.data.notes ?? "",
        status: planRes.data.status,
      }
    : fallbackPlan;

  const documents =
    docsRes.data && docsRes.data.length > 0
      ? docsRes.data.map((doc) => ({
          label: doc.doc_label,
          uploadedAt: doc.uploaded_at,
          status: doc.status,
        }))
      : fallbackDocs;

  return { unloadPlan, documents };
}

function revalidateContainerSurfaces(containerId: string) {
  revalidatePath("/");
  revalidatePath("/availability");
  revalidatePath("/containers");
  revalidatePath(`/containers/${containerId}`);
}

async function receiveIntoInventory(containerId: string) {
  "use server";

  const container = containerShipments.find((entry) => entry.id === containerId);
  if (!container) {
    return;
  }

  if (isContainerReceived(container)) {
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  const supabase = getSupabaseOrNull();
  if (supabase) {
    await supabase
      .from("container_shipments")
      .update({
        status: "Received into inventory",
        inventory_status: "Received",
      })
      .eq("id", containerId);

    await supabase.from("container_milestones").upsert(
      [
        { container_id: containerId, stage: "Arrived at warehouse", milestone_date: today },
        { container_id: containerId, stage: "Received into inventory", milestone_date: today },
      ],
      { onConflict: "container_id,stage" },
    );

    await supabase
      .from("container_unload_plans")
      .upsert(
        {
          container_id: containerId,
          status: "Unloaded",
          scheduled_unload_date: today,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "container_id" },
      );
  }

  container.status = "Received into inventory";
  container.inventoryStatus = "Received";

  const existing = new Set(container.milestones.map((item) => item.stage));
  if (!existing.has("Arrived at warehouse")) {
    container.milestones.push({ stage: "Arrived at warehouse", date: today });
  }
  if (!existing.has("Received into inventory")) {
    container.milestones.push({ stage: "Received into inventory", date: today });
  }

  container.milestones.sort((a, b) => a.date.localeCompare(b.date));

  const plan = containerUnloadPlans.find((entry) => entry.containerId === containerId);
  if (plan) {
    plan.status = "Unloaded";
    if (!plan.scheduledUnloadDate) {
      plan.scheduledUnloadDate = today;
    }
  }

  revalidateContainerSurfaces(containerId);
}

async function saveUnloadPlan(containerId: string, formData: FormData) {
  "use server";

  const container = containerShipments.find((entry) => entry.id === containerId);
  if (!container) return;

  const existingPlan = containerUnloadPlans.find((entry) => entry.containerId === containerId);
  const estimatedUnitsRaw = String(formData.get("estimatedUnits") ?? "0");
  const estimatedPalletsRaw = String(formData.get("estimatedPallets") ?? "0");
  const selectedStatus = String(formData.get("status") ?? "Not Scheduled");
  const parsedUnits = Number.parseInt(estimatedUnitsRaw, 10);
  const parsedPallets = Number.parseInt(estimatedPalletsRaw, 10);

  const plan =
    existingPlan ?? {
      containerId,
      scheduledUnloadDate: null,
      scheduledUnloadTime: null,
      warehouseBay: null,
      forkliftNeeded: true,
      staffAssigned: [],
      estimatedPallets: Math.max(1, Math.ceil(getContainerTotalUnits(container) / 8)),
      estimatedUnits: getContainerTotalUnits(container),
      notes: "",
      status: "Not Scheduled" as const,
    };

  plan.scheduledUnloadDate = cleanText(formData.get("scheduledUnloadDate"));
  plan.scheduledUnloadTime = cleanText(formData.get("scheduledUnloadTime"));
  plan.warehouseBay = cleanText(formData.get("warehouseBay"));
  plan.forkliftNeeded = String(formData.get("forkliftNeeded") ?? "yes") === "yes";
  plan.staffAssigned = String(formData.get("staffAssigned") ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  plan.estimatedUnits = Number.isFinite(parsedUnits) && parsedUnits > 0 ? parsedUnits : getContainerTotalUnits(container);
  plan.estimatedPallets = Number.isFinite(parsedPallets) && parsedPallets > 0 ? parsedPallets : Math.max(1, Math.ceil(plan.estimatedUnits / 8));
  plan.status = unloadStatuses.includes(selectedStatus as ContainerUnloadPlanStatus)
    ? (selectedStatus as ContainerUnloadPlanStatus)
    : "Not Scheduled";

  if (!existingPlan) {
    containerUnloadPlans.push(plan);
  }

  const supabase = getSupabaseOrNull();
  if (supabase) {
    await supabase
      .from("container_unload_plans")
      .upsert(
        {
          container_id: containerId,
          scheduled_unload_date: plan.scheduledUnloadDate,
          scheduled_unload_time: plan.scheduledUnloadTime,
          warehouse_bay: plan.warehouseBay,
          forklift_needed: plan.forkliftNeeded,
          staff_assigned: plan.staffAssigned,
          estimated_pallets: plan.estimatedPallets,
          estimated_units: plan.estimatedUnits,
          notes: plan.notes,
          status: plan.status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "container_id" },
      );
  }

  revalidateContainerSurfaces(containerId);
}

async function saveDocuments(containerId: string, formData: FormData) {
  "use server";

  const existingDocs = containerDocumentsById[containerId] ?? [
    { label: "Supplier invoice", uploadedAt: null, status: "Missing" },
    { label: "Packing list", uploadedAt: null, status: "Missing" },
    { label: "Bill of lading", uploadedAt: null, status: "Missing" },
    { label: "Delivery appointment", uploadedAt: null, status: "Missing" },
  ];

  const today = new Date().toISOString().slice(0, 10);
  const updated: ContainerDocument[] = existingDocs.map((doc, index) => {
    const selected = formData.get(`doc-${index}`) === "on";
    return {
      label: doc.label,
      status: selected ? "Uploaded" : "Missing",
      uploadedAt: selected ? doc.uploadedAt ?? today : null,
    };
  });

  containerDocumentsById[containerId] = updated;

  const supabase = getSupabaseOrNull();
  if (supabase) {
    await supabase.from("container_documents").upsert(
      updated.map((doc) => ({
        container_id: containerId,
        doc_label: doc.label,
        status: doc.status,
        uploaded_at: doc.uploadedAt,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "container_id,doc_label" },
    );
  }

  revalidateContainerSurfaces(containerId);
}

async function saveInternalNotes(containerId: string, formData: FormData) {
  "use server";

  const notes = String(formData.get("notes") ?? "").trim();
  const plan = containerUnloadPlans.find((entry) => entry.containerId === containerId);

  if (plan) {
    plan.notes = notes;
  } else {
    const container = containerShipments.find((entry) => entry.id === containerId);
    if (container) {
      containerUnloadPlans.push({
        containerId,
        scheduledUnloadDate: null,
        scheduledUnloadTime: null,
        warehouseBay: null,
        forkliftNeeded: true,
        staffAssigned: [],
        estimatedPallets: Math.max(1, Math.ceil(getContainerTotalUnits(container) / 8)),
        estimatedUnits: getContainerTotalUnits(container),
        notes,
        status: "Not Scheduled",
      });
    }
  }

  const supabase = getSupabaseOrNull();
  if (supabase) {
    await supabase
      .from("container_internal_notes")
      .upsert(
        {
          container_id: containerId,
          notes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "container_id" },
      );
  }

  revalidateContainerSurfaces(containerId);
}

export default async function ContainerDetailPage({ params }: ContainerDetailPageProps) {
  const { containerId } = await params;

  const fallbackContainer = containerShipments.find((entry) => entry.id === containerId);
  const dbContainer = await fetchContainerFromSupabase(containerId);
  const container = dbContainer ?? fallbackContainer;
  if (!container) {
    notFound();
  }

  const supportData = await fetchContainerSupportData(container.id);

  const unloadPlan =
    supportData.unloadPlan ?? {
      containerId: container.id,
      scheduledUnloadDate: null,
      scheduledUnloadTime: null,
      warehouseBay: null,
      forkliftNeeded: true,
      staffAssigned: [],
      estimatedPallets: Math.max(1, Math.ceil(getContainerTotalUnits(container) / 8)),
      estimatedUnits: getContainerTotalUnits(container),
      notes: "",
      status: "Not Scheduled" as const,
    };

  const assignments = deriveAssignmentsFromApprovedInvoices(customerInvoices);
  const currentStep = getCurrentTimelineStep(container.status, unloadPlan.scheduledUnloadDate, container.deliveryDate);
  const daysUntilPortArrival = dateDiffInDays(container.portDate);
  const daysUntilWarehouse = dateDiffInDays(container.deliveryDate);
  const locationLabel = deriveLocationLabel(container.status, container.origin, container.portName);
  const documents = supportData.documents;

  return (
    <section className="mx-auto w-full max-w-6xl space-y-4">
      <header className="rounded-[20px] border border-[var(--line-soft)] bg-white px-5 py-5 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Container / PO #{container.poNumber}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{container.containerNo}</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(container.status)}`}>{container.status}</span>
        </div>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">Supplier {container.supplier} • Tracking {container.trackingNumber} via {container.trackingSource}</p>
      </header>

      <section className="rounded-[20px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
        <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Container Tracking Timeline</h3>
        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[780px]">
            <div className="flex items-center">
              {timelineSteps.map((step, index) => {
                const state = index < currentStep ? "done" : index === currentStep ? "current" : "future";
                return (
                  <div key={step.key} className="flex flex-1 items-center gap-2 last:flex-none">
                    <div
                      className={`h-4 w-4 rounded-full border-2 ${
                        state === "done"
                          ? "border-[#1e3a5f] bg-[#2f6b4f]"
                          : state === "current"
                            ? "border-[#8b1e24] bg-[#8b1e24]"
                            : "border-[#cfd7e2] bg-white"
                      }`}
                    />
                    {index < timelineSteps.length - 1 ? (
                      <div className={`h-[3px] flex-1 ${index < currentStep ? "bg-[#1e3a5f]" : "bg-[#dbe2ec]"}`} />
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="mt-2.5 grid grid-cols-7 gap-2 text-[11px] font-semibold leading-4 text-[var(--text-muted)]">
              {timelineSteps.map((step, index) => (
                <p key={`${step.key}-label`} className={index <= currentStep ? "text-[#172436]" : "text-[var(--text-muted)]"}>
                  {step.label}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <section className="rounded-[20px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
          <div className="bg-[linear-gradient(90deg,#111d31_0%,#091223_100%)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white">Status Summary</div>
          <div className="grid gap-3 p-3 sm:grid-cols-2">
            <SummaryField label="Current status" value={container.status} />
            <SummaryField label="Current location" value={locationLabel} />
            <SummaryField label="Port ETA" value={formatLongDate(container.portDate)} />
            <SummaryField label="Warehouse delivery" value={formatLongDate(container.deliveryDate)} />
            <SummaryField
              label="Days until arrival"
              value={daysUntilPortArrival >= 0 ? `${daysUntilPortArrival} days to port` : `${Math.abs(daysUntilPortArrival)} days past ETA`}
            />
            <SummaryField
              label="Days until warehouse"
              value={daysUntilWarehouse >= 0 ? `${daysUntilWarehouse} days to delivery` : `${Math.abs(daysUntilWarehouse)} days past delivery`}
            />
            <SummaryField label="Carrier" value={container.trackingSource} />
            <SummaryField label="Tracking number" value={container.trackingNumber} />
          </div>
        </section>

        <section className="rounded-[20px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
          <div className="flex items-center justify-between bg-[linear-gradient(90deg,#111d31_0%,#091223_100%)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
            <span>Receive Inventory</span>
            <span className="text-[#ef2d35]">Warehouse Action</span>
          </div>

          <div className="space-y-3 p-3 text-sm text-[var(--text-muted)]">
            <p>
              When unloaded, this action marks the container as received, rolls quantities into inventory availability, and updates allocation
              pressure for backordered products.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <SummaryField label="Inventory status" value={container.inventoryStatus} compact />
              <SummaryField label="Total inbound units" value={String(getContainerTotalUnits(container))} compact />
            </div>
            <form action={receiveIntoInventory.bind(null, container.id)}>
              <button
                type="submit"
                disabled={isContainerReceived(container)}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#8b1e24] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#75191e] disabled:cursor-not-allowed disabled:bg-[#c9a1a5]"
              >
                {isContainerReceived(container) ? "Already Received Into Inventory" : "Receive Into Inventory"}
              </button>
            </form>
          </div>
        </section>
      </div>

      <section className="rounded-[20px] border border-[var(--line-soft)] bg-white shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
        <div className="bg-[linear-gradient(90deg,#111d31_0%,#091223_100%)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">Warehouse Unload Plan</div>
        <form action={saveUnloadPlan.bind(null, container.id)} className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
          <EditableField label="Scheduled unload date">
            <input name="scheduledUnloadDate" type="date" defaultValue={unloadPlan.scheduledUnloadDate ?? ""} className={inputClass} />
          </EditableField>
          <EditableField label="Scheduled unload time">
            <input name="scheduledUnloadTime" type="time" defaultValue={unloadPlan.scheduledUnloadTime ?? ""} className={inputClass} />
          </EditableField>
          <EditableField label="Warehouse location / bay">
            <input name="warehouseBay" type="text" defaultValue={unloadPlan.warehouseBay ?? ""} placeholder="Dock B-2" className={inputClass} />
          </EditableField>
          <EditableField label="Forklift needed">
            <select name="forkliftNeeded" defaultValue={unloadPlan.forkliftNeeded ? "yes" : "no"} className={inputClass}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </EditableField>
          <EditableField label="Staff assigned">
            <input name="staffAssigned" type="text" defaultValue={unloadPlan.staffAssigned.join(", ")} placeholder="Luis P, Mina R" className={inputClass} />
          </EditableField>
          <EditableField label="Estimated pallets">
            <input name="estimatedPallets" type="number" min={1} defaultValue={String(unloadPlan.estimatedPallets)} className={inputClass} />
          </EditableField>
          <EditableField label="Estimated units">
            <input name="estimatedUnits" type="number" min={1} defaultValue={String(unloadPlan.estimatedUnits)} className={inputClass} />
          </EditableField>
          <EditableField label="Status">
            <select name="status" defaultValue={unloadPlan.status} className={inputClass}>
              {unloadStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </EditableField>
          <div className="md:col-span-2 xl:col-span-4">
            <button type="submit" className="inline-flex rounded-xl bg-[#8b1e24] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#75191e]">
              Save unload plan
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[20px] border border-[var(--line-soft)] bg-white shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
        <div className="bg-[linear-gradient(90deg,#111d31_0%,#091223_100%)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">Products Inside Container</div>
        <div className="overflow-x-auto p-4">
          <table className="min-w-full text-left text-[13px]">
            <thead className="bg-[var(--bg-page)] text-[11px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">Quantity</th>
                <th className="px-3 py-2">Already Assigned</th>
                <th className="px-3 py-2">Available After Orders</th>
                <th className="px-3 py-2">Receive Status</th>
              </tr>
            </thead>
            <tbody>
              {container.items.map((item) => {
                const product = erpProducts.find((entry) => entry.id === item.erpProductId);
                const assigned = assignments.filter((entry) => entry.productId === item.erpProductId).reduce((sum, entry) => sum + entry.qty, 0);
                const onHandBefore = (product?.onFloorQty ?? 0) + (product?.inStockQty ?? 0) + getReceivedUnitsForProduct(containerShipments, item.erpProductId);
                const backorderNeed = Math.max(0, assigned - onHandBefore);
                const alreadyAssigned = Math.min(item.qty, backorderNeed);
                const availableAfterOrders = item.qty - alreadyAssigned;

                return (
                  <tr key={item.erpProductId} className="border-t border-[var(--line-soft)]">
                    <td className="px-3 py-2.5 font-semibold text-[var(--text-primary)]">{product?.name ?? item.erpProductId}</td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)]">{product?.sku ?? "Unknown SKU"}</td>
                    <td className="px-3 py-2.5 font-semibold text-[var(--text-primary)]">{item.qty}</td>
                    <td className="px-3 py-2.5 text-[var(--text-primary)]">{alreadyAssigned}</td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${availableAfterOrders > 0 ? "bg-[#e7f6ed] text-[#2f6b4f]" : "bg-[#fbe6e8] text-[#8b1e24]"}`}>
                        {availableAfterOrders} units
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${isContainerReceived(container) ? "bg-[#e7f6ed] text-[#2f6b4f]" : "bg-[#e6edf8] text-[#1e3a5f]"}`}>
                        {isContainerReceived(container) ? "Received" : "Pending Receipt"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[20px] border border-[var(--line-soft)] bg-white shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
          <div className="bg-[linear-gradient(90deg,#111d31_0%,#091223_100%)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">Documents</div>
          <form action={saveDocuments.bind(null, container.id)} className="space-y-2 p-4">
            {documents.map((doc, index) => (
              <label key={doc.label} className="flex items-center justify-between rounded-xl border border-[var(--line-soft)] bg-[var(--bg-page)] px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{doc.label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{doc.uploadedAt ? `Uploaded ${formatLongDate(doc.uploadedAt)}` : "Not uploaded"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input name={`doc-${index}`} type="checkbox" defaultChecked={doc.status === "Uploaded"} className="h-4 w-4 accent-[#8b1e24]" />
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${doc.status === "Uploaded" ? "bg-[#e7f6ed] text-[#2f6b4f]" : "bg-[#fbe6e8] text-[#8b1e24]"}`}>
                    {doc.status}
                  </span>
                </div>
              </label>
            ))}
            <button type="submit" className="mt-1 inline-flex rounded-xl border border-[#d4dbe6] bg-white px-3 py-2 text-sm font-semibold text-[#8b1e24] hover:bg-[#fff6f7]">
              Save document checklist
            </button>
          </form>
        </section>

        <section className="rounded-[20px] border border-[var(--line-soft)] bg-white shadow-[0_14px_36px_-30px_rgba(17,24,39,0.45)]">
          <div className="bg-[linear-gradient(90deg,#111d31_0%,#091223_100%)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">Internal Notes</div>
          <form action={saveInternalNotes.bind(null, container.id)} className="p-4">
            <textarea
              name="notes"
              defaultValue={unloadPlan.notes || "Coordinate with dock team and verify unload checklist before release."}
              className="h-36 w-full rounded-xl border border-[var(--line-soft)] bg-[var(--bg-page)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[#8b1e24]"
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-[var(--text-muted)]">Internal planning notes only.</p>
              <button type="submit" className="inline-flex rounded-xl bg-[#8b1e24] px-3 py-2 text-sm font-semibold text-white hover:bg-[#75191e]">
                Save notes
              </button>
            </div>
          </form>
        </section>
      </div>

      <div className="flex justify-end">
        <Link href="/containers" className="text-sm font-semibold text-[#8b1e24] hover:underline">
          Back to all containers
        </Link>
      </div>
    </section>
  );
}

function getCurrentTimelineStep(status: string, scheduledUnloadDate: string | null, _deliveryDate: string | null) {
  if (status === "Received into inventory") return 6;
  if (status === "Arrived at warehouse") return 5;
  if (scheduledUnloadDate) return 4;
  if (status === "Released from port") return 3;
  if (status === "At destination port") return 2;
  if (status === "On the ship") return 1;
  return 0;
}

function deriveLocationLabel(status: string, origin: string, portName: string) {
  if (status === "At origin port" || status === "On the ship") return origin;
  if (status === "At destination port" || status === "Released from port") return `${portName}, US`;
  if (status === "Arrived at warehouse" || status === "Received into inventory") return "Olympic Warehouse";
  return origin;
}

function statusTone(status: string) {
  const s = status.toLowerCase();
  if (s.includes("received") || s.includes("arrived")) return "bg-[#e7f6ed] text-[#2f6b4f]";
  if (s.includes("ship") || s.includes("port") || s.includes("origin") || s.includes("destination")) return "bg-[#e6edf8] text-[#1e3a5f]";
  if (s.includes("released")) return "bg-[#fff2d8] text-[#b7791f]";
  return "bg-[#ecf0f5] text-[#334155]";
}

function dateDiffInDays(dateText: string) {
  const target = new Date(dateText);
  if (Number.isNaN(target.getTime())) return 0;

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const to = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

function formatLongDate(dateText: string) {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return dateText;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function cleanText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const inputClass = "w-full rounded-lg border border-[var(--line-soft)] bg-white px-2.5 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[#8b1e24]";

function EditableField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="rounded-xl border border-[var(--line-soft)] bg-[var(--bg-page)] px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function SummaryField({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <article className={`rounded-xl border border-[var(--line-soft)] bg-[var(--bg-page)] ${compact ? "px-3 py-2.5" : "px-3 py-3"}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
      <p className={`mt-1 font-semibold text-[var(--text-primary)] ${compact ? "text-[13px]" : "text-sm"}`}>{value}</p>
    </article>
  );
}
