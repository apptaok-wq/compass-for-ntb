# Compass for NTB

# NTB-PIS — CURRENT STATE & CLAUDE DEVELOPMENT HANDOFF

Audit date: 2026-08-08. Source of truth: the actual codebase + live database. Nothing below is inferred from earlier prompts.

## PART 1 — EXECUTIVE CURRENT STATE


| Item                   | Finding                                                                                                                                                                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project                | NTB Poverty Intelligence System (NTB-PIS)                                                                                                                                                                                                                                    |
| Purpose                | Public marketing landing page + internal role-based decision-support shell for extreme-poverty reduction in NTB (aggregate, village-level only)                                                                                                                              |
| Stage                  | Landing page complete; internal app = auth + RBAC + admin tooling only; all four analytic modules are placeholders                                                                                                                                                           |
| Overall implementation | ~35–40% of the stated product (landing ~95%, platform foundation ~70%, analytic product ~5%)                                                                                                                                                                                 |
| Confidence             | High for code/DB facts (read directly); NOT VERIFIED for end-to-end runtime auth flows (no user accounts exist to test with)                                                                                                                                                 |
| Build status           | Dev server running; no typecheck/build executed in this audit → NOT VERIFIED                                                                                                                                                                                                 |
| Deployment             | Preview + published at `https://ntb-data-compass.lovable.app` (canonical hardcoded in `src/routes/index.tsx`)                                                                                                                                                                |
| Biggest blocker        | Database has **0 profiles, 0 user_roles, 0 kesejahteraan_agregat rows, 0 wilayah geometry**. No Super Admin has been bootstrapped → the entire authenticated app is unreachable and untested in practice                                                                     |
| Biggest risks          | (1) unbootstrapped/untested auth path; (2) `wilayah` INSERT/UPDATE/DELETE granted to `authenticated` at the GRANT level (RLS still restricts to super_admin, so defence-in-depth only); (3) `spatial_ref_sys` RLS-disabled (PostGIS-owned, not fixable); (4) no tests at all |
| Recommended next point | Bootstrap Super Admin via `/setup`, verify auth+RBAC end-to-end, load `wilayah` geometry (GeoJSON) and seed `kesejahteraan_agregat`, then build the Skor Kerentanan scoring module before the GIS dashboard                                                                  |


## PART 2 — PROJECT STRUCTURE (ACTUAL)

```text
/ (root)  package.json, vite.config.ts (@lovable.dev/vite-tanstack-config), tsconfig.json,
          components.json, eslint.config.js, .env, supabase/{config.toml,migrations/*.sql}
src/
  router.tsx          TanStack Router + QueryClient factory
  start.ts            createStart: functionMiddleware [attachSupabaseAuth], requestMiddleware [errorMiddleware, csrfMiddleware]
  server.ts           SSR entry wrapper, normalises h3-swallowed 500s to an HTML error page
  styles.css          271 lines — full design system (OKLCH tokens, @utility section-y, eyebrow, display-*)
  routes/             file-based routes (see Part 3)
  components/
    sections/         17 landing-page section components
    app/              AppSidebar, TopBar, PlaceholderPage, WilayahSelect
    ui/               45 shadcn primitives (many unused)
    Reveal.tsx, SectionHeading.tsx, NtbMapMotif.tsx
  hooks/              useCurrentUser.ts, use-mobile.tsx
  lib/                rbac.ts, admin.functions.ts, setup.functions.ts, web-vitals.ts,
                      error-capture.ts, error-page.ts, lovable-error-reporting.ts, utils.ts
  integrations/supabase/  client.ts, client.server.ts, auth-middleware.ts, auth-attacher.ts, types.ts (all generated)
```

No `tests/`, no `src/services/`, no `src/types/`, no `public/` assets beyond `robots.txt`.

## PART 3 — ROUTE INVENTORY


