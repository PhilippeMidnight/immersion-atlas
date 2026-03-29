# Atlas ↔ Immersion CRM Integration Design

> Defines how Atlas MCP tools map to the Immersion CRM Supabase schema,
> and the n8n workflows that automate the sales pipeline.

---

## 1. Architecture

```
┌─────────────┐     MCP tools      ┌──────────────┐     Supabase      ┌──────────────┐
│  Atlas App   │ ──────────────────▸│  Atlas MCP   │ ──────────────────▸│  Immersion   │
│  (Next.js)   │  tool_use calls    │  (Railway)   │  REST / SQL        │  CRM (Supa)  │
│  port 3002   │                    │  FastMCP     │                    │  crm.imm.io  │
└─────────────┘                    └──────┬───────┘                    └──────────────┘
                                          │
                                   n8n webhooks
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
             ┌────────────┐      ┌──────────────┐      ┌──────────────┐
             │  Calendly   │      │    Slack      │      │    Gmail     │
             │  (visits)   │      │  (alerts)     │      │  (emails)    │
             └────────────┘      └──────────────┘      └──────────────┘
```

**Key decision:** Atlas MCP's `crm_service.py` currently uses the **generic HTTP provider** path when `provider != "attio"`. For the Immersion CRM, we have two options:

1. **Direct Supabase** — Atlas MCP calls Supabase REST API directly (recommended for speed)
2. **CRM API routes** — Atlas MCP calls `crm.immersionapp.io/api/*` endpoints (recommended for RLS compliance)

**Recommended: Option 2** — Route through the CRM app's API so RLS policies and business logic are enforced consistently. The CRM app exposes REST endpoints, Atlas MCP calls them via the generic HTTP provider.

---

## 2. CRM Schema (Supabase)

### Core Tables (from 001_initial_schema.sql)

| Table | Atlas Relevance | Key Fields |
|-------|----------------|------------|
| `promoters` | Maps to project promoter_id in registry | id, name, slug |
| `building_groups` | Maps to Atlas "project" concept | id, promoter_id, name, slug |
| `buildings` | Individual buildings within a project | id, building_group_id, name, slug |
| `units` | Unit search/details from Atlas widget | id, building_id, number, floor, price, surface, availability, orientation |
| `contacts` | **Lead/buyer records** — Atlas creates these | id, promoter_id, first_name, last_name, email, phone |
| `contact_buildings` | Which buildings a contact is interested in | contact_id, building_id |
| `contracts` | Deal pipeline — 5 states | id, contact_id, unit_id, building_id, status |

### New Tables (from 002_atlas_integration.sql)

| Table | Purpose |
|-------|---------|
| `atlas_interactions` | Log of every Atlas AI conversation/event per contact |
| `atlas_visits` | Visit bookings made through Atlas scheduling agent |
| `atlas_routing_rules` | Auto-assignment rules: project + language + score → sales rep |

### Extended Contact Fields (from 002)

| Field | Type | Purpose |
|-------|------|---------|
| `language` | text | Preferred: 'en' or 'fr' |
| `lead_source` | text | atlas_widget, kiosk, voice, broker, website, manual |
| `lead_source_detail` | text | Widget URL, kiosk location, etc. |
| `qualification_score` | int | 0–100 from lead-qualification agent |
| `status` | text | new → contacted → qualified → nurturing → converted / lost |
| `assigned_to` | uuid | Sales rep FK to crm_users |
| `last_interaction_at` | timestamptz | Most recent Atlas interaction |
| `session_count` | int | Number of chat sessions |
| `tags` | text[] | Flexible labels |
| `metadata` | jsonb | Agent-specific flexible data |

---

## 3. Field Mapping: Atlas MCP → Immersion CRM

### atlas_crm_create_lead → POST /api/contacts

