import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  deriveContainerStatusFromMilestones,
  deriveInventoryStatusFromMilestones,
  fetchTrackingMilestones,
} from "@/lib/tracking-provider";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ containerId: string }> },
) {
  const { containerId } = await context.params;

  try {
    const supabase = getSupabaseAdminClient();

    const { data: container, error: containerError } = await supabase
      .from("container_shipments")
      .select("id, tracking_number, tracking_source, origin_port_date")
      .eq("id", containerId)
      .single();

    if (containerError || !container) {
      return NextResponse.json({ error: "Container not found" }, { status: 404 });
    }

    const { events, source } = await fetchTrackingMilestones({
      trackingSource: container.tracking_source ?? "",
      trackingNumber: container.tracking_number ?? "",
      fallbackDate: container.origin_port_date ?? new Date().toISOString().slice(0, 10),
    });

    for (const event of events) {
      await supabase
        .from("container_milestones")
        .upsert(
          {
            container_id: containerId,
            stage: event.stage,
            milestone_date: event.date,
          },
          { onConflict: "container_id,stage" },
        );
    }

    const status = deriveContainerStatusFromMilestones(events);
    const inventoryStatus = deriveInventoryStatusFromMilestones(events);

    await supabase
      .from("container_shipments")
      .update({
        status,
        inventory_status: inventoryStatus,
      })
      .eq("id", containerId);

    return NextResponse.json({
      ok: true,
      source,
      status,
      inventoryStatus,
      milestones: events,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