| Route                  | File                                       | Auth                 | Role                 | UI                                                         | Backend                                                                | Status                                                                   |
| ---------------------- | ------------------------------------------ | -------------------- | -------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `/`                    | `routes/index.tsx` + 17 section components | public               | any                  | Full                                                       | none (static content)                                                  | UI IMPLEMENTED / no backend needed / VERIFIED visually in prior sessions |
| `/auth`                | `routes/auth.tsx` (ssr:false)              | public               | —                    | login + reset-request form, inline error, loading label    | Supabase `signInWithPassword`, `resetPasswordForEmail`                 | INTEGRATED / NOT VERIFIED (no accounts exist)                            |
| `/reset-password`      | `routes/reset-password.tsx`                | recovery link        | —                    | Full                                                       | `supabase.auth.updateUser`                                             | INTEGRATED / NOT VERIFIED                                                |
| `/setup`               | `routes/setup.tsx`                         | public, self-closing | —                    | Full                                                       | serverFn `bootstrapSuperAdmin`, `superAdminExists`                     | INTEGRATED / NOT VERIFIED — **still open, 0 super admins exist**         |
| `/_authenticated`      | `route.tsx` (ssr:false)                    | required             | any                  | shell: sidebar + topbar, loading + inactive-account states | `supabase.auth.getUser()` in `beforeLoad` → redirect `/auth`           | IMPLEMENTED                                                              |
| `/dashboard`           | `_authenticated/dashboard.tsx`             | yes                  | all                  | `PlaceholderPage` only                                     | none                                                                   | NOT IMPLEMENTED (placeholder)                                            |
| `/skor-kerentanan`     | placeholder                                | yes                  | all                  | `PlaceholderPage`                                          | none                                                                   | NOT IMPLEMENTED                                                          |
| `/monitoring-evaluasi` | placeholder                                | yes                  | 6 roles              | `PlaceholderPage`                                          | none                                                                   | NOT IMPLEMENTED                                                          |
| `/rekomendasi-program` | placeholder                                | yes                  | 5 roles              | `PlaceholderPage`                                          | none                                                                   | NOT IMPLEMENTED                                                          |
| `/policy-brief`        | placeholder                                | yes                  | 5 roles              | `PlaceholderPage`                                          | none                                                                   | NOT IMPLEMENTED                                                          |
| `/admin/pengguna`      | 312 lines                                  | yes                  | super_admin          | table, dialog, role/wilayah selects, active switch         | serverFns `createUserAccount` / `updateUserAccount`                    | BACKEND IMPLEMENTED + INTEGRATED / NOT VERIFIED                          |
| `/admin/impor-data`    | 341 lines                                  | yes                  | super_admin          | upload, header validation, preview table, history          | direct client upsert into `kesejahteraan_agregat` + `audit_log` insert | INTEGRATED / NOT VERIFIED (0 rows imported)                              |
| `/admin/audit`         | 95 lines                                   | yes                  | super_admin, kominfo | table with loading/error/empty states                      | `audit_log` select (RLS-gated)                                         | IMPLEMENTED / empty data                                                 |
| `/admin/performa`      | 253 lines                                  | yes                  | super_admin, kominfo | p75 cards, per-path table, filters                         | `web_vitals` select                                                    | IMPLEMENTED — 34 real rows in DB                                         |
| `/api/public/vitals`   | `routes/api/public/vitals.ts`              | public POST          | —                    | —                                                          | Zod-validated insert via `supabaseAdmin`                               | IMPLEMENTED (previously curl-verified)                                   |


Note: `/admin/*` pages guard by rendering `PlaceholderPage` when `me.role !== 'super_admin'`; there is **no route-level role guard** — protection at the data layer comes from RLS.

## PART 4–8 — FEATURES, AUTH, RBAC, DATABASE, API

**Authentication** — Supabase email/password. Login, logout (`useSignOut` clears query cache + `signOut` + redirect), session persistence via localStorage, password reset request + update. Protected subtree via `_authenticated/route.tsx` `beforeLoad`. Bearer token attached to server functions by `attachSupabaseAuth` in `src/start.ts`. Status: UI IMPLEMENTED, BACKEND IMPLEMENTED, INTEGRATED, **NOT VERIFIED**.

**RBAC** — 8 roles in enum `app_role`; roles stored in the separate `user_roles` table (correct pattern). `src/lib/rbac.ts` holds labels, `NAV_ITEMS` and `canAccess()` for sidebar filtering only. Server functions re-check `is_super_admin()` RPC before privileged work. Gap: no per-route authorization; UI filtering is cosmetic (RLS is the real boundary).

**Database (verified live)** — Provider: Lovable Cloud / Postgres + PostGIS.