| Atlas MCP Field | CRM Column | Transform |
|----------------|-----------|-----------|
| `first_name` | `contacts.first_name` | Direct |
| `last_name` | `contacts.last_name` | Direct |
| `email` | `contacts.email` | Normalize, dedup key |
| `phone` / `phone_number` | `contacts.phone` | E.164 format |
| `description` | `contacts.notes` | Direct |
| `language` | `contacts.language` | 'en' or 'fr' |
| `lead_source` | `contacts.lead_source` | atlas_widget, kiosk, etc. |
| `project_id` → lookup | `contact_buildings` junction | Map project_id → building_group → buildings |

### atlas_crm_find_contact → GET /api/contacts?email=...

| Atlas Identity Field | CRM Query |
|---------------------|-----------|
| `email` | `contacts WHERE email = ?` |
| `phone` | `contacts WHERE phone = ?` |
| `name` / `full_name` | `contacts WHERE first_name || last_name ILIKE ?` |
| `crm_record_id` | `contacts WHERE id = ?` |

### atlas_crm_update_stage → PATCH /api/contacts/:id

| Atlas Field | CRM Column | Values |
|------------|-----------|--------|
| `stage` | `contacts.status` | new, contacted, qualified, nurturing, converted, lost |

### atlas_crm_append_note → POST /api/contacts/:id/interactions

Creates an `atlas_interactions` row:
| Atlas Field | CRM Column |
|------------|-----------|
| `note` | `atlas_interactions.summary` |
| `session_id` | `atlas_interactions.session_id` |
| `source_agent` | `atlas_interactions.agent_slug` |

### atlas_crm_assign_broker → PATCH /api/contacts/:id

| Atlas Field | CRM Column |
|------------|-----------|
| `broker.email` → lookup crm_users | `contacts.assigned_to` |

### Contract Pipeline (new, for Steven)

| Atlas Action | CRM Endpoint | Effect |
|-------------|-------------|--------|
| Lead qualifies | POST /api/contracts | Create contract (status: under_creation) linking contact to unit |
| Deal progresses | PATCH /api/contracts/:id | Update status through: under_creation → awaiting_signature → signed |
| Deal cancelled | PATCH /api/contracts/:id | Set status: terminated |

---

## 4. Atlas MCP Configuration

### Project Registry Updates

```python
"ovation_mtl": {
    "promoter_id": "m1",
    "project_name": "Ovation",
    "city": "Montreal",
    "crm_connector_id": "immersion_crm",
    "default_language": "fr",
    "metadata": {
        "crm": {
            "provider": "generic",
            "base_url": "https://crm.immersionapp.io",
            "path_prefix": "/api/atlas",
            "api_key": "${ATLAS_CRM_API_KEY}",
        },
        "scheduling": {
            "provider": "calendly",
            "event_types": {
                "visit": "https://api.calendly.com/event_types/<demo-immersion-uuid>",
                "presentation": "https://api.calendly.com/event_types/<presentation-uuid>"
            }
        }
    }
}
```

### Environment Variables (Railway)

```env
# Replace Attio with Immersion CRM
ATLAS_CRM_PROVIDER=generic
ATLAS_CRM_API_BASE_URL=https://crm.immersionapp.io
ATLAS_CRM_API_KEY=<shared-secret-between-atlas-and-crm>
ATLAS_CRM_PATH_PREFIX=/api/atlas

# Calendly (already configured)
ATLAS_CALENDLY_PAT=<pat>
ATLAS_CALENDLY_ORGANIZATION_URI=<org-uri>
ATLAS_CALENDLY_BOOKING_MODE=api
```

---

## 5. CRM API Routes Needed (for apps/crm)

