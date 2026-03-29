# Philippe — Manual Setup Guide

> Everything you need to do by hand to get Atlas ↔ CRM ↔ Calendly fully live.
> Estimated time: ~30 minutes.
> **Date:** 2026-03-29

---

## Step 1: Generate the shared CRM API key

This single secret connects Atlas MCP to the CRM app. Both services need the same value.

1. Open a terminal and run:
   ```bash
   openssl rand -hex 32
   ```
2. Copy the output (it looks like `a3f8c1d9e7b2...64 characters`). Save it somewhere temporarily — you'll paste it twice.

---

## Step 2: Set Railway env vars (Atlas MCP)

1. Go to [Railway dashboard](https://railway.com/dashboard)
2. Click on the **Atlas MCP** service (`immersionatlas.up.railway.app`)
3. Go to **Variables** tab
4. Add these variables (click **+ New Variable** for each):

| Variable | Value |
|----------|-------|
| `ATLAS_CRM_PROVIDER` | `generic` |
| `ATLAS_CRM_API_BASE_URL` | `https://crm.immersionapp.io` |
| `ATLAS_CRM_API_KEY` | *(paste the key from Step 1)* |
| `ATLAS_CRM_PATH_PREFIX` | `/api/atlas` |
| `ATLAS_CALENDLY_ORGANIZATION_URI` | `https://api.calendly.com/organizations/e98a10e5-149c-4c9c-9509-00720e9a5725` |
| `ATLAS_CALENDLY_BOOKING_MODE` | `api` |
| `ATLAS_CALENDLY_PAT` | *(see Step 3 below)* |

5. **Don't deploy yet** — finish Steps 3–4 first, then deploy once.

---

## Step 3: Get your Calendly Personal Access Token

1. Go to [calendly.com/integrations](https://calendly.com/integrations)
2. Scroll down to **API & Webhooks** (or go to [calendly.com/integrations/api_webhooks](https://calendly.com/integrations/api_webhooks))
3. Click **Generate New Token**
4. Name it `Atlas MCP` and click **Create Token**
5. **Copy the token immediately** — Calendly only shows it once
6. Go back to Railway and paste it as the value for `ATLAS_CALENDLY_PAT`

---

## Step 4: Set Netlify env vars (CRM app)

1. Go to [Netlify dashboard](https://app.netlify.com)
2. Find the **CRM** site (`crm.immersionapp.io`)
3. Go to **Site configuration** → **Environment variables**
4. Add or update these variables:

| Variable | Value |
|----------|-------|
| `ATLAS_CRM_API_KEY` | *(paste the same key from Step 1)* |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xuckbuavifubuxjbgeva.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1Y2tidWF2aWZ1YnV4amJnZXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzA0MDQsImV4cCI6MjA4ODc0NjQwNH0.c2h1vYtqIYHlz8VJNK4ZekQmHzthVDn5MD3FcnuTBgY` |
| `SUPABASE_SERVICE_ROLE_KEY` | *(see Step 5 below)* |

---

## Step 5: Get the Supabase service role key

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click on the **Immersion Atlas** project
3. Go to **Project Settings** (gear icon in sidebar) → **API**
4. Under **Project API keys**, find `service_role` (the one labeled "secret")
5. Click the eye icon to reveal it, then **copy**
6. Paste it as `SUPABASE_SERVICE_ROLE_KEY` in the Netlify CRM env vars (Step 4)

> **Important:** This key bypasses Row Level Security. Never expose it client-side or commit it to git.

---

## Step 6: Deploy both services

### Railway (Atlas MCP)
1. Back in Railway, click **Deploy** to redeploy with the new env vars
2. Wait for the deploy to finish (check the logs for "Application startup complete")

### Netlify (CRM app)
1. Back in Netlify, trigger a deploy:
   - Either push code to git (Step 8 below)
   - Or go to **Deploys** → **Trigger deploy** → **Deploy site**

---

## Step 7: Import n8n workflows

There are 4 workflow JSON files ready to import. These automate lead routing, CRM sync, visit reminders, and sales notifications.

1. Go to your n8n instance
2. For each workflow:
   - Click **+ Add Workflow** (or the ⋮ menu → **Import from file**)
   - Select the JSON file
   - Review the nodes and update credentials (Supabase, Slack, Gmail) where needed
   - **Activate** the workflow

| File | What it does |
|------|-------------|
| `n8n-workflows/01-lead-routing.json` | New lead → check routing rules → assign sales rep → Slack notify |
| `n8n-workflows/02-crm-sync.json` | CRM events → switch by type → update stats → Slack notify |
| `n8n-workflows/03-visit-reminders.json` | Hourly check → visits in 24h → email + Slack reminder |
| `n8n-workflows/04-sales-notifications.json` | Atlas event → score priority → Slack with urgency level |

### Credentials to configure in each workflow:
- **Supabase:** Use the project URL (`https://xuckbuavifubuxjbgeva.supabase.co`) and service role key
- **Slack:** Connect to your workspace, set the channel ID for sales notifications
- **Gmail:** Use SMTP credentials (see Step 9 if you set those up)

---

## Step 8: Push code to git

Three repos have changes. Run these from the directories on your machine:

### atlas-mcp (registry update)
```bash
cd atlas-mcp
git add app/registry.py
git commit -m "feat: wire Immersion CRM generic provider + Calendly config in project registry

- Set crm_connector_id to immersion_crm for ovation_mtl and trudel_b5
- Add generic CRM provider config with base_url/path_prefix fallbacks
- Add Calendly event type URIs for visit/presentation/group bookings
- Add follow_up config per project"
git push origin main
```

### immersion-atlas (docs + n8n workflows)
```bash
cd immersion-atlas
git add docs/ n8n-workflows/
git commit -m "feat: add Atlas-CRM integration docs and n8n workflow definitions

- CRM schema mapping and API contract documentation
- Calendly config with event type URIs
- Railway env var setup guide
- Bryan handoff doc for phases 2-4
- 4 n8n workflow JSONs: lead routing, CRM sync, visit reminders, sales notifications"
git push origin master
```

### immersion-suite (CRM atlas integration)
```bash
cd immersion-suite
git add apps/crm/supabase/migrations/002_atlas_integration.sql apps/crm/src/app/api/atlas/route.ts apps/crm/src/lib/database.types.ts
git commit -m "feat(crm): add Atlas integration layer

- Migration 002: extend contacts with lead tracking fields, add atlas_interactions/visits/routing_rules tables
- POST /api/atlas: bridge endpoint for Atlas MCP generic HTTP provider
- TypeScript types for all new Atlas tables"
git push origin main
```

> **Note:** immersion-suite has many other modified files (Nexus, Atlas frontend, etc.). The commands above only commit the CRM/Atlas integration work. If you want to commit everything, replace the `git add` line with `git add -A` — but review with `git diff --cached` first.

---

## Step 9: Gmail App Password (optional — for email follow-ups)

This is only needed when you're ready to test email sending (visit reminders, follow-up sequences).

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Make sure **2-Step Verification** is ON (required for app passwords)
3. Search for **App passwords** in the security page, or go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Click **Select app** → choose **Mail**
5. Click **Select device** → choose **Other** → type `Atlas MCP`
6. Click **Generate**
7. Copy the 16-character password (looks like `abcd efgh ijkl mnop`)
8. Add these to Railway env vars:

| Variable | Value |
|----------|-------|
| `ATLAS_FOLLOWUP_SMTP_USERNAME` | *(your Gmail address)* |
| `ATLAS_FOLLOWUP_SMTP_PASSWORD` | *(the 16-char app password, no spaces)* |
| `ATLAS_FOLLOWUP_SMTP_FROM_EMAIL` | *(the address emails come from, e.g. info@immersionapp.io)* |
| `ATLAS_FOLLOWUP_SMTP_FROM_NAME` | `Atlas` |
| `ATLAS_FOLLOWUP_SMTP_REPLY_TO` | `philippe@minuitmoinsune.com` |

---

## Step 10: Enable Google Calendar (optional — for conflict checking)

Currently, Calendly handles all scheduling. Google Calendar integration adds conflict checking against your personal calendar.

1. Go to [calendar.google.com](https://calendar.google.com) with your `philippe@minuitmoinsune.com` account
2. If you see a "Welcome to Google Calendar" setup screen, complete it
3. Once your calendar is active, the Google Calendar MCP tools will work

> This is low priority — Calendly works independently for booking. Only needed if you want Atlas to check your calendar availability before offering times.

---

## Verification Checklist

After completing the steps above, verify everything works:

- [ ] **Railway deploys successfully** — Check logs for "Application startup complete"
- [ ] **CRM API responds** — Run this from any terminal:
  ```bash
  curl -X POST https://crm.immersionapp.io/api/atlas \
    -H "Authorization: Bearer YOUR_CRM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"operation":"find_contact","match":{"email":"test@example.com"}}'
  ```
  Expected: `{"status":"no_match","matches":[],...}`

- [ ] **Calendly token works** — Check Railway logs after a test booking attempt, or test via Atlas chat
- [ ] **Supabase tables exist** — Go to Supabase dashboard → Table Editor → verify `atlas_interactions`, `atlas_visits`, `atlas_routing_rules` are listed
- [ ] **n8n workflows active** — Check n8n dashboard for green "Active" indicators on all 4 workflows
- [ ] **Git pushed** — Run `git status` in all 3 repos to confirm clean working trees