| Table                                                                                 | RLS | Policies | Rows                                            |
| ------------------------------------------------------------------------------------- | --- | -------- | ----------------------------------------------- |
| `wilayah` (geometry MultiPolygon 4326, parent_id self-FK, kode_bps unique)            | on  | 4        | 24, **0 with geometry**                         |
| `profiles` (FK auth.users, wilayah_scope_id, is_active)                               | on  | 4        | **0**                                           |
| `user_roles`                                                                          | on  | 2        | **0**                                           |
| `kesejahteraan_agregat` (desil 1–3, kk miskin ekstrem, unique wilayah+periode+sumber) | on  | 2        | **0**                                           |
| `audit_log`                                                                           | on  | 2        | **0**                                           |
| `kunjungan_lapangan`                                                                  | on  | 4        | 0 — schema only, no UI                          |
| `web_vitals`                                                                          | on  | 1        | 34                                              |
| `spatial_ref_sys` (PostGIS)                                                           | off | 0        | 8500 — platform-owned, closed as not actionable |


Security-definer helpers: `has_role`, `has_full_wilayah_read`, `is_super_admin`, `wilayah_in_scope` (recursive ancestor walk), `can_read_wilayah`. No triggers (notably **no** `handle_new_user` **trigger** — profiles are created only by server functions). No views, no storage buckets, no edge functions. 7 migrations.

**API surface** — `createUserAccount`, `updateUserAccount` (auth middleware + super-admin recheck + admin client + audit write), `bootstrapSuperAdmin`, `superAdminExists` (both **unauthenticated by design**, guarded by the zero-super-admin condition), and the public `POST /api/public/vitals`. All other data access is direct client-side Supabase queries under RLS.

## PART 9–14 — FRONTEND, DESIGN SYSTEM, UI, RESPONSIVE, A11Y, STATES

- Framework: React 19 + TanStack Start v1 + Vite 8 + TS 5.8. Data: TanStack Query (`useQuery`/`useMutation`); no loaders/`ensureQueryData` used in app routes. Forms: local `useState` — `react-hook-form`/`@hookform/resolvers` are installed but **unused**. Validation: Zod on server functions and CSV headers only.
- Design system in `src/styles.css`: OKLCH tokens (navy anchor, steel-teal accent, `--accent-strong` for AA contrast), `--radius: 0.5rem`, Space Grotesk display + Plus Jakarta Sans body, `@utility section-y` / `section-y-tight`, `shadow-lift`, `eyebrow`, `display-*`. Dark-mode variant declared but no dark theme values applied to the app shell → effectively light-only.
- Charts: **recharts is installed but unused**; the landing "Analytics" section uses hand-written SVG. `chart.tsx` shadcn wrapper unused. No map library installed at all (Leaflet/Mapbox absent) — GIS dashboard has no rendering dependency yet.
- Responsive: landing verified overflow-free at 390px and 1440px in a prior session; app shell sidebar is `hidden md:block` with a `Sheet` drawer in `TopBar` for mobile. Admin tables rely on `overflow-x-auto` (impor-data yes; pengguna/audit tables have no explicit x-scroll wrapper → likely cramped on mobile, NOT VERIFIED).
- Accessibility: semantic landmarks, `aria-label` on nav, `role="alert"` on form errors, AA contrast token work done, Lighthouse A11y 100 on the landing. Internal app pages have **not** been audited for a11y — NOT VERIFIED.
- States: loading text present on all data pages; empty states on audit/performa/import; error states on audit/performa/auth; toasts via `sonner`. **No skeletons, no retry affordances anywhere.**

## PART 15 — DATA FLOW (ACTUAL)

```text
Admin CRUD:  page → useMutation → useServerFn(createUserAccount)
             → attachSupabaseAuth (bearer) → requireSupabaseAuth middleware
             → rpc is_super_admin → supabaseAdmin (service role) → auth.users/profiles/user_roles/audit_log
Reads:       page → useQuery → supabase (anon+JWT) → Postgres under RLS → UI
RUM:         __root useEffect → initWebVitals → sendBeacon /api/public/vitals → Zod → supabaseAdmin → web_vitals
```

## PART 16–20 — INTEGRATIONS, AI, SECURITY, PERFORMANCE, TESTING

