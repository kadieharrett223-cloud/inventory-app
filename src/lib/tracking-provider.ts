import type { ContainerMilestoneStage } from "@/lib/inventory-core";
import { appConfig } from "@/lib/config";

export type TrackingMilestoneEvent = {
  stage: ContainerMilestoneStage;
  date: string;
};

const stageOrder: ContainerMilestoneStage[] = [
  "At origin port",
  "On the ship",
  "At destination port",
  "Released from port",
  "Arrived at warehouse",
  "Received into inventory",
];

function normalizeStage(stage: string): ContainerMilestoneStage | null {
  const match = stageOrder.find((entry) => entry.toLowerCase() === stage.toLowerCase());
  return match ?? null;
}

function fallbackMilestones(referenceDate: string): TrackingMilestoneEvent[] {
  return [
    { stage: "At origin port", date: referenceDate },
    { stage: "On the ship", date: referenceDate },
  ];
}

export async function fetchTrackingMilestones(params: {
  trackingSource: string;
  trackingNumber: string;
  fallbackDate: string;
}): Promise<{ events: TrackingMilestoneEvent[]; source: "live" | "fallback" }> {
  const { trackingSource, trackingNumber, fallbackDate } = params;

  if (!appConfig.trackingApiBaseUrl || !appConfig.trackingApiKey) {
    return {
      events: fallbackMilestones(fallbackDate),
      source: "fallback",
    };
  }

  const endpoint = `${appConfig.trackingApiBaseUrl.replace(/\/$/, "")}/track`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${appConfig.trackingApiKey}`,
    },
    body: JSON.stringify({
      source: trackingSource,
      trackingNumber,
    }),
  });

  if (!response.ok) {
    return {
      events: fallbackMilestones(fallbackDate),
      source: "fallback",
    };
  }

  const payload = (await response.json()) as {
    milestones?: { stage: string; date: string }[];
  };

  const events = (payload.milestones ?? [])
    .map((event) => {
      const normalized = normalizeStage(event.stage);
      if (!normalized) {
        return null;
      }

      return {
        stage: normalized,
        date: event.date,
      };
    })
    .filter((event): event is TrackingMilestoneEvent => Boolean(event));

  if (!events.length) {
    return {
      events: fallbackMilestones(fallbackDate),
      source: "fallback",
    };
  }

  return {
    events,
    source: "live",
  };
}

export function deriveContainerStatusFromMilestones(events: TrackingMilestoneEvent[]) {
  for (let i = stageOrder.length - 1; i >= 0; i -= 1) {
    const stage = stageOrder[i];
    if (events.some((event) => event.stage === stage)) {
      return stage;
    }
  }

  return "At origin port";
}

export function deriveInventoryStatusFromMilestones(events: TrackingMilestoneEvent[]) {
  if (events.some((event) => event.stage === "Received into inventory")) {
    return "Received" as const;
  }

  if (events.some((event) => event.stage === "Arrived at warehouse")) {
    return "Partially Received" as const;
  }

  return "On Order" as const;
}
