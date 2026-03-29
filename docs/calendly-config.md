# Calendly Event Types — Atlas Configuration

## Active Event Types

| Name | URI | Scheduling URL | Duration | Language | Location |
|------|-----|---------------|----------|----------|----------|
| **Atlas Test** | `d87821a9-05f6-4cb2-929a-6e2423683cb7` | `https://calendly.com/d/cx9h-cb7-b4q/atlas-test` | 30 min | en | — |
| **Démo IMMERSION** | `b7463a02-f8cf-4492-9fca-25073aece2a3` | `https://calendly.com/minuitmoinsune/60min` | 60 min | fr | 9285 Boul. l'Ormière, QC |
| **Immersion Atlas** | `536d68cc-45e0-4bbe-a742-025e0b68e301` | `https://calendly.com/philippe-minuitmoinsune/immersion-atlas` | 90 min | en | Bureau de Minuit Moins Une |
| **Présentation MMU** | `378e29c6-cd7e-46e2-9087-464d685a3998` | `https://calendly.com/d/cxqw-5mr-zwv/presentation-minuit-moins-une` | 60 min | fr | 9285 Bd de l'Ormière + Teams |
| **30 Minute Meeting** | `836028a3-983f-4d15-9f7a-842d2d512dd0` | `https://calendly.com/philippe-minuitmoinsune/30min` | 30 min | en | — |

## Atlas Project Mapping

For the `metadata.scheduling` block in the atlas-mcp project registry:

```python
# ovation_mtl (French project)
"scheduling": {
    "provider": "calendly",
    "event_types": {
        "visit": "https://api.calendly.com/event_types/b7463a02-f8cf-4492-9fca-25073aece2a3",        # Démo IMMERSION (fr, 60m)
        "presentation": "https://api.calendly.com/event_types/378e29c6-cd7e-46e2-9087-464d685a3998",  # Présentation MMU (fr, 60m)
        "group": "https://api.calendly.com/event_types/536d68cc-45e0-4bbe-a742-025e0b68e301",         # Immersion Atlas (en, 90m, group)
    },
    "default_event_type": "visit",
    "timezone": "America/Toronto",
}

# trudel_b5 (French project)
"scheduling": {
    "provider": "calendly",
    "event_types": {
        "visit": "https://api.calendly.com/event_types/b7463a02-f8cf-4492-9fca-25073aece2a3",        # Démo IMMERSION
        "presentation": "https://api.calendly.com/event_types/378e29c6-cd7e-46e2-9087-464d685a3998",  # Présentation MMU
    },
    "default_event_type": "visit",
    "timezone": "America/Toronto",
}
```

## Availability (Philippe's working hours)

| Day | Hours (ET) |
|-----|-----------|
| Monday | 11:00–12:30, 13:00–16:00 |
| Tuesday–Thursday | 09:00–12:00, 13:00–16:00 |
| Friday | 09:00–12:00 |
| Saturday–Sunday | Closed |

## Custom Questions (Démo IMMERSION)

These are collected at booking and should be stored in `atlas_visits.notes`:
1. **Votre entreprise** (required, text)
2. **Votre numéro de téléphone** (required, phone)
3. **En personne ou vidéo conférence?** (required, single_select)
4. **Brève description de votre projet** (optional, text)
