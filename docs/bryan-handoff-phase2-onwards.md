# Bryan Agent — Handoff: Phase 2, 3, 4

> **Context:** Phase 1 (Integration Wiring) is complete. This document hands off all remaining Bryan tasks to the next agent session.
> **Date:** 2026-03-29
> **Previous agent:** Bryan (Cowork session, ~3 context windows)

---

## What Was Completed in Phase 1

### Deliverables

| Item | Status | Location |
|------|--------|----------|
| **CRM schema mapping** (Attio → Immersion CRM pivot) | Done | `docs/atlas-crm-schema-mapping.md` |
| **Calendly config** — all 5 event types documented | Done | `docs/calendly-config.md` |
| **Atlas-MCP registry.py** — CRM + Calendly + follow-up config | Done | `atlas-mcp/app/registry.py` (both `ovation_mtl` and `trudel_b5`) |
| **Supabase migration 001** — 21-table CRM schema | Applied | Project `xuckbuavifubuxjbgeva` |
| **Supabase migration 002** — Atlas integration tables | Applied | Project `xuckbuavifubuxjbgeva` |
| **CRM API route** — `/api/atlas` POST endpoint | Done | `immersion-suite/apps/crm/src/app/api/atlas/route.ts` |
| **TypeScript types** — 3 new tables + extended contacts | Done | `immersion-suite/apps/crm/src/lib/database.types.ts` |
| **n8n workflows** — 4 JSON files (not yet imported) | Written | `n8n-workflows/01-04.json` |
| **Railway env var guide** | Done | `docs/railway-env-vars.md` |

### Key Decisions Made

1. **Attio → Immersion CRM pivot:** Atlas MCP's `crm_service.py` already supports a `generic` HTTP provider. We use that instead of Attio. The CRM app at `crm.immersionapp.io/api/atlas` handles all 6 operations (find, create, update, append_note, update_stage, assign_broker).

2. **Shared Supabase project:** CRM and Atlas share project `xuckbuavifubuxjbgeva` (free tier limit). Tables are prefixed: CRM core tables are unprefixed, Atlas-specific tables use `atlas_` prefix.

3. **Calendly API booking mode:** Atlas books visits via Calendly API (not scheduling links). Organization URI: `https://api.calendly.com/organizations/e98a10e5-149c-4c9c-9509-00720e9a5725`. Philippe's user URI: `https://api.calendly.com/users/6096180d-572a-4ac5-8b22-999e068c9b5f`.

4. **Registry `None` fallbacks:** `base_url`, `path_prefix`, `from_email`, `reply_to` in registry entries are `None` — they fall back to env vars (`ATLAS_CRM_API_BASE_URL`, `ATLAS_CRM_PATH_PREFIX`, `ATLAS_FOLLOWUP_SMTP_FROM_EMAIL`, etc.).

### Known Blockers Still Open

- **n8n MCP auth:** The n8n connector was returning "Session terminated" errors. The 4 workflow JSONs exist but need to be imported manually or after re-auth.
- **Google Calendar:** Not enabled on Philippe's Google account. `gcal_list_calendars` returned "The user must be signed up for Google Calendar." This blocks calendar conflict checking (Calendly booking itself works without it).
- **SMTP credentials:** Gmail App Password needed for follow-up emails — not yet generated.

---

## Phase 2: Automation Pipelines

> Ref: `atlas-handoff.md` Bryan tasks 5–8

### Task 5 — n8n Workflow: Email Sequences

**Goal:** Automated email flows triggered by Atlas events.

**Sequences to build:**
- **Welcome sequence** — Triggered when `atlas_interactions` gets first `chat` entry for a contact. 3 emails: immediate thank-you → 24h follow-up with project info → 72h soft CTA for visit booking.
- **Post-visit follow-up** — Triggered when `atlas_visits.status` changes to `completed`. Summary email + next steps + satisfaction survey link.
- **Nurture drip** — For contacts with `status = 'nurturing'`. Weekly content emails (project updates, neighborhood highlights, financing tips). 6-email sequence.
- **Re-engagement** — For contacts where `last_interaction_at > 30 days ago`. 2-email sequence: "Still interested?" + final follow-up.

**Implementation approach:**
- n8n workflows triggered by Supabase webhooks (or scheduled polling of `atlas_interactions` / `atlas_visits`)
- Email sending via Gmail SMTP (env vars already documented in `railway-env-vars.md`)
- Templates must be bilingual (use `contacts.language` field: `'en'` or `'fr'`)
- Track email state in `atlas_interactions` with `interaction_type = 'email_sent'`

