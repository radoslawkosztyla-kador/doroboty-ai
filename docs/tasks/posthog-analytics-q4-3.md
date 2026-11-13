# PostHog EU product analytics and error tracking (Quest 4.3)

## Intent

Integrate PostHog Cloud EU (`https://eu.i.posthog.com`, project `224180`) into the DoRoboty.ai prototype to provide web analytics, hash-route pageviews, autocapture, session replay with masked inputs, error observability, and funnel tracking for the Smart Screening recruitment workflow, while keeping isolated Playwright E2E test runs on port `3106` offline.

## Acceptance criteria

- `posthog-js` initializes on local dev (`3001`) and production/preview deployments (`*.vercel.app`) using the EU region (`https://eu.i.posthog.com`).
- Hash route transitions (`/#/`, `/#/oferty`, `/#/oferty/:slug`, `/#/aplikuj/:slug`, `/#/app/kandydaci`) emit `$pageview` events with `route_path` and `persona_role`.
- Key domain events (`job_published_by_employer`, `application_started`, `screening_paste_blocked`, `application_submitted`, `candidate_reviewed_by_employer`) are tracked with non-sensitive metadata only (no private free text).
- `PrototypeErrorBoundary` reports sanitized exception names to PostHog without leaking user text.
- `PrivacyPage` transparently discloses PostHog EU analytics and input masking.
- Isolated Playwright E2E tests (`npm run test:e2e` on port `3106`) continue to pass 35/35 with zero external requests.
