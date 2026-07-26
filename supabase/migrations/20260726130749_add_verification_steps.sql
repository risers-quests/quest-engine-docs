-- Persists the structured computation steps behind a concept's VERIFICATION
-- prose (docs/03_system_prompt.md's output format), so the PDF-build step
-- can draw a real diagram from them (docs/04_design.md: "any reference
-- diagram ... is drawn directly in the build step") instead of only having
-- prose to render. Additive: doesn't change any existing column.

alter table concepts
  add column verification_steps jsonb not null default '[]'::jsonb;
