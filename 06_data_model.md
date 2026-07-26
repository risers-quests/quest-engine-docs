# Data Model

Storage: Supabase (Postgres). No login/auth in v1 — single implicit user.

## Tables

### requests
- id (uuid, pk)
- created_at (timestamp)
- age_band (text)
- theme (text)
- difficulty_target (text, nullable)

### concepts
- id (uuid, pk)
- request_id (fk -> requests.id)
- created_at (timestamp)
- raw_output (text) — full generated concept text, all sections
- skills_claimed (jsonb) — array of {skill, sub_skill, moment, justification}
- ethics_flag (text, nullable) — null if clean, else the "excluded, uncertain boundary" reason
- was_chosen (boolean, default false)

### checks
- id (uuid, pk)
- concept_id (fk -> concepts.id)
- check_type (text) — e.g. "computation_verification", "encoding_safety", "font_safety"
- passed (boolean)
- detail (text) — what the check found, especially on failure
- created_at (timestamp)

### builds
- id (uuid, pk)
- concept_id (fk -> concepts.id)
- created_at (timestamp)
- pdf_path (text) — where the finished file lives
- design_doc_version (text) — hash/version of 04_design.md at build time, for traceability

## Why this shape
- Every concept is traceable back to the exact request that produced it
- Check results are stored per-concept, not just pass/fail on the whole batch, so a specific
  failure can be inspected later
- `was_chosen` lets future work (v2 reference-bank comparison) query "what did Wizard actually
  pick" as a signal, without needing that feature built yet
- `design_doc_version` on builds means if the design doc changes later, old builds are still
  traceable to the rules that were active when they were made

## Change process
Schema changes go here first, then get applied as an actual migration. This doc is the
source of truth for what the database should look like — if the doc and the live database
ever disagree, the doc wins and the database gets migrated to match.
