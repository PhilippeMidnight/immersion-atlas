# Railway Environment Variables — Atlas MCP

> **Service:** `immersionatlas.up.railway.app`
> **Last updated:** 2026-03-29

All variables below must be set in the Railway dashboard under the Atlas MCP service's **Variables** tab.

---

## CRM Integration (Immersion CRM via generic HTTP provider)

| Variable | Value | Where to find it |
|----------|-------|-----------------|
| `ATLAS_CRM_PROVIDER` | `generic` | Hardcode this. Tells atlas-mcp to use the HTTP provider instead of Attio. |
| `ATLAS_CRM_API_BASE_URL` | `https://crm.immersionapp.io` | The production domain of the CRM app (Netlify). |
| `ATLAS_CRM_API_KEY` | *(generate a shared secret)* | Generate a strong random string (e.g. `openssl rand -hex 32`). This same value must also be set as `ATLAS_CRM_API_KEY` in the **CRM app's Netlify env vars** — the API route at `/api/atlas` checks `Authorization: Bearer <this-key>`. |
| `ATLAS_CRM_PATH_PREFIX` | `/api/atlas` | The API route path in the CRM app. This is the default the code already expects. |
| `ATLAS_CRM_TIMEOUT_SECONDS` | `20` | Optional. Default is already 20s. Increase if CRM responses are slow. |

---

## Calendly (API booking mode)

| Variable | Value | Where to find it |
|----------|-------|-----------------|
| `ATLAS_CALENDLY_PAT` | *(your Calendly Personal Access Token)* | Calendly dashboard → **Integrations** → **API & Webhooks** → generate a Personal Access Token. Must have scopes for reading event types, availability, and creating invitees. |
| `ATLAS_CALENDLY_ORGANIZATION_URI` | `https://api.calendly.com/organizations/e98a10e5-149c-4c9c-9509-00720e9a5725` | This is Philippe's Calendly org URI (just confirmed via API). |
| `ATLAS_CALENDLY_BOOKING_MODE` | `api` | Hardcode this. Tells Atlas to book via Calendly API rather than generating scheduling links. |

---

## SMTP / Follow-up Emails

| Variable | Value | Where to find it |
|----------|-------|-----------------|
| `ATLAS_FOLLOWUP_SMTP_HOST` | `smtp.gmail.com` | Default. Only change if using a different email provider. |
| `ATLAS_FOLLOWUP_SMTP_PORT` | `587` | Default for STARTTLS. Use `465` if switching to SSL. |
| `ATLAS_FOLLOWUP_SMTP_USERNAME` | *(Gmail address or app-specific email)* | The Gmail account that sends follow-up emails. |
| `ATLAS_FOLLOWUP_SMTP_PASSWORD` | *(Gmail App Password)* | Google Account → **Security** → **2-Step Verification** → **App passwords** → generate one for "Mail". Do NOT use your regular Gmail password. |
| `ATLAS_FOLLOWUP_SMTP_FROM_EMAIL` | *(e.g. `info@immersionapp.io`)* | The "From" address on outgoing emails. Can differ from SMTP_USERNAME if Gmail allows "Send as" for this address. |
| `ATLAS_FOLLOWUP_SMTP_FROM_NAME` | `Atlas` | Default. Override per-project via `metadata.follow_up.from_name` in registry. |
| `ATLAS_FOLLOWUP_SMTP_REPLY_TO` | *(e.g. `philippe@minuitmoinsune.com`)* | Optional. Where replies go if different from FROM_EMAIL. |

---

## Existing / Already Set (verify these are present)

| Variable | Value | Where to find it |
|----------|-------|-----------------|
| `ATLAS_MCP_API_KEY` | *(existing key)* | Already set — this is the API key clients use to call the MCP server. Should already be in Railway. |
| `ATLAS_ENV` | `production` | Set to `production` for prod, `development` for dev. |
| `LOG_LEVEL` | `INFO` | Optional. Default is INFO. |
| `PROJECT_REGISTRY_SOURCE` | `static` | Default. Uses the in-code registry.py. |

---

## CRM App (Netlify) — matching variables

These go in the **CRM app's** Netlify environment variables (not Railway):

| Variable | Value | Notes |
|----------|-------|-------|
| `ATLAS_CRM_API_KEY` | *(same shared secret as Railway)* | Must match exactly — the `/api/atlas` route validates Bearer tokens against this. |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xuckbuavifubuxjbgeva.supabase.co` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1Y2tidWF2aWZ1YnV4amJnZXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzA0MDQsImV4cCI6MjA4ODc0NjQwNH0.c2h1vYtqIYHlz8VJNK4ZekQmHzthVDn5MD3FcnuTBgY` | Supabase anon key (safe to expose client-side). |
| `SUPABASE_SERVICE_ROLE_KEY` | *(from Supabase dashboard)* | Supabase dashboard → Project Settings → API → `service_role` key. **Keep secret.** The `/api/atlas` route needs this to bypass RLS. |

---

## Quick Setup Checklist

1. **Generate shared secret:** `openssl rand -hex 32` → set as `ATLAS_CRM_API_KEY` in both Railway AND Netlify CRM
2. **Get Calendly PAT:** Calendly → Integrations → API → Personal Access Token
3. **Get Gmail App Password:** Google Account → Security → App Passwords
4. **Get Supabase service role key:** supabase.com → project `xuckbuavifubuxjbgeva` → Settings → API → service_role
5. **Deploy registry.py** changes to Railway (the updated `registry.py` with Immersion CRM config)
