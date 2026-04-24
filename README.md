# SolarCalc

SolarCalc is a Next.js application for sizing residential/commercial solar systems and producing shareable, exportable build outputs.

It supports:
- Input-driven system sizing (inverter, battery, panel count, stringing)
- Formula-backed computation and plain-language rationale
- Public share pages for generated builds
- Account save flow (Google sign-in) for personal build history
- Export options: JSON and printable quote PDF
- Build retention policy (auto-expire after 30 days)

## Status

Current status: suitable for local development, internal demos, and staging.

Production status: not fully hardened yet. Review the Pre-Production Checklist below before publishing.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Prisma + PostgreSQL
- Auth.js (NextAuth) with Google provider
- React + react-katex
- React Flow (`@xyflow/react`) for system diagrams

## Implemented Features

- Calculator form with grouped inputs and helper text
- Panel presets + custom panel electrical values
- Bifacial and motor-load aware sizing
- Dynamic computation output and explanations
- Collapsible JSON and glossary/term definitions
- Guest share creation on compute (`/p/[shareId]`)
- Optional account save for signed-in users
- Saved builds section with delete action
- Export APIs:
  - `GET /api/export/[shareId]` (JSON)
  - `GET /api/export/[shareId]/quote` (printable quote HTML/PDF)
- Retention/expiry checks in calculate/share/export paths
- Open Graph images for site and shared builds

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Configure environment variables.

Copy `.env.example` to `.env` and update values as needed.

3. Start PostgreSQL with Docker.

```bash
npm run db:up
```

4. Initialize Prisma schema/client.

```bash
npx prisma generate
npx prisma db push
```

5. Run the app.

```bash
npm run dev
```

## Environment Variables

Required runtime variables:

- `DATABASE_URL`
- `AUTH_SECRET` (or `NEXTAUTH_SECRET` fallback)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`

Notes:
- Prisma CLI reads `.env` by default.
- For social share previews, `NEXT_PUBLIC_APP_URL` must be a publicly reachable domain (not localhost).

## Database (Docker)

Included compose service exposes PostgreSQL on host port `5433`.

Useful commands:

```bash
npm run db:up
npm run db:logs
npm run db:down
npm run db:setup
```

## OCI Ampere + Portainer + Nginx Proxy Deployment

This repository now includes:

- `Dockerfile` for production container builds
- `docker-compose.oci.yml` for app + Postgres stack deployment

Recommended flow on an OCI Always Free Ampere VM:

1. Prepare host
- Install Docker Engine + Docker Compose plugin.
- Install Portainer.
- Create shared proxy network once:

```bash
docker network create net
```

2. Configure environment
- In Portainer Stack, add Environment variables.
- Set production values:
  - `NEXTAUTH_URL=https://your-domain`
  - `NEXT_PUBLIC_APP_URL=https://your-domain`
  - strong `AUTH_SECRET`
  - production `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  - `DATABASE_URL=postgresql://<user>:<pass>@postgres:5432/solarcalc?schema=public` (when using the Postgres service in this stack)
  - or set `DATABASE_URL` to your managed Postgres endpoint

3. Deploy with Portainer Stacks
- In Portainer, create/update a stack using `docker-compose.oci.yml`.
- Build and start the stack.
- The app container is reachable on Docker network at `solarcalc:3000` (or alias `solarcalc-app:3000`).

4. Configure Nginx Proxy Manager
- Proxy Host domain: `your-domain`
- Forward Hostname/IP: `solarcalc`
- Forward Port: `3000`
- Scheme: `http`
- Enable WebSocket support.
- Request/issue SSL cert (Let's Encrypt) and force SSL.

5. Google OAuth callback
- In Google Cloud OAuth settings, add callback URL:
  - `https://your-domain/api/auth/callback/google`

6. OCI security list / firewall
- Open inbound `80` and `443` to the VM.
- Keep Postgres private (do not expose `5432` publicly).

Notes:
- `docker-compose.oci.yml` uses an external Docker network named `net` so Nginx Proxy Manager can route directly to the app container.
- The container start command retries `prisma db push` until the database is reachable, then starts Next.js.
- If you keep DB inside the same stack, set strong Postgres credentials before production use.

## Share vs Save Behavior

- Share: created for each calculation so users can open/share a public build URL.
- Save: optional account-bound save for logged-in users.
- Retention: builds currently expire after 30 days.

## Pre-Production Checklist

Complete these before publishing to production:

1. Secrets and auth
- Set strong `AUTH_SECRET` in production.
- Configure Google OAuth redirect URIs for your production domain.
- Ensure `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` match the deployed domain.

2. Database and migrations
- Use a managed production Postgres instance.
- Replace `db push` workflow with Prisma migrations (`prisma migrate deploy`) for release safety.
- Set up automated backups and restore test.

3. Security hardening
- Add request validation/rate limiting on public APIs (`/api/calculate`, exports, share endpoints).
- Review data exposure policy for public share links.
- Confirm no development credentials remain in deployed environment.

4. Reliability and observability
- Add error monitoring (for API/auth/database failures).
- Add uptime checks for the main page and critical APIs.
- Add basic runbook for auth/database outage handling.

5. Testing and quality gates
- Add core engine tests for sizing rules and edge cases.
- Add API route smoke/integration tests.
- Require passing `npm run lint` + `npm run build` in CI before deploy.

6. Product/policy readiness
- Confirm retention policy text shown in UI matches business policy.
- Add privacy/terms pages if public sharing is enabled.

## Quick Production Answer

Is it okay to not publish yet? Yes. The app is already useful in local/staging.

Do you need more before production? Yes. At minimum: secure env/auth config, migration-based DB deploy, API hardening, and basic monitoring/tests.
