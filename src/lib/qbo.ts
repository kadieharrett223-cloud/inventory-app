import { appConfig } from "@/lib/config";

export type QboConnectionState = {
  ready: boolean;
  reason: string;
};

export function getQboConnectionState(): QboConnectionState {
  if (!appConfig.qboClientId || !appConfig.qboRedirectUri) {
    return {
      ready: false,
      reason: "Missing QBO_CLIENT_ID or QBO_REDIRECT_URI",
    };
  }

  return {
    ready: true,
    reason: "QBO env vars detected",
  };
}