**Dependencies:** SMTP credentials must be set (see Philippe's manual setup guide).

### Task 6 — n8n Workflow: Visit Reminders

**Status:** Workflow JSON already written (`n8n-workflows/03-visit-reminders.json`). Needs import and testing.

**What it does:**
- Hourly schedule trigger
- Queries `atlas_visits` for visits in the next 24 hours with status `scheduled`
- Joins contact info and building_group name
- Sends bilingual email reminder to contact
- Sends Slack reminder to assigned sales rep

**To complete:** Import JSON, configure Supabase/Gmail/Slack credentials in n8n, test with a dummy visit row.

### Task 7 — n8n Workflow: Sales Notifications

**Status:** Workflow JSON already written (`n8n-workflows/04-sales-notifications.json`). Needs import and testing.

**What it does:**
- Webhook trigger (called by CRM sync workflow or Atlas MCP)
- Scores priority: high (score ≥ 80 or status = awaiting_signature), medium (score ≥ 60), low (rest)
- Routes to Slack channel with appropriate urgency formatting

**To complete:** Import JSON, configure Slack channel ID, test with sample payloads.

### Task 8 — Email Templates

**Goal:** Draft all email copy for the sequences above, in both English and French.

**Templates needed:**
1. Welcome — immediate (`welcome_instant`)
2. Welcome — 24h follow-up (`welcome_followup_24h`)
3. Welcome — 72h CTA (`welcome_cta_72h`)
4. Post-visit summary (`visit_followup`)
5. Nurture 1-6 (`nurture_01` through `nurture_06`)
6. Re-engagement — initial (`reengage_initial`)
7. Re-engagement — final (`reengage_final`)
8. Visit reminder — 24h (`visit_reminder_24h`)
9. Visit confirmation (`visit_confirmation`)

**Format:** Store as JSON or markdown in `n8n-workflows/email-templates/` with `{contact_name}`, `{project_name}`, `{building_group_name}`, `{visit_date}`, `{visit_time}`, `{broker_name}` interpolation variables.

**Tone:** Professional but warm. Real estate luxury market. French = default voice, English = equally polished (not translated — natively written).

---

## Phase 3: Voice & Knowledge

> Ref: `atlas-handoff.md` Bryan tasks 9–11

### Task 9 — ElevenLabs Voice Agent

**Goal:** Configure a voice agent for Atlas kiosk and phone interactions.

**Available tools:** `mcp__ElevenLabs_Agents_MCP_App__create_agent`, `search_voices`, `show_agent_creator`, `update_agent`

**Steps:**
1. Search for a French-Canadian bilingual voice (or two voices: one FR, one EN)
2. Create agent with personality matching Atlas sales concierge (professional, knowledgeable, warm)
3. Connect agent to Atlas MCP backend for real-time unit/inventory/scheduling queries
4. Configure the agent's conversation flow: greeting → project interest → unit search → qualification → visit booking
5. Test with sample conversations in both languages

**Design decisions needed:**
- Single bilingual voice or language-specific voices?
- Phone number integration (Twilio?) or kiosk-only?
- How does voice agent authenticate to Atlas MCP? (Separate API key? Same `ATLAS_MCP_API_KEY`?)

### Task 10 — Notion Knowledge Base Structure

**Goal:** Set up a Notion workspace structure that Atlas knowledge agent queries.

**Proposed structure:**
```
Atlas Knowledge Base (database)
├── Project: Ovation
│   ├── FAQ
│   ├── Unit Specs
│   ├── Neighborhood Guide
│   ├── Financing Options
│   ├── Legal / Condo Docs
│   └── Construction Timeline
├── Project: B5
│   └── (same structure)
└── General
    ├── Company Info
    ├── Sales Process
    └── Competitor Comparisons
```

**Each page should have:** title, project_id tag, category tag, language tag (en/fr), last_updated date, content body.

**Integration point:** Atlas MCP's `kb_tools.search_knowledge_base` tool. Currently returns mock data. Steven needs to wire it to a real source — Notion API or a vector store populated from Notion.

### Task 11 — n8n Workflow: Knowledge Sync

**Goal:** When a Notion page is created/updated, push its content to Atlas's knowledge retrieval system.

**Approach:**
- n8n trigger: Notion "Page Updated" or scheduled poll of the knowledge base database
- Extract page content via Notion API
- Transform to Atlas knowledge format (chunked text + metadata)
- Push to vector store (Supabase pgvector extension, or external like Pinecone)
- Update `knowledge_source_id` in project registry if needed

**Dependency:** Requires Steven to implement the knowledge agent's data layer first. Coordinate on the expected input format.

---

## Phase 4: Frontend & Deployment

> Ref: `atlas-handoff.md` Bryan tasks 12–14

### Task 12 — Atlas Frontend Improvements

**Current state:** `apps/atlas/` has a basic chat widget. `generateAtlasResponse.ts` calls Claude with no tool_use (Steven is adding this).

**Bryan's frontend tasks:**
- Add i18n strings to `packages/config/src/i18n/dictionaries.ts` for any new Atlas UI
- Ensure dark/light mode compliance (use semantic tokens)
- Add loading skeletons (`loading.tsx`) for Atlas pages
- Build UI for visit booking confirmation (show calendar, time, location, broker)
- Build UI for unit comparison cards (when Atlas suggests units)
- Add conversation history sidebar (use `atlas_interactions` table)

**Key files:**
- `apps/atlas/src/app/atlas/page.tsx` — main page
- `apps/atlas/src/components/atlas/` — chat components (AtlasChatView, ChatPanel, ProjectSelector)
- `apps/atlas/src/lib/atlas-widget/` — AI logic, MCP client, input guard

### Task 13 — Netlify Env Vars

**Atlas app on Netlify needs:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — from Clerk dashboard
- `CLERK_SECRET_KEY` — from Clerk dashboard
- `ANTHROPIC_API_KEY` — for `generateAtlasResponse.ts`
- `ATLAS_MCP_URL` — `https://immersionatlas.up.railway.app`
- `ATLAS_MCP_API_KEY` — same key Railway uses for auth

**Use:** `mcp__a0be58ee__netlify-deploy-services-updater` or Netlify dashboard.

### Task 14 — Supabase Schema (if needed)

**Already done:** Migrations 001 + 002 applied. 24 tables live on project `xuckbuavifubuxjbgeva`.

**Remaining if needed:**
- Enable pgvector extension for knowledge base embeddings: `CREATE EXTENSION IF NOT EXISTS vector;`
- Add `atlas_conversations` table if you want to persist full chat transcripts (currently not stored)
- Add RLS policies (currently all tables have `rls_enabled: false` — fine for internal use, needs policies before exposing to external users)

---

## Coordination Points with Steven

| Topic | Bryan Does | Steven Does | Sync Point |
|-------|-----------|-------------|------------|
| CRM data flow | API route + n8n workflows | Wire `crm_service.py` to call `/api/atlas` | Test with `curl` against CRM API route |
| Scheduling | Calendly config in registry | Wire `scheduling_service.py` to Calendly API | Test `book_visit` tool end-to-end |
| Knowledge base | Notion structure + sync workflow | Wire `kb_tools` to vector store | Agree on embedding format and API |
| Voice agent | ElevenLabs setup | Expose MCP tools voice agent can call | Agree on auth method for voice |
| Frontend tool_use | Build UI for tool results | Add `tool_use` to `generateAtlasResponse.ts` | Test tool calls render correctly in chat |
| Email lifecycle | n8n workflows + templates | Implement `followup_service.py` SMTP | Test email sending end-to-end |

---

## File Map

```
immersion-atlas/
├── docs/
│   ├── atlas-crm-schema-mapping.md    # Full integration design doc
│   ├── calendly-config.md             # All 5 event types + URIs
│   ├── railway-env-vars.md            # Every env var with source
│   ├── registry-update-for-steven.py  # (superseded — registry.py updated directly)
│   └── bryan-handoff-phase2-onwards.md # ← THIS FILE
├── n8n-workflows/
│   ├── 01-lead-routing.json           # Webhook → route → assign → Slack
│   ├── 02-crm-sync.json              # Webhook → switch by op → Slack/log
│   ├── 03-visit-reminders.json       # Hourly → fetch visits → email + Slack
│   └── 04-sales-notifications.json   # Webhook → score priority → Slack
└── src/app/                           # Atlas standalone site (legacy)

atlas-mcp/
├── app/
│   ├── registry.py                    # Updated with CRM + Calendly config
│   ├── config.py                      # Env var definitions
│   ├── services/crm_service.py        # Dual Attio/generic provider
│   └── services/scheduling_service.py # Calendly integration
└── agents/                            # 00-10 markdown specs (not yet code)

immersion-suite/
├── apps/crm/
│   ├── supabase/migrations/
│   │   ├── 001_initial_crm_schema.sql
│   │   └── 002_atlas_integration.sql
│   ├── src/app/api/atlas/route.ts     # Atlas MCP → CRM bridge
│   └── src/lib/database.types.ts      # Includes Atlas table types
└── apps/atlas/                        # Frontend (Next.js)
```

---

## How to Start

1. Read this doc and `atlas-crm-schema-mapping.md` for full context
2. Verify Philippe has completed the manual setup (env vars, n8n import, SMTP)
3. Start with **Task 6 (visit reminders)** — it's already written as JSON, just needs import and testing
4. Then **Task 7 (sales notifications)** — same situation
5. Then tackle **Task 5 (email sequences)** — new workflows + templates (Task 8)
6. Phase 3 and 4 can proceed in any order after Phase 2 is stable
