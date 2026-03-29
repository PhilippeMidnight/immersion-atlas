"""
Atlas MCP Project Registry Update — For Steven
================================================
Replace the entries in atlas-mcp/app/registry.py with these updated configs.
They wire Atlas to the Immersion CRM (via generic HTTP provider) and Calendly.

Environment variables needed on Railway:
  ATLAS_CRM_PROVIDER=generic
  ATLAS_CRM_API_BASE_URL=https://crm.immersionapp.io
  ATLAS_CRM_API_KEY=<shared-secret>
  ATLAS_CRM_PATH_PREFIX=/api/atlas
  ATLAS_CALENDLY_PAT=<calendly-pat>
  ATLAS_CALENDLY_ORGANIZATION_URI=<org-uri>
  ATLAS_CALENDLY_BOOKING_MODE=api
"""

PROJECT_REGISTRY = {
    "ovation_mtl": {
        "promoter_id": "m1",
        "project_name": "Ovation",
        "city": "Montreal",
        "unit_data_url": None,
        "unit_source": {
            "url": None,
            "format": "immersion_units_v1",
        },
        "knowledge_source_id": None,
        "crm_connector_id": "immersion_crm",
        "default_language": "fr",
        "metadata": {
            "amenities": ["Gym", "Rooftop terrace", "Lounge"],
            "crm": {
                "provider": "generic",
                "base_url": None,   # Falls back to ATLAS_CRM_API_BASE_URL env var
                "path_prefix": None,  # Falls back to ATLAS_CRM_PATH_PREFIX env var
                "object": "contacts",
                "match_attribute": "email",
            },
            "scheduling": {
                "provider": "calendly",
                "event_types": {
                    "visit": "https://api.calendly.com/event_types/b7463a02-f8cf-4492-9fca-25073aece2a3",
                    "presentation": "https://api.calendly.com/event_types/378e29c6-cd7e-46e2-9087-464d685a3998",
                    "group": "https://api.calendly.com/event_types/536d68cc-45e0-4bbe-a742-025e0b68e301",
                },
                "default_event_type": "visit",
                "timezone": "America/Toronto",
            },
            "follow_up": {
                "from_email": None,  # Falls back to ATLAS_FOLLOWUP_SMTP_FROM_EMAIL
                "from_name": "Ovation par Immersion",
                "reply_to": None,
            },
        },
        "surface_bindings": {
            "domains": ["ovation.immersionapp.io"],
            "app_instances": [],
            "device_ids": [],
            "crm_accounts": [],
        },
    },
    "trudel_b5": {
        "promoter_id": "trudel",
        "project_name": "B5",
        "city": "Quebec",
        "unit_data_url": "https://datacenter.immersionapp.ca/trudel/B5_units.json",
        "unit_source": {
            "url": "https://datacenter.immersionapp.ca/trudel/B5_units.json",
            "format": "immersion_units_v1",
        },
        "knowledge_source_id": None,
        "crm_connector_id": "immersion_crm",
        "default_language": "fr",
        "metadata": {
            "amenities": [],
            "crm": {
                "provider": "generic",
                "base_url": None,
                "path_prefix": None,
                "object": "contacts",
                "match_attribute": "email",
            },
            "scheduling": {
                "provider": "calendly",
                "event_types": {
                    "visit": "https://api.calendly.com/event_types/b7463a02-f8cf-4492-9fca-25073aece2a3",
                    "presentation": "https://api.calendly.com/event_types/378e29c6-cd7e-46e2-9087-464d685a3998",
                },
                "default_event_type": "visit",
                "timezone": "America/Toronto",
            },
            "follow_up": {
                "from_email": None,
                "from_name": "B5 par Trudel",
                "reply_to": None,
            },
        },
        "surface_bindings": {
            "domains": ["b5.immersionapp.io"],
            "app_instances": [],
            "device_ids": [],
            "crm_accounts": [],
        },
    },
}
