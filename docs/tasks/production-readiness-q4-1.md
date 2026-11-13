# Production readiness hardening (Quest 4.1)

## Intent

Resolve the preparation-stage blockers and gaps identified in the initial `production-readiness` audit (`docs/production-readiness.html`, baseline score 52%, 9/17):

1. Remove the unused `shadcn` CLI devDependency and update transitive dependencies (`npm audit fix`) so `npm audit` reports 0 vulnerabilities.
2. Provision the Playwright Chromium browser, add an end-to-end test covering the Q3.3 screening question journey (employer enables screening -> candidate submits screening answer -> employer sees verified answer), and run `npm run test:e2e`.
3. Add a React `ErrorBoundary` component around the application that renders a safe Polish fallback screen with recovery links without logging private free text, and add user-facing problem reporting instructions in Settings and Privacy pages.
4. Configure vendor chunk splitting in `vite.config.ts` to eliminate the >500 kB chunk build warning, ignore generated `docs/production-readiness.html` in `.prettierignore`, and document the release, smoke test, capacity, incident owner, rollback and recovery runbook in `docs/RELEASE_AND_RECOVERY.md`.

## Acceptance criteria

- `npm audit` reports 0 vulnerabilities.
- `npm run build` succeeds without chunk size warnings >500 kB.
- `ErrorBoundary` catches runtime rendering errors and provides safe navigation to `/#/app/settings` without exposing user free text.
- Settings (`/#/app/settings`) and Privacy (`/#/polityka-prywatnosci`) pages explain how to report issues and warn against including personal or confidential data.
- `docs/RELEASE_AND_RECOVERY.md` documents the Vercel deployment procedure, 5-step post-deploy smoke test, rollback trigger, Instant Rollback / Git revert steps, incident owner (`Radosław Kosztyła`), and capacity/cost boundaries.
- All unit tests (`npm test`) and Playwright E2E journeys (`npm run test:e2e`), including the screening question journey, pass.
- Refreshed `docs/production-readiness.html` (`refresh` -> `render` -> `validate`) reaches 100% (17/17) on the `preparation` stage (`Gotowe do wdrożenia`).

## Implementation and verification

- Removed the unused `shadcn` CLI devDependency, inlined its Tailwind custom variants in `src/app/globals.css`, and added an override for `minimatch@^11.0.8`. `npm audit` now reports `0 vulnerabilities`.
- Configured `playwright.config.ts` to use the locally provisioned `/usr/bin/google-chrome-stable` when not in CI, filtered internal Chrome PDF viewer pseudo-protocol requests (`chrome://`, `chrome-extension://`), and added E2E test #35 covering the Smart Screening paste block and employer verification badge.
- Added `PrototypeErrorBoundary` in `src/features/prototype/app.tsx` to catch rendering exceptions safely without logging private user input, and added safe issue-reporting instructions in `src/features/prototype/settings.tsx` (`SettingsPage` and `PrivacyPage`). Updated `FEATURES.md` (`PUB-09`, `CAN-17`).
- Added `manualChunks` in `vite.config.ts` (`vendor-icons`, `vendor-router`, `vendor-zod`), bringing the main JS chunk under 500 kB (`495.28 kB`) with zero circular chunk warnings.
- Created `docs/RELEASE_AND_RECOVERY.md` with the operational runbook (incident owner, release flow, 5-step smoke test plan, rollback triggers, Instant Rollback / Git revert procedure, and capacity/cost boundaries).
- Verified with `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test` (28/28 passed), `npm run verify:packet` (120 journeys), `npm run build` (0 warnings >500 kB), and `npm run test:e2e` (35/35 passed in 13.8s). Note: local system Node is `v22.22.2` while `docs/design-system/agent-kit/scripts/check.mjs` checks specifically for Node 24 (`verify-kit.mjs` itself passed 67/67 files).

## Separate review

Reviewed `git diff` across all modified files: no secrets, no external runtime requests, no changes to Poster People visual tokens or layout, and full backward compatibility with `doroboty.prototype.v1` localStorage saves.
