import posthog from "posthog-js";

const POSTHOG_KEY =
  import.meta.env.VITE_PUBLIC_POSTHOG_KEY || "phc_vB25EPuzw7ZtQKqpDHB9Ud4mvhMJdeYqErmzVxpBpwWM";
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

let initialized = false;

export function isAnalyticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  // Keep isolated Playwright preview runs on port 3106 completely offline unless ?posthog=1 is set.
  if (window.location.port === "3106" && !window.location.search.includes("posthog=1")) {
    return false;
  }
  return Boolean(POSTHOG_KEY);
}

export function initAnalytics() {
  if (initialized || !isAnalyticsEnabled()) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: "https://eu.posthog.com",
    person_profiles: "identified_only",
    autocapture: true,
    capture_pageview: false,
    capture_pageleave: true,
    capture_exceptions: true,
    mask_all_text: false,
    session_recording: {
      maskAllInputs: true,
    },
  });
  initialized = true;
}

export function trackPageView(pathname: string, role?: string) {
  if (!initialized) return;
  posthog.capture("$pageview", {
    $current_url: window.location.href,
    route_path: pathname,
    persona_role: role ?? "anonymous",
  });
}

export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>,
) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function trackException(error: Error) {
  if (!initialized) return;
  posthog.captureException(new Error(error.name || "PrototypeRenderError"));
}