Atlas MCP will call these via the generic HTTP provider:

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/atlas/find_contact` | Find contact by identity |
| POST | `/api/atlas/create_lead` | Create or upsert contact |
| POST | `/api/atlas/update_lead` | Update contact fields |
| POST | `/api/atlas/append_note` | Create atlas_interaction |
| POST | `/api/atlas/update_stage` | Update contact status |
| POST | `/api/atlas/assign_broker` | Set contact assigned_to |
| POST | `/api/atlas/book_visit` | Create atlas_visit record |
| GET | `/api/atlas/units?building_group_id=...` | Unit search for widget |

All endpoints accept the standard Atlas MCP payload shape:
```json
{
  "project_id": "string",
  "promoter_id": "string",
  "crm_connector_id": "string",
  "operation": "string",
  "payload": {},
  "source_agent": "string",
  "approval_token": "string|null"
}
```

And return the standard response:
```json
{
  "status": "success|partial|failed|no_change",
  "crm_record_id": "uuid|null",
  "matches": [],
  "applied_changes": [],
  "rejected_changes": [],
  "reason": "string|null",
  "audit_ref": "string"
}
```

---

## 6. n8n Workflow Designs

### Workflow 1: Lead Routing
**Trigger:** Webhook from CRM (Supabase realtime or CRM API callback)
**When:** New contact created with `lead_source LIKE 'atlas%'`
**Logic:**
1. Fetch `atlas_routing_rules` for the contact's promoter_id + building_group_id
2. Match by language and qualification_score range
3. Pick highest-priority active rule
4. Update `contacts.assigned_to` with the matched sales rep
5. Send Slack notification to the assigned rep

### Workflow 2: CRM Sync (Atlas → CRM)
**Trigger:** Webhook from Atlas MCP on every CRM operation
**Logic:**
1. Receive operation result from Atlas MCP
2. If new lead: check for duplicates, merge if needed
3. Update `contacts.last_interaction_at` and `session_count`
4. If qualification_score changed: re-evaluate routing rules
5. Log to `atlas_interactions`

### Workflow 3: Visit Reminders
**Trigger:** Schedule (runs every hour)
**Logic:**
1. Query `atlas_visits WHERE status = 'scheduled' AND scheduled_at BETWEEN now() AND now() + 24h`
2. For each upcoming visit: send reminder email to contact
3. Send Slack reminder to assigned sales rep
4. Update visit status to 'confirmed' if contact responded

### Workflow 4: Sales Notifications
**Trigger:** Webhook from CRM
**When:** `contacts.qualification_score >= 70` OR `contracts.status = 'awaiting_signature'`
**Logic:**
1. Send Slack alert to #sales channel with contact details
2. If high-value deal: also DM the assigned rep

---

## 7. Calendly ↔ Atlas Mapping

| Calendly Event Type | Atlas Project | Language | Duration |
|--------------------|---------------|----------|----------|
| Démo IMMERSION | All (demo) | fr | 60 min |
| Immersion Atlas | All (group) | en | 90 min |
| Atlas Test | Testing only | en | 30 min |
| Présentation Minuit Moins Une | Company-wide | fr | 60 min |

**Visit flow:**
1. Atlas scheduling agent calls `atlas_schedule_book` MCP tool
2. MCP creates Calendly event via API
3. n8n webhook fires on Calendly event creation
4. n8n creates `atlas_visits` record in CRM
5. n8n links visit to contact and building_group
6. Reminder workflow sends notifications before visit

---

## 8. Action Items

### For Bryan (orchestration — this agent)
- [x] Design integration schema and migration
- [ ] Build n8n Lead Routing workflow
- [ ] Build n8n CRM Sync workflow
- [ ] Build n8n Visit Reminders workflow
- [ ] Build n8n Sales Notifications workflow
- [ ] Map Calendly event type URIs to project configs

### For Steven (atlas-mcp backend)
- [ ] Update project registry with `crm_connector_id: "immersion_crm"` and `metadata.crm` config
- [ ] Add CRM API key env var on Railway
- [ ] Implement `tool_use` in `generateAtlasResponse.ts` to call MCP tools
- [ ] Test end-to-end: widget chat → MCP tool call → CRM API → Supabase

### For CRM App Developer
- [ ] Implement `/api/atlas/*` API routes (see Section 5)
- [ ] Run migration 002_atlas_integration.sql
- [ ] Add API key auth middleware for Atlas endpoints
- [ ] Set up Supabase realtime webhooks for n8n triggers
