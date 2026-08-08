# NTB-PIS — Rebuild from the audit spec

This project is currently an empty starter (placeholder home page, no backend). The audit describes a codebase that does not exist here, so the plan rebuilds NTB-PIS to the audited state and then continues from Part 30, step 5.

Work is staged so each stage leaves a working app. Copy is formal Bahasa Indonesia throughout. Aggregate, village-level data only — never NIK, names, addresses, or household records.

## Stage 1 — Foundation and design system

- Enable Lovable Cloud (database, auth, server-side admin access).
- Replace the placeholder design tokens in `src/styles.css` with the audited system: OKLCH navy anchor, steel-teal accent, `--accent-strong` for AA contrast, `--radius: 0.5rem`, Space Grotesk (display) + Plus Jakarta Sans (body) loaded via a `<link>` in the root route, and `section-y` / `eyebrow` / `display-*` / `shadow-lift` utilities.
- Mount the toast provider in the root route; per-route head metadata (title, description, og/twitter) on every page.

## Stage 2 — Database schema

One migration creating, with grants + RLS + policies:

- `wilayah` — hierarchical regions (self-referencing parent, unique BPS code, PostGIS MultiPolygon 4326 geometry), seeded with NTB provinsi/kabupaten-kota rows.
- `profiles` — linked to auth users, with `wilayah_scope_id` and `is_active`.
- `app_role` enum (8 roles) + `user_roles` table (roles never on profiles).
- `kesejahteraan_agregat` — decile 1–3 counts, extreme-poor household counts, unique on wilayah + periode + sumber.
- `audit_log`, `kunjungan_lapangan`, `web_vitals`.
- Security-definer helpers: `has_role`, `is_super_admin`, `has_full_wilayah_read`, `wilayah_in_scope` (recursive ancestor walk), `can_read_wilayah`.

## Stage 3 — Auth, RBAC and app shell

- `/auth` (login + password-reset request), `/reset-password`, and a self-closing `/setup` that bootstraps the first Super Admin only while zero super admins exist.
- Protected `_authenticated` subtree with sidebar + topbar shell, role-aware navigation from a shared `NAV_ITEMS`/`canAccess()` module, `useCurrentUser` hook, inactive-account state, sign-out that clears the query cache.
- Route-level role guards on protected routes (closing a gap the audit flagged), with RLS as the real boundary.

## Stage 4 — Public landing page

A single-page marketing site at `/`: hero, problem framing, the four modules, methodology, data-governance/privacy, positioning as complementary to DTSEN/SEPAKAT, and a CTA to the internal login. Responsive, semantic, AA contrast, no overflow at 390px or 1440px.

## Stage 5 — Admin tooling

- `/admin/pengguna` — Super Admin user management (create/update accounts, role + wilayah scope, active toggle) through privileged server functions that re-check super-admin status and write audit entries.
- `/admin/impor-data` — CSV import into `kesejahteraan_agregat` with header validation, a robust quoted-field parser, forbidden personal-column screening (`nik`, `nama`, `alamat`, `no_kk`, …), preview, and import history.
- `/admin/audit` — audit log viewer. `/admin/performa` — Web Vitals p75 cards and per-path table.
- `POST /api/public/vitals` — validated RUM ingest with simple rate limiting.

## Stage 6 — Data load and the first analytic module

- Seed one period of `kesejahteraan_agregat` for NTB wilayah plus wilayah boundary geometry via migration.
- `/skor-kerentanan` — deterministic weighted composite score in a new `src/lib/skor.ts`, surfaced as a sortable table with wilayah and periode filters, RLS-scoped so a `pemkab_kota` user only sees their subtree. Loading, empty and error states with retry.
- Remaining modules (`/dashboard`, `/monitoring-evaluasi`, `/rekomendasi-program`, `/policy-brief`) ship as placeholders for now; the GIS map needs a map library choice and comes after this.

## Technical notes

- TanStack Start v1 file routing only; no React Router. Reads run client-side through the generated Supabase client under RLS; privileged writes go through `supabaseAdmin` loaded inside a server-function handler after an `is_super_admin()` recheck.
- Server functions live in `*.functions.ts` outside `src/server/`; public HTTP endpoints under `src/routes/api/public/`.
- Every new public-schema table gets explicit GRANTs; `wilayah` write GRANTs are limited rather than blanket-granted to `authenticated`.
- No hardcoded colors — semantic tokens only. Generated `src/integrations/supabase/*` and `src/routeTree.gen.ts` are never hand-edited.

## Open decisions (not blocking Stage 1)

- Map library for the later GIS dashboard (Leaflet vs MapLibre) — decide before that stage.
- Source file for real wilayah GeoJSON boundaries; until provided, geometry stays empty and the map stage is blocked.
