# Release, Smoke Plan and Recovery Runbook

This document defines the release procedure, post-deployment smoke verification, rollback steps, capacity boundaries and incident ownership for the **DoRoboty.ai AIPH 3 prototype**.

---

## 1. Incident Owner and Operational Responsibilities

- **Incident Owner:** Radosław Kosztyła (Product Builder / Owner)
- **Access & Permissions:**
  - GitHub repository: [`radoslawkosztyla-kador/doroboty-ai`](https://github.com/radoslawkosztyla-kador/doroboty-ai) (branch protection, Actions CI, `main` branch)
  - Hosting: Vercel project linked to `radoslawkosztyla-kador/doroboty-ai`
  - Analytics / Monitoring (Quest 4.3): PostHog Cloud EU (`https://eu.posthog.com`)
- **Issue Reporting Channel:** GitHub Issues in the project repository or direct report to the owner during AIPH 3 evaluation sessions (visible to users in `/#/app/settings` and `/#/polityka-prywatnosci`, with an explicit warning never to attach personal or confidential data).

---

## 2. Release Procedure and Environments

1. **Local / Pre-release Gate:**
   - Node.js 24 (`.nvmrc`), locked dependencies (`package-lock.json`).
   - Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm audit`, `npm run build`, and `npm run test:e2e`.
   - Build output is generated in `dist/` with vendor code-splitting (`vendor-react`, `vendor-ui`, `vendor`, `index`) so every JS bundle stays well below 500 kB.
2. **Preview Environment (Feature Branches / Pull Requests):**
   - Every push to a feature branch and Pull Request runs `.github/workflows/ci.yml` and builds an isolated Vercel Preview URL.
3. **Production Environment (`main` branch):**
   - Merging a verified PR into `main` triggers the production build on Vercel.
   - Hash routing (`/#/`) ensures all deep links work on static hosting without server-side rewrites.

---

## 3. Post-Deployment Smoke Test Plan (5 Minutes)

Immediately after deploying to the target Vercel URL, the owner executes the following 5-step smoke test in an clean browser session:

1. **HTTPS & Public Entry (`/#/` and `/#/oferty`):** Confirm TLS certificate is valid, the homepage and job listing render without layout overflow on desktop and mobile widths, and the browser console shows `0` uncaught errors.
2. **Employer Flow (`/#/auth/sign-in` -> Karolina Wiśniewska -> `/#/app/oferty`):** Open an existing offer or create a new offer with **Mikro-Pytanie Weryfikacyjne (Smart Screening)** enabled and publish it.
3. **Candidate Flow (`/#/auth/sign-in` -> Anna Kowalska -> `/#/aplikuj/ai-product-manager`):** Verify the screening prompt is displayed, paste protection (`onPaste`) blocks clipboard pasting with a warning message, type a manual answer (>= 20 chars), check approval, and submit.
4. **Employer Verification (`/#/auth/sign-in` -> Karolina Wiśniewska -> `/#/app/kandydaci`):** Open Anna's application and confirm the verified screening badge (`✓ Mikro-Check zweryfikowany`), response time, and manual answer block are visible on the candidate card.
5. **Scenario Persistence & Recovery (`/#/app/settings`):** Reload the page (`F5`) to confirm `localStorage` persistence (`doroboty.prototype.v1`), and verify that **Eksportuj dane** downloads `doroboty-scenariusz.json`.

### Rollback Trigger (Warunek Wycofania Wersji)

Trigger an immediate rollback if **any** of the following occur after deployment:

- The application fails to render (blank page or `PrototypeErrorBoundary` fallback screen triggered on core routes).
- Any step of the 5-step smoke journey fails (broken routing, inability to submit an application, or broken employer candidate view).
- Existing `localStorage` state fails to load or causes an unhandled exception.

---

## 4. Rollback and Recovery Procedure

### A. Instant Rollback on Vercel (< 1 minute)

1. Sign in to the Vercel Dashboard and open the `doroboty-ai` project.
2. Navigate to **Deployments**, locate the previous known-good production deployment, click the three-dots menu (`⋯`) and select **Instant Rollback**.
3. Re-run Step 1 and Step 3 of the Smoke Test on the production URL to confirm service restoration.

### B. Git Revert Fallback (Repository Level)

If Vercel Instant Rollback is unavailable:

```sh
git checkout main
git revert HEAD --no-edit
git push origin main
```

### C. Impact on User Data (`localStorage`) During Rollback

- All scenario state is stored in browser `localStorage` under `doroboty.prototype.v1` (`src/features/prototype/storage.ts`).
- `parseState()` uses backward-compatible optional fields (`screeningEnabled`, `screeningQuestion`, `screeningAnswer`, `screeningTimeSeconds`) and preserves unreadable saves without overwriting them (`blocked: true`, offering raw download in `/#/app/settings`).
- If a user's local browser state becomes corrupted, they can click **Pobierz poprzedni zapis** or **Resetuj scenariusz** in `/#/app/settings`, or use the emergency link rendered by `PrototypeErrorBoundary`.

---

## 5. Capacity and Cost Boundaries

- **Architecture:** 100% static SPA served via Vercel CDN; zero backend compute, zero database queries, and zero paid LLM API calls at runtime.
- **Bundle Size:** Split into cached vendor chunks (`vendor-react` ~88 kB, `vendor-ui` ~131 kB, `vendor` ~211 kB, app `index` ~208 kB minified; ~210 kB total gzipped JS).
- **Expected Traffic & Budget:** Course evaluation and executive demo traffic (< 1,000 sessions/month, < 5 GB bandwidth/month) fits entirely within the **0 PLN / $0 free tier** of Vercel Hobby (100 GB bandwidth/month) and PostHog Cloud EU free tier (1,000,000 events/month, 5,000 session recordings/month). No paid overages can be triggered because no credit card or paid usage tier is attached.
