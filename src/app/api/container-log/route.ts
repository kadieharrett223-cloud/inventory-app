import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getContainerLineCount, getContainerTotalUnits, type ContainerShipment } from "@/lib/inventory-core";

type ContainerRow = {
  id: string;
  po_number: string;
  container_no: string;
  supplier: string;
  tracking_number: string | null;
  tracking_source: string | null;
  origin: string | null;
  origin_port_date: string | null;
  on_ship_date: string | null;
  po_date: string | null;
  port_date: string | null;
  port_name: string | null;
  payment_status: "Paid" | "Partially Paid" | "Unpaid";
  status:
    | "At origin port"
    | "On the ship"
    | "At destination port"
    | "Released from port"
    | "Arrived at warehouse"
    | "Received into inventory";
  inventory_status: "On Order" | "Partially Received" | "Received";
  uploaded_at: string | null;
  tracking_connected: boolean;
};

type ContainerItemRow = {
  erp_product_id: string;
  qty: number;
};

type ContainerMilestoneRow = {
  stage:
    | "At origin port"
    | "On the ship"
    | "At destination port"
    | "Released from port"
    | "Arrived at warehouse"
    | "Received into inventory";
  milestone_date: string;
};

function toShipment(
  container: ContainerRow,
  items: ContainerItemRow[],
  milestones: ContainerMilestoneRow[],
): ContainerShipment {
  return {
    id: container.id,
    poNumber: container.po_number,
    containerNo: container.container_no,
    supplier: container.supplier,
    trackingNumber: container.tracking_number ?? "",
    trackingSource: container.tracking_source ?? "",
    origin: container.origin ?? "",
    originPortDate: container.origin_port_date ?? "",
    onShipDate: container.on_ship_date ?? "",
    poDate: container.po_date ?? "",
    portDate: container.port_date ?? "",
    portName: container.port_name ?? "",
    paymentStatus: container.payment_status,
    status: container.status,
    inventoryStatus: container.inventory_status,
    uploadedAt: container.uploaded_at ?? "",
    trackingConnected: container.tracking_connected,
    milestones: milestones.map((entry) => ({ stage: entry.stage, date: entry.milestone_date })),
    items: items.map((entry) => ({ erpProductId: entry.erp_product_id, qty: entry.qty })),
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();

    const { data: containers, error: containerError } = await supabase
      .from("container_shipments")
      .select("*")
      .order("created_at", { ascending: false });

    if (containerError) {
      return NextResponse.json({ error: containerError.message }, { status: 500 });
    }

    const ids = (containers ?? []).map((entry) => entry.id);

    const { data: items, error: itemError } = await supabase
      .from("container_items")
      .select("container_id, erp_product_id, qty")
      .in("container_id", ids.length ? ids : ["__none__"]);

    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 500 });
    }

    const { data: milestones, error: milestoneError } = await supabase
      .from("container_milestones")
      .select("container_id, stage, milestone_date")
      .in("container_id", ids.length ? ids : ["__none__"])
      .order("milestone_date", { ascending: true });

    if (milestoneError) {
      return NextResponse.json({ error: milestoneError.message }, { status: 500 });
    }

    const list = (containers ?? []).map((container) => {
      const containerItems = (items ?? []).filter((entry) => entry.container_id === container.id);
      const containerMilestones = (milestones ?? []).filter((entry) => entry.container_id === container.id);

      const shipment = toShipment(
        container as ContainerRow,
        containerItems as ContainerItemRow[],
        containerMilestones as ContainerMilestoneRow[],
      );

      return {
        ...shipment,
        lineCount: getContainerLineCount(shipment),
        totalUnits: getContainerTotalUnits(shipment),
      };
    });

    return NextResponse.json({ containers: list });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
