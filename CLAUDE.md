# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # start dev server (Next.js, Turbopack)
npm run dev:lan       # dev server bound to 0.0.0.0 for LAN access
npm run build         # production build
npm run start         # start production server
npm run lint          # eslint (flat config, eslint-config-next core-web-vitals + typescript)
```

There is no test runner configured in `package.json`.

### Database (Prisma + MariaDB/MySQL)

```bash
npx prisma generate          # regenerate client (also runs automatically via postinstall)
npx prisma migrate dev       # create/apply a migration in development
npx prisma db seed           # run prisma/seed.ts (uses tsx)
npx prisma studio            # inspect data
```

Prisma config lives in `prisma.config.ts` (not `package.json#prisma.seed` alone — that key is legacy/duplicated). `DATABASE_URL` and other secrets are read from `.env` (`JWT_SECRET`, `RESEND_API_KEY`, `ADMIN_EMAILS`).

## Architecture

### Two separate auth systems

- **Admin/User auth** (`lib/auth.ts`, `middleware.ts`): a `User` (username/password, bcrypt) signs in via `app/api/auth/login`, receives a JWT (`jose`, HS256, `JWT_SECRET`) stored in the `auth_token` cookie. `middleware.ts` guards every `/admin/:path*` route by verifying this cookie — there is no per-page auth check inside `app/admin/**`.
- **Admin OTP flow** (`app/actions/sendAdminOtp.ts`, `verifyAdminOtp.ts`, `AdminOtp` model): a secondary one-time-code flow gated by `ADMIN_EMAILS`, emailed via Resend. Used for sensitive admin actions distinct from the User/JWT session above.
- **Persona** is a separate concept entirely — it's the person being trained (client), not an authenticated principal. Persona records are looked up/created via `cc` (cédula) and have no password.

Each server action file that touches Prisma (`app/actions/*.ts`) currently instantiates its own `PrismaMariaDb` adapter + `PrismaClient` singleton rather than importing `lib/prisma.ts`'s shared instance — follow the existing pattern in a given file rather than silently "fixing" this.

### Domain model: RM → Macrociclo → Mesociclo → Semana

The app's core purpose is exercise-science training periodization, built in layers:

1. **RM (repetición máxima / one-rep max)** — `lib/rm.ts` implements multiple estimation formulas (Epley, Brzycki, Lombardi, Lander, O'Connor, Mayhew, Wathen, Baechle) plus lab-measured protocols (Casas, Nacleiro, `lib/nacleiro.ts`). Formulas differ for `masculino`/`femenino`. A `Sesion` records one RM-testing session for a `Persona`, with per-exercise `ResultadoEjercicio` rows storing all formula outputs. `lib/training-flow.ts` gates which RM methods are available by `trainingMonths` (lab protocols require ≥4 months of training history).
2. **Macrociclo** — a training macrocycle for a `Persona`, created via a multi-step wizard (`app/macrociclo/nuevo`, `components/macrociclo/MacrocicloWizard*`). Only one non-closed macrociclo per persona is allowed (see `services/macrociclo.service.ts`). A macrociclo snapshots the persona's RM, anthropometric measurements, and VO2max at creation time (`rmSnapshot`, `medidasSnapshot`, `vo2maxSnapshot` JSON columns) so historical plans stay stable even if the source data later changes.
3. **Periodización** (`lib/macrociclo-periodizacion.ts`) — splits the macrociclo's date range into `MacrocicloPeriodo` (preparatorio/competitivo) → `MacrocicloEtapa` (general/especifica/precompetitiva/competitiva) → `MacrocicloMesociclo` (entrante/desarrollador/estabilizador/choque/competencia/etc.) by percentage weighting, then into weekly `MacrocicloSemana` rows with computed volume/intensity per `tipoMicrociclo`.
4. **Mesociclo carga** (`lib/mesociclo-carga.ts`, `MesocicloCarga` model) — per-mesociclo training-load configuration: session duration, training "directions" (`direcciones`), and nested percentage distributions across microciclos and sessions that must each sum to 100 (`volumen`, `microciclos`, `sesiones` JSON columns).
5. **Semana ejercicios** — `MacrocicloSemanaEjercicio` links a specific exercise to a week with the RM formula used, computed RM, target weight, and volume, feeding the weekly training prescription shown in the UI.

`actions/macrociclo.ts`, `actions/persona.ts`, `actions/sesion.ts` are the server actions orchestrating this; `services/macrociclo.service.ts` and `services/persona.service.ts` hold the shared business logic/queries they call into. All macrociclo state changes are recorded to `MacrocicloAuditLog` (before/after JSON, actor type persona vs admin).

### Anthropometric PDF import

`lib/pdf-antropometria.ts` (largest lib file) parses uploaded anthropometry report PDFs (via `pdfjs-dist`) to extract body measurements used to prefill `Persona`/`Macrociclo` measurement snapshots — see `procesarPdfAntropometriaAction` in `actions/macrociclo.ts`.

### Route structure

- `app/(public)` — `app/page.tsx`, `app/login`, `app/registro`: public/auth entry points.
- `app/dashboard`, `app/macrociclo/**`, `app/sesion/**`, `app/nueva-sesion`: persona-facing flows (RM sessions, macrociclo wizard/detail/edit).
- `app/admin/**`: JWT-protected admin panel (personas, sesiones, macrociclos, ejercicios, usuarios) — protected globally by `middleware.ts`, not per-route.
- `app/api/**`: route handlers for login/logout and a couple of REST-ish endpoints (`persona/medidas`, `users/[id]`); most mutations otherwise go through server actions in `actions/` and `app/actions/`, not API routes.
