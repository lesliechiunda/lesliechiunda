# Leslie Chiunda — Digital Studio Platform

The production codebase for [lesliechiunda.com](https://lesliechiunda.com): a public portfolio and agency website, a business website-concept studio, and a private owner CRM.

## What is included

- Public personal and agency website
- Portfolio for websites, apps, commerce and business systems
- Dynamic business previews at `/preview/[slug]`
- Wildcard subdomain routing for `business.lesliechiunda.com`
- Owner-only admin workspace with an explicit identity allowlist
- Business listing creation and editing
- Durable image uploads backed by object storage
- Preview, outreach and approval workflows
- Approval-gated hooks for future AI-agent discovery

No email provider or automated outreach service is connected.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npm run build
npm run db:generate
```

## Data and access

- Structured CRM data uses Cloudflare D1 through the logical `DB` binding.
- Listing images use R2 through the logical `MEDIA` binding.
- Admin pages use platform-provided sign-in plus a server-side `ADMIN_EMAILS` allowlist.
- Agent discovery intake stays disabled until `AGENT_INGEST_TOKEN` is configured.

Database migrations are stored in `drizzle/`. Runtime values are managed by the hosting platform and are not committed to the repository.