- Integrations: Supabase only (auth, DB, service-role admin). Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`; service key server-side only. No email service, no analytics vendor, no storage, no maps, no external APIs.
- **AI functionality not implemented.** The landing page's "AI Intelligence / Metodologi" section is descriptive copy about a weighted scoring method; no model, prompt, gateway call, or scoring code exists anywhere in `src/`.
- Security: RLS on every application table; roles in a dedicated table; CSRF middleware on server functions; forbidden-column CSV screening (`nik, nama, alamat, no_kk…`); no secrets in client code; error pages do not leak stack traces. Open items: `/setup` is publicly reachable (self-closing but currently *open* because 0 super admins exist), broad table-level GRANTs to `authenticated` on `wilayah`, no rate limiting on `/api/public/vitals` (unauthenticated insert path — spammable), naive CSV parser (splits on `,`/`;`, no quoted-comma support).
- Performance: Lighthouse 99/100/100/100 on production landing. Admin performa page pulls up to 5000 rows client-side and percentiles them in the browser — fine now, will not scale.
- Testing: **zero tests.** No vitest/playwright config, no test scripts in `package.json`.

## PART 21–24 — DEPLOYMENT, DEPENDENCIES, DEBT, BUGS

Hosting: Lovable (Cloudflare Worker target via nitro). Build: `vite build`. Preview + published environments both live.

Notable dependencies: `@tanstack/react-start` 1.168, `react` 19.2, `@supabase/supabase-js` 2.112, `zod` 3.24, `web-vitals` 6.1, `tailwindcss` 4.2, 25 Radix packages. Unused-but-installed: `recharts`, `react-hook-form`, `@hookform/resolvers`, `embla-carousel-react`, `vaul`, `cmdk`, `input-otp`, `react-day-picker`, `react-resizable-panels`, `date-fns`.


| Debt                                     | Severity | Evidence                           | Impact                                           |
| ---------------------------------------- | -------- | ---------------------------------- | ------------------------------------------------ |
| No Super Admin / no seed data            | CRITICAL | 0 rows in `profiles`, `user_roles` | Whole authenticated app is untested and unusable |
| Zero automated tests                     | HIGH     | no test tooling in `package.json`  | Auth/RBAC/import regressions undetectable        |
| 4 core modules are placeholders          | HIGH     | `PlaceholderPage` in 5 routes      | Product value not delivered                      |
| No route-level role guard                | MEDIUM   | role check is in-component only    | Cosmetic only today (RLS holds), but fragile     |
| Hand-rolled CSV parser                   | MEDIUM   | `parseCsv` in `impor-data.tsx`     | Quoted fields with commas corrupt rows           |
| `wilayah` write GRANT to `authenticated` | MEDIUM   | migration GRANT block              | Defence-in-depth weaker than intended            |
| `/api/public/vitals` unrated             | MEDIUM   | no throttle in handler             | Table can be flooded                             |
| Unused heavy deps                        | LOW      | see list                           | Bundle/maintenance noise                         |


Known bugs: one preview-only runtime error — `Failed to fetch dynamically imported module … @tanstack/react-start/dist/plugin/default-entry/client.tsx` — a dev-server HMR/stale-chunk artefact, not reproducible in production; status OPEN / low severity. No functional bugs confirmed in application code during this audit.

## PART 25–29 — GAP MATRIX


| Area                             | Requirement                       | Current state                             | Evidence         | Priority |
| -------------------------------- | --------------------------------- | ----------------------------------------- | ---------------- | -------- |
| Bootstrap                        | Working Super Admin               | NOT IMPLEMENTED (0 rows)                  | DB count         | P0       |
| Wilayah geometry                 | PostGIS boundaries for map        | NOT IMPLEMENTED (`geometry` all NULL)     | DB count         | P0       |
| Aggregate data                   | `kesejahteraan_agregat` populated | NOT IMPLEMENTED (0 rows)                  | DB count         | P0       |
| GIS dashboard                    | Thematic village map              | NOT IMPLEMENTED (placeholder, no map lib) | route file       | P1       |
| Skor Kerentanan                  | Composite scoring                 | NOT IMPLEMENTED (no formula in code)      | grep             | P1       |
| M&E / Rekomendasi / Policy Brief | Analytic modules                  | NOT IMPLEMENTED                           | route files      | P2       |
| Kunjungan lapangan               | Field-visit capture               | BACKEND ONLY (table + RLS, no UI)         | migration + grep | P2       |
| Testing                          | Any coverage                      | NOT IMPLEMENTED                           | package.json     | P1       |
| AI                               | Any AI feature                    | NOT IMPLEMENTED                           | grep             | P2       |


Genuinely complete: landing page (17 sections, Lighthouse-verified), design system, auth screens + flows (code-complete), `_authenticated` shell with role-aware nav, Super Admin user management, CSV aggregate import with privacy screening, audit log viewer, RUM pipeline end-to-end, full RLS schema.

## PART 30 — EXACT CONTINUATION POINT

1. Stage: foundation complete, data + analytics not started.
2. Last completed: Web Vitals RUM + `/admin/performa`, then a security-finding review pass.
3. Unfinished: everything data-driven.
4. Blocker: empty database + no admin account.
5. **Next task:** bootstrap the Super Admin at `/setup`, verify login → shell → `/admin/pengguna` → create a scoped user → confirm RLS scoping works; then load `wilayah` geometry and seed one period of `kesejahteraan_agregat`; then implement **Skor Kerentanan** (deterministic weighted composite over the aggregate columns, surfaced as a sortable table with wilayah filter) before the map.
6. Why: every remaining module reads from `kesejahteraan_agregat` and `wilayah`; scoring is the cheapest module that proves the whole data path and unblocks the GIS layer, M&E, and Policy Brief.
7. Files: `src/routes/_authenticated/skor-kerentanan.tsx`, a new `src/lib/skor.ts`, `src/components/app/WilayahSelect.tsx`, a new migration for geometry + seed.
8. Dependencies: aggregate rows must exist; a map library must be chosen before the GIS dashboard (none installed).
9. Expected result: a real, RLS-scoped analytic table replacing the first placeholder.
10. Acceptance: super_admin sees all wilayah; a `pemkab_kota` user sees only their subtree; scores recompute per selected periode; empty/loading/error states present.
11. Must NOT change: generated `src/integrations/supabase/*`, `src/routeTree.gen.ts`, the RLS/role model (roles stay in `user_roles`), the aggregate-only privacy rule, the `styles.css` token system, and the landing page.

## PART 31 — CLAUDE DEVELOPMENT HANDOFF

Continue from this codebase; do not restart. TanStack Start v1 file routing (never React Router). App-internal server logic uses `createServerFn` in `*.functions.ts`; webhooks/public endpoints go under `src/routes/api/public/`. Reads run client-side through the generated Supabase client under RLS; privileged writes go through `supabaseAdmin` inside a handler *after* an `is_super_admin()` recheck. Use the existing OKLCH tokens — never hardcoded colours. Copy is formal Bahasa Indonesia. Never store individual/household data (NIK, names, addresses). Frame the system as complementary to DTSEN/SEPAKAT. Reuse `PlaceholderPage`, `WilayahSelect`, `useCurrentUser`, and `NAV_ITEMS`; do not rebuild the landing page, auth, or admin panels. Start at Part 30, step 5.

## PART 32 — SCORECARD


| Area           | Score  | Band                                  |
| -------------- | ------ | ------------------------------------- |
| Product        | 40     | Partial                               |
| Frontend       | 70     | Advanced                              |
| Backend        | 55     | Partial                               |
| Database       | 75     | Advanced (schema) / 10 (data)         |
| API            | 55     | Partial                               |
| Authentication | 70     | Advanced (unverified)                 |
| Authorization  | 70     | Advanced                              |
| UX             | 55     | Partial                               |
| UI             | 85     | Near complete                         |
| Design system  | 90     | Near complete                         |
| Responsive     | 70     | Advanced                              |
| Accessibility  | 70     | Advanced (landing 95, app unverified) |
| AI             | 0      | Not started                           |
| Security       | 70     | Advanced                              |
| Testing        | 0      | Not started                           |
| DevOps         | 60     | Partial                               |
| Deployment     | 80     | Advanced                              |
| Documentation  | 45     | Partial                               |
| **Overall**    | **55** | **Partial**                           |

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ef08184e-4c5d-4c5c-a6c1-acaac69626fa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
